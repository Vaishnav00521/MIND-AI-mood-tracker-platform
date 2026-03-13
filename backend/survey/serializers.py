from rest_framework import serializers
from .models import Question, SurveyResponse

class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = '__all__'

class SurveyResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = SurveyResponse
        fields = ['id', 'question', 'score', 'date', 'created_at']
        read_only_fields = ['id', 'date', 'created_at']
