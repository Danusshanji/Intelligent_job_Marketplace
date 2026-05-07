from rest_framework import serializers
from .models import Job


class JobSerializer(serializers.ModelSerializer):
    employer_name = serializers.CharField(source='employer.username', read_only=True)
    company_description = serializers.CharField(source='employer.company_description', read_only=True)
    company_website = serializers.CharField(source='employer.company_website', read_only=True)
    company_industry = serializers.CharField(source='employer.industry', read_only=True)
    company_size = serializers.CharField(source='employer.company_size', read_only=True)
    company_logo_url = serializers.SerializerMethodField()

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
            'created_at',
            # Company profile fields
            'company_description',
            'company_website',
            'company_industry',
            'company_size',
            'company_logo_url',
        ]
        read_only_fields = ['employer', 'created_at']

    def get_company_logo_url(self, obj):
        request = self.context.get('request')
        if obj.employer.company_logo:
            if request:
                return request.build_absolute_uri(obj.employer.company_logo.url)
            return obj.employer.company_logo.url
        return None