from django.db import models
from django.utils import timezone

# models.py

class DownloadRequest(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField()
    ip_address = models.GenericIPAddressField()
    timestamp = models.DateTimeField()

class CSVRequestLog(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField()
    ip_address = models.GenericIPAddressField()
    requested_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.email}) at {self.requested_at}"

class AuthGroup(models.Model):
    name = models.CharField(unique=True, max_length=150)

    class Meta:
        app_label = 'wells'
        # db_table = 'auth_group'

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
    
# class CountyNames(models.Model):
#     county = models.CharField(max_length=50)
#     statename = models.CharField(max_length=20)
#     stusps = models.CharField(max_length=2)

#     class Meta:
#         managed = False
#         db_table = 'county_wstate'
    
#     def __str__(self) -> str:
#         return super().__str__()
    
class stStatus(models.Model):
    well_status = models.CharField(max_length=50)
    stusps = models.CharField(max_length=2)

    class Meta:
        managed = False
        db_table = 'wellstatus'
    
    def __str__(self) -> str:
        return super().__str__()
    
class stType(models.Model):
    well_type = models.CharField(max_length=50)
    stusps = models.CharField(max_length=2)

    class Meta:
        managed = False
        db_table = 'welltype'
    
    def __str__(self) -> str:
        return super().__str__()

class Wells(models.Model):
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
    # wellwiki = models.CharField(max_length=50, blank=True, null=True)
    # ftuid = models.IntegerField(blank=True, null=True)
    id = models.IntegerField(primary_key=True)

    class Meta:
        managed = False
        db_table = '"wells"."wells"'
    
    def __str__(self) -> str:
        return super().__str__()
    


class DownloadLog(models.Model):
    AFFILIATION_CHOICES = [
        ('','Oppo'),
        ('', ''),
        ('NG', ''),
        ('Community Member', 'Community Member'),
        ('Student', 'Student'),
        ('Industry', 'Industry'),
        ('Nonprofit', 'Nonprofit'),
        ('Government', 'Government'),
        ('Other', 'Other'),
    ]
    
    STATE_CHOICES = [
        ('', ''),
        ('Alabama','Alabama'),
        ('AL', 'Alabama'),
        ('AK', 'Alaska'),
        ('AZ', 'Arizona'),
        ('AR', 'Arkansas'),
        ('CA', 'California'),
        ('CO', 'Colorado'),
        ('CT', 'Connecticut'),
        ('DE', 'Delaware'),
        ('FL', 'Florida'),
        ('GA', 'Georgia'),
        ('HI', 'Hawaii'),
        ('ID', 'Idaho'),
        ('IL', 'Illinois'),
        ('IN', 'Indiana'),
        ('IA', 'Iowa'),
        ('KS', 'Kansas'),
        ('KY', 'Kentucky'),
        ('LA', 'Louisiana'),
        ('ME', 'Maine'),
        ('MD', 'Maryland'),
        ('MA', 'Massachusetts'),
        ('MI', 'Michigan'),
        ('MN', 'Minnesota'),
        ('MS', 'Mississippi'),
        ('MO', 'Missouri'),
        ('MT', 'Montana'),
        ('NE', 'Nebraska'),
        ('NV', 'Nevada'),
        ('NH', 'New Hampshire'),
        ('NJ', 'New Jersey'),
        ('NM', 'New Mexico'),
        ('NY', 'New York'),
        ('NC', 'North Carolina'),
        ('ND', 'North Dakota'),
        ('OH', 'Ohio'),
        ('OK', 'Oklahoma'),
        ('OR', 'Oregon'),
        ('PA', 'Pennsylvania'),
        ('RI', 'Rhode Island'),
        ('SC', 'South Carolina'),
        ('SD', 'South Dakota'),
        ('TN', 'Tennessee'),
        ('TX', 'Texas'),
        ('UT', 'Utah'),
        ('VT', 'Vermont'),
        ('VA', 'Virginia'),
        ('WA', 'Washington'),
        ('WV', 'West Virginia'),
        ('WI', 'Wisconsin'),
        ('WY', 'Wyoming'),
        ('DC', 'District of Columbia'),
        ('Other', 'International'),
    ]
    
    name = models.CharField(max_length=100)
    email = models.EmailField()
    affiliation = models.CharField(max_length=50, choices=AFFILIATION_CHOICES)
    state = models.CharField(max_length=50, choices=STATE_CHOICES)
    file_name = models.CharField(max_length=255, blank=True, null=True)
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    download_date = models.DateTimeField(default=timezone.now)
    

    
    def __str__(self):
        return f"{self.name} - {self.email} - {self.created_at}"
    
    class Meta:
        ordering = ['-download_date']
        managed = False
        db_table = '"portals"."wells_downloads"'