from django.urls import path
from .views import TherapistDashboardAnalytics

urlpatterns = [
    path('dashboard/', TherapistDashboardAnalytics.as_view(), name='therapist_dashboard'),
]
