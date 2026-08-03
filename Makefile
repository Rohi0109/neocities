.PHONY: frontend backend all

frontend:
	cd frontend && npm run dev

backend:
	cd backend && uv run app.py

# Running `make all` directly runs both in parallel
all:
	@make -j 2 frontend backend
