# Generated by Django 5.0.4 on 2024-07-17 11:54

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('wells', '0004_alter_wells_table'),
    ]

    operations = [
        migrations.CreateModel(
            name='Wells_OH',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('api_num', models.CharField(blank=True, max_length=50, null=True)),
                ('other_id', models.CharField(blank=True, max_length=50, null=True)),
                ('latitude', models.FloatField(blank=True, null=True)),
                ('longitude', models.FloatField(blank=True, null=True)),
                ('stusps', models.CharField(blank=True, max_length=50, null=True)),
                ('county', models.CharField(blank=True, max_length=50, null=True)),
                ('municipality', models.CharField(blank=True, max_length=50, null=True)),
                ('well_name', models.CharField(blank=True, max_length=50, null=True)),
                ('operator', models.CharField(blank=True, max_length=50, null=True)),
                ('spud_date', models.CharField(blank=True, max_length=50, null=True)),
                ('plug_date', models.CharField(blank=True, max_length=50, null=True)),
                ('well_type', models.CharField(blank=True, max_length=50, null=True)),
                ('well_status', models.CharField(blank=True, max_length=50, null=True)),
                ('well_configuration', models.CharField(blank=True, max_length=50, null=True)),
                ('ft_category', models.CharField(blank=True, max_length=50, null=True)),
                ('wellwiki', models.CharField(blank=True, max_length=50, null=True)),
                ('ftuid', models.IntegerField(blank=True, null=True)),
            ],
            options={
                'db_table': 'wells_oh',
                'managed': False,
            },
        ),
        migrations.CreateModel(
            name='Wells_PA',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('api_num', models.CharField(blank=True, max_length=50, null=True)),
                ('other_id', models.CharField(blank=True, max_length=50, null=True)),
                ('latitude', models.FloatField(blank=True, null=True)),
                ('longitude', models.FloatField(blank=True, null=True)),
                ('stusps', models.CharField(blank=True, max_length=50, null=True)),
                ('county', models.CharField(blank=True, max_length=50, null=True)),
                ('municipality', models.CharField(blank=True, max_length=50, null=True)),
                ('well_name', models.CharField(blank=True, max_length=50, null=True)),
                ('operator', models.CharField(blank=True, max_length=50, null=True)),
                ('spud_date', models.CharField(blank=True, max_length=50, null=True)),
                ('plug_date', models.CharField(blank=True, max_length=50, null=True)),
                ('well_type', models.CharField(blank=True, max_length=50, null=True)),
                ('well_status', models.CharField(blank=True, max_length=50, null=True)),
                ('well_configuration', models.CharField(blank=True, max_length=50, null=True)),
                ('ft_category', models.CharField(blank=True, max_length=50, null=True)),
                ('wellwiki', models.CharField(blank=True, max_length=50, null=True)),
                ('ftuid', models.IntegerField(blank=True, null=True)),
            ],
            options={
                'db_table': 'wells_pa',
                'managed': False,
            },
        ),
    ]
