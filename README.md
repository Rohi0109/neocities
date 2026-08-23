# Personal website

My personal website, built with React and Vite, with a small Flask API.

## Repository layout

```text
.
├── src/                       React application
├── public/                    Static pages, posts, and site data
├── backend/                   Flask API
├── docker/
│   ├── website.Dockerfile     Builds React, then serves it with Nginx
│   └── backend.Dockerfile     Runs the Flask API
├── neocities-update-server/   Separate tool for publishing updates and posts
├── nginx.conf                 Website proxy and SPA routing
├── compose.yml                Homelab deployment
└── Makefile                   Common development and deployment commands
```

The generated `dist/` directory and local environment files are intentionally
not committed.

## Development

Install dependencies, then run the frontend and backend together:

```bash
npm ci
make dev
```

The Vite development server proxies `/api` requests to Flask on port 5000.

## Homelab deployment

Create `backend/.env` with the required secrets:

```dotenv
ADMIN_PASSWORD=replace-me
FLASK_SECRET_KEY=replace-with-a-long-random-value
```

Then build and start both containers:

```bash
docker compose up -d --build
```

The website is exposed on port **9500**. Useful commands:

```bash
docker compose ps
docker compose logs -f
docker compose down
```

The website container serves the frontend produced during its image build. The
`public/` bind mount on the backend lets it read locally published update data.

## Other deployment

Pushes to `master` also build and deploy `dist/` to Neocities through the
GitHub Actions workflow.
