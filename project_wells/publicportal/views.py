#from django.http import HttpResponse
from django.shortcuts import render

def homepage(request):
    #return HttpResponse("Welcome to the Public Facing Data Portal")
    return render(request, '/wells/templates/wells.html')

# def homepage(request):
#     #return HttpResponse("Welcome to the Public Facing Data Portal")
#     return render(request, 'wells.html')

