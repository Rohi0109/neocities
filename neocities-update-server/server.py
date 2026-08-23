import json
import re
from datetime import date
from pathlib import Path
import os

from flask import Flask, request, redirect

SERVER_DIR = Path(__file__).resolve().parent
REPO_ROOT = Path(os.environ.get("REPO_ROOT", SERVER_DIR.parent)).resolve()

# In Docker, the server may be copied to /app/server.py, so parent.parent becomes /
# and the repo's public directory is not discoverable unless it is mounted explicitly.
PUBLIC_DIR = Path(os.environ.get("NEOCITIES_PUBLIC_DIR", REPO_ROOT / "public")).resolve()
UPDATES_FILE = PUBLIC_DIR / "updates.json"
POSTS_FILE = PUBLIC_DIR / "posts.json"
POSTS_DIR = PUBLIC_DIR / "posts"

app = Flask(__name__)

print(f"PUBLIC_DIR={PUBLIC_DIR}", flush=True)
print(f"UPDATES_FILE={UPDATES_FILE} exists={UPDATES_FILE.exists()}", flush=True)


def write_json(path: Path, value: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary_path = path.with_suffix(f"{path.suffix}.tmp")
    temporary_path.write_text(
        json.dumps(value, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    temporary_path.replace(path)

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
    <button type="submit">Save update</button>
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
    <button type="submit">Save blog post</button>
  </form>
</body>
</html>"""


@app.route("/")
def index():
    status = request.args.get("status")
    if status == "ok":
        msg = '<div class="msg ok">✅ Update saved!</div>'
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
        updates = json.loads(UPDATES_FILE.read_text(encoding="utf-8"))
        updates.insert(0, {"date": entry_date, "info": info})  # prepend for descending order
        write_json(UPDATES_FILE, updates)

        return redirect("/?status=ok")
    except Exception as e:
        return redirect(f"/?status=err&detail={str(e)[:80]}")


@app.route("/blog")
def blog_form():
    status = request.args.get("status")
    if status == "ok":
        msg = '<div class="msg ok">✅ Blog post saved!</div>'
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

    slug = re.sub(r"[^a-z0-9_]+", "_", slug.lower()).strip("_")
    if not slug:
        return redirect("/blog?status=err&detail=invalid+slug")

    try:
        # Write the markdown file
        post_path = POSTS_DIR / f"{slug}.md"
        POSTS_DIR.mkdir(parents=True, exist_ok=True)
        post_path.write_text(content, encoding="utf-8")

        # Update posts.json
        posts = json.loads(POSTS_FILE.read_text(encoding="utf-8"))
        today_iso = date.today().isoformat()
        posts.append({"slug": slug, "title": title, "date": today_iso})
        write_json(POSTS_FILE, posts)

        return redirect("/blog?status=ok")
    except Exception as e:
        return redirect(f"/blog?status=err&detail={str(e)[:80]}")


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=9500, debug=False)
