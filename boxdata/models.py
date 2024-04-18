from django.db import models

# Create your models here.
class BoxData(models.Model):
    objectid = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'dataset_mapping'
    
    def __str__(self) -> str:
        return super().__str__()