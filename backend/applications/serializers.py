from rest_framework import serializers
from .models import Application
from jobs.serializers import JobSerializer

class ApplicationSerializer(serializers.ModelSerializer):
    job_details = JobSerializer(source='job', read_only=True)
    applicant_name = serializers.CharField(source='applicant.username', read_only=True)

    class Meta:
        model = Application
        fields = [
            'id',
            'job',
            'job_details',
            'applicant',
            'applicant_name',
            'cover_letter',
            'resume',
            'status',
            'applied_at'
        ]
        read_only_fields = ['applicant', 'applied_at', 'status']