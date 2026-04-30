from django.shortcuts import render
from .models import Wells, Counties, States, stStatus, stType
from django.http import HttpResponse, JsonResponse
from django.db import connection
from django.db.models import Count
import json
import ast
import math
import csv
import io
import zipfile
from django.views.decorators.http import require_POST
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.contrib.auth.decorators import login_required, permission_required
from .models import DownloadLog


# Enabled states — keys are separator-free lowercase, must match statesarray in wells.js
# Handles new-york, new_york, newyork, etc. by stripping separators before lookup.
_SLUG_TO_STATE = {
    'alabama': 'Alabama', 'arizona': 'Arizona', 'arkansas': 'Arkansas',
    'california': 'California', 'colorado': 'Colorado', 'florida': 'Florida',
    'idaho': 'Idaho', 'illinois': 'Illinois', 'indiana': 'Indiana',
    'iowa': 'Iowa', 'kansas': 'Kansas', 'kentucky': 'Kentucky',
    'louisiana': 'Louisiana', 'maryland': 'Maryland', 'michigan': 'Michigan',
    'mississippi': 'Mississippi', 'missouri': 'Missouri', 'montana': 'Montana',
    'nebraska': 'Nebraska', 'nevada': 'Nevada', 'newmexico': 'New Mexico',
    'newyork': 'New York', 'northdakota': 'North Dakota', 'ohio': 'Ohio',
    'oklahoma': 'Oklahoma', 'oregon': 'Oregon', 'pennsylvania': 'Pennsylvania',
    'southdakota': 'South Dakota', 'tennessee': 'Tennessee', 'texas': 'Texas',
    'utah': 'Utah', 'virginia': 'Virginia', 'washington': 'Washington',
    'westvirginia': 'West Virginia', 'wyoming': 'Wyoming',
}

def wells(request, state_slug=None):
    preselected_state = None
    if state_slug:
        normalized = state_slug.lower().replace('-', '').replace('_', '').replace(' ', '')
        preselected_state = _SLUG_TO_STATE.get(normalized)
    return render(request, 'wells.html', {'preselected_state': preselected_state})


def createCountyList(request):
    states_in = request.GET.getlist('states')[0].split(',')
    states = [s.strip().replace('input-', '') for s in states_in]
    cl = list(Counties.objects.filter(statename__in=states).values('county', 'statename', 'stusps'))
    cl.sort(key=lambda x: (x['stusps'], x['county']))
    return JsonResponse(cl, safe=False)


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
    'county', 'municipality', 'well_field', 'well_name', 'operator', 'spud_date',
    'plug_date', 'well_type', 'well_status', 'well_configuration', 'ft_category', 'orphan',
]


def generate_csv(request):
    filter_kwargs = parse_filters(request)
    qs = Wells.objects.filter(**filter_kwargs)

    search_field = request.GET.get('search_field', '').strip()
    search_value = request.GET.get('search_value', '').strip()
    if search_field in _SEARCHABLE_FIELDS and search_value:
        qs = qs.filter(**{f'{search_field}__icontains': search_value})

    csv_buffer = io.StringIO()
    writer = csv.writer(csv_buffer)
    writer.writerow(WELL_FIELDS)
    for w in qs.values(*WELL_FIELDS).iterator(chunk_size=2000):
        writer.writerow([w[f] if w[f] is not None else '' for f in WELL_FIELDS])

    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zf:
        zf.writestr('fractracker_wells_download.csv', csv_buffer.getvalue())

    response = HttpResponse(zip_buffer.getvalue(), content_type='application/zip')
    response['Content-Disposition'] = 'attachment; filename="fractracker_wells_download.zip"'
    return response


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
    qs = Wells.objects.filter(**filter_kwargs)

    search_field = request.GET.get('search_field', '').strip()
    search_value = request.GET.get('search_value', '').strip()
    if search_field in _SEARCHABLE_FIELDS and search_value:
        qs = qs.filter(**{f'{search_field}__icontains': search_value})

    counts = qs.values('stusps', 'county').annotate(count=Count('id'))
    return JsonResponse(list(counts), safe=False)


_SEARCHABLE_FIELDS = {
    'api_num', 'other_id', 'stusps', 'county', 'municipality', 'well_field',
    'well_name', 'operator', 'well_type', 'well_status',
    'well_configuration', 'ft_category', 'orphan',
}


def get_table_page(request):
    page = max(1, int(request.GET.get('page', 1)))
    page_size = min(200, max(1, int(request.GET.get('page_size', 50))))
    offset = (page - 1) * page_size

    filter_kwargs = parse_filters(request)
    qs = Wells.objects.filter(**filter_kwargs)

    search_field = request.GET.get('search_field', '').strip()
    search_value = request.GET.get('search_value', '').strip()
    if search_field in _SEARCHABLE_FIELDS and search_value:
        qs = qs.filter(**{f'{search_field}__icontains': search_value})

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

    visible_categories_raw = request.GET.get('visible_categories', '')
    if visible_categories_raw:
        visible_list = [c.strip() for c in visible_categories_raw.split(',') if c.strip()]
        if visible_list:
            filter_kwargs['ft_category__in'] = visible_list

    qs = Wells.objects.filter(**filter_kwargs)

    search_field = request.GET.get('search_field', '').strip()
    search_value = request.GET.get('search_value', '').strip()
    if search_field in _SEARCHABLE_FIELDS and search_value:
        qs = qs.filter(**{f'{search_field}__icontains': search_value})

    qs = qs.extra(
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


def well_tiles(request, z, x, y):
    z, x, y = int(z), int(x), int(y)
    try:
        filter_kwargs = parse_filters(request)
    except Exception:
        return HttpResponse(b'', content_type='application/x-protobuf')

    conditions, params = [], []
    if filter_kwargs.get('stusps__in'):
        conditions.append("w.stusps = ANY(%s)")
        params.append(filter_kwargs['stusps__in'])
    if filter_kwargs.get('county__in'):
        conditions.append("LOWER(w.county) = ANY(%s)")
        params.append([c.lower() for c in filter_kwargs['county__in']])
    if filter_kwargs.get('well_status__in'):
        conditions.append("w.well_status = ANY(%s)")
        params.append(filter_kwargs['well_status__in'])
    if filter_kwargs.get('well_type__in'):
        conditions.append("w.well_type = ANY(%s)")
        params.append(filter_kwargs['well_type__in'])
    if filter_kwargs.get('ft_category__in'):
        conditions.append("w.ft_category = ANY(%s)")
        params.append(filter_kwargs['ft_category__in'])

    search_field = request.GET.get('search_field', '').strip()
    search_value = request.GET.get('search_value', '').strip()
    if search_field in _SEARCHABLE_FIELDS and search_value:
        conditions.append(f"w.{search_field} ILIKE %s")
        params.append(f'%{search_value}%')

    extra_where = ('AND ' + ' AND '.join(conditions)) if conditions else ''

    # Transform the tile envelope to 4326 once, then work entirely in 4326.
    # ST_AsMVTGeom works in any CRS as long as the geometry and bounds match.
    # && (bbox overlap) is index-aware and equivalent to ST_Intersects for rectangular tiles.
    sql = f"""
        WITH bounds AS (
            SELECT ST_Transform(ST_TileEnvelope(%s, %s, %s), 4326) AS geom
        ),
        mvtgeom AS (
            SELECT
                ST_AsMVTGeom(
                    ST_SetSRID(ST_MakePoint(w.longitude, w.latitude), 4326),
                    bounds.geom, 4096, 64, true
                ) AS geom,
                w.id, w.api_num, w.well_name, w.operator,
                w.well_status, w.well_type, w.stusps,
                w.ft_category, w.latitude, w.longitude
            FROM wells.wells w, bounds
            WHERE w.latitude  IS NOT NULL
              AND w.longitude IS NOT NULL
              AND ST_SetSRID(ST_MakePoint(w.longitude, w.latitude), 4326) && bounds.geom
              {extra_where}
        )
        SELECT ST_AsMVT(mvtgeom, 'wells', 4096, 'geom') FROM mvtgeom
        WHERE geom IS NOT NULL
    """

    with connection.cursor() as cursor:
        cursor.execute(sql, [z, x, y] + params)
        row = cursor.fetchone()

    tile_data = bytes(row[0]) if row and row[0] else b''
    response = HttpResponse(tile_data, content_type='application/x-protobuf')
    response['Cache-Control'] = 'public, max-age=3600'
    return response


def nearest_well(request):
    try:
        lat = float(request.GET.get('lat'))
        lng = float(request.GET.get('lng'))
        tolerance = float(request.GET.get('tolerance', 0.01))
    except (TypeError, ValueError):
        return JsonResponse({})

    try:
        filter_kwargs = parse_filters(request)
    except Exception:
        return JsonResponse({})

    conditions = [
        "w.latitude IS NOT NULL",
        "w.longitude IS NOT NULL",
        "ST_DWithin(ST_SetSRID(ST_MakePoint(w.longitude, w.latitude), 4326), ST_SetSRID(ST_MakePoint(%s, %s), 4326), %s)",
    ]
    params = [lng, lat, tolerance]

    if filter_kwargs.get('stusps__in'):
        conditions.append("w.stusps = ANY(%s)")
        params.append(filter_kwargs['stusps__in'])
    if filter_kwargs.get('county__in'):
        conditions.append("LOWER(w.county) = ANY(%s)")
        params.append([c.lower() for c in filter_kwargs['county__in']])
    if filter_kwargs.get('well_status__in'):
        conditions.append("w.well_status = ANY(%s)")
        params.append(filter_kwargs['well_status__in'])
    if filter_kwargs.get('well_type__in'):
        conditions.append("w.well_type = ANY(%s)")
        params.append(filter_kwargs['well_type__in'])
    if filter_kwargs.get('ft_category__in'):
        conditions.append("w.ft_category = ANY(%s)")
        params.append(filter_kwargs['ft_category__in'])

    visible_categories_raw = request.GET.get('visible_categories', '')
    if visible_categories_raw:
        visible_list = [c.strip() for c in visible_categories_raw.split(',') if c.strip()]
        if visible_list:
            conditions.append("w.ft_category = ANY(%s)")
            params.append(visible_list)

    where = 'WHERE ' + ' AND '.join(conditions)

    sql = f"""
        SELECT id, api_num, well_name, operator, well_status, well_type, stusps, ft_category, latitude, longitude
        FROM wells.wells w
        {where}
        ORDER BY ST_SetSRID(ST_MakePoint(w.longitude, w.latitude), 4326)
                 <-> ST_SetSRID(ST_MakePoint(%s, %s), 4326)
        LIMIT 1
    """
    params_knn = params + [lng, lat]

    with connection.cursor() as cursor:
        cursor.execute(sql, params_knn)
        row = cursor.fetchone()

    if not row:
        return JsonResponse({})

    cols = ['id', 'api_num', 'well_name', 'operator', 'well_status', 'well_type', 'stusps', 'ft_category', 'latitude', 'longitude']
    return JsonResponse(dict(zip(cols, row)))


@login_required(login_url='/accounts/login')
@permission_required('wells.view_metrics', raise_exception=True)
def metrics(request):
    from django.utils import timezone as tz
    from datetime import timedelta

    base_qs = DownloadLog.objects.filter(metrics__isnull=True)

    # Date filtering
    date_range = request.GET.get('range')
    start_str = request.GET.get('start', '')
    end_str = request.GET.get('end', '')
    active_filter = date_range or ('custom' if start_str or end_str else 'all')

    if date_range in ('7', '14', '30'):
        cutoff = tz.now() - timedelta(days=int(date_range))
        base_qs = base_qs.filter(download_date__gte=cutoff)
    elif start_str or end_str:
        if start_str:
            base_qs = base_qs.filter(download_date__date__gte=start_str)
        if end_str:
            base_qs = base_qs.filter(download_date__date__lte=end_str)

    total_downloads = base_qs.count()
    by_state = (
        base_qs
        .exclude(state='')
        .values('state')
        .annotate(count=Count('id'))
        .order_by('-count')
    )
    by_affiliation = (
        base_qs
        .exclude(affiliation='')
        .values('affiliation')
        .annotate(count=Count('id'))
        .order_by('-count')
    )
    recent = base_qs.order_by('-download_date')

    return render(request, 'metrics.html', {
        'total_downloads': total_downloads,
        'by_state': list(by_state),
        'by_affiliation': list(by_affiliation),
        'recent': recent,
        'active_filter': active_filter,
        'start_str': start_str,
        'end_str': end_str,
    })
