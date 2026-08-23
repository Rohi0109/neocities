import json
import os
import secrets
from datetime import datetime, timezone
from functools import wraps
from pathlib import Path
from threading import Lock
from dotenv import load_dotenv
from flask import Flask, jsonify, request, session

app = Flask(__name__)
load_dotenv(Path(__file__).resolve().parent / ".env")
PUBLIC_DIR = Path(__file__).resolve().parent.parent / "public"
UPDATES_FILE = PUBLIC_DIR / "updates.json"
TODO_DATA_FILE = Path(
    os.environ.get(
        "TODO_DATA_FILE",
        Path(__file__).resolve().parent.parent / "data" / "todos.json",
    )
)
todo_lock = Lock()


ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD")
app.secret_key = os.environ.get("FLASK_SECRET_KEY")
AUTH_REQUIRED = os.environ.get("AUTH_REQUIRED", "false").lower() == "true"

if not app.secret_key:
    raise RuntimeError("FLASK_SECRET_KEY must be configured")


def login_required(view):
    @wraps(view)
    def wrapped_view(*args, **kwargs):
        if AUTH_REQUIRED and not session.get("logged_in"):
            return jsonify({"status": "error", "message": "Please log in first."}), 401
        return view(*args, **kwargs)

    return wrapped_view


# 1. THE LOGIN ENDPOINT
@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    password_given = data.get("password")

    if not ADMIN_PASSWORD:
        return jsonify({"status": "error", "message": "Login is not configured."}), 503

    if password_given and password_given == ADMIN_PASSWORD:
        session["logged_in"] = True  # Set the session variable
        return jsonify({"status": "success", "message": "Logged in!"})

    return jsonify({"status": "error", "message": "Invalid password"}), 401


@app.route("/api/logout", methods=["POST"])
def logout():
    session.pop("logged_in", None)
    return jsonify({"status": "success", "message": "Logged out."})


@app.route("/api/session", methods=["GET"])
def session_status():
    return jsonify({"logged_in": not AUTH_REQUIRED or bool(session.get("logged_in"))})


@app.route("/api/updates", methods=["GET"])
@login_required
def updates_api():
    if not UPDATES_FILE.exists():
        return jsonify([])

    updates = json.loads(UPDATES_FILE.read_text())
    return jsonify(updates)


def read_todos():
    if not TODO_DATA_FILE.exists():
        return []
    return json.loads(TODO_DATA_FILE.read_text(encoding="utf-8"))


def write_todos(todos):
    TODO_DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
    temporary_file = TODO_DATA_FILE.with_suffix(".json.tmp")
    temporary_file.write_text(
        json.dumps(todos, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    temporary_file.replace(TODO_DATA_FILE)


@app.route("/api/todos", methods=["GET"])
@login_required
def list_todos():
    with todo_lock:
        return jsonify(read_todos())


@app.route("/api/todos", methods=["POST"])
@login_required
def create_todo():
    data = request.get_json() or {}
    text = str(data.get("text", "")).strip()
    if not text:
        return jsonify({"status": "error", "message": "Todo text is required."}), 400
    if len(text) > 200:
        return jsonify({"status": "error", "message": "Todo text is too long."}), 400

    todo = {
        "id": secrets.token_hex(16),
        "text": text,
        "completed": bool(data.get("completed", False)),
        "createdAt": datetime.now(timezone.utc).isoformat(),
    }
    with todo_lock:
        todos = read_todos()
        todos.append(todo)
        write_todos(todos)
    return jsonify(todo), 201


@app.route("/api/todos/<todo_id>", methods=["PATCH"])
@login_required
def update_todo(todo_id):
    data = request.get_json() or {}
    if "completed" not in data or not isinstance(data["completed"], bool):
        return jsonify({"status": "error", "message": "A completed boolean is required."}), 400

    with todo_lock:
        todos = read_todos()
        for todo in todos:
            if todo["id"] == todo_id:
                todo["completed"] = data["completed"]
                write_todos(todos)
                return jsonify(todo)

    return jsonify({"status": "error", "message": "Todo not found."}), 404

# 2. THE PROTECTED UPDATES ROUTE
@app.route("/updates")
@login_required
def updates_page():
    return "<h1>Secret Updates</h1><p>Update 1: Site is live!</p>"

if __name__ == "__main__":
    app.run(port=5000, debug=True)
