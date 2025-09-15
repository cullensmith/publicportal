# forms.py
from django import forms
from .models import DownloadLog

class DownloadForm(forms.ModelForm):
    class Meta:
        model = DownloadLog
        fields = ['name', 'email', 'affiliation', 'state']
        labels = {
            'name' : 'Name' ,
            'email' : 'Email address',
            'affiliation' : 'Affiliation',
            'state' : 'State'
        }
        widgets = {
            'name': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Enter your preferred name',
                'required': True
            }),
            'email': forms.EmailInput(attrs={
                'class': 'form-control',
                'placeholder': 'Enter your email address',
                'required': True
            }),
            'affiliation': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Select your affiliation',
                'required': True
            }),
            'state': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Select your state',
                'required': True
            })
        }
    
    def clean_email(self):
        email = self.cleaned_data.get('email')
        if email:
            email = email.lower().strip()
        return email