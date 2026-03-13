"""
Django settings for backend_core project.
"""

from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Quick-start development settings - unsuitable for production
SECRET_KEY = 'django-insecure-tdv1_&nv(x+lt(&!ik%*uq&*mvage$dx9q&5atf1cs9y+-+ygv'
DEBUG = True
ALLOWED_HOSTS = []

# Application definition
INSTALLED_APPS = [
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
]

ASGI_APPLICATION = 'backend_core.asgi.application'
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            "hosts": [('127.0.0.1', 6379)],
        },
    },
}

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
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

# Initialize Zero-Trust Azure Key Vault Abstraction
from .keyvault import vault

# Database Connections (Pulled securely from Azure Key Vault when deployed)
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': vault.get_secret('DB_NAME') or os.getenv('DB_NAME'),
        'USER': vault.get_secret('DB_USER') or os.getenv('DB_USER'),
        'PASSWORD': vault.get_secret('DB_PASSWORD') or os.getenv('DB_PASSWORD'),
        'HOST': vault.get_secret('DB_HOST') or os.getenv('DB_HOST'),
        'PORT': vault.get_secret('DB_PORT', '5432') or os.getenv('DB_PORT', '5432'),
        'OPTIONS': {
            'sslmode': 'require',  # Enforce SSL connections across all interfaces
        },
    }
}

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
