import json
import subprocess
from datetime import date
from pathlib import Path
import os

from flask import Flask, request, redirect

# Repo root is one level up from this server directory
REPO_ROOT = Path(__file__).resolve().parent.parent
PUBLIC_DIR = REPO_ROOT / "public"
UPDATES_FILE = PUBLIC_DIR / "updates.json"
POSTS_FILE = PUBLIC_DIR / "posts.json"
POSTS_DIR = PUBLIC_DIR / "posts"

app = Flask(__name__)

STYLE = """
    body { font-family: sans-serif; max-width: 520px; margin: 40px auto; padding: 0 16px; }
    textarea { width: 100%; font-size: 16px; padding: 8px; box-sizing: border-box; }
    input[type=text] { width: 100%; font-size: 16px; padding: 8px; box-sizing: border-box; }
    button { margin-top: 12px; width: 100%; padding: 12px; font-size: 18px; background: #222; color: #fff; border: none; border-radius: 6px; cursor: pointer; }
    .msg { padding: 12px; border-radius: 6px; margin-bottom: 16px; }
    .ok { background: #d4edda; color: #155724; }
    .err { background: #f8d7da; color: #721c24; }
    nav { margin-bottom: 24px; }
    nav a { margin-right: 16px; }
    .short { height: 80px; }
    .tall { height: 300px; }
"""

UPDATE_HTML = """<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Post Update</title>
  <style>{style}</style>
</head>
<body>
  <nav><a href="/">Updates</a> | <a href="/blog">Blog Post</a></nav>
  <h2>Post a site update</h2>
  {msg}
  <form method="POST" action="/post">
    <label>Date (e.g. 3/27)</label><br>
    <input type="text" name="date" value="{today}" required><br><br>
    <label>What happened today?</label><br>
    <textarea class="short" name="info" placeholder="Write your update here..." required></textarea><br>
    <button type="submit">Post &amp; Deploy</button>
  </form>
</body>
</html>"""

BLOG_HTML = """<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>New Blog Post</title>
  <style>{style}</style>
</head>
<body>
  <nav><a href="/">Updates</a> | <a href="/blog">Blog Post</a></nav>
  <h2>Create a new blog post</h2>
  {msg}
  <form method="POST" action="/blog">
    <label>Title</label><br>
    <input type="text" name="title" placeholder="My awesome post" required><br><br>
    <label>Slug (filename, e.g. my_awesome_post)</label><br>
    <input type="text" name="slug" placeholder="my_awesome_post" required><br><br>
    <label>Content (Markdown)</label><br>
    <textarea class="tall" name="content" placeholder="Write your post in markdown..." required></textarea><br>
    <button type="submit">Publish &amp; Deploy</button>
  </form>
</body>
</html>"""


@app.route("/")
def index():
    status = request.args.get("status")
    if status == "ok":
        msg = '<div class="msg ok">✅ Posted and pushed to GitHub!</div>'
    elif status == "err":
        msg = f'<div class="msg err">❌ Error: {request.args.get("detail", "unknown")}</div>'
    else:
        msg = ""
    today = date.today().strftime("%-m/%-d")
    return UPDATE_HTML.format(style=STYLE, msg=msg, today=today)


@app.route("/post", methods=["POST"])
def post_update():
    entry_date = request.form.get("date", "").strip()
    info = request.form.get("info", "").strip()

    if not entry_date or not info:
        return redirect("/?status=err&detail=date+and+info+required")

    try:
        updates = json.loads(UPDATES_FILE.read_text())
        updates.insert(0, {"date": entry_date, "info": info})  # prepend for descending order
        UPDATES_FILE.write_text(json.dumps(updates, indent=2, ensure_ascii=False))

        subprocess.run(["git", "add", "public/updates.json"], cwd=REPO_ROOT, check=True)
        subprocess.run(
            ["git", "commit", "-m", f"update: {entry_date}"],
            cwd=REPO_ROOT, check=True
        )
        subprocess.run(["git", "push"], cwd=REPO_ROOT, check=True)

        return redirect("/?status=ok")
    except Exception as e:
        return redirect(f"/?status=err&detail={str(e)[:80]}")


@app.route("/blog")
def blog_form():
    status = request.args.get("status")
    if status == "ok":
        msg = '<div class="msg ok">✅ Blog post published and pushed!</div>'
    elif status == "err":
        msg = f'<div class="msg err">❌ Error: {request.args.get("detail", "unknown")}</div>'
    else:
        msg = ""
    return BLOG_HTML.format(style=STYLE, msg=msg)


@app.route("/blog", methods=["POST"])
def post_blog():
    title = request.form.get("title", "").strip()
    slug = request.form.get("slug", "").strip()
    content = request.form.get("content", "").strip()

    if not title or not slug or not content:
        return redirect("/blog?status=err&detail=title,+slug,+and+content+required")

    # Sanitize slug (replace spaces/special chars with underscores)
    slug = slug.replace(" ", "_").replace("-", "_")

    try:
        # Write the markdown file
        post_path = POSTS_DIR / f"{slug}.md"
        post_path.write_text(content)

        # Update posts.json
        posts = json.loads(POSTS_FILE.read_text())
        today_iso = date.today().isoformat()
        posts.append({"slug": slug, "title": title, "date": today_iso})
        POSTS_FILE.write_text(json.dumps(posts, indent=2, ensure_ascii=False))

        # Git commit and push
        subprocess.run(["git", "add", f"public/posts/{slug}.md", "public/posts.json"], cwd=REPO_ROOT, check=True)
        subprocess.run(
            ["git", "commit", "-m", f"blog: {title}"],
            cwd=REPO_ROOT, check=True
        )
        subprocess.run(["git", "push"], cwd=REPO_ROOT, check=True)

        return redirect("/blog?status=ok")
    except Exception as e:
        return redirect(f"/blog?status=err&detail={str(e)[:80]}")


if __name__ == "__main__":
    # Listen on port 9500 so this server is reachable over TailScale
    app.run(host="0.0.0.0", port=9500, debug=False)
