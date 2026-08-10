.PHONY: frontend backend all

frontend:
	npm run dev -- --host 0.0.0.0

backend:
	uv run python backend/app.py

# Running `make all` directly runs both in parallel
all:
	@make -j 2 frontend backend
