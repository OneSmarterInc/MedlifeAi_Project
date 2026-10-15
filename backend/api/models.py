from django.db import models
from django.contrib.auth.models import User

class FamilyProfile(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="family_profiles", null=True, blank=True)
    name = models.CharField(max_length=150)
    relation = models.CharField(max_length=100, blank=True, null=True)
    age = models.IntegerField(blank=True, null=True)
    height = models.CharField(max_length=50, blank=True, null=True)
    weight = models.CharField(max_length=50, blank=True, null=True)
    a1c = models.CharField(max_length=50, blank=True, null=True)
    blood_pressure = models.CharField(max_length=50, blank=True, null=True)
    conditions = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name