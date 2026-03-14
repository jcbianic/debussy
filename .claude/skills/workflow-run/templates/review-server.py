#!/usr/bin/env python3
"""
Workflow Review Server
Deployed by /workflow-run skill. Do not edit manually.

Usage:
  python3 review-server.py <state.json path> <port>

  port: 0 or omitted = ephemeral, specific number = use that port

On human decision, writes state.json then touches .resume-trigger to wake
the maestro's blocking trigger-file loop.
"""

import http.server
import json
import os
import signal
import sys
from datetime import datetime, timezone
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
        if self.path == "/api/review":
            self._handle_review_decision()
        else:
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
        path = WORKSPACE / name
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
        path = WORKSPACE / f"{name}.summary.md"
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

    def _handle_review_decision(self):
        length = int(self.headers.get("Content-Length", 0))
        body = json.loads(self.rfile.read(length))

        # Read, update, write state atomically
        state = json.loads(STATE_FILE.read_text())
        step_id = body["step_id"]
        decision = body["decision"]
        comments = body.get("comments", "")
        timestamp = body.get("timestamp", datetime.now(timezone.utc).isoformat())

        if step_id not in state["steps"]:
            self.send_response(400)
            self.end_headers()
            return

        state["steps"][step_id]["status"] = decision
        if state["steps"][step_id].get("review"):
            state["steps"][step_id]["review"]["status"] = decision
            state["steps"][step_id]["review"]["decision"] = decision
            state["steps"][step_id]["review"]["comments"] = comments
            state["steps"][step_id]["review"]["decided_at"] = timestamp
        state["updated_at"] = timestamp

        STATE_FILE.write_text(json.dumps(state, indent=2))

        # Wake the maestro's blocking trigger-file loop
        if decision in ("approved", "rejected", "revision_requested"):
            (WORKSPACE / ".resume-trigger").touch()

        response = json.dumps({"ok": True}).encode()
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(response)))
        self.end_headers()
        self.wfile.write(response)

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
