# Generated by Django 4.1.7 on 2023-06-11 04:44

from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0007_appuser_sharedcontracts_contract_sharedwith'),
    ]

    operations = [
        migrations.AlterField(
            model_name='contract',
            name='sharedWith',
            field=models.ManyToManyField(default=[], to=settings.AUTH_USER_MODEL),
        ),
    ]
