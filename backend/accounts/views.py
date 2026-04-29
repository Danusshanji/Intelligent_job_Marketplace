from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .serializers import RegisterSerializer, UserSerializer
from .models import User
import json


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'message': 'User registered successfully',
                'token': str(refresh.access_token),
                'user': UserSerializer(user, context={'request': request}).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        if user:
            refresh = RefreshToken.for_user(user)
            return Response({
                'message': 'Login successful',
                'token': str(refresh.access_token),
                'user': UserSerializer(user, context={'request': request}).data
            })
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user, context={'request': request})
        return Response(serializer.data)


class ProfileUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        user = request.user

        user.first_name = request.data.get('first_name', user.first_name)
        user.last_name = request.data.get('last_name', user.last_name)
        user.email = request.data.get('email', user.email)
        user.phone = request.data.get('phone', user.phone)
        user.location = request.data.get('location', user.location)
        user.bio = request.data.get('bio', user.bio)
        user.education = request.data.get('education', user.education)
        user.experience = request.data.get('experience', user.experience)

        # Skills — stored as JSON string
        skills = request.data.get('skills', None)
        if skills is not None:
            if isinstance(skills, list):
                user.skills = json.dumps(skills)
            elif isinstance(skills, str):
                try:
                    json.loads(skills)  # validate JSON
                    user.skills = skills
                except Exception:
                    pass

        # Profile picture — field name is profile_picture in model
        if 'profile_pic' in request.FILES:
            user.profile_picture = request.FILES['profile_pic']

        user.save()
        return Response({
            'message': 'Profile updated successfully',
            'user': UserSerializer(user, context={'request': request}).data
        })


class ResumeUploadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        if 'resume' not in request.FILES:
            return Response(
                {'error': 'No resume file provided'},
                status=status.HTTP_400_BAD_REQUEST
            )
        file = request.FILES['resume']
        if not file.name.endswith('.pdf'):
            return Response(
                {'error': 'Only PDF files are accepted'},
                status=status.HTTP_400_BAD_REQUEST
            )
        if file.size > 5 * 1024 * 1024:
            return Response(
                {'error': 'File size must be under 5MB'},
                status=status.HTTP_400_BAD_REQUEST
            )
        user.resume = file
        user.save()
        return Response({
            'message': 'Resume uploaded successfully',
            'resume_name': str(user.resume).split('/')[-1]
        })

    def delete(self, request):
        user = request.user
        user.resume = None
        user.save()
        return Response({'message': 'Resume deleted successfully'})
class AdminUserListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'admin':
            return Response({'error': 'Unauthorized'}, status=403)
        users = User.objects.all()
        serializer = UserSerializer(users, many=True, context={'request': request})
        return Response(serializer.data)


class AdminUserDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, user_id):
        if request.user.role != 'admin':
            return Response({'error': 'Unauthorized'}, status=403)
        try:
            user = User.objects.get(id=user_id)
            user.delete()
            return Response({'message': 'User deleted successfully'})
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)


class AdminUserToggleView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, user_id):
        if request.user.role != 'admin':
            return Response({'error': 'Unauthorized'}, status=403)
        try:
            user = User.objects.get(id=user_id)
            user.is_active = request.data.get('is_active', user.is_active)
            user.save()
            return Response({'message': 'User status updated'})
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)