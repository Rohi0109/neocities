import os
from flask import Flask, jsonify, request, session

app = Flask(__name__)

# FIX 1: Set a fallback or environment variable for the missing admin password
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "my-secure-password")
app.secret_key = os.environ.get("FLASK_SECRET_KEY", "super-secret-key")

# 1. THE LOGIN ENDPOINT
@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    password_given = data.get("password")

    if password_given == ADMIN_PASSWORD:
        session["logged_in"] = True  # Set the session variable
        return jsonify({"status": "success", "message": "Logged in!"})

    return jsonify({"status": "error", "message": "Invalid password"}), 401

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
