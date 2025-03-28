from django.db import models
from core.models import System

# Create your models here.


# class Service(models.Model):
#     """Services offered in workshops"""
#     system = models.ForeignKey(System, on_delete=models.CASCADE)
#     name = models.CharField(max_length=100)
#     price = models.DecimalField(max_digits=10, decimal_places=2)


# class Appointment(models.Model):
#     """Appointments in workshops"""
#     system = models.ForeignKey(System, on_delete=models.CASCADE)
#     customer_name = models.CharField(max_length=100)
#     service = models.ForeignKey(Service, on_delete=models.CASCADE)
#     appointment_time = models.DateTimeField()
#     completed = models.BooleanField(default=False)


