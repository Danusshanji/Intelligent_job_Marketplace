from django.urls import path
from .views import (
    RegisterView, LoginView, ProfileView, ProfileUpdateView, ResumeUploadView,
    AdminUserListView, AdminUserDeleteView, AdminUserToggleView
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('profile/update/', ProfileUpdateView.as_view(), name='profile-update'),
    path('profile/upload-resume/', ResumeUploadView.as_view(), name='resume-upload'),
    path('admin/users/', AdminUserListView.as_view(), name='admin-users'),
    path('admin/users/<int:user_id>/delete/', AdminUserDeleteView.as_view(), name='admin-user-delete'),
    path('admin/users/<int:user_id>/toggle/', AdminUserToggleView.as_view(), name='admin-user-toggle'),
]