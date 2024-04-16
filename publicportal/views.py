#from django.http import HttpResponse
from django.shortcuts import render

def homepage(request):
    #return HttpResponse("Welcome to the Public Facing Data Portal")
    return render(request, 'home.html')

def about(request):
    #return HttpResponse("Datasets are currently limited")
    return render(request, 'about.html')