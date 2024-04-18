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
    for s in Cracker.objects.all():
        states.append(s.state)
    cstates = set(states)
    print('did we even look?')
    print(cstates)
    cstates = list(map(lambda x: x, cstates))
    return cstates

def added_states(request):
    # Get the selected states from the AJAX request
    print('started the added_states view')
    selected_states = request.GET.getlist('selectedValue[]')

    # Call the cracker_states function to get additional selections
    additional_selections = cracker_states(selected_states)
    additional_selections.sort()
    print(f'new choices: {additional_selections}')
    # Return the additional selections as JSON response
    additional_selections = json.dumps(additional_selections)

    return JsonResponse(additional_selections, safe=False)

def cracker_states2(request):
    print('reached the cracker_states view')
    states = list()
    for s in Cracker.objects.all():
        states.append(s.company)
    cstates = set(states)
    print('did we even look?')
    print(cstates)
    cstates = list(map(lambda x: x, cstates))
    return cstates

def added_states2(request):
    # Get the selected states from the AJAX request
    print('started the added_states view')
    selected_states = request.GET.getlist('selectedOption[]')

    # Call the cracker_states function to get additional selections
    additional_selections = cracker_states2(selected_states)
    additional_selections.sort()
    print(f'companies: {additional_selections}')
    # Return the additional selections as JSON response
    additional_selections = json.dumps(additional_selections)

    return JsonResponse(additional_selections, safe=False)


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

def your_view(request):
    # Get the selected value from the AJAX request
    selected_value = request.GET.getlist('selectedValue[]','')
    # attrvals = Wells15.objects.all()
    statelist = ['PA','OH','WV','LA','TX','OK']
    filter_state = list()
    for x in selected_value:
        if x in statelist:
            filter_state.append(x)
        elif x=='allstates':
            filter_state=statelist
    if not filter_state:
        filter_state=statelist

    print(f'filter state: {filter_state}')

    ftcats = ['Production','Injection / Storage / Service','Orphaned / Abandoned / Unverified Plug','Other / Unknown','Not Drilled','Plugged']
    filter_cats = list()
    for x in selected_value:
        if x in ftcats:
            filter_cats.append(x)
    if not filter_cats:
        filter_cats = ftcats 
            
    attrvals = Wells15.objects.filter(Q(stusps__in=filter_state)&Q(ft_category__in=filter_cats))
    
    newwell = list()
    for n,x in enumerate(attrvals):
        # if n<=5:
        tmp=vars(x)
        tmp.pop('_state')
        newwell.append(tmp)
    newwells = json.dumps(newwell)
    return JsonResponse(newwells, safe=False)
