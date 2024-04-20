from django.shortcuts import render
from .models import Wells15,HifldOilRef,BoxData,Cracker,TermPetro
from django.http import HttpResponse
from django.http import JsonResponse
from django.db.models import Q
import json 

# Create your views here.
def wellsdb(request):
    wells = Wells15.objects.all()
    return render(request, 'wellsdb.html', { 'wells': wells })

def cracker(request):
    crackers = Cracker.objects.all()
    return render(request, 'wellsdb.html', { 'crackers': crackers })

def cracker_states(request):
    print('reached the cracker_states view')
    states = list()
    for d in request:
        if d == 'option1':
            for s in Cracker.objects.all():
                states.append(s.state)
        elif d == 'option2':
            for s in TermPetro.objects.all():
                states.append(s.state)
        elif d == 'option3':
            for s in HifldOilRef.objects.all():
                states.append(s.state)
    cstates = set(states)
    print('did we even look?')
    print(f'new state list: {cstates}')
    cstates = list(map(lambda x: x, cstates))
    return cstates

def added_states(request):
    # Get the selected states from the AJAX request
    # print('started the added_states view')
    # selected_states = request.GET.getlist('selectedValue[]')
    selected_ds = request.GET.getlist('selectedDataset[]')
    # print(f'selected states: {selected_states}')
    print(f'selected dataset: {selected_ds}')

    # Call the cracker_states function to get additional selections
    additional_selections = cracker_states(selected_ds)
    additional_selections.sort()
    # print(f'new choices: {additional_selections}')
    # Return the additional selections as JSON response
    additional_selections = json.dumps(additional_selections)

    return JsonResponse(additional_selections, safe=False)

def cracker_states2(request):
    # print('reached the cracker_states TWO view')
    states = list()
    # for s in Cracker.objects.all():
    #     states.append(s.company)

    for d in request:
        if d == 'option1':
            for s in Cracker.objects.all():
                states.append(s.company)
        elif d == 'option2':
            for s in TermPetro.objects.all():
                states.append(s.typedesc)
        elif d == 'option3':
            for s in HifldOilRef.objects.all():
                states.append(s.reftype)
    cstates2 = set(states)
    # print('did we even look TWP?')
    # print(f'cstates2: {cstates2}')
    cstates2 = list(map(lambda x: x, cstates2))
    return cstates2

def added_states2(request):
    # Get the selected states from the AJAX request
    # print('started the added_states TWO view')
    
    selected_cat = request.GET.getlist('selectedOption[]')
    print(f'selected cat: {selected_cat}')
    # Call the cracker_states function to get additional selections
    additional_selections2 = cracker_states2(selected_cat)
    additional_selections2.sort()
    # print(f'companies: {additional_selections2}')
    # Return the additional selections as JSON response
    additional_selections2 = json.dumps(additional_selections2)

    return JsonResponse(additional_selections2, safe=False)


def terminalspetro(request):
    petroterms = TermPetro.objects.all()
    return render(request, 'wellsdb.html', { 'petroterms': petroterms })

def boxdata(request):
    boxsets = BoxData.objects.all()
    return render(request, 'boxdata.html', { 'boxsets': boxsets })

def oilref(request):
    oilrefs = HifldOilRef.objects.all()
    print(f'oilrefs:{oilrefs[0]}')
    return render(request, 'wellsdb.html', { 'oilrefs': oilrefs })

def update_table(request):
    selected_dataset = request.GET.getlist('selectedDataset[]')
    cols=list()
    for d in selected_dataset:
        if d == 'option1':
            for s in Cracker.objects.all():
                cols = ['objectid','company','sitename','county','state','padd','sourceorg','year','longitude','latitude']
        elif d == 'option2':
            for s in TermPetro.objects.all():
                cols=['objectid','term_id','terminalname','address','city','state','zip','zip4','telephone','typedesc','status','population','county','countyfips','country','latitude','longitude','naics_code','naics_desc','sourceorg','sourcedate','val_method','val_date','website','exstars_i','ownername','operatorname','posrel','commodity','capacity','truck_in','truck_out','pipe_in','pipe_out','marine_in','marine_out','rail_in','rail_out','asphalt','chemicals','propane','butane','refined','ethanol','biodiesel','crude_oil','jetfuel','gasoline','distillate','avgas']
        elif d == 'option3':
            for s in HifldOilRef.objects.all():
                cols=['objectid','ref_id','latitude','longitude','name','address','city','state','county','status','naics_code','naics_desc','reftype','opername','capacity','us_rank']
    # Simulate fetching data from a database or performing some computation
    print(f'here are what the columns should be: {cols}')
    new_table = generate_new_table(cols)
    return HttpResponse(new_table)

def generate_new_table(cols):
    # Simulate generating a new table
    new_table_html = "<tr>"
    print(f'here are the columns{cols}')
    for i in cols:
        new_table_html += f"<th>{i}</th>"
    new_table_html += "</tr>"
    for i in range(1, 2):
        new_table_html += "<tr>"
        for j in range(1, len(cols)+1):
            new_table_html += f"<td>Row {i} Data {j}</td>"
        new_table_html += "</tr>"
    return new_table_html

def generate_geojson(request):
    # Get the selected value from the AJAX request
    selected_dataset = request.GET.getlist('selectedDataset[]')
    selected_states = request.GET.getlist('selectedStates[]')
    selected_cat = request.GET.getlist('selectedCat[]')
    print(f'selected_states: {selected_dataset}')
    print(f'selected_states: {selected_states}')

    states = list()
    cats = list()
    for d in selected_dataset:
        if d == 'option1':
            for s in Cracker.objects.all():
                states.append(s.state)
                cats.append(s.company)
        elif d == 'option2':
            for s in TermPetro.objects.all():
                states.append(s.state)
                cats.append(s.typedesc)
        elif d == 'option3':
            for s in HifldOilRef.objects.all():
                states.append(s.state)
                cats.append(s.reftype)

    states = set(states)
    states = list(map(lambda x: x, states))


    filter_state = list()
    for x in selected_states:
        filter_state.append(x)
    if not filter_state:
        filter_state=states

    cats = set(cats)
    cats = list(map(lambda x: x, cats))

    filter_cats = list()
    for x in selected_cat:
        filter_cats.append(x)
    if not filter_cats:
        filter_cats=cats

    print(f'filter state: {filter_state}')

    for d in selected_dataset:
        if d == 'option1':
            attrvals = Cracker.objects.filter(Q(state__in=filter_state)&Q(company__in=filter_cats))
        elif d == 'option2':
            attrvals = TermPetro.objects.filter(Q(state__in=filter_state)&Q(typedesc__in=filter_cats))
        elif d == 'option3':
            attrvals = HifldOilRef.objects.filter(Q(state__in=filter_state)&Q(reftype__in=filter_cats))
    newwell = list()
    for n,x in enumerate(attrvals):
        # if n<=5:
        tmp=vars(x)
        tmp.pop('_state')
        newwell.append(tmp)
    # newwells = json.dumps(newwell)
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
        } for d in newwell]
    }

    mapdata = json.dumps(geojson)
    return JsonResponse(mapdata, safe=False)

def your_view(request):
    # Get the selected value from the AJAX request
    selected_dataset = request.GET.getlist('selectedDataset[]')
    selected_states = request.GET.getlist('selectedStates[]')
    selected_cat = request.GET.getlist('selectedCat[]')

    states = list()
    cats = list()
    for d in selected_dataset:
        if d == 'option1':
            for s in Cracker.objects.all():
                states.append(s.state)
                cats.append(s.company)
        elif d == 'option2':
            for s in TermPetro.objects.all():
                states.append(s.state)
                cats.append(s.typedesc)
        elif d == 'option3':
            for s in HifldOilRef.objects.all():
                states.append(s.state)
                cats.append(s.reftype)

    states = set(states)
    states = list(map(lambda x: x, states))

    # attrvals = Wells15.objects.all()
    # statelist = ['PA','OH','WV','LA','TX','OK']
    filter_state = list()
    for x in selected_states:
        filter_state.append(x)
    if not filter_state:
        filter_state=states

    cats = set(cats)
    cats = list(map(lambda x: x, cats))

    # attrvals = Wells15.objects.all()
    # statelist = ['PA','OH','WV','LA','TX','OK']
    filter_cats = list()
    for x in selected_cat:
        filter_cats.append(x)
    if not filter_cats:
        filter_cats=cats

    # print(f'filter state: {filter_state}')

    for d in selected_dataset:
        if d == 'option1':
            attrvals = Cracker.objects.filter(Q(state__in=filter_state)&Q(company__in=filter_cats))
        elif d == 'option2':
            attrvals = TermPetro.objects.filter(Q(state__in=filter_state)&Q(typedesc__in=filter_cats))
        elif d == 'option3':
            attrvals = HifldOilRef.objects.filter(Q(state__in=filter_state)&Q(reftype__in=filter_cats))
    newwell = list()
    for n,x in enumerate(attrvals):
        # if n<=5:
        tmp=vars(x)
        tmp.pop('_state')
        newwell.append(tmp)
    newwells = json.dumps(newwell)
    return JsonResponse(newwells, safe=False)
