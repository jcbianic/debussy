#!/usr/bin/env python3
"""
Strategy Review Server
Deployed by /strategy skill. Do not edit manually.

Usage:
  python3 strategy-server.py <request.json path> [port]

  port: 0 or omitted = ephemeral (auto-assigned)
"""

import http.server
import json
import os
import platform
import re
import signal
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

REQUEST_FILE = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("request.json")
PORT = int(sys.argv[2]) if len(sys.argv) > 2 and sys.argv[2] != "0" else 0
WORKSPACE = REQUEST_FILE.parent
HTML_FILE = Path(__file__).parent / "strategy-review.html"
RESPONSE_FILE = WORKSPACE / "response.json"

# Derive PROJECT_ROOT from request.json content
_request_data = json.loads(REQUEST_FILE.read_text())
PROJECT_ROOT = Path(_request_data.get("project_root", ".")).resolve()
REVIEWS_DIR = PROJECT_ROOT / _request_data.get("reviews_dir", "docs/strategy/.reviews")


def send_notification(title, message):
    """Send a desktop notification. Best-effort."""
    try:
        if platform.system() == "Darwin":
            subprocess.run(
                [
                    "osascript",
                    "-e",
                    f'display notification "{message}" with title "{title}"',
                ],
                capture_output=True,
                timeout=5,
            )
        elif platform.system() == "Linux":
            subprocess.run(
                ["notify-send", title, message], capture_output=True, timeout=5
            )
    except Exception:
        pass


def strip_frontmatter(text):
    """Remove YAML frontmatter from markdown content."""
    if text.startswith("---"):
        match = re.match(r"^---\s*\n.*?\n---\s*\n", text, re.DOTALL)
        if match:
            return text[match.end():]
    return text


class StrategyHandler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path in ("/", "/review"):
            self._serve_review_page()
        elif self.path == "/api/request":
            self._serve_json(REQUEST_FILE.read_bytes())
        elif self.path.startswith("/api/artifact/"):
            self._serve_artifact(self.path[len("/api/artifact/"):])
        elif self.path == "/api/reviews":
            self._serve_all_reviews()
        elif self.path == "/api/rounds":
            self._serve_rounds()
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        if self.path.startswith("/api/review/"):
            slug = self.path[len("/api/review/"):]
            self._save_review(slug)
        elif self.path == "/api/submit":
            self._handle_submit()
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
        request_json = json.dumps(json.loads(REQUEST_FILE.read_text()), indent=2)
        html = html.replace("__REQUEST_JSON__", request_json)
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
        if isinstance(data, str):
            data = data.encode("utf-8")
        self.wfile.write(data)

    def _serve_artifact(self, rel_path):
        """Read a markdown file, strip YAML frontmatter, return raw content."""
        path = (PROJECT_ROOT / rel_path).resolve()
        if not path.is_relative_to(PROJECT_ROOT):
            self.send_response(403)
            self.end_headers()
            return
        if path.exists() and path.is_file():
            content = path.read_text(encoding="utf-8")
            content = strip_frontmatter(content)
            data = content.encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "text/plain; charset=utf-8")
            self.send_header("Content-Length", str(len(data)))
            self.end_headers()
            self.wfile.write(data)
        else:
            self.send_response(404)
            self.end_headers()

    def _serve_all_reviews(self):
        """Return all .review.json files as a single JSON object (excludes rounds/)."""
        reviews = {}
        if REVIEWS_DIR.exists():
            for f in REVIEWS_DIR.rglob("*.review.json"):
                rel = f.relative_to(REVIEWS_DIR)
                # Skip archived rounds
                if rel.parts[0] == "rounds":
                    continue
                slug = f.stem.replace(".review", "")
                parts = list(rel.parts)
                parts[-1] = slug
                full_slug = "/".join(parts)
                try:
                    reviews[full_slug] = json.loads(f.read_text())
                except (json.JSONDecodeError, OSError):
                    pass
        self._serve_json(json.dumps(reviews).encode("utf-8"))

    def _serve_rounds(self):
        """Return all archived review rounds as { "1": { slug: review_data } }."""
        rounds_dir = REVIEWS_DIR / "rounds"
        result = {}
        if rounds_dir.exists():
            for round_dir in sorted(rounds_dir.iterdir()):
                if not round_dir.is_dir():
                    continue
                round_id = round_dir.name
                round_reviews = {}
                for f in round_dir.rglob("*.review.json"):
                    slug = f.stem.replace(".review", "")
                    rel = f.relative_to(round_dir)
                    parts = list(rel.parts)
                    parts[-1] = slug
                    full_slug = "/".join(parts)
                    try:
                        round_reviews[full_slug] = json.loads(f.read_text())
                    except (json.JSONDecodeError, OSError):
                        pass
                if round_reviews:
                    result[round_id] = round_reviews
        self._serve_json(json.dumps(result).encode("utf-8"))

    def _save_review(self, slug):
        """Write/update one .review.json sidecar atomically."""
        length = int(self.headers.get("Content-Length", 0))
        body = json.loads(self.rfile.read(length))

        # Build review file path from slug
        parts = slug.split("/")
        review_dir = REVIEWS_DIR
        if len(parts) > 1:
            review_dir = REVIEWS_DIR / "/".join(parts[:-1])
        review_dir.mkdir(parents=True, exist_ok=True)

        review_file = review_dir / f"{parts[-1]}.review.json"
        tmp = review_file.with_suffix(".tmp")
        tmp.write_text(json.dumps(body, indent=2))
        tmp.rename(review_file)

        result = json.dumps({"ok": True}).encode()
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(result)))
        self.end_headers()
        self.wfile.write(result)

    def _handle_submit(self):
        """Write all review sidecars + response.json signal file."""
        length = int(self.headers.get("Content-Length", 0))
        body = json.loads(self.rfile.read(length))

        # Write response file atomically (triggers filewatch)
        timestamp = datetime.now(timezone.utc).isoformat()
        response = {
            "submitted_at": timestamp,
            "reviews": body.get("reviews", {}),
            "summary": body.get("summary", {}),
        }

        tmp = RESPONSE_FILE.with_suffix(".tmp")
        tmp.write_text(json.dumps(response, indent=2))
        tmp.rename(RESPONSE_FILE)

        result = json.dumps({"ok": True}).encode()
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(result)))
        self.end_headers()
        self.wfile.write(result)

        send_notification(
            "Strategy Review Submitted",
            "Your review has been recorded.",
        )

    def log_message(self, fmt, *args):
        pass  # Suppress access log noise


def main():
    server = http.server.HTTPServer(("127.0.0.1", PORT), StrategyHandler)
    actual_port = server.server_address[1]

    pid_file = WORKSPACE / "server.pid"
    port_file = WORKSPACE / "server.port"

    pid_file.write_text(str(os.getpid()))
    port_file.write_text(str(actual_port))

    print(f"STRATEGY_URL=http://127.0.0.1:{actual_port}", flush=True)
    print(f"STRATEGY_PID={os.getpid()}", flush=True)

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
