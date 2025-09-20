from django.db import models
from django.contrib.auth.models import User
from django.conf import settings
import json
# from cryptography.fernet import Fernet
# import base64

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    name = models.CharField(max_length=100)
    availability = models.JSONField(default=dict)  # e.g., {"mon": ["18:00-19:00"], "wed": ["19:00-20:00"]}
    equipment = models.JSONField(default=list)     # e.g., ["dumbbells", "barbell"]
    fatigue_log = models.JSONField(default=list)  # e.g., [{"date": "2025-09-20", "level": 7}]
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class WorkoutPlan(models.Model):
    user_profile = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='plans')
    start_date = models.DateField()
    weeks = models.IntegerField(default=4)
    rationale = models.TextField(blank=True)  # Explanation of plan decisions
    last_updated = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

class WorkoutSession(models.Model):
    STATUS_CHOICES = [
        ('planned', 'Planned'),
        ('completed', 'Completed'),
        ('missed', 'Missed'),
        ('rescheduled', 'Rescheduled'),
    ]
    
    user_profile = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='sessions')
    plan = models.ForeignKey(WorkoutPlan, on_delete=models.CASCADE, related_name='sessions')
    date = models.DateField()
    exercises = models.JSONField(default=list)  # List of exercise dicts with reps, sets etc.
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='planned')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
