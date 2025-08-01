"""
Dashboard Server
This script starts a simple HTTP server to serve the dashboard files.
"""
import os
import http.server
import socketserver
import webbrowser
from urllib.parse import urlparse

# Constants
PORT = 8000
DASHBOARD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'dashboard')

class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DASHBOARD_DIR, **kwargs)
    
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()
    
    def do_GET(self):
        # Handle relative paths for data directory
        parsed_path = urlparse(self.path)
        if parsed_path.path.startswith('/data/'):
            # Rewrite to project root data directory
            project_root = os.path.dirname(os.path.dirname(__file__))
            file_path = os.path.join(project_root, parsed_path.path[1:])
            
            if os.path.exists(file_path):
                with open(file_path, 'rb') as f:
                    self.send_response(200)
                    if file_path.endswith('.csv'):
                        self.send_header('Content-Type', 'text/csv')
                    else:
                        self.send_header('Content-Type', 'application/octet-stream')
                    self.end_headers()
                    self.wfile.write(f.read())
                return
        
        return super().do_GET()

def main():
    print(f"Starting dashboard server at http://localhost:{PORT}")
    print(f"Serving files from: {DASHBOARD_DIR}")
    
    # Create handler
    handler = CustomHandler
    
    # Start server
    with socketserver.TCPServer(("", PORT), handler) as httpd:
        print("Server started. Press Ctrl+C to stop.")
        
        # Open browser
        webbrowser.open(f"http://localhost:{PORT}")
        
        # Serve until interrupted
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")

if __name__ == "__main__":
    main()
