from django.db import migrations

def create_initial_data(apps, schema_editor):
    System = apps.get_model('core', 'System')
    RestaurantData = apps.get_model('restaurant', 'RestaurantData')
    
    # Create RestaurantData for all restaurant systems
    for system in System.objects.filter(category='restaurant'):
        RestaurantData.objects.get_or_create(
            system=system,
            defaults={'number_of_tables': 15}
        )

def reverse_create(apps, schema_editor):
    RestaurantData = apps.get_model('restaurant', 'RestaurantData')
    RestaurantData.objects.all().delete()

class Migration(migrations.Migration):
    dependencies = [
        ('restaurant', '0013_restaurantdata'),
    ]

    operations = [
        migrations.RunPython(create_initial_data, reverse_create),
    ] 