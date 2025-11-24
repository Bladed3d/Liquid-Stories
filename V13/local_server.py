#!/usr/bin/env python3
"""
Simple local HTTP server for testing protected storybook
"""

import http.server
import socketserver
import webbrowser
import os

PORT = 8000

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

def start_server():
    os.chdir('dist')  # Change to dist directory

    with socketserver.TCPServer(("", PORT), CustomHTTPRequestHandler) as httpd:
        print(f"Local server started at http://localhost:{PORT}")
        print(f"Serving files from: {os.getcwd()}")
        print(f"Open your browser to: http://localhost:{PORT}/page-1.html")
        print(f"\nNote: Use Ctrl+C to stop the server")

        # Open browser automatically
        webbrowser.open(f'http://localhost:{PORT}/page-1.html')

        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print(f"\nServer stopped")

if __name__ == "__main__":
    start_server()