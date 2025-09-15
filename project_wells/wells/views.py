from django.shortcuts import render,redirect
from .models import Wells, Counties, States, stStatus, stType #, CountyNames
from django.http import HttpResponse, JsonResponse, FileResponse
import json 
import ast
import time
import csv
from io import StringIO
from datetime import timedelta
from django.utils.timezone import now
from django.core.mail import EmailMessage
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from .models import CSVRequestLog
from django.utils import timezone
from django.core.serializers import serialize
import io
import zipfile
from django.views import View
from django.utils.decorators import method_decorator
from django.conf import settings
from django.db import connection
from .models import DownloadRequest,DownloadLog
from django.contrib import messages
from django.urls import reverse
from .forms import DownloadForm
import os
import logging

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
    print(f'here is the request from getstates: {request}')
    print(f"states requested from getstates: {request.GET.getlist('states')}")
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
    print(f'here is the request from getcounties: {request}')
    print(f"states requested from getcounties: {request.GET.getlist('states')}")
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
    start_time = time.time()
    print('now were getting the data for the map')
    print(f'here is the request from generate_geojson: {request}')
    print(f"states requested from generate_geojson: {request.GET.getlist('states')}")
    states_in = request.GET.getlist('states')[0].split(',')
    states = parse_states(states_in)
    stop_time1 = time.time()
    print(f'part 1 took: {start_time - stop_time1} sec')

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
                     'category':['category','',fcats]
                    }
    
    filter_dict = { 
                   'county':county, 
                   'well_status':well_status, 
                   'well_type':well_type, 
                #    'well_name':well_name, 
                   }

    filter_kwargs = dict()

    print(f'here is the main dict: {filterop_dict}')

    stop_time2 = time.time()
    print(f'part 2 took: {stop_time2 - stop_time1} sec')

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

    stop_time3 = time.time()
    print(f'part 3 took: {stop_time3 - stop_time2} sec')
    print(f'here is the kwargs ---->> {filter_kwargs}')
    attrvals = list()
    attrvals = Wells.objects.filter(**filter_kwargs)

    stop_time4 = time.time()
    print(f'part 4 took: {stop_time4 - stop_time3} sec')

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
    stop_time5a = time.time()
    print(f'part 5a took: {stop_time5a - stop_time4} sec')
    mapdata = json.dumps(geojson)

    stop_time5 = time.time()
    print(f'part 5 took: {stop_time5 - stop_time5a} sec')



    # mapdata = serialize('json', attrvals, fields=('api_num','other_id','latitude','longitude','stusps','county','municipality','well_name','operator','spud_date','plug_data','well_type','well_status','well_configuration','ft_category','id'))

    stop_time6 = time.time()
    print(f'part 6 took: {stop_time6 - stop_time5} sec')

    print(f'part total was took: {stop_time6 - start_time} sec')
    return JsonResponse(mapdata, safe=False)



# @csrf_exempt
# @require_POST
# def request_csv(request):
#     name = request.POST.get('name')
#     email = request.POST.get('email')
#     ip = get_client_ip(request)

#     if not name or not email:
#         return JsonResponse({'status': 'error', 'message': 'Missing name or email.'}, status=400)

#     # Rate limit: max 5 requests per email per day
#     today = now() - timedelta(days=1)
#     recent_requests = CSVRequestLog.objects.filter(email=email, requested_at__gte=today)
#     if recent_requests.count() >= 50:
#         return JsonResponse({
#             'status': 'error',
#             'message': 'Rate limit exceeded. Only 5 requests per 24 hours are allowed.'
#         }, status=429)

#     # Log the request
#     CSVRequestLog.objects.create(name=name, email=email, ip_address=ip)

#     # Generate CSV
#     csv_data = generate_csv()

#     # Send email
#     subject = 'Your requested CSV file'
#     message = 'Hi {},\n\nHere is the CSV you requested.'.format(name)
#     email_msg = EmailMessage(subject, message, to=[email])
#     email_msg.attach('data.csv', csv_data.getvalue(), 'text/csv')
#     email_msg.send()

#     return JsonResponse({'status': 'success', 'message': 'CSV sent to your email.'})


# def generate_csv():
#     output = StringIO()
#     writer = csv.writer(output)
#     writer.writerow(['Name', 'Value'])
#     for i in range(10):  # Replace with real data
#         writer.writerow([f'Item {i}', i * 10])
#     output.seek(0)
#     return output


# def get_client_ip(request):
#     """Get IP from request headers (handle proxies)"""
#     x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
#     if x_forwarded_for:
#         ip = x_forwarded_for.split(',')[0]
#     else:
#         ip = request.META.get('REMOTE_ADDR')
#     return ip


# @csrf_exempt
# def send_csv_email(request):
#     if request.method == 'POST':
#         data = json.loads(request.body)
#         name = data.get('name')
#         email = data.get('email')
#         geojson = data.get('data')
#         ip = get_client_ip(request)

#         # Rate limit (5 per day per IP)
#         today = timezone.now().date()
#         count = CSVRequestLog.objects.filter(requested_at__date=today).count()

#         # count = CSVRequestLog.objects.filter(ip=ip_address, requested_at__date=today).count()
#         if count >= 5:
#             return JsonResponse({'success': False, 'message': 'Rate limit exceeded (5/day).'}, status=429)
#         # CSVRequestLog.objects.create(name=name, email=email, ip=ip)

#         CSVRequestLog.objects.create(name=name, email=email, ip_address=ip)

#         # Create CSV from GeoJSON
#         csv_file = StringIO()
#         writer = csv.writer(csv_file)
#         headers = geojson['features'][0]['properties'].keys()
#         writer.writerow(headers)
#         for feature in geojson['features']:
#             writer.writerow([feature['properties'][h] for h in headers])

#         csv_file.seek(0)
#         email_msg = EmailMessage(
#             subject='Your Well Data Request',
#             body='Attached is the CSV you requested.',
#             to=[email]
#         )
#         email_msg.attach('well_location_data.csv', csv_file.getvalue(), 'text/csv')
#         email_msg.send()

#         return JsonResponse({'success': True})

#     return JsonResponse({'success': False}, status=405)

# def get_client_ip(request):
#     # return request.META.get('HTTP_X_FORWARDED_FOR', request.META.get('REMOTE_ADDR'))
#     """Get client IP address from request headers."""
#     x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
#     if x_forwarded_for:
#         return x_forwarded_for.split(",")[0]
#     return request.META.get("REMOTE_ADDR")


# @method_decorator(csrf_exempt, name='dispatch')
# class DownloadCSVView(View):
#     def post(self, request, *args, **kwargs):
#         try:
#             data = json.loads(request.body)
#             name = data.get("name")
#             email = data.get("email")
#             filtered_data = data.get("filteredData")  # Expecting GeoJSON-like structure

#             # Rate limit: Check if this IP made more than 5 requests in the past hour
#             ip = get_client_ip(request)
#             one_hour_ago = timezone.now() - timezone.timedelta(hours=1)
#             recent_requests = DownloadRequest.objects.filter(ip_address=ip, timestamp__gte=one_hour_ago)
#             if recent_requests.count() >= 5:
#                 return JsonResponse({"error": "Rate limit exceeded (5/hour)."}, status=429)

#             # Log request
#             DownloadRequest.objects.create(name=name, email=email, ip_address=ip, timestamp=timezone.now())

#             # Generate CSV in memory
#             csv_buffer = io.StringIO()
#             writer = csv.writer(csv_buffer)

#             features = filtered_data["features"]
#             if not features:
#                 return JsonResponse({"error": "No data to export."}, status=400)

#             headers = list(features[0]["properties"].keys())
#             writer.writerow(headers)
#             for feature in features:
#                 writer.writerow([feature["properties"].get(h, "") for h in headers])

#             # Zip the CSV in memory
#             zip_buffer = io.BytesIO()
#             with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
#                 zip_file.writestr("filtered_data.csv", csv_buffer.getvalue())

#             zip_buffer.seek(0)  # Go back to start

#             # Send email with zipped attachment
#             email_message = EmailMessage(
#                 subject="Your CSV Download",
#                 body="Hello {},\n\nYour data is attached as a zip file.".format(name),
#                 from_email=settings.DEFAULT_FROM_EMAIL,
#                 to=[email],
#             )
#             email_message.attach('filtered_data.zip', zip_buffer.read(), 'application/zip')
#             email_message.send()

#             return JsonResponse({"success": "CSV emailed successfully."})
#         except Exception as e:
#             return JsonResponse({"error": str(e)}, status=500)


# Add your Google Drive folder ID here
GOOGLE_DRIVE_FOLDER_ID = "YOUR_FOLDER_ID_HERE"
GOOGLE_SERVICE_ACCOUNT_FILE = "path/to/service_account_key.json"

@method_decorator(csrf_exempt, name='dispatch')
class DownloadCSVView(View):
    def post(self, request, *args, **kwargs):
        try:
            data = json.loads(request.body)
            name = data.get("name")
            email = data.get("email")
            filtered_data = data.get("filteredData")
            ip = get_client_ip(request)

            # Rate limit: max 5 requests per hour per IP
            one_hour_ago = timezone.now() - timezone.timedelta(hours=1)
            recent_requests = DownloadRequest.objects.filter(ip_address=ip, timestamp__gte=one_hour_ago)
            if recent_requests.count() >= 5:
                return JsonResponse({"error": "Rate limit exceeded (5/hour)."}, status=429)

            # Log request
            DownloadRequest.objects.create(name=name, email=email, ip_address=ip, timestamp=timezone.now())

            # Create CSV in memory
            csv_buffer = io.StringIO()
            writer = csv.writer(csv_buffer)
            features = filtered_data.get("features", [])

            if not features:
                return JsonResponse({"error": "No data provided."}, status=400)

            headers = list(features[0]["properties"].keys())
            writer.writerow(headers)
            for feature in features:
                writer.writerow([feature["properties"].get(h, "") for h in headers])
            csv_buffer.seek(0)

            # Upload to Google Drive
            credentials = service_account.Credentials.from_service_account_file(
                GOOGLE_SERVICE_ACCOUNT_FILE,
                scopes=["https://www.googleapis.com/auth/drive.file"]
            )
            service = build("drive", "v3", credentials=credentials)

            file_metadata = {
                "name": f"{name.replace(' ', '_')}_data.csv",
                "parents": [GOOGLE_DRIVE_FOLDER_ID]
            }

            media = MediaIoBaseUpload(csv_buffer, mimetype="text/csv", resumable=True)
            uploaded_file = service.files().create(body=file_metadata, media_body=media, fields="id").execute()

            # Make the file shareable
            service.permissions().create(
                fileId=uploaded_file["id"],
                body={"role": "reader", "type": "anyone"}
            ).execute()

            file_id = uploaded_file["id"]
            file_link = f"https://drive.google.com/file/d/{file_id}/view?usp=sharing"

            # Email the link
            email_message = EmailMessage(
                subject="Your CSV Download Link",
                body=f"Hi {name},\n\nYour CSV file is ready:\n\n{file_link}\n\nThanks!",
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[email],
            )
            email_message.send()

            return JsonResponse({"success": "Link sent via email."})

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

# def get_client_ip(request):
#     x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
#     if x_forwarded_for:
#         return x_forwarded_for.split(",")[0]
#     return request.META.get("REMOTE_ADDR")



def get_client_ip(request):
    """Get the client's IP address from the request"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

@require_POST
@csrf_exempt  # You may want to handle CSRF properly instead
def download_csv(request):
    """Handle the AJAX request to download CSV after form submission"""
    try:
        # Get JSON data from request
        data = json.loads(request.body)
        name = data.get('name', '').strip()
        email = data.get('email', '').strip().lower()
        filtered_data = data.get('filtered_data', [])  # Get the filtered data
        
        # Basic validation
        if not name or not email:
            return JsonResponse({
                'success': False, 
                'error': 'Name and email are required'
            })
        
        # Create download log entry
        download_log = DownloadLog.objects.create(
            name=name,
            email=email,
            file_name='wells_data_export.csv',
            ip_address=get_client_ip(request)
        )
        
        # Generate CSV content using filtered data
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="wells_data_export.csv"'
        
        writer = csv.writer(response)
        
        # If filtered_data is provided, use it; otherwise use default/all data
        if filtered_data and len(filtered_data) > 0:
            # Assuming filtered_data is a list of dictionaries
            # Get headers from the first row
            if isinstance(filtered_data[0], dict):
                headers = list(filtered_data[0].keys())
                writer.writerow(headers)
                
                # Write data rows
                for row in filtered_data:
                    writer.writerow([row.get(header, '') for header in headers])
            else:
                # If it's not a dict, treat as simple list
                writer.writerow(['Data'])
                for item in filtered_data:
                    writer.writerow([item])
        else:
            # Fallback: generate default CSV structure
            # Replace this with your actual data generation logic
            writer.writerow(['Well ID', 'Location', 'Status', 'Type', 'Date'])  # Example headers
            writer.writerow(['Sample', 'Data', 'Active', 'Oil', '2024-01-01'])  # Example data
        
        return response
        
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False, 
            'error': 'Invalid JSON data'
        })
    except Exception as e:
        return JsonResponse({
            'success': False, 
            'error': str(e)
        })

# Alternative approach using regular form submission
class DownloadView(View):
    def get(self, request):
        form = DownloadForm()
        return render(request, 'your_template.html', {'form': form})
    
    def post(self, request):
        form = DownloadForm(request.POST)
        if form.is_valid():
            # Save the form data
            download_log = form.save(commit=False)
            download_log.file_name = 'data_export.csv'
            download_log.ip_address = get_client_ip(request)
            download_log.save()
            
            # Generate and return CSV
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = 'attachment; filename="data_export.csv"'
            
            writer = csv.writer(response)
            # Replace with your actual data
            writer.writerow(['Column1', 'Column2', 'Column3'])
            writer.writerow(['Sample', 'Data', 'Row'])
            
            return response
        else:
            return render(request, 'your_template.html', {'form': form})