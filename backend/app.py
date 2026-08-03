import json
import os
from pathlib import Path
from dotenv import load_dotenv
from flask import Flask, jsonify, request, session

app = Flask(__name__)
load_dotenv()
PUBLIC_DIR = Path(__file__).resolve().parent.parent / "public"
UPDATES_FILE = PUBLIC_DIR / "updates.json"


ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD")
app.secret_key = os.environ.get("FLASK_SECRET_KEY")

# 1. THE LOGIN ENDPOINT
@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    password_given = data.get("password")

    if password_given == ADMIN_PASSWORD:
        session["logged_in"] = True  # Set the session variable
        return jsonify({"status": "success", "message": "Logged in!"})

    return jsonify({"status": "error", "message": "Invalid password"}), 401


@app.route("/api/logout", methods=["POST"])
def logout():
    session.pop("logged_in", None)
    return jsonify({"status": "success", "message": "Logged out."})


@app.route("/api/session", methods=["GET"])
def session_status():
    return jsonify({"logged_in": bool(session.get("logged_in"))})


@app.route("/api/updates", methods=["GET"])
def updates_api():
    if not session.get("logged_in"):
        return jsonify({"status": "error", "message": "Please log in first."}), 401

    if not UPDATES_FILE.exists():
        return jsonify([])

    updates = json.loads(UPDATES_FILE.read_text())
    return jsonify(updates)

# 2. THE PROTECTED UPDATES ROUTE
@app.route("/updates")
def updates_page():
    # Check if the user's session says they are logged in
    if not session.get("logged_in"):
        return (
            "<h1>Access Denied</h1><p>Please log in first.</p>",
            403,
        )

    return "<h1>Secret Updates</h1><p>Update 1: Site is live!</p>"

if __name__ == "__main__":
    app.run(port=5000, debug=True)
