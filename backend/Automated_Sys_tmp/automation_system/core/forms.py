from django import forms
from core.models import System

class SystemForm(forms.ModelForm):
    class Meta:
        model = System
        fields = ["name", "category"]
# unUsed
  
  
  
  