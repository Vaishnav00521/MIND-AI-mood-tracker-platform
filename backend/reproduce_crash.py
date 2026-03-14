import os
import sys
from unittest.mock import MagicMock

# Mock azure modules
mock_azure = MagicMock()
sys.modules['azure'] = mock_azure
sys.modules['azure.identity'] = MagicMock()
sys.modules['azure.keyvault'] = MagicMock()
sys.modules['azure.keyvault.secrets'] = MagicMock()
sys.modules['azure.core'] = MagicMock()
sys.modules['azure.core.exceptions'] = MagicMock()

import django
from django.conf import settings

# Set up Django environment with SQLite for testing
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_core.settings')

# Override DATABASES before django.setup()
if not settings.configured:
    settings.configure(
        DATABASES={
            'default': {
                'ENGINE': 'django.db.backends.sqlite3',
                'NAME': ':memory:',
            }
        },
        INSTALLED_APPS=[
            'django.contrib.admin',
            'django.contrib.auth',
            'django.contrib.contenttypes',
            'django.contrib.sessions',
            'django.contrib.messages',
            'django.contrib.staticfiles',
            'rest_framework',
            'users.apps.UsersConfig',
            'mood_engine.apps.MoodEngineConfig',
            'survey.apps.SurveyConfig',
            'ai_core.apps.AiCoreConfig',
        ],
        AUTH_USER_MODEL='users.CustomUser',
        REST_FRAMEWORK={
            'DEFAULT_AUTHENTICATION_CLASSES': (
                'rest_framework.authentication.SessionAuthentication',
            )
        },
        SECRET_KEY='fake-key',
        ROOT_URLCONF='backend_core.urls',
        MIDDLEWARE=[
            'django.contrib.sessions.middleware.SessionMiddleware',
            'django.contrib.auth.middleware.AuthenticationMiddleware',
            'django.contrib.messages.middleware.MessageMiddleware',
        ],
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
        ],
    )

django.setup()

from django.core.management import call_command
call_command('migrate', verbosity=0)

from rest_framework.test import APIClient
from rest_framework import status
from users.models import CustomUser
from mood_engine.models import DailyLog

def reproduce_crash():
    client = APIClient()
    
    # Create a user
    user = CustomUser.objects.create_user(
        email='crash_test@example.com',
        password='password123',
        name='Crash Test'
    )
    
    # Create a DailyLog entry
    log = DailyLog.objects.create(
        user=user,
        mood_score=75,
        sleep_hours=8.0,
        journal_entry='Testing delete crash'
    )
    
    # Authenticate
    client.force_authenticate(user=user)
    
    # Try to delete the entry
    url = f'/api/mood/logs/{log.id}/'
    print(f"Attempting to DELETE {url}")
    
    try:
        response = client.delete(url)
        print(f"Response status: {response.status_code}")
        if response.status_code == status.HTTP_204_NO_CONTENT:
            print("Delete successful, no crash detected.")
        else:
            print(f"Delete failed with status {response.status_code}")
            if hasattr(response, 'data'):
                print(f"Response data: {response.data}")
    except Exception as e:
        print(f"CRASH DETECTED: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    reproduce_crash()
