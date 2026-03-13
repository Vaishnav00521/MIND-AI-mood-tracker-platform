from django.apps import AppConfig

class MoodEngineConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'mood_engine'

    def ready(self):
        import mood_engine.signals
