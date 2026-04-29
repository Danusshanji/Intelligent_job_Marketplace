from django.urls import path
from .views import JobRecommendationsView, CandidateRankingView, ExtractSkillsView

urlpatterns = [
    path('recommendations/', JobRecommendationsView.as_view(), name='job-recommendations'),
    path('rank-candidates/<int:job_id>/', CandidateRankingView.as_view(), name='rank-candidates'),
    path('extract-skills/', ExtractSkillsView.as_view(), name='extract-skills'),
]