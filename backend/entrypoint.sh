#!/bin/bash
set -e

# Run database migrations
echo "Running database migrations..."
python manage.py makemigrations
python manage.py migrate

# Collect static files (optional depending on your Django setup, usually needed)
echo "Collecting static files..."
python manage.py collectstatic --noinput

# Start Daphne/Gunicorn (Since we use Channels, Daphne or Uvicorn is required over standard Gunicorn)
# We will run gunicorn with uvicorn workers
echo "Starting Gunicorn server..."
exec gunicorn backend_core.asgi:application -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000 --workers 4
