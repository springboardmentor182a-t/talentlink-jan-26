from rest_framework import filters
from rest_framework.generics import ListAPIView
from django_filters.rest_framework import DjangoFilterBackend
from .models import Project
from .serializers import ProjectSerializer
from django_filters import rest_framework as django_filters

# Filter class
class ProjectFilter(django_filters.FilterSet):
    skills = django_filters.CharFilter(field_name='skills', lookup_expr='icontains')
    budget_min = django_filters.NumberFilter(field_name='budget_min', lookup_expr='gte')
    budget_max = django_filters.NumberFilter(field_name='budget_max', lookup_expr='lte')

    class Meta:
        model = Project
        fields = ['skills', 'budget_min', 'budget_max', 'duration']

# API view
class ProjectListView(ListAPIView):
    queryset = Project.objects.all().order_by('-created_at')
    serializer_class = ProjectSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ProjectFilter
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'budget_min', 'budget_max']
    ordering = ['-created_at']  # default newest first
