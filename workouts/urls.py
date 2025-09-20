from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserProfileViewSet, WorkoutPlanViewSet, WorkoutSessionViewSet
from .auth_views import login_view, register_view, verify_token_view

router = DefaultRouter()
router.register(r'user-profile', UserProfileViewSet, basename='user-profile')
router.register(r'workout-plans', WorkoutPlanViewSet, basename='workout-plans')
router.register(r'workout-sessions', WorkoutSessionViewSet, basename='workout-sessions')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/login/', login_view, name='login'),
    path('auth/register/', register_view, name='register'),
    path('auth/verify/', verify_token_view, name='verify-token'),
]
