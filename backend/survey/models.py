import uuid
from django.db import models
from django.conf import settings

class Question(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    question_text = models.CharField(max_length=500)
    category = models.CharField(max_length=100) # mood, sleep, stress, etc.
    question_type = models.CharField(max_length=50) # positive / negative
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.question_text

class SurveyResponse(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='responses')
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    score = models.IntegerField() # 1-5
    date = models.DateField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['user', 'date']),
        ]

    def __str__(self):
        return f"{self.user.email} - {self.date}"
