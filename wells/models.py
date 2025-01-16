from django.db import models

# Create your models here.
class States(models.Model):
    geomjson = models.CharField(max_length=255)
    statename = models.CharField(max_length=255)
    class Meta:
        managed = False
        db_table = 'states_json'
    
    def __str__(self) -> str:
        return super().__str__()
    
class Counties(models.Model):
    geomjson = models.CharField(max_length=255)
    statename = models.CharField(max_length=255)
    stusps = models.CharField(max_length=10)
    county = models.CharField(max_length=255)

    class Meta:
        managed = False
        db_table = 'counties_json'
    
    def __str__(self) -> str:
        return super().__str__()
    
class CountyNames(models.Model):
    county = models.CharField(max_length=50)
    statename = models.CharField(max_length=20)
    stusps = models.CharField(max_length=2)

    class Meta:
        managed = False
        db_table = 'county_wstate'
    
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
    id = models.IntegerField(primary_key=True)

    class Meta:
        managed = False
        db_table = 'wells_natl_v1'
    
    def __str__(self) -> str:
        return super().__str__()
    