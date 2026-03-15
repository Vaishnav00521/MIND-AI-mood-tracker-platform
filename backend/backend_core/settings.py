"""
Django settings for backend_core project.
"""

from pathlib import Path
import os
from dotenv import load_dotenv

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Load environment variables from .env file for local development
load_dotenv()

# Try to load secrets from Doppler if available
# Doppler can be used in two ways:
# 1. Local dev: Run `doppler run -- python manage.py runserver`
# 2. Production: Set DOPPLER_TOKEN env var and use doppler.EnvsService.Get
def load_doppler_secrets():
    """Load secrets from Doppler if available."""
    try:
        import json
        # Check if Doppler token is available
        doppler_token = os.environ.get('DOPPLER_TOKEN')
        if not doppler_token:
            return False
            
        # Use Doppler CLI to get secrets
        import subprocess
        result = subprocess.run(
            ['doppler', 'secrets', 'download', '--json'],
            capture_output=True,
            text=True,
            env={**os.environ, 'DOPPLER_TOKEN': doppler_token}
        )
        if result.returncode == 0:
            secrets = json.loads(result.stdout)
            for key, value in secrets.items():
                if value.get('value'):
                    os.environ[key] = value['value']
            return True
    except Exception as e:
        print(f"Doppler secrets loading failed: {e}")
    return False

# Try to load Doppler secrets
load_doppler_secrets()

# Security - Secret Key (Required - fails if not set)
SECRET_KEY = os.environ.get('SECRET_KEY')
if not SECRET_KEY:
    raise ValueError("No SECRET_KEY set for Django application. Please configure in Doppler.")

# Debug mode - should be False in production
DEBUG = os.environ.get('DEBUG', 'True') == 'True'

# Allowed hosts - comma-separated in production
ALLOWED_HOSTS = ['*']

# Application definition
INSTALLED_APPS = [
    'daphne',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third party
    'channels',
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',

    # Local Apps
    'users.apps.UsersConfig',
    'survey.apps.SurveyConfig',
    'mood_engine.apps.MoodEngineConfig',
    'recommendations.apps.RecommendationsConfig',
    'ai_core.apps.AiCoreConfig',
    'analytics.apps.AnalyticsConfig',
    'ai_companion.apps.AiCompanionConfig',
    'audit_ledger.apps.AuditLedgerConfig',
    'spotify_service.apps.SpotifyServiceConfig',
    'digital_twin.apps.DigitalTwinConfig',
]

ASGI_APPLICATION = 'backend_core.asgi.application'
# Channels configuration
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels.layers.InMemoryChannelLayer",
    },
}

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'audit_ledger.middleware.AuditMiddleware',
]

ROOT_URLCONF = 'backend_core.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

import os
from dotenv import load_dotenv

# Load fallback environment variables for local dev
load_dotenv()

# Database Configuration
import dj_database_url
DATABASES = {
    'default': dj_database_url.config(default=os.environ.get('DATABASE_URL'))
}

# AI API Keys
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = 'static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

AUTH_USER_MODEL = 'users.CustomUser'

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    )
}

from datetime import timedelta
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': False,
    'BLACKLIST_AFTER_ROTATION': False,
    'UPDATE_LAST_LOGIN': True,
    'SIGNING_KEY': SECRET_KEY,
}

CORS_ALLOW_ALL_ORIGINS = True  # Setup properly for prod later

# Celery Configuration
CELERY_BROKER_URL = 'redis://localhost:6379/0'
CELERY_RESULT_BACKEND = 'redis://localhost:6379/0'
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
