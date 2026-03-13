from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import QuestionViewSet, SurveyResponseViewSet

router = DefaultRouter()
router.register(r'questions', QuestionViewSet, basename='question')
router.register(r'responses', SurveyResponseViewSet, basename='surveyresponse')

urlpatterns = [
    path('', include(router.urls)),
]
