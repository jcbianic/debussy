#!/usr/bin/env python3
"""
Workflow Review Server — read-only progress dashboard.
Deployed by /workflow-run skill. Do not edit manually.

Usage:
  python3 review-server.py <state.json path> <port>

  port: 0 or omitted = ephemeral, specific number = use that port

Serves the workflow pipeline and artifact viewer. Decisions are collected
by the feedback skill (separate browser tab per review gate).
"""

import http.server
import json
import os
import signal
import sys
from pathlib import Path

STATE_FILE = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("state.json")
PORT = int(sys.argv[2]) if len(sys.argv) > 2 and sys.argv[2] != "0" else 0
WORKSPACE = STATE_FILE.parent
HTML_FILE = Path(__file__).parent / "review.html"


class ReviewHandler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path in ("/", "/review"):
            self._serve_review_page()
        elif self.path == "/api/state":
            self._serve_json(STATE_FILE.read_bytes())
        elif self.path.startswith("/api/artifact/"):
            self._serve_artifact(self.path[len("/api/artifact/") :])
        elif self.path.startswith("/api/summary/"):
            self._serve_summary(self.path[len("/api/summary/") :])
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        self.send_response(404)
        self.end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def _serve_review_page(self):
        html = HTML_FILE.read_text(encoding="utf-8")
        state_json = json.dumps(json.loads(STATE_FILE.read_text()), indent=2)
        html = html.replace("__STATE_JSON__", state_json)
        body = html.encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _serve_json(self, data):
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Cache-Control", "no-cache")
        self.end_headers()
        self.wfile.write(data)

    def _serve_artifact(self, name):
        path = (WORKSPACE / name).resolve()
        if not path.is_relative_to(WORKSPACE.resolve()):
            self.send_response(403)
            self.end_headers()
            return
        if path.exists() and path.is_file():
            data = path.read_bytes()
            self.send_response(200)
            self.send_header("Content-Type", "text/plain; charset=utf-8")
            self.send_header("Content-Length", str(len(data)))
            self.end_headers()
            self.wfile.write(data)
        else:
            self.send_response(404)
            self.end_headers()

    def _serve_summary(self, name):
        path = (WORKSPACE / f"{name}.summary.md").resolve()
        if not path.is_relative_to(WORKSPACE.resolve()):
            self.send_response(403)
            self.end_headers()
            return
        if path.exists() and path.is_file():
            data = path.read_bytes()
            self.send_response(200)
            self.send_header("Content-Type", "text/plain; charset=utf-8")
            self.send_header("Content-Length", str(len(data)))
            self.end_headers()
            self.wfile.write(data)
        else:
            self.send_response(404)
            self.end_headers()

    def log_message(self, fmt, *args):
        pass  # Suppress access log noise


def main():
    server = http.server.HTTPServer(("127.0.0.1", PORT), ReviewHandler)
    actual_port = server.server_address[1]

    pid_file = WORKSPACE / "review-server.pid"
    port_file = WORKSPACE / "review-server.port"

    pid_file.write_text(str(os.getpid()))
    port_file.write_text(str(actual_port))

    # Signal output — skill reads these to get the actual port
    print(f"REVIEW_URL=http://127.0.0.1:{actual_port}/review", flush=True)
    print(f"REVIEW_PID={os.getpid()}", flush=True)

    def cleanup(signum=None, frame=None):
        pid_file.unlink(missing_ok=True)
        port_file.unlink(missing_ok=True)
        sys.exit(0)

    signal.signal(signal.SIGTERM, cleanup)

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        cleanup()


if __name__ == "__main__":
    main()
