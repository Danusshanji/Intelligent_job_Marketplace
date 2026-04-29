from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from .models import Application
from .serializers import ApplicationSerializer


class ApplyJobView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, job_id):
        if request.user.role != 'seeker':
            return Response({'error': 'Only job seekers can apply'}, status=status.HTTP_403_FORBIDDEN)
        
        data = request.data.copy()
        data['job'] = job_id
        
        if Application.objects.filter(job=job_id, applicant=request.user).exists():
            return Response({'error': 'You have already applied for this job'}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = ApplicationSerializer(data=data)
        if serializer.is_valid():
            serializer.save(applicant=request.user)
            return Response({'message': 'Applied successfully', 'application': serializer.data}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MyApplicationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        applications = Application.objects.filter(applicant=request.user)
        serializer = ApplicationSerializer(applications, many=True)
        return Response(serializer.data)


class JobApplicationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, job_id):
        if request.user.role != 'employer':
            return Response({'error': 'Only employers can view applications'}, status=status.HTTP_403_FORBIDDEN)
        applications = Application.objects.filter(job=job_id)
        serializer = ApplicationSerializer(applications, many=True)
        return Response(serializer.data)


class UpdateApplicationStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        if request.user.role != 'employer':
            return Response({'error': 'Only employers can update status'}, status=status.HTTP_403_FORBIDDEN)
        try:
            application = Application.objects.get(pk=pk)
            application.status = request.data.get('status', application.status)
            application.save()
            return Response({'message': 'Status updated successfully'})
        except Application.DoesNotExist:
            return Response({'error': 'Application not found'}, status=status.HTTP_404_NOT_FOUND)


class AllApplicationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'admin':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        applications = Application.objects.all().select_related('applicant', 'job')
        data = []
        for app in applications:
            data.append({
                'id': app.id,
                'applicant_name': f"{app.applicant.first_name} {app.applicant.last_name}".strip() or app.applicant.username,
                'applicant_email': app.applicant.email,
                'job_title': app.job.title,
                'company': app.job.company,
                'status': app.status,
                'applied_at': app.applied_at,
                'cover_letter': app.cover_letter,
            })
        return Response(data)