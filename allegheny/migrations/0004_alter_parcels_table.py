# Generated by Django 4.2.13 on 2024-05-16 11:15

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('allegheny', '0003_alter_parcels_options'),
    ]

    operations = [
        migrations.AlterModelTable(
            name='parcels',
            table='allegheny_parceldata',
        ),
    ]