from django.urls import path
from . import views


app_name = 'wellsdb'

urlpatterns = [
    path('',views.wellsdb, name="wellsdb"),
    path('cracker',views.cracker, name="cracker"),
    path('terminalspetro',views.terminalspetro, name="terminalspetro"),
    path('boxdata',views.boxdata, name="boxdata"),
    path('your_view',views.your_view, name="your_view"),
    path('cracker_states',views.cracker_states, name="cracker_states"),
    path('added_states',views.added_states, name="added_states"),
    path('cracker_states2',views.cracker_states2, name="cracker_states2"),
    path('added_states2',views.added_states2, name="added_states2"),
]
