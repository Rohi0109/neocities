FROM python:3.14-alpine

WORKDIR /app

RUN pip install --no-cache-dir "flask>=3.1.3" "gunicorn>=25.3.0"

COPY neocities-update-server/server.py /app/server.py

ENV PYTHONUNBUFFERED=1
ENV NEOCITIES_PUBLIC_DIR=/data

EXPOSE 9500

CMD ["gunicorn", "--bind", "0.0.0.0:9500", "--workers", "1", "server:app"]
