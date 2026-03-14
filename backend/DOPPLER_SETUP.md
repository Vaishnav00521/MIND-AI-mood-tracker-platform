# Doppler Setup Guide for MindAI

This guide explains how to integrate Doppler secrets management with the MindAI backend.

## Overview

Doppler is a secrets management platform that allows you to:
- Securely store and manage application secrets
- Inject secrets into your application environment
- Manage different configurations for development, staging, and production
- Rotate secrets without code changes

## Prerequisites

1. **Doppler Account**: Sign up at [https://doppler.com](https://doppler.com)
2. **Doppler CLI**: Already installed at `C:\Users\vaish\AppData\Local\Microsoft\WinGet\Packages\Doppler.doppler_Microsoft.Winget.Source_8wekyb3d8bbwe\doppler.exe`

## Quick Start

### 1. Set Your Doppler Token

```bash
# Windows (Command Prompt)
set DOPPLER_TOKEN=your_token_here

# Windows (PowerShell)
$env:DOPPLER_TOKEN="your_token_here"

# Linux/Mac
export DOPPLER_TOKEN=your_token_here
```

### 2. Run with Doppler

```bash
cd backend
doppler run -- python manage.py runserver
```

## Secrets Configuration

The following secrets should be configured in your Doppler project:

### Required Secrets

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `SECRET_KEY` | Django secret key | `your-secret-key-here` |
| `DEBUG` | Django debug mode | `True` or `False` |
| `ALLOWED_HOSTS` | Allowed hosts | `localhost,127.0.0.1` |

### Database Secrets (PostgreSQL)

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `DB_NAME` | Database name | `mindai_db` |
| `DB_USER` | Database username | `postgres` |
| `DB_PASSWORD` | Database password | `your-password` |
| `DB_HOST` | Database host | `localhost` |
| `DB_PORT` | Database port | `5432` |
| `DB_SSL_MODE` | SSL mode | `disable` |

### API Keys

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `GEMINI_API_KEY` | Google Gemini API key | `AIzaSy...` |
| `SPOTIFY_CLIENT_ID` | Spotify API client ID | `your-client-id` |
| `SPOTIFY_CLIENT_SECRET` | Spotify API client secret | `your-client-secret` |
| `SPOTIFY_REDIRECT_URI` | Spotify OAuth redirect | `http://localhost:8000/spotify/callback` |

### Celery Configuration

| Secret Name | Description | Default |
|-------------|-------------|---------|
| `CELERY_BROKER_URL` | Celery message broker | `redis://localhost:6379/0` |
| `CELERY_RESULT_BACKEND` | Celery result backend | `redis://localhost:6379/0` |

## Setting Up in Doppler Dashboard

1. **Create a Project**: Log in to Doppler and create a new project called `mindai`
2. **Create Configs**: Create different configs for each environment:
   - `dev` - Development
   - `staging` - Staging
   - `prod` - Production
3. **Add Secrets**: Add the secrets listed above to each config
4. **Get Token**: Create a service token from Settings > Tokens

## Django Integration

The [`settings.py`](backend_core/settings.py) has been updated to automatically load secrets from Doppler when:
- `DOPPLER_TOKEN` environment variable is set
- Doppler CLI is available

### How It Works

```python
# settings.py checks for Doppler secrets
def load_doppler_secrets():
    doppler_token = os.environ.get('DOPPLER_TOKEN')
    if doppler_token:
        # Fetch and apply secrets from Doppler
        # ...
```

## Local Development

### Option 1: Using .env file (Default)

The project uses a `.env` file for local development:

```bash
cd backend
python manage.py runserver
```

### Option 2: Using Doppler

```bash
cd backend
doppler run -- python manage.py runserver
```

### Option 3: Hybrid

You can use Doppler for specific secrets while keeping others in `.env`:

1. Keep sensitive secrets in Doppler
2. Keep local-only secrets in `.env`

## Docker Deployment

For production Docker deployment, add the Doppler token as a build argument:

```dockerfile
# Dockerfile
ARG DOPPLER_TOKEN
ENV DOPPLER_TOKEN=$DOPPLER_TOKEN

# Run with Doppler
CMD ["doppler", "run", "--", "python", "manage.py", "runserver"]
```

Build command:
```bash
docker build --build-arg DOPPLER_TOKEN=your_token -t mindai-backend .
```

## Troubleshooting

### "Doppler Error: you must provide a token"

Set the `DOPPLER_TOKEN` environment variable:
```bash
export DOPPLER_TOKEN=your_token
```

### "Doppler secrets loading failed"

Check that:
1. Your Doppler token is valid
2. The project exists in Doppler
3. The secrets are configured in your Doppler config

### Connection Issues

Test your Doppler connection:
```bash
doppler me
doppler secrets list
```

## Security Best Practices

1. **Never commit tokens**: Add `DOPPLER_TOKEN` to `.gitignore`
2. **Use different configs**: Separate dev/staging/prod secrets
3. **Rotate secrets regularly**: Use Doppler's secret rotation features
4. **Audit access**: Monitor who accesses secrets in Doppler dashboard

## Files Modified

- [`backend/backend_core/settings.py`](backend_core/settings.py) - Added Doppler secrets loading
- [`backend/.env`](.env) - Added Doppler configuration comments
- [`backend/doppler.yaml`](doppler.yaml) - Doppler project configuration
- [`backend/setup_doppler.sh`](setup_doppler.sh) - Setup script

## Additional Resources

- [Doppler Documentation](https://docs.doppler.com)
- [Django Settings Best Practices](https://docs.djangoproject.com/en/stable/topics/settings/)
- [Doppler CLI Reference](https://docs.doppler.com/cli/reference)
