from django.urls import path
from . import views


app_name = 'wells'

urlpatterns = [
    path('',views.wells, name="wells"),
    path('generate_new_table',views.generate_new_table, name="generate_new_table"),
    path('update_table',views.update_table, name="update_table"),
    path('generate_geojson',views.generate_geojson, name="generate_geojson"),
]
