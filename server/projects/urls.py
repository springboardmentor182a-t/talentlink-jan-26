from django.urls import path
from .views import ProjectListView

urlpatterns = [
    path('projects/', ProjectListView.as_view(), name='project-list'),
]
