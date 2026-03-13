from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Avg, Count
from django.utils import timezone
from datetime import timedelta
from users.permissions import IsTherapist
from django.contrib.auth import get_user_model
from mood_engine.models import DailyLog

User = get_user_model()

class TherapistDashboardAnalytics(APIView):
    """
    Enterprise B2B Corp-Net Endpoint
    """
    permission_classes = [IsTherapist]

    def get(self, request):
        thirty_days_ago = timezone.now().date() - timedelta(days=30)
        
        # 1. Total number of active patients
        # Assuming patients mapped to this therapist or simply all active patients for demo
        active_patients_count = User.objects.filter(role='PATIENT').count()

        # 2. Average clinic mood score over the last 30 days
        clinic_mood_avg = DailyLog.objects.filter(
            date__gte=thirty_days_ago
        ).aggregate(
            avg_score=Avg('mood_score')
        )['avg_score'] or 0.0

        # 3. Serialized list of patients with depression_risk_flag = True
        critical_patients = User.objects.filter(
            role='PATIENT', 
            depression_risk_flag=True
        ).values('id', 'name', 'email', 'age', 'gender')

        return Response({
            "active_patients": active_patients_count,
            "clinic_mood_average_30d": round(clinic_mood_avg, 2),
            "critical_alerts": list(critical_patients)
        })
