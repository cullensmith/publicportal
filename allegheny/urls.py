from django.urls import path
from . import views


app_name = 'allegheny'

urlpatterns = [
    path('',views.allegheny, name="allegheny"),
    path('wellsdb',views.wellsdb, name="wellsdb"),
    path('parcels',views.parcels, name="parcels"),
    path('points',views.points, name="points"),
    path('polygon_geojson_view', views.polygon_geojson_view, name='polygon_geojson_view'),
]