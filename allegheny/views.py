from django.shortcuts import render
from .models import Wells15
from .models import Parcels
from .models import Points
from .models import PolygonModel
from django.http import HttpResponse
from django.http import JsonResponse
from django.db.models import Q
import json 
import ast

# Create your views here.
def wellsdb(request):
    wells = Wells15.objects.all()
    return render(request, 'wellsdb.html', { 'wells': wells })

def allegheny(request):
    return render(request, 'allegheny.html')


def polygon_geojson_view(request):
    polygons = PolygonModel.objects.all()  # Query all polygons
    features = []
    for i,polygon in enumerate(polygons):
        # if i > 5:
        #     break
        # Parse GeoJSON text from the geomjson field
        geojson_data = polygon.geomjson
        # Add GeoJSON feature to the list
        feature = dict()
        feature['type'] = "Feature"
        feature['properties'] = {}
        feature['geometry'] = ast.literal_eval(geojson_data)
        features.append(feature)
        # print('so we got here')
        
    # Create GeoJSON FeatureCollection
    geojson_collection = {
        "type": "FeatureCollection",
        "features": features
    }
    # print(geojson_collection)
    return JsonResponse(geojson_collection)


def parcels(request):
    print('grabbing parcels')
    polygons = Parcels.objects.all()
    polygons_data = []

    for polygon in polygons:
        # print(f'parcel---> {polygon}')
        polygon_data = {
            'company': polygon.field_2,
            'record_type': polygon.field_5,
            'municipality': polygon.propertycity,
            'geometry': polygon.geomjson
        }
        polygons_data.append(polygon_data)
    print('got the parcel data')
    geojson = {
        "type": "FeatureCollection",
        "features": [
        {
            "type": "Feature",
            "geometry" : {
                "type": "MultiPolygon",
                "coordinates": [d["coordinates"]],
                },
            "properties" : d,
        } for d in polygons_data]
    }

    mapdata = json.dumps(geojson)
    return JsonResponse(mapdata, safe=False)



def points2(request):
    cty = request.GET.getlist('county[]')
    print(cty[0])
    print(request)
    points = Wells15.objects.filter(Q(county = cty[0]))
    well = list()
    for n,x in enumerate(points):
        # if n<=5:
        # print(x.county)
        tmp=vars(x)
        tmp.pop('_state')
        well.append(tmp)
    # print(well)
    print(f'newwells')
    geojson = {
        "type": "FeatureCollection",
        "features": [
        {
            "type": "Feature",
            "geometry" : {
                "type": "Point",
                "coordinates": [d["longitude"], d["latitude"]],
                },
            "properties" : d,
        } for d in well]
    }
    mapdata = json.dumps(geojson)
    return JsonResponse(mapdata, safe=False)

def points(request):
    cty = request.GET.getlist('county[]')
    print(cty[0])
    print(request)
    points = Wells15.objects.filter(Q(county = cty[0]))
    well = list()
    for n,x in enumerate(points):
        # if n>5:
        #     break
        tmp=vars(x)
        tmp.pop('_state')
        well.append(tmp)
    # print(well)
    print(f'newwells')
    features = []
    for d in well:
        geomjson_data = {

                    "type": "Point",
                    "coordinates": ast.literal_eval(f'[[[{d["longitude"]}, {d["latitude"]}]]]'),
                    
            }
            # geojson_data = polygon.geomjson
        # Add GeoJSON feature to the list
        feature = dict()
        feature['type'] = "Feature"
        feature['properties'] = {}
        feature['geometry'] = geomjson_data
        features.append(feature)
    # Create GeoJSON FeatureCollection
    geojson_collection = {
        "type": "FeatureCollection",
        "features": features
    }
    # print(geojson_collection)
    return JsonResponse(geojson_collection)


