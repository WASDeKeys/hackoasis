from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.db import IntegrityError
from .serializers import LoginSerializer, RegisterSerializer, UserSerializer, UserProfileSerializer
from .models import UserProfile
from django.conf import settings
import base64
import hashlib
# from Crypto.Cipher import AES
# from Crypto.Util.Padding import unpad

def decrypt_password(encrypted_password):
    """Decrypt password from frontend - temporarily disabled for debugging"""
    # For now, return the password as-is to test registration
    # TODO: Implement proper AES decryption compatible with CryptoJS
    return encrypted_password

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']
        password = decrypt_password(serializer.validated_data['password'])
        
        try:
            user = User.objects.get(email=email)
            user = authenticate(username=user.username, password=password)
            
            if user:
                token, created = Token.objects.get_or_create(user=user)
                user_profile, created = UserProfile.objects.get_or_create(
                    user=user,
                    defaults={'name': user.get_full_name() or user.username}
                )
                
                return Response({
                    'token': token.key,
                    'user': {
                        'id': user.id,
                        'email': user.email,
                        'username': user.username,
                        'name': user_profile.name
                    }
                })
            else:
                return Response(
                    {'message': 'Invalid credentials'}, 
                    status=status.HTTP_401_UNAUTHORIZED
                )
        except User.DoesNotExist:
            return Response(
                {'message': 'User not found'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']
        username = serializer.validated_data['username']
        password = decrypt_password(serializer.validated_data['password'])
        
        try:
            # Check if user already exists
            if User.objects.filter(email=email).exists():
                return Response(
                    {'message': 'Email already exists'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            if User.objects.filter(username=username).exists():
                return Response(
                    {'message': 'Username already exists'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Create user
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password
            )
            
            # Create user profile
            user_profile = UserProfile.objects.create(
                user=user,
                name=user.get_full_name() or username
            )
            
            # Create token
            token = Token.objects.create(user=user)
            
            return Response({
                'token': token.key,
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'username': user.username,
                    'name': user_profile.name
                }
            })
            
        except IntegrityError:
            return Response(
                {'message': 'User already exists'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def verify_token_view(request):
    user = request.user
    try:
        user_profile = user.profile
        return Response({
            'id': user.id,
            'email': user.email,
            'username': user.username,
            'name': user_profile.name
        })
    except UserProfile.DoesNotExist:
        # Create profile if it doesn't exist
        user_profile = UserProfile.objects.create(
            user=user,
            name=user.get_full_name() or user.username
        )
        return Response({
            'id': user.id,
            'email': user.email,
            'username': user.username,
            'name': user_profile.name
        })
