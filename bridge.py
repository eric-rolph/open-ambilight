"""
Open Ambilight - Wi-Fi Remote Control Bridge for Android OS and Mobile Devices.
Serves the built web UI (dist/) and optionally forwards Adalight LED frames
posted to POST /api/frame directly to a USB-attached microcontroller via pyserial.
"""

from __future__ import annotations

import argparse
import http.server
import json
import os
import socket
import threading
import time
from typing import Any


def get_local_ip() -> str:
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("10.255.255.255", 1))
        ip = s.getsockname()[0]
    except Exception:
        ip = "127.0.0.1"
    finally:
        s.close()
    return ip


class SerialBridge:
    """Thread-safe optional pyserial Adalight output bridge."""

    def __init__(self, port: str | None = None, baudrate: int = 115200) -> None:
        self.port_name = port
        self.baudrate = baudrate
        self._lock = threading.Lock()
        self._ser: Any = None
        if port:
            try:
                import serial  # type: ignore[import-untyped]
            except ImportError as exc:
                raise SystemExit(
                    "pyserial is required when --serial-port is specified: pip install pyserial"
                ) from exc
            self._ser = serial.Serial(port, baudrate=baudrate, timeout=0.5)
            time.sleep(1.8)  # Allow Arduino/CH340 bootloader reset

    @property
    def connected(self) -> bool:
        return self._ser is not None and bool(getattr(self._ser, "is_open", False))

    def send_rgb_bytes(self, rgb_bytes: bytes) -> int:
        if not self.connected or len(rgb_bytes) < 3 or len(rgb_bytes) % 3 != 0:
            return 0
        num_leds = len(rgb_bytes) // 3
        count = num_leds - 1
        hi = (count >> 8) & 0xFF
        lo = count & 0xFF
        chk = hi ^ lo ^ 0x55
        packet = bytes([0x41, 0x64, 0x61, hi, lo, chk]) + rgb_bytes
        with self._lock:
            self._ser.write(packet)
        return num_leds

    def close(self) -> None:
        with self._lock:
            if self._ser is not None:
                try:
                    self._ser.close()
                except Exception:
                    pass
                self._ser = None


class ReusableThreadingHTTPServer(http.server.ThreadingHTTPServer):
    allow_reuse_address = True


def make_handler(dist_dir: str, bridge: SerialBridge):
    class AmbilightHandler(http.server.SimpleHTTPRequestHandler):
        def __init__(self, *args, **kwargs):
            super().__init__(*args, directory=dist_dir, **kwargs)

        def _send_json(self, payload: dict[str, Any], status: int = 200) -> None:
            body = json.dumps(payload).encode("utf-8")
            self.send_response(status)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)

        def do_GET(self) -> None:
            if self.path == "/api/status":
                self._send_json(
                    {
                        "serial_connected": bridge.connected,
                        "serial_port": bridge.port_name,
                        "baudrate": bridge.baudrate,
                    }
                )
                return
            super().do_GET()

        def do_POST(self) -> None:
            if self.path != "/api/frame":
                self._send_json({"error": "Not found"}, status=404)
                return
            if not bridge.connected:
                self._send_json({"error": "No serial port attached (start with --serial-port)"}, status=503)
                return
            try:
                length = int(self.headers.get("Content-Length") or 0)
                if length <= 0 or length > 65536:
                    self._send_json({"error": "Invalid frame length"}, status=400)
                    return
                raw = self.rfile.read(length)
                ctype = (self.headers.get("Content-Type") or "").lower()
                if "application/json" in ctype:
                    data = json.loads(raw.decode("utf-8"))
                    pixels = data.get("pixels") or []
                    rgb = bytearray()
                    for px in pixels:
                        rgb.extend(max(0, min(255, int(c))) for c in px[:3])
                    leds = bridge.send_rgb_bytes(bytes(rgb))
                else:
                    leds = bridge.send_rgb_bytes(raw)
                self._send_json({"ok": True, "leds": leds})
            except Exception as exc:
                self._send_json({"error": str(exc)}, status=400)

    return AmbilightHandler


def start_server(port: int = 8080, serial_port: str | None = None, baudrate: int = 115200) -> None:
    dist_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "dist")
    bridge = SerialBridge(port=serial_port, baudrate=baudrate)
    local_ip = get_local_ip()
    print("=" * 60)
    print("Open Ambilight - Local Wi-Fi Companion Bridge")
    print(f"Desktop URL:   http://localhost:{port}")
    print(f"Phone/Android: http://{local_ip}:{port}")
    if bridge.connected:
        print(f"Serial Bridge: {serial_port} @ {baudrate} baud (POST /api/frame)")
    else:
        print("Serial Bridge: disabled (pass --serial-port COM3 or /dev/ttyUSB0 to enable)")
    print("=" * 60)
    handler = make_handler(dist_dir, bridge)
    try:
        with ReusableThreadingHTTPServer(("0.0.0.0", port), handler) as httpd:
            httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        bridge.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Open Ambilight Local Wi-Fi Server & Serial Bridge")
    parser.add_argument("--port", type=int, default=8080, help="HTTP port to listen on (default: 8080)")
    parser.add_argument("--serial-port", default=None, help="Optional USB serial port (e.g. COM3 or /dev/ttyUSB0)")
    parser.add_argument("--baud", type=int, default=115200, help="Serial baud rate (default: 115200)")
    args = parser.parse_args()
    start_server(port=args.port, serial_port=args.serial_port, baudrate=args.baud)
