from rest_framework import serializers
from .models import Application
from jobs.serializers import JobSerializer
import json


class ApplicationSerializer(serializers.ModelSerializer):
    job_details = JobSerializer(source='job', read_only=True)
    applicant_name = serializers.SerializerMethodField()
    applicant_email = serializers.SerializerMethodField()
    applicant_location = serializers.SerializerMethodField()
    applicant_skills = serializers.SerializerMethodField()
    resume_url = serializers.SerializerMethodField()
    profile_pic_url = serializers.SerializerMethodField()

    class Meta:
        model = Application
        fields = [
            'id',
            'job',
            'job_details',
            'applicant',
            'applicant_name',
            'applicant_email',
            'applicant_location',
            'applicant_skills',
            'resume_url',
            'profile_pic_url',
            'cover_letter',
            'resume',
            'status',
            'applied_at',
        ]
        read_only_fields = ['applicant', 'applied_at', 'status']

    def get_applicant_name(self, obj):
        full_name = f"{obj.applicant.first_name} {obj.applicant.last_name}".strip()
        return full_name if full_name else obj.applicant.username

    def get_applicant_email(self, obj):
        return obj.applicant.email

    def get_applicant_location(self, obj):
        return obj.applicant.location or ""

    def get_applicant_skills(self, obj):
        if not obj.applicant.skills:
            return []
        if isinstance(obj.applicant.skills, list):
            return obj.applicant.skills
        try:
            return json.loads(obj.applicant.skills)
        except Exception:
            return []

    def get_resume_url(self, obj):
        request = self.context.get('request')
        # First check applicant's profile resume
        if obj.applicant.resume:
            if request:
                return request.build_absolute_uri(obj.applicant.resume.url)
            return obj.applicant.resume.url
        # Fall back to application resume
        if obj.resume:
            if request:
                return request.build_absolute_uri(obj.resume.url)
            return obj.resume.url
        return None

    def get_profile_pic_url(self, obj):
        request = self.context.get('request')
        if obj.applicant.profile_picture:
            if request:
                return request.build_absolute_uri(obj.applicant.profile_picture.url)
            return obj.applicant.profile_picture.url
        return None