from django.shortcuts import render
from .models import Wells, Counties, States, stStatus, stType
from django.http import HttpResponse, JsonResponse
from django.db.models import Count
import json
import ast
import math
import time
from django.views.decorators.http import require_POST
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from .models import DownloadLog


def wells(request):
    wells = Wells.objects.all()
    return render(request, 'wells.html', {'wells': wells})


def createCountyList(request):
    states_in = request.GET.getlist('states')[0].split(',')
    states = [s.strip().replace('input-', '') for s in states_in]
    cl = Counties.objects.filter(statename__in=states)
    filtered = [
        {'county': c.county, 'statename': c.statename, 'stusps': c.stusps}
        for c in cl
    ]
    return JsonResponse(json.dumps(sorted(filtered, key=lambda x: (x['stusps'], x['county']))), safe=False)


def createStatusList(request):
    states_in = request.GET.getlist('states')[0].split(',')
    states = [statenameMap(s.strip().replace('input-', '')) for s in states_in if len(s) > 1]
    cl = stStatus.objects.filter(stusps__in=states)
    filtered = [
        {'well_status': c.well_status, 'stusps': c.stusps}
        for c in cl
    ]
    return JsonResponse(json.dumps(sorted(filtered, key=lambda x: (x['stusps'], x['well_status']))), safe=False)


def createTypeList(request):
    states_in = request.GET.getlist('states')[0].split(',')
    states = [statenameMap(s.strip().replace('input-', '')) for s in states_in if len(s) > 1]
    cl = stType.objects.filter(stusps__in=states)
    filtered = [
        {'well_type': c.well_type, 'stusps': c.stusps}
        for c in cl
    ]
    return JsonResponse(json.dumps(sorted(filtered, key=lambda x: (x['stusps'], x['well_type']))), safe=False)


def statenameMap(s):
    statedict = {
        "Alabama": "AL",
        "Arizona": "AZ",
        "Arkansas": "AR",
        "California": "CA",
        "Colorado": "CO",
        "Florida": "FL",
        "Idaho": "ID",
        "Illinois": "IL",
        "Indiana": "IN",
        "Iowa": "IA",
        "Kansas": "KS",
        "Kentucky": "KY",
        "Louisiana": "LA",
        "Maryland": "MD",
        "Michigan": "MI",
        "Mississippi": "MS",
        "Missouri": "MO",
        "Montana": "MT",
        "Nebraska": "NE",
        "Nevada": "NV",
        "New Mexico": "NM",
        "New York": "NY",
        "North Dakota": "ND",
        "Ohio": "OH",
        "Oklahoma": "OK",
        "Oregon": "OR",
        "Pennsylvania": "PA",
        "South Dakota": "SD",
        "Tennessee": "TN",
        "Texas": "TX",
        "Utah": "UT",
        "Virginia": "VA",
        "Washington": "WA",
        "West Virginia": "WV",
        "Wisconsin": "WI",
        "Wyoming": "WY",
    }
    return statedict[s]


def getstates_view(request):
    states_in = request.GET.getlist('states')[0].split(',')
    states = [s.strip().title() for s in states_in]
    polygons = States.objects.filter(statename__in=states)
    features = [
        {
            'type': 'Feature',
            'properties': {},
            'geometry': ast.literal_eval(polygon.geomjson),
        }
        for polygon in polygons
    ]
    return JsonResponse({'type': 'FeatureCollection', 'features': features})


def getcounties_view(request):
    states_in = request.GET.getlist('states')[0].split(',')
    states = [s.strip().title() for s in states_in]
    polygons = Counties.objects.filter(statename__in=states)
    features = [
        {
            'type': 'Feature',
            'statename': polygon.stusps,
            'county': polygon.county,
            'geometry': ast.literal_eval(polygon.geomjson),
        }
        for polygon in polygons
    ]
    return JsonResponse({'type': 'FeatureCollection', 'features': features})


def update_table():
    cols = [
        "api_num", "other_id", "latitude", "longitude", "stusps", "county",
        "municipality", "well_name", "operator", "spud_date", "plug_date",
        "well_type", "well_status", "well_configuration", "ft_category",
    ]
    return HttpResponse(generate_new_table(cols))


def generate_new_table(cols):
    cols = [
        "api_num", "other_id", "latitude", "longitude", "stusps", "county",
        "municipality", "well_name", "operator", "spud_date", "plug_date",
        "well_type", "well_status", "well_configuration", "ft_category",
    ]
    new_table_html = "<tr>"
    for col in cols:
        new_table_html += f"<th>{col}</th>"
    new_table_html += "</tr>"
    for i in range(1, 2):
        new_table_html += "<tr>"
        for j in range(1, len(cols) + 1):
            if j in (1, len(cols)):
                continue
            new_table_html += f"<td>Row {i} Data {j}</td>"
        new_table_html += "</tr>"
    return new_table_html


def parse_states(data):
    state_abbreviations = {
        'Alabama': 'AL',
        'Arizona': 'AZ',
        'Arkansas': 'AR',
        'California': 'CA',
        'Colorado': 'CO',
        'Florida': 'FL',
        'Idaho': 'ID',
        'Illinois': 'IL',
        'Indiana': 'IN',
        'Iowa': 'IA',
        'Kansas': 'KS',
        'Kentucky': 'KY',
        'Louisiana': 'LA',
        'Maryland': 'MD',
        'Michigan': 'MI',
        'Mississippi': 'MS',
        'Missouri': 'MO',
        'Montana': 'MT',
        'Nebraska': 'NE',
        'Nevada': 'NV',
        'New Mexico': 'NM',
        'New York': 'NY',
        'North Dakota': 'ND',
        'Ohio': 'OH',
        'Oklahoma': 'OK',
        'Oregon': 'OR',
        'Pennsylvania': 'PA',
        'South Dakota': 'SD',
        'Tennessee': 'TN',
        'Texas': 'TX',
        'Utah': 'UT',
        'Virginia': 'VA',
        'Washington': 'WA',
        'West Virginia': 'WV',
        'Wisconsin': 'WI',
        'Wyoming': 'WY',
    }
    states = [state_abbreviations[s.strip().title()] for s in data if len(s) > 1]
    return list(set(states))


def parse_filters(request):
    """Parse common filter params into a filter_kwargs dict for Wells.objects.filter()."""
    states_in = request.GET.getlist('states')[0].split(',')
    states = parse_states(states_in)

    well_status = []
    if request.GET.getlist('well_status'):
        well_status = list(set(
            s[4:].strip()
            for s in request.GET.getlist('well_status')[0].split(',')
            if s
        ))

    well_type = []
    if request.GET.getlist('well_type'):
        well_type = list(set(
            s[4:].strip()
            for s in request.GET.getlist('well_type')[0].split(',')
            if s
        ))

    fcats = []
    try:
        category = request.GET.getlist('category')
        catsplit = category[0].split(',') if category else ['']
        if 'default' in catsplit or 'initial' in catsplit or catsplit == ['']:
            fcats = ['default']
        else:
            fcats = list(catsplit)
    except Exception:
        fcats = ['default']

    try:
        county = list(set(
            s[4:].strip().title()
            for s in request.GET.getlist('county')[0].split(',')
            if len(s) > 0
        ))
    except Exception:
        county = []

    filter_kwargs = {
        'stusps__in': states,
        'latitude__isnull': False,
        'longitude__isnull': False,
    }
    if county:
        filter_kwargs['county__in'] = county
    if well_status:
        filter_kwargs['well_status__in'] = well_status
    if well_type:
        filter_kwargs['well_type__in'] = well_type
    if fcats and fcats != ['default']:
        filter_kwargs['ft_category__in'] = fcats

    return filter_kwargs


WELL_FIELDS = [
    'id', 'api_num', 'other_id', 'latitude', 'longitude', 'stusps',
    'county', 'municipality', 'well_name', 'operator', 'spud_date',
    'plug_date', 'well_type', 'well_status', 'well_configuration', 'ft_category',
]


def generate_geojson(request):
    MAX_RESULTS = 150_000
    filter_kwargs = parse_filters(request)
    qs = Wells.objects.filter(**filter_kwargs)
    total_count = qs.count()
    attrvals = qs.values(*WELL_FIELDS)[:MAX_RESULTS]

    geojson = {
        'type': 'FeatureCollection',
        'features': [
            {
                'type': 'Feature',
                'geometry': {
                    'type': 'Point',
                    'coordinates': [w['longitude'], w['latitude']],
                },
                'properties': w,
            }
            for w in attrvals
        ],
    }

    response = JsonResponse(json.dumps(geojson), safe=False)
    response['X-Total-Count'] = total_count
    return response


def get_county_counts(request):
    filter_kwargs = parse_filters(request)
    counts = (
        Wells.objects
        .filter(**filter_kwargs)
        .values('stusps', 'county')
        .annotate(count=Count('id'))
    )
    return JsonResponse(list(counts), safe=False)


def get_table_page(request):
    page = max(1, int(request.GET.get('page', 1)))
    page_size = min(200, max(1, int(request.GET.get('page_size', 50))))
    offset = (page - 1) * page_size

    filter_kwargs = parse_filters(request)
    qs = Wells.objects.filter(**filter_kwargs)
    total_count = qs.count()
    total_pages = math.ceil(total_count / page_size) if total_count else 1
    records = list(qs.values(*WELL_FIELDS)[offset:offset + page_size])

    return JsonResponse({
        'features': records,
        'total_count': total_count,
        'page': page,
        'total_pages': total_pages,
    })


def get_records_in_circle(request):
    try:
        lat = float(request.GET.get('lat'))
        lng = float(request.GET.get('lng'))
        radius = float(request.GET.get('radius'))  # metres
    except (TypeError, ValueError):
        return JsonResponse({'error': 'lat, lng, radius are required numeric params'}, status=400)

    page = max(1, int(request.GET.get('page', 1)))
    page_size = min(200, max(1, int(request.GET.get('page_size', 50))))
    offset = (page - 1) * page_size

    filter_kwargs = parse_filters(request)
    qs = Wells.objects.filter(**filter_kwargs).extra(
        where=[
            "ST_DWithin("
            "ST_MakePoint(longitude, latitude)::geography,"
            "ST_MakePoint(%s, %s)::geography,"
            "%s"
            ")"
        ],
        params=[lng, lat, radius],
    )
    total_count = qs.count()
    total_pages = math.ceil(total_count / page_size) if total_count else 1
    records = list(qs.values(*WELL_FIELDS)[offset:offset + page_size])

    return JsonResponse({
        'features': records,
        'total_count': total_count,
        'page': page,
        'total_pages': total_pages,
    })


def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        return x_forwarded_for.split(',')[0]
    return request.META.get('REMOTE_ADDR')


@require_POST
def download_csv(request):
    try:
        data = json.loads(request.body)
        name = data.get('name', '').strip()
        email = data.get('email', '').strip().lower()
        affiliation = data.get('affiliation', '').strip()
        state = data.get('state', '').strip()

        if not name:
            return JsonResponse({'success': False, 'error': 'Name is required'})
        if not email:
            return JsonResponse({'success': False, 'error': 'Email is required'})
        try:
            validate_email(email)
        except ValidationError:
            return JsonResponse({'success': False, 'error': 'Please enter a valid email address'})
        if not affiliation:
            return JsonResponse({'success': False, 'error': 'Affiliation is required'})
        if not state:
            return JsonResponse({'success': False, 'error': 'State is required'})

        try:
            download_log = DownloadLog.objects.create(
                name=name,
                email=email,
                file_name='wells_data_export.csv',
                ip_address=get_client_ip(request),
                affiliation=affiliation,
                state=state,
            )
        except Exception as e:
            return JsonResponse({'success': False, 'error': f'Failed to log download: {str(e)}'})

        return JsonResponse({'success': True, 'download_id': download_log.id})

    except json.JSONDecodeError:
        return JsonResponse({'success': False, 'error': 'Invalid JSON data'})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})
