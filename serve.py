from http.server import HTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import os

PORT = 9500

# Serve from the dist folder by default.
ROOT = Path(__file__).resolve().parent / "dist"
if not ROOT.exists():
    raise SystemExit("dist/ directory not found. Run 'npm run build' first.")

os.chdir(ROOT)

class SPARequestHandler(SimpleHTTPRequestHandler):
    def send_head(self):
        path = self.translate_path(self.path)
        if self.path != "/" and not Path(path).exists():
            return super().send_head() if Path(path).is_file() else self.send_index()
        return super().send_head()

    def send_index(self):
        self.path = "/index.html"
        return super().send_head()

    def log_message(self, format, *args):
        print(f"[serve] {self.address_string()} - {format % args}")

if __name__ == "__main__":
    server_address = ("0.0.0.0", PORT)
    httpd = HTTPServer(server_address, SPARequestHandler)
    print(f"Serving {ROOT} on http://0.0.0.0:{PORT}")
    httpd.serve_forever()
