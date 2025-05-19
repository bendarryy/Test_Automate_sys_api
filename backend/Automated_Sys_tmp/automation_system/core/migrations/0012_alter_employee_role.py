from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0011_system_description_system_is_public_system_subdomain'),
    ]

    operations = [
        migrations.AlterField(
            model_name='employee',
            name='role',
            field=models.CharField(
                max_length=50,
                choices=[
                    ('waiter', 'Waiter'),
                    ('chef', 'Chef'),
                    ('delivery', 'Delivery'),
                    ('manager', 'Manager'),
                    ('head_chef', 'Head Chef'),
                    ('cashier', 'Cashier'),
                    ('inventory_manager', 'Inventory Manager')
                ]
            ),
        ),
    ] 