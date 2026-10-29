"""
Open Ambilight - Wi-Fi Remote Control Bridge for Android OS and Mobile Devices
Runs a lightweight local web server & serial bridge so any phone on Wi-Fi can control the strip!
"""

import argparse
import asyncio
import http.server
import json
import os
import socketserver
import threading
import serial

CONTROL_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "bridge_control.json")

def get_local_ip():
    import socket
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(('10.255.255.255', 1))
        IP = s.getsockname()[0]
    except Exception:
        IP = '127.0.0.1'
    finally:
        s.close()
    return IP

class AmbilightHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        dist_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "dist")
        super().__init__(*args, directory=dist_dir, **kwargs)

def start_server(port=8080):
    local_ip = get_local_ip()
    print("=" * 60)
    print("⚡ Open Ambilight - Local Wi-Fi Companion Bridge")
    print(f"📡 Desktop URL:  http://localhost:{port}")
    print(f"📱 Phone/Android: http://{local_ip}:{port}")
    print("=" * 60)
    with socketserver.TCPServer(("0.0.0.0", port), AmbilightHandler) as httpd:
        httpd.serve_forever()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Open Ambilight Local Wi-Fi Server")
    parser.add_argument("--port", type=int, default=8080, help="Port to listen on (default: 8080)")
    args = parser.parse_args()
    start_server(args.port)
