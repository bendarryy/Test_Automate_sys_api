from django.db import migrations

def create_restaurant_data(apps, schema_editor):
    System = apps.get_model('core', 'System')
    RestaurantData = apps.get_model('core', 'RestaurantData')
    
    # Create RestaurantData for all existing restaurant systems
    for system in System.objects.filter(category='restaurant'):
        RestaurantData.objects.get_or_create(
            system=system,
            defaults={'number_of_tables': 15}
        )

def reverse_restaurant_data(apps, schema_editor):
    RestaurantData = apps.get_model('core', 'RestaurantData')
    RestaurantData.objects.all().delete()

class Migration(migrations.Migration):
    dependencies = [
        ('core', '0025_alter_publicsliderimage_options_and_more'),
    ]

    operations = [
        migrations.RunPython(create_restaurant_data, reverse_restaurant_data),
    ] 