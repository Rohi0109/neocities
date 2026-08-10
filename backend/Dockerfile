FROM python:3.12-alpine

WORKDIR /app

RUN pip install --no-cache-dir "flask>=3.1.3" "python-dotenv>=1.2.2"

COPY backend /app/backend
COPY public /app/public

ENV PYTHONUNBUFFERED=1

CMD ["flask", "--app", "backend.app", "run", "--host=0.0.0.0", "--port=5000"]
