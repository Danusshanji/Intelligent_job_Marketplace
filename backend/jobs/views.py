from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Job
from .serializers import JobSerializer


class JobListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        jobs = Job.objects.filter(is_active=True)
        serializer = JobSerializer(jobs, many=True, context={'request': request})
        return Response(serializer.data)


class JobCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role != 'employer':
            return Response(
                {'error': 'Only employers can post jobs'},
                status=status.HTTP_403_FORBIDDEN
            )
        serializer = JobSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save(employer=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class JobDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        try:
            job = Job.objects.get(pk=pk, is_active=True)
            serializer = JobSerializer(job, context={'request': request})
            return Response(serializer.data)
        except Job.DoesNotExist:
            return Response(
                {'error': 'Job not found'},
                status=status.HTTP_404_NOT_FOUND
            )

    def delete(self, request, pk):
        try:
            job = Job.objects.get(pk=pk, employer=request.user)
            job.delete()
            return Response({'message': 'Job deleted successfully'})
        except Job.DoesNotExist:
            return Response(
                {'error': 'Job not found'},
                status=status.HTTP_404_NOT_FOUND
            )