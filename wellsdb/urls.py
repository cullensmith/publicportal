from django.urls import path
from . import views


app_name = 'wellsdb'

urlpatterns = [
    path('',views.wellsdb, name="wellsdb"),
    path('',views.fwells, name="fwells"),
    path('your_view',views.your_view, name="your_view"),

]
