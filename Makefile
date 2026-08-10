COMPOSE := docker compose -f docker-compose.website.yml
.DEFAULT_GOAL := all

.PHONY: frontend backend dev build docker-down docker-up docker-restart all

frontend:
	npm run dev -- --host 0.0.0.0

backend:
	uv run python backend/app.py

dev:
	@make -j 2 frontend backend

build:
	npm run build

docker-down:
	$(COMPOSE) down

docker-up: build
	$(COMPOSE) up -d --build

docker-restart:
	$(COMPOSE) down
	$(MAKE) docker-up

all: docker-restart
