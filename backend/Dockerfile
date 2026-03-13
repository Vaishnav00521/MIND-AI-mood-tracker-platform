# Use an official Python runtime as a parent image
FROM python:3.11-slim-bookworm

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
ENV DJANGO_SETTINGS_MODULE backend_core.settings

# Set work directory
WORKDIR /app

# Install system dependencies for PostgreSQL and building Python packages
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        gcc \
        libpq-dev \
        postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt /app/
# (Assume gunicorn & psycopg2 are in requirements.txt)
RUN pip install --upgrade pip \
    && pip install -r requirements.txt \
    && pip install gunicorn psycopg2-binary daphne channels_redis uvicorn asgiref

# Copy project
COPY . /app/

# Copy entrypoint.sh and make it executable
COPY ./entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Expose port (Azure App Service defaults to 8000 if not specified otherwise, but we expose 8000)
EXPOSE 8000

# Run entrypoint.sh
ENTRYPOINT ["/app/entrypoint.sh"]
