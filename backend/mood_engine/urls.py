from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MoodResultViewSet, PredictMoodView, DailyLogViewSet, DailyQuestViewSet
from .voice_analysis import analyze_voice

router = DefaultRouter()
router.register(r'results', MoodResultViewSet, basename='moodresult')
router.register(r'logs', DailyLogViewSet, basename='dailylog')
router.register(r'quests', DailyQuestViewSet, basename='dailyquest')

urlpatterns = [
    path('predict/', PredictMoodView.as_view(), name='predict_mood'),
    path('analyze-voice/', analyze_voice, name='analyze_voice'),
    path('', include(router.urls)),
]
