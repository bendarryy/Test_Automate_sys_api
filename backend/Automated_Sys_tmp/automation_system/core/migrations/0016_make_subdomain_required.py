from django.db import migrations, models
import uuid

def generate_subdomain(apps, schema_editor):
    System = apps.get_model('core', 'System')
    for system in System.objects.filter(subdomain__isnull=True):
        # Generate a unique subdomain based on system name
        base_subdomain = system.name.lower().replace(' ', '-')
        subdomain = base_subdomain
        counter = 1
        
        # Keep trying until we find a unique subdomain
        while System.objects.filter(subdomain=subdomain).exists():
            subdomain = f"{base_subdomain}-{counter}"
            counter += 1
            
        system.subdomain = subdomain
        system.save()

class Migration(migrations.Migration):

    dependencies = [
        ('core', '0015_system_created_at_system_custom_domain_and_more'),
    ]

    operations = [
        # First, ensure all existing records have a subdomain
        migrations.RunPython(generate_subdomain),
        
        # Then, make the field required
        migrations.AlterField(
            model_name='system',
            name='subdomain',
            field=models.CharField(max_length=100, unique=True),
        ),
    ] 