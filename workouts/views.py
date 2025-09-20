from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import UserProfile, WorkoutPlan, WorkoutSession
from .serializers import UserProfileSerializer, WorkoutPlanSerializer, WorkoutSessionSerializer

class UserProfileViewSet(viewsets.ModelViewSet):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return UserProfile.objects.filter(user=self.request.user)

    def get_object(self):
        return get_object_or_404(UserProfile, user=self.request.user)

    def list(self, request, *args, **kwargs):
        # Return the user's profile
        profile = self.get_object()
        serializer = self.get_serializer(profile)
        return Response(serializer.data)

    def update(self, request, *args, **kwargs):
        profile = self.get_object()
        serializer = self.get_serializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class WorkoutPlanViewSet(viewsets.ModelViewSet):
    serializer_class = WorkoutPlanSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return WorkoutPlan.objects.filter(user_profile__user=self.request.user)

    @action(detail=True, methods=['post'])
    def regenerate(self, request, pk=None):
        plan = self.get_object()
        # TODO: Implement workout plan generation logic
        serializer = WorkoutPlanSerializer(plan)
        return Response(serializer.data)
    
class WorkoutSessionViewSet(viewsets.ModelViewSet):
    serializer_class = WorkoutSessionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return WorkoutSession.objects.filter(user_profile__user=self.request.user)

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        session = self.get_object()
        status_val = request.data.get('status')
        notes = request.data.get('notes', '')
        
        if status_val in dict(WorkoutSession.STATUS_CHOICES):
            session.status = status_val
            if notes:
                session.notes = notes
            session.save()
            return Response({'status': 'updated'})
        return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)