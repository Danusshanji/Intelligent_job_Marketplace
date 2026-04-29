from rest_framework import serializers
from .models import Job

class JobSerializer(serializers.ModelSerializer):
    employer_name = serializers.CharField(source='employer.username', read_only=True)
    
    class Meta:
        model = Job
        fields = [
            'id', 
            'employer', 
            'employer_name',
            'title', 
            'company', 
            'location', 
            'job_type', 
            'description', 
            'requirements', 
            'skills_required', 
            'salary', 
            'is_active', 
            'created_at'
        ]
        read_only_fields = ['employer', 'created_at']