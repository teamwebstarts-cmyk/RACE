#!/usr/bin/env python3
"""Simple HTTP server for RapidTow clone"""
import http.server
import socketserver
import os
import webbrowser

PORT = 8085
_HERE = os.path.dirname(os.path.abspath(__file__))
DIRECTORY = os.path.dirname(_HERE) if os.path.basename(_HERE) == "tools" else _HERE

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    
    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache')
        super().end_headers()

if __name__ == '__main__':
    os.chdir(DIRECTORY)
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"[+] RACE Service website running at http://localhost:{PORT}")
        print(f"[*] Directory: {DIRECTORY}")
        print(f"[*] Pages:")
        print(f"   - Home:     http://localhost:{PORT}/")
        print(f"   - Service:  http://localhost:{PORT}/service.html")
        print(f"   - Contact:  http://localhost:{PORT}/contact.html")
        print(f"   - Pricing:  http://localhost:{PORT}/pricing.html")
        print(f"\nPress Ctrl+C to stop")
        httpd.serve_forever()