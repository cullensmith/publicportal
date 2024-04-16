from django.db import models

# Create your models here.
class Wells15(models.Model):
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
    src_url = models.CharField(max_length=50, blank=True, null=True)
    ft_uid = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'wells15'
    
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