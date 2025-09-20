from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from .models import UserProfile, WorkoutPlan, WorkoutSession

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = UserProfile
        fields = ['id', 'user', 'name', 'availability', 'equipment', 'fatigue_log', 'created_at', 'updated_at']

class WorkoutPlanSerializer(serializers.ModelSerializer):
    sessions = serializers.SerializerMethodField()
    
    class Meta:
        model = WorkoutPlan
        fields = ['id', 'user_profile', 'start_date', 'weeks', 'rationale', 'last_updated', 'created_at', 'sessions']
    
    def get_sessions(self, obj):
        return WorkoutSessionSerializer(obj.sessions.all(), many=True).data

class WorkoutSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkoutSession
        fields = ['id', 'user_profile', 'plan', 'date', 'exercises', 'status', 'notes', 'created_at', 'updated_at']

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(min_length=8)
