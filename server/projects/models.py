
from django.db import models

class Project(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    budget_min = models.IntegerField()
    budget_max = models.IntegerField()
    duration = models.CharField(max_length=50)
    skills = models.CharField(max_length=255)  # comma-separated skills
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
