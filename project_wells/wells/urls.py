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
    path('get_county_counts', views.get_county_counts, name='get_county_counts'),
    path('get_table_page', views.get_table_page, name='get_table_page'),
    path('get_records_in_circle', views.get_records_in_circle, name='get_records_in_circle'),
    path('download-csv/', views.download_csv, name='download_csv'),
    path('tiles/<int:z>/<int:x>/<int:y>', views.well_tiles, name='well_tiles'),
    path('nearest_well', views.nearest_well, name='nearest_well'),
    # path('check_ip', views.check_ip, name='check_ip'),
    # path('send-csv-email/', views.send_csv_email, name='send_csv_email'),

]
