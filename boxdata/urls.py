from django.urls import path
from . import views


app_name = 'boxdata'

urlpatterns = [
    path('',views.boxdata, name="boxdata"),
]