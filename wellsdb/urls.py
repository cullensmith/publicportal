from django.urls import path
from . import views


app_name = 'wellsdb'

urlpatterns = [
    path('',views.wellsdb, name="wellsdb"),
    path('cracker',views.cracker, name="cracker"),
    path('terminalspetro',views.terminalspetro, name="terminalspetro"),
    path('<slug:slug>',views.boxdata, name="boxdata"),
    path('your_view',views.your_view, name="your_view"),

]
