from django.db import migrations


def populate_unit_cost(apps, schema_editor):
    SaleItem = apps.get_model("supermarket", "SaleItem")
    for item in SaleItem.objects.all():
        item.unit_cost = item.product.cost
        item.save()


class Migration(migrations.Migration):

    dependencies = [
        ("supermarket", "0017_saleitem_unit_cost"),
    ]

    operations = [
        migrations.RunPython(populate_unit_cost),
    ]
