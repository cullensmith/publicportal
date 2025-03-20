from django.shortcuts import render
from .models import Wells, Counties, States, stStatus, stType #, CountyNames
from django.http import HttpResponse
from django.http import JsonResponse
from django.views.generic import View
from django.db.models import Q
import json 
import ast



# Create your views here.
def wells(request):
    wells = Wells.objects.all()
    return render(request, 'wells.html', { 'wells': wells })

def createCountyList(request):
    filtered = list()
    print(request.GET.getlist('states')) #[0].split(',')
    print('states_in request ^')
    states_in = request.GET.getlist('states')[0].split(',')
    states = [s.strip().replace('input-','') for s in states_in]
    print(f'states_county: {states}')
    cl = Counties.objects.filter(statename__in=states)  # Query all polygons
    for c in cl:
        item = dict()
        item['county'] = c.county
        item['statename'] = c.statename
        item['stusps'] = c.stusps
        filtered.append(item)
        
    return JsonResponse(json.dumps(sorted(filtered, key=lambda x: (x['stusps'], x['county']))), safe=False)

def createStatusList(request):
    filtered = list()
    states_in = request.GET.getlist('states')[0].split(',')
    states = [statenameMap(s.strip().replace('input-','')) for s in states_in if len(s) > 1]
    print(f'states_status: {states}')
    cl = stStatus.objects.filter(stusps__in=states)  # Query all polygons
    for c in cl:
        # print(f'c status= {c.well_status}')
        # print(f'c usps= {c.stusps}')
        item = dict()
        item['well_status'] = c.well_status
        item['stusps'] = c.stusps
        filtered.append(item)
        
    return JsonResponse(json.dumps(sorted(filtered, key=lambda x: (x['stusps'], x['well_status']))), safe=False)

def createTypeList(request):
    filtered = list()
    states_in = request.GET.getlist('states')[0].split(',')
    states = [statenameMap(s.strip().replace('input-','')) for s in states_in if len(s) > 1]
    print(f'states_type: {states}')
    cl = stType.objects.filter(stusps__in=states)  # Query all polygons
    for c in cl:
        item = dict()
        item['well_type'] = c.well_type
        item['stusps'] = c.stusps
        filtered.append(item)
        
    return JsonResponse(json.dumps(sorted(filtered, key=lambda x: (x['stusps'], x['well_type']))), safe=False)

def statenameMap(s):
    statedict = {
        "Alabama": "AL",
        # "Alaska": "AK",
        "Arizona": "AZ",
        "Arkansas": "AR",
        "California": "CA",
        "Colorado": "CO",
        # "Connecticut": "CT",
        # "Delaware": "DE",
        "Florida": "FL",
        # "Georgia": "GA",
        # "Hawaii": "HI",
        "Idaho": "ID",
        "Illinois": "IL",
        "Indiana": "IN",
        "Iowa": "IA",
        "Kansas": "KS",
        "Kentucky": "KY",
        "Louisiana": "LA",
        # "Maine": "ME",
        "Maryland": "MD",
        # "Massachusetts": "MA",
        "Michigan": "MI",
        # "Minnesota": "MN",
        "Mississippi": "MS",
        "Missouri": "MO",
        "Montana": "MT",
        "Nebraska": "NE",
        "Nevada": "NV",
        # "New Hampshire": "NH",
        # "New Jersey": "NJ",
        "New Mexico": "NM",
        "New York": "NY",
        # "North Carolina": "NC",
        "North Dakota": "ND",
        "Ohio": "OH",
        "Oklahoma": "OK",
        "Oregon": "OR",
        "Pennsylvania": "PA",
        # "Rhode Island": "RI",
        # "South Carolina": "SC",
        "South Dakota": "SD",
        "Tennessee": "TN",
        "Texas": "TX",
        "Utah": "UT",
        # "Vermont": "VT",
        "Virginia": "VA",
        "Washington": "WA",
        "West Virginia": "WV",
        "Wisconsin": "WI",
        "Wyoming": "WY"
    }

    return statedict[s]



def getstates_view(request):
    print('now were getting the states for the map')
    print(f'here is the request: {request}')
    print(f"states requested: {request.GET.getlist('states')}")
    states_in = request.GET.getlist('states')[0].split(',')
    print(f'states in = {states_in}')
    states = list()
    for s in states_in:
        h = s.strip()
        # states.append(h)
        # states.append(h.upper())
        # states.append(h.lower())
        states.append(h.title())
    print(f"states--{len(states)}->{states}")
    filter_kwargs = dict()
    # if len(states) == 1:
    #     filter_kwargs.update(f'statename__iexact={states}')
    # else:
    # for getstate in states:
        
    filter_kwargs.update({'statename__in':states})

    print(f'the query = {filter_kwargs}')
    polygons = States.objects.filter(**filter_kwargs)  # Query all polygons
    print(f'state polygons-_-_-_-->{polygons}')
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


def getcounties_view(request):
    print('now were getting the counties for the map')
    print(f'here is the request: {request}')
    print(f"states requested: {request.GET.getlist('states')}")
    print(request.GET.getlist('states')) #[0].split(',')
    print('states_in request ^^')
    states_in = request.GET.getlist('states')[0].split(',')
    print(f'states in = {states_in}')
    states = list()
    for s in states_in:
        h = s.strip()
        states.append(h.title())
    print(f"states--{len(states)}->{states}")
    filter_kwargs = dict()

    filter_kwargs.update({'statename__in':states})

    print(f'the query = {filter_kwargs}')
    polygons = Counties.objects.filter(**filter_kwargs)  # Query all polygons
    features = []
    for i,polygon in enumerate(polygons):
        geojson_data = polygon.geomjson
        feature = dict()
        feature['type'] = "Feature"
        feature['statename'] = polygon.stusps
        feature['county'] = polygon.county
        feature['geometry'] = ast.literal_eval(geojson_data)
        features.append(feature)
    geojson_collection = {
        "type": "FeatureCollection",
        "features": features
    }
    # print(geojson_collection)
    return JsonResponse(geojson_collection)

def update_table():
    # selected_dataset = request.GET.getlist('selectedDataset[]')
    # cols=list()
    print('==================================================\n=================================')
    cols = ["api_num",
            "other_id",
            "latitude",
            "longitude",
            "stusps",
            "county",
            "municipality",
            "well_name",
            "operator",
            "spud_date",
            "plug_date",
            "well_type",
            "well_status",
            "well_configuration",
            "ft_category"]
    new_table = generate_new_table(cols)
    return HttpResponse(new_table)

def generate_new_table(cols):
    # Simulate generating a new table
    cols = ["api_num",
            "other_id",
            "latitude",
            "longitude",
            "stusps",
            "county",
            "municipality",
            "well_name",
            "operator",
            "spud_date",
            "plug_date",
            "well_type",
            "well_status",
            "well_configuration",
            "ft_category"]
    new_table_html = "<tr>"
    # print(f'here are the columns{cols}')
    for i in cols:
        new_table_html += f"<th>{i}</th>"
    new_table_html += "</tr>"
    for i in range(1, 2):
        new_table_html += "<tr>"
        for j in range(1, len(cols)+1):
            if j in (1,len(cols)):
                continue
            new_table_html += f"<td>Row {i} Data {j}</td>"
        new_table_html += "</tr>"
    return new_table_html

def mapToDB(state):
    if state in ['TX']:
        return 'six'
    else:
        pass

def parse_states(data):
    states = list()
    state_abbreviations = {
        'Alabama': 'AL',
        # 'Alaska': 'AK',
        'Arizona': 'AZ',
        'Arkansas': 'AR',
        'California': 'CA',
        'Colorado': 'CO',
        # 'Connecticut': 'CT',
        # 'Delaware': 'DE',
        'Florida': 'FL',
        # 'Georgia': 'GA',
        # 'Hawaii': 'HI',
        'Idaho': 'ID',
        'Illinois': 'IL',
        'Indiana': 'IN',
        'Iowa': 'IA',
        'Kansas': 'KS',
        'Kentucky': 'KY',
        'Louisiana': 'LA',
        # 'Maine': 'ME',
        'Maryland': 'MD',
        # 'Massachusetts': 'MA',
        'Michigan': 'MI',
        # 'Minnesota': 'MN',
        'Mississippi': 'MS',
        'Missouri': 'MO',
        'Montana': 'MT',
        'Nebraska': 'NE',
        'Nevada': 'NV',
        # 'New Hampshire': 'NH',
        # 'New Jersey': 'NJ',
        'New Mexico': 'NM',
        'New York': 'NY',
        # 'North Carolina': 'NC',
        'North Dakota': 'ND',
        'Ohio': 'OH',
        'Oklahoma': 'OK',
        'Oregon': 'OR',
        'Pennsylvania': 'PA',
        # 'Rhode Island': 'RI',
        # 'South Carolina': 'SC',
        'South Dakota': 'SD',
        'Tennessee': 'TN',
        'Texas': 'TX',
        'Utah': 'UT',
        # 'Vermont': 'VT',
        'Virginia': 'VA',
        'Washington': 'WA',
        'West Virginia': 'WV',
        'Wisconsin': 'WI',
        'Wyoming': 'WY'
    }

    for s in data:
        if len(s) > 1:
            h = s.strip()
            states.append(state_abbreviations[h.title()])

    return list(set(states))

def generate_geojson(request):
    print('now were getting the data for the map')
    print(f'here is the request: {request}')
    print(f"states requested: {request.GET.getlist('states')}")
    states_in = request.GET.getlist('states')[0].split(',')
    states = parse_states(states_in)

    # for s in states:
    #     mapToDB()

    well_status = list()
    if len(request.GET.getlist('well_status'))>0:
        well_status_in = request.GET.getlist('well_status')[0].split(',')
        for s in well_status_in:
            if s:
                h = s[4:].strip()
                well_status.append(h)
    well_status = list(set(well_status))

    well_type = list()
    if len(request.GET.getlist('well_type'))>0:
        well_type_in = request.GET.getlist('well_type')[0].split(',')
        for s in well_type_in:
            if s:
                h = s[4:].strip()
                well_type.append(h)
    well_type = list(set(well_type))

    category = request.GET.getlist('category')
    fcats = list()
    try:
        catsplit = category[0].split(',')
        print(f'here is catsplit -->{catsplit}')
        if 'default' in catsplit or 'initial' in catsplit:
            fcats.append('default')
        elif catsplit == ['']:
            fcats.append('default')
        else:
            for c in category[0].split(','):
                fcats.append(c)
    except:
        fcats.append('default')
    # stateop = request.GET.getlist('statesop')
    try:
        county_in = request.GET.getlist('county')[0].split(',')
        county = list()
        for s in county_in:
            if len(s) > 0:
                h = s.strip()
                h = s.replace('County','').replace('COUNTY','').replace('county','').strip()
                h = s[4:].strip()
                county.append(h.title())
        county = list(set(county))
    except:
        county = list()
    filterop_dict = {'states':['stusps','',states], 
                     'well_status':['well_status','',well_status],
                     'well_type':['well_type','',well_type],
                    #  'well_name':['well_name','',well_name],
                     'county':['county','',county],
                    #  'category':['category','',fcats]
                    }
    
    filter_dict = { 
                   'county':county, 
                   'well_status':well_status, 
                   'well_type':well_type, 
                #    'well_name':well_name, 
                   }

    filter_kwargs = dict()

    print(f'here is the main dict: {filterop_dict}')

    for k,v in filterop_dict.items():
        for s in v:
            if len(s) > 0:
                if k == 'states':
                    aval = filterop_dict[k]
                    filter_kwargs.update({f'{aval[0]}__in':aval[2]})
                elif k in filter_dict.keys():
                    aval = filterop_dict[k]
                    if len(aval[2]) > 0:
                        filter_kwargs.update({f'{aval[0]}__in':aval[2]})
                elif k == 'category':
                    here = filterop_dict[k][2]
                    if here == ['default']:
                        continue
                    else:
                        filter_kwargs.update({f'ft_category__in':here})

    attrvals = list()
    attrvals = Wells.objects.filter(**filter_kwargs)

    newwell = list()
    for n,x in enumerate(attrvals):
        tmp=vars(x)
        tmp.pop('_state')
        newwell.append(tmp)
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
        } for d in newwell]
    }

    mapdata = json.dumps(geojson)
    return JsonResponse(mapdata, safe=False)
