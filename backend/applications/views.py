from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.core.mail import send_mail
from django.conf import settings
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
        applications = Application.objects.filter(applicant=request.user).select_related('applicant', 'job')
        serializer = ApplicationSerializer(applications, many=True, context={'request': request})
        return Response(serializer.data)


class JobApplicationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, job_id):
        if request.user.role != 'employer':
            return Response(
                {'error': 'Only employers can view applications'},
                status=status.HTTP_403_FORBIDDEN
            )
        applications = Application.objects.filter(job=job_id).select_related('applicant', 'job')
        serializer = ApplicationSerializer(applications, many=True, context={'request': request})
        return Response(serializer.data)


class UpdateApplicationStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        if request.user.role != 'employer':
            return Response(
                {'error': 'Only employers can update status'},
                status=status.HTTP_403_FORBIDDEN
            )
        try:
            application = Application.objects.get(pk=pk)
            new_status = request.data.get('status', application.status)
            application.status = new_status

            if new_status == 'interview_scheduled':
                interview_link = request.data.get('interview_link', '')
                interview_date = request.data.get('interview_date', '')
                interview_message = request.data.get('interview_message', '')

                application.interview_link = interview_link
                application.interview_message = interview_message

                if interview_date:
                    from django.utils.dateparse import parse_datetime
                    application.interview_date = parse_datetime(interview_date)

                try:
                    from datetime import datetime
                    candidate_name = application.applicant.first_name or application.applicant.username

                    # Format date with AM/PM
                    try:
                        dt = datetime.strptime(interview_date, '%Y-%m-%dT%H:%M')
                        formatted_date = dt.strftime('%d %B %Y, %I:%M %p')
                    except Exception:
                        formatted_date = interview_date

                    subject = f"Interview Invitation — {application.job.title} at {application.job.company}"
                    message = f"""
Dear {candidate_name},

Congratulations! You have been shortlisted for the position of {application.job.title} at {application.job.company}.

We would like to invite you for a virtual interview.

Interview Details:
——————————————————
Position    : {application.job.title}
Company     : {application.job.company}
Date & Time : {formatted_date}
Meeting Link: {interview_link}
——————————————————

{f'Message from Employer: {interview_message}' if interview_message else ''}

Please join the meeting on time. Prepare well and best of luck!

Regards,
{application.job.company}
Intelligent Job Marketplace
                    """
                    send_mail(
                        subject,
                        message,
                        settings.DEFAULT_FROM_EMAIL,
                        [application.applicant.email],
                        fail_silently=False,
                    )
                    print(f"Interview email sent to {application.applicant.email}")
                except Exception as e:
                    print(f"Email sending failed: {e}")

            application.save()
            return Response({
                'message': f'Application status updated to {new_status}',
                'status': new_status
            })

        except Application.DoesNotExist:
            return Response(
                {'error': 'Application not found'},
                status=status.HTTP_404_NOT_FOUND
            )


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