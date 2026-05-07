from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from jobs.models import Job
from applications.models import Application
from .matcher import get_job_recommendations, rank_candidates_for_job, extract_skills_from_text, extract_text_from_resume
import os


class JobRecommendationsView(APIView):
    """Returns AI-ranked job recommendations for a job seeker based on their resume."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        # Check if user has a resume
        if not user.resume:
            return Response({
                'message': 'Please upload your resume to get job recommendations.',
                'recommendations': []
            })

        # Get all active jobs
        jobs = Job.objects.filter(is_active=True)
        jobs_data = [
            {
                'id': job.id,
                'title': job.title,
                'company': job.company,
                'location': job.location,
                'job_type': job.job_type,
                'salary': str(job.salary) if job.salary else '',
                'description': job.description,
                'skills_required': job.skills_required or '',
            }
            for job in jobs
        ]

        # Get resume file path
        resume_path = user.resume.path

        # Run AI matching
        ranked_jobs = get_job_recommendations(resume_path, jobs_data)

        # Only return jobs with score > 0
        recommendations = [j for j in ranked_jobs if j['match_score'] > 1]

        return Response({
            'recommendations': recommendations,
            'total': len(recommendations)
        })


class CandidateRankingView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, job_id):
        user = request.user

        if user.role != 'employer':
            return Response(
                {'error': 'Only employers can access candidate rankings.'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            job = Job.objects.get(id=job_id, employer=user)
        except Job.DoesNotExist:
            return Response(
                {'error': 'Job not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        applications = Application.objects.filter(job=job).select_related('applicant')

        job_data = {
            'title': job.title,
            'description': job.description,
            'skills_required': job.skills_required or '',
        }

        apps_data = []
        for app in applications:
            resume_path = app.applicant.resume.path if app.applicant.resume else None
            resume_url = None
            if app.applicant.resume:
                try:
                    resume_url = request.build_absolute_uri(app.applicant.resume.url)
                except Exception:
                    resume_url = None

            apps_data.append({
                'id': app.id,
                'applicant_id': app.applicant.id,
                'applicant_name': f"{app.applicant.first_name} {app.applicant.last_name}".strip() or app.applicant.username,
                'applicant_email': app.applicant.email,
                'status': app.status,
                'applied_at': str(app.applied_at),
                'cover_letter': app.cover_letter,
                'resume_path': resume_path,
                'resume_url': resume_url,
            })

        ranked = rank_candidates_for_job(job_data, apps_data)

        # Remove resume_path but keep resume_url
        for r in ranked:
            r.pop('resume_path', None)

        return Response({
            'job_title': job.title,
            'ranked_candidates': ranked,
            'total': len(ranked)
        })


class ExtractSkillsView(APIView):
    """Extracts skills from the logged-in user's resume and updates their profile."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user

        if not user.resume:
            return Response(
                {'error': 'No resume found. Please upload your resume first.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        resume_text = extract_text_from_resume(user.resume.path)
        skills = extract_skills_from_text(resume_text)

        if skills:
            import json
            user.skills = json.dumps(skills)
            user.save()

        return Response({
            'message': 'Skills extracted successfully from your resume.',
            'skills': skills
        })