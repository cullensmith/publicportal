from django.urls import path
from . import views
# from .views import request_csv


app_name = 'wells'

urlpatterns = [
    path('',views.wells, name="home"),
    path('generate_new_table',views.generate_new_table, name="generate_new_table"),
    path('update_table',views.update_table, name="update_table"),
    path('generate_geojson',views.generate_geojson, name="generate_geojson"),
    path('getcounties_view',views.getcounties_view, name="getcounties_view"),
    path('getstates_view',views.getstates_view, name="getstates_view"),
    path('createCountyList',views.createCountyList, name="createCountyList"),
    path('createStatusList',views.createStatusList, name="createStatusList"),
    path('createTypeList',views.createTypeList, name="createTypeList"),
    # path('request-csv/', request_csv, name='request_csv'),
    # path('send-csv-email/', views.send_csv_email, name='send_csv_email'),

]
