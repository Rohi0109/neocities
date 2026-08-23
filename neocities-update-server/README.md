# Update server

A small private form for adding site updates and blog posts. It writes directly
to the main repository's `public/` directory, which is the canonical source for
both the homelab website and Vite builds.

Run it with the rest of the site from the repository root:

```bash
docker compose up -d --build
```

Open `http://<server-hostname>:9501` from the trusted network. The main website
continues to use port 9500.

The service only saves local files; it does not commit or push to GitHub.
