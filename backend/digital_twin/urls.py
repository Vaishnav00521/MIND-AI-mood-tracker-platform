"""
Digital Twin URL Configuration
"""

from django.urls import path
from . import views

urlpatterns = [
    path('calendar/login/', views.calendar_login, name='calendar_login'),
    path('calendar/callback/', views.calendar_callback, name='calendar_callback'),
    path('schedule/', views.get_tomorrows_schedule, name='get_tomorrows_schedule'),
    path('predict/', views.predict_burnout, name='predict_burnout'),
    path('insert-buffer/', views.insert_buffer_event, name='insert_buffer_event'),
]
