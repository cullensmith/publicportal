
# forms.py
from django import forms
from .models import DownloadLog

class DownloadForm(forms.ModelForm):
    class Meta:
        model = DownloadLog
        fields = ['name', 'email', 'affiliation', 'state']
        widgets = {
            'name': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Enter your name',
                'required': True,
                'id': 'userName'
            }),
            'email': forms.EmailInput(attrs={
                'class': 'form-control',
                'placeholder': 'Enter your email',
                'required': True,
                'id': 'userEmail'
            }),
            'affiliation': forms.Select(attrs={
                'class': 'form-control',
                'required': True,
                'id': 'userAffiliation'
            }),
            'state': forms.Select(attrs={
                'class': 'form-control',
                'required': True,
                'id': 'userState'
            })
        }
    