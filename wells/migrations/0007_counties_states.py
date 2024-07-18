# Generated by Django 5.0.4 on 2024-07-17 13:50

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('wells', '0006_wells_tx'),
    ]

    operations = [
        migrations.CreateModel(
            name='Counties',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('geomjson', models.CharField()),
                ('statename', models.CharField()),
                ('county', models.CharField()),
            ],
            options={
                'db_table': 'counties_json',
                'managed': False,
            },
        ),
        migrations.CreateModel(
            name='States',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
            ],
            options={
                'db_table': 'states',
                'managed': False,
            },
        ),
    ]
