# Generated by Django 4.1.7 on 2023-07-07 15:21

import django.contrib.postgres.fields
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0011_alter_item_returnedby'),
    ]

    operations = [
        migrations.AddField(
            model_name='contract',
            name='transactionHistory',
            field=django.contrib.postgres.fields.ArrayField(base_field=models.CharField(default=None, max_length=100), default=None, size=None),
        ),
    ]
