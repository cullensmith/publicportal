from django.db import models

# Create your models here.
class States(models.Model):
    geomjson = models.CharField()
    statename = models.CharField()
    class Meta:
        managed = False
        db_table = 'states_json'
    
    def __str__(self) -> str:
        return super().__str__()
    
class Counties(models.Model):
    geomjson = models.CharField()
    statename = models.CharField()
    county = models.CharField()

    class Meta:
        managed = False
        db_table = 'counties_json'
    
    def __str__(self) -> str:
        return super().__str__()

class Wells(models.Model):
    api_num = models.CharField(max_length=50, blank=True, null=True)
    other_id = models.CharField(max_length=50, blank=True, null=True)
    lat = models.FloatField(blank=True, null=True)
    lng = models.FloatField(blank=True, null=True)
    stusps = models.CharField(max_length=50, blank=True, null=True)
    county = models.CharField(max_length=50, blank=True, null=True)
    municipality = models.CharField(max_length=50, blank=True, null=True)
    well_name = models.CharField(max_length=50, blank=True, null=True)
    operator = models.CharField(max_length=50, blank=True, null=True)
    spud_date = models.CharField(max_length=50, blank=True, null=True)
    plug_date = models.CharField(max_length=50, blank=True, null=True)
    well_type = models.CharField(max_length=50, blank=True, null=True)
    well_status = models.CharField(max_length=50, blank=True, null=True)
    well_configuration = models.CharField(max_length=50, blank=True, null=True)
    ft_category = models.CharField(max_length=50, blank=True, null=True)
    wellwiki = models.CharField(max_length=50, blank=True, null=True)
    ftuid = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'wells_240701'
    
    def __str__(self) -> str:
        return super().__str__()
    
class Wells_PA(models.Model):
    api_num = models.CharField(max_length=50, blank=True, null=True)
    other_id = models.CharField(max_length=50, blank=True, null=True)
    latitude = models.FloatField(blank=True, null=True)
    longitude = models.FloatField(blank=True, null=True)
    stusps = models.CharField(max_length=50, blank=True, null=True)
    county = models.CharField(max_length=50, blank=True, null=True)
    municipality = models.CharField(max_length=50, blank=True, null=True)
    well_name = models.CharField(max_length=50, blank=True, null=True)
    operator = models.CharField(max_length=50, blank=True, null=True)
    spud_date = models.CharField(max_length=50, blank=True, null=True)
    plug_date = models.CharField(max_length=50, blank=True, null=True)
    well_type = models.CharField(max_length=50, blank=True, null=True)
    well_status = models.CharField(max_length=50, blank=True, null=True)
    well_configuration = models.CharField(max_length=50, blank=True, null=True)
    ft_category = models.CharField(max_length=50, blank=True, null=True)
    wellwiki = models.CharField(max_length=50, blank=True, null=True)
    ftuid = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'wells_pa'
    
    def __str__(self) -> str:
        return super().__str__()
    
class Wells_OH(models.Model):
    api_num = models.CharField(max_length=50, blank=True, null=True)
    other_id = models.CharField(max_length=50, blank=True, null=True)
    latitude = models.FloatField(blank=True, null=True)
    longitude = models.FloatField(blank=True, null=True)
    stusps = models.CharField(max_length=50, blank=True, null=True)
    county = models.CharField(max_length=50, blank=True, null=True)
    municipality = models.CharField(max_length=50, blank=True, null=True)
    well_name = models.CharField(max_length=50, blank=True, null=True)
    operator = models.CharField(max_length=50, blank=True, null=True)
    spud_date = models.CharField(max_length=50, blank=True, null=True)
    plug_date = models.CharField(max_length=50, blank=True, null=True)
    well_type = models.CharField(max_length=50, blank=True, null=True)
    well_status = models.CharField(max_length=50, blank=True, null=True)
    well_configuration = models.CharField(max_length=50, blank=True, null=True)
    ft_category = models.CharField(max_length=50, blank=True, null=True)
    wellwiki = models.CharField(max_length=50, blank=True, null=True)
    ftuid = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'wells_oh'
    
    def __str__(self) -> str:
        return super().__str__()

class Wells_TX(models.Model):
    api_num = models.CharField(max_length=50, blank=True, null=True)
    other_id = models.CharField(max_length=50, blank=True, null=True)
    latitude = models.FloatField(blank=True, null=True)
    longitude = models.FloatField(blank=True, null=True)
    stusps = models.CharField(max_length=50, blank=True, null=True)
    county = models.CharField(max_length=50, blank=True, null=True)
    municipality = models.CharField(max_length=50, blank=True, null=True)
    well_name = models.CharField(max_length=50, blank=True, null=True)
    operator = models.CharField(max_length=50, blank=True, null=True)
    spud_date = models.CharField(max_length=50, blank=True, null=True)
    plug_date = models.CharField(max_length=50, blank=True, null=True)
    well_type = models.CharField(max_length=50, blank=True, null=True)
    well_status = models.CharField(max_length=50, blank=True, null=True)
    well_configuration = models.CharField(max_length=50, blank=True, null=True)
    ft_category = models.CharField(max_length=50, blank=True, null=True)
    wellwiki = models.CharField(max_length=50, blank=True, null=True)
    ftuid = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'wells_tx'
    
    def __str__(self) -> str:
        return super().__str__()

class HifldOilRef(models.Model):
    objectid = models.CharField(max_length=50, blank=True, null=True)
    ref_id = models.CharField(max_length=50, blank=True, null=True)
    latitude = models.FloatField(blank=True, null=True)
    longitude = models.FloatField(blank=True, null=True)
    name = models.CharField(max_length=50, blank=True, null=True)
    address = models.CharField(max_length=50, blank=True, null=True)
    city = models.CharField(max_length=50, blank=True, null=True)
    state = models.CharField(max_length=50, blank=True, null=True)
    county = models.CharField(max_length=50, blank=True, null=True)
    status = models.CharField(max_length=50, blank=True, null=True)
    naics_code = models.CharField(max_length=50, blank=True, null=True)
    naics_desc = models.CharField(max_length=50, blank=True, null=True)
    reftype = models.CharField(max_length=50, blank=True, null=True)
    opername = models.CharField(max_length=50, blank=True, null=True)
    capacity = models.CharField(max_length=50, blank=True, null=True)
    us_rank = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'hifld_oilrefineries'
    
    def __str__(self) -> str:
        return super().__str__()
    
class BoxData(models.Model):
    objectid = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'hifld_oilrefineries'
    
    def __str__(self) -> str:
        return super().__str__()
    
class Cracker(models.Model):
    objectid = models.IntegerField(blank=True, null=True)
    company = models.CharField(max_length=150, blank=True, null=True)
    sitename = models.CharField(max_length=150, blank=True, null=True)
    county = models.CharField(max_length=150, blank=True, null=True)
    state = models.CharField(max_length=150, blank=True, null=True)
    padd = models.IntegerField(blank=True, null=True)
    sourceorg = models.CharField(max_length=150, blank=True, null=True)
    year = models.CharField(max_length=150, blank=True, null=True)
    longitude = models.FloatField(blank=True, null=True)
    latitude = models.FloatField(blank=True, null=True)
    id = models.IntegerField(blank=True, null=False,primary_key=True)

    class Meta:
        managed = False
        db_table = 'plants_cracker'
    
    def __str__(self) -> str:
        return super().__str__()
    
class TermPetro(models.Model):
    objectid = models.IntegerField(blank=True, null=True)
    term_id = models.CharField(max_length=150, blank=True, null=True)
    terminalname = models.CharField(max_length=150, blank=True, null=True)
    address = models.CharField(max_length=150, blank=True, null=True)
    city = models.CharField(max_length=150, blank=True, null=True)
    state = models.CharField(max_length=150, blank=True, null=True)
    zip = models.IntegerField(blank=True, null=True)
    zip4 = models.CharField(max_length=150, blank=True, null=True)
    telephone = models.CharField(max_length=150, blank=True, null=True)
    typedesc = models.CharField(max_length=150, blank=True, null=True)
    status = models.CharField(max_length=150, blank=True, null=True)
    population = models.IntegerField(blank=True, null=True)
    county = models.CharField(max_length=150, blank=True, null=True)
    countyfips = models.IntegerField(blank=True, null=True)
    country = models.CharField(max_length=150, blank=True, null=True)
    latitude = models.FloatField(blank=True, null=True)
    longitude = models.FloatField(blank=True, null=True)
    naics_code = models.IntegerField(blank=True, null=True)
    naics_desc = models.CharField(max_length=150, blank=True, null=True)
    sourceorg = models.CharField(max_length=150, blank=True, null=True)
    sourcedate = models.CharField(max_length=150, blank=True, null=True)
    val_method = models.CharField(max_length=150, blank=True, null=True)
    val_date = models.CharField(max_length=150, blank=True, null=True)
    website = models.CharField(max_length=150, blank=True, null=True)
    exstars_i = models.CharField(max_length=150, blank=True, null=True)
    ownername = models.CharField(max_length=150, blank=True, null=True)
    operatorname = models.CharField(max_length=150, blank=True, null=True)
    posrel = models.CharField(max_length=150, blank=True, null=True)
    commodity = models.CharField(max_length=150, blank=True, null=True)
    capacity = models.IntegerField(blank=True, null=True)
    truck_in = models.CharField(max_length=150, blank=True, null=True)
    truck_out = models.CharField(max_length=150, blank=True, null=True)
    pipe_in = models.CharField(max_length=150, blank=True, null=True)
    pipe_out = models.CharField(max_length=150, blank=True, null=True)
    marine_in = models.CharField(max_length=150, blank=True, null=True)
    marine_out = models.CharField(max_length=150, blank=True, null=True)
    rail_in = models.CharField(max_length=150, blank=True, null=True)
    rail_out = models.CharField(max_length=150, blank=True, null=True)
    asphalt = models.CharField(max_length=150, blank=True, null=True)
    chemicals = models.CharField(max_length=150, blank=True, null=True)
    propane = models.CharField(max_length=150, blank=True, null=True)
    butane = models.CharField(max_length=150, blank=True, null=True)
    refined = models.CharField(max_length=150, blank=True, null=True)
    ethanol = models.CharField(max_length=150, blank=True, null=True)
    biodiesel = models.CharField(max_length=150, blank=True, null=True)
    crude_oil = models.CharField(max_length=150, blank=True, null=True)
    jetfuel = models.CharField(max_length=150, blank=True, null=True)
    gasoline = models.CharField(max_length=150, blank=True, null=True)
    distillate = models.CharField(max_length=150, blank=True, null=True)
    avgas = models.CharField(max_length=150, blank=True, null=True)
    id = models.IntegerField(blank=True, null=False,primary_key=True)


    class Meta:
        managed = False
        db_table = 'terminals_petrolium'
    
    def __str__(self) -> str:
        return super().__str__()