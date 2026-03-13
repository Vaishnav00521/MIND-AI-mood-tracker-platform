from rest_framework import viewsets, mixins, status
from rest_framework.permissions import IsAuthenticated
from .models import MoodResult, DailyLog, DailyQuest
from rest_framework import serializers
from rest_framework.decorators import action
from django.utils import timezone
from datetime import timedelta

class MoodResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = MoodResult
        fields = '__all__'

class MoodResultViewSet(viewsets.ReadOnlyModelViewSet):
    """
    GET /api/mood/results/ - Returns historical mood scores for calendar/dashboard
    """
    serializer_class = MoodResultSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return MoodResult.objects.filter(user=self.request.user).order_by('-date')

class DailyLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyLog
        fields = '__all__'
        read_only_fields = ['user']

class DailyLogViewSet(viewsets.ModelViewSet):
    serializer_class = DailyLogSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return DailyLog.objects.filter(user=self.request.user).order_by('-date')

    def create(self, request, *args, **kwargs):
        """
        Overrides default create to return 202 Accepted and dispatch ML task dynamically
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        # Dispatch Async Celery Task for ML analysis
        try:
            from ai_core.tasks import analyze_daily_risk_level
            mood_score = serializer.validated_data.get('mood_score', 50)
            sleep_hours = serializer.validated_data.get('sleep_hours', 7.0)
            analyze_daily_risk_level.delay(str(request.user.id), mood_score, sleep_hours)
        except Exception as e:
            print(f"Failed to dispatch ML task: {e}")

        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_202_ACCEPTED, headers=headers)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def heatmap_data(self, request):
        """
        Returns JSON array formatted for GitHub-style contribution graph (last 365 days)
        [{ "date": "YYYY-MM-DD", "score": 85 }, ...]
        """
        one_year_ago = timezone.now().date() - timedelta(days=365)
        logs = DailyLog.objects.filter(user=request.user, date__gte=one_year_ago).values('date', 'mood_score')
        
        # Format explicitly for simple frontend consumption
        data = [{"date": str(log['date']), "score": log['mood_score']} for log in logs]
        return Response(data)

class DailyQuestSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyQuest
        fields = '__all__'
        read_only_fields = ['user']

class DailyQuestViewSet(viewsets.ModelViewSet):
    serializer_class = DailyQuestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return DailyQuest.objects.filter(user=self.request.user).order_by('-date')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

from rest_framework.views import APIView
from rest_framework.response import Response
from .ml_predict import predict_mood

class PredictMoodView(APIView):
    """
    POST /api/mood/predict/
    Accepts current stats and returns tomorrow's predicted mood.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        sleep_hours = request.data.get('sleep_hours', 7.0)
        stress_score = request.data.get('stress_score', 50.0)
        current_mood = request.data.get('current_mood', 70.0)
        
        try:
            prediction = predict_mood(float(sleep_hours), float(stress_score), float(current_mood))
            return Response({'predicted_mood_score': prediction})
        except Exception as e:
            return Response({'error': str(e)}, status=400)
