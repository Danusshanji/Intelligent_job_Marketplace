from rest_framework import serializers
from .models import User
import json


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'role']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            role=validated_data['role']
        )
        return user


class UserSerializer(serializers.ModelSerializer):
    skills = serializers.SerializerMethodField()
    resume_name = serializers.SerializerMethodField()
    applications_count = serializers.SerializerMethodField()
    profile_pic_url = serializers.SerializerMethodField()
    company_logo_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'first_name', 'last_name',
            'email', 'role', 'phone', 'location', 'bio',
            'skills', 'education', 'experience',
            'profile_pic_url', 'resume', 'resume_name',
            'applications_count',
            # Employer fields
            'company_name', 'company_website', 'company_description',
            'industry', 'company_size', 'company_logo_url',
        ]

    def get_skills(self, obj):
        if not obj.skills:
            return []
        if isinstance(obj.skills, list):
            return obj.skills
        try:
            return json.loads(obj.skills)
        except Exception:
            return []

    def get_resume_name(self, obj):
        if obj.resume:
            return str(obj.resume).split('/')[-1]
        return None

    def get_profile_pic_url(self, obj):
        request = self.context.get('request')
        if obj.profile_picture:
            if request:
                return request.build_absolute_uri(obj.profile_picture.url)
            return obj.profile_picture.url
        return None

    def get_company_logo_url(self, obj):
        request = self.context.get('request')
        if obj.company_logo:
            if request:
                return request.build_absolute_uri(obj.company_logo.url)
            return obj.company_logo.url
        return None

    def get_applications_count(self, obj):
        try:
            if obj.role == 'employer':
            # Count jobs posted by this employer
                from jobs.models import Job
                return Job.objects.filter(employer=obj).count()
            return obj.applications.count()
        except Exception:
            return 0