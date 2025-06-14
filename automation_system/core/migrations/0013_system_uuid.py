from django.db import migrations, models
import uuid


def gen_uuid(apps, schema_editor):
    System = apps.get_model('core', 'System')
    for row in System.objects.all():
        row.uuid = uuid.uuid4()
        row.save(update_fields=['uuid'])


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0012_alter_employee_role'),
    ]

    operations = [
        migrations.AddField(
            model_name='system',
            name='uuid',
            field=models.UUIDField(unique=True, editable=False, null=True),
        ),
        migrations.RunPython(gen_uuid),
        migrations.AlterField(
            model_name='system',
            name='uuid',
            field=models.UUIDField(unique=True, editable=False),
        ),
    ] 