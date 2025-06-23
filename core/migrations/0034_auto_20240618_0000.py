from django.db import migrations, models
import django.db.models.deletion
from django.conf import settings
import datetime


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0033_passwordresetotp"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="Profile",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("last_selected_system_id", models.IntegerField(blank=True, null=True)),
                (
                    "user",
                    models.OneToOneField(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="profile",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
        ),
        migrations.AlterField(
            model_name="passwordresetotp",
            name="user",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="password_reset_otps",
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.AddField(
            model_name="passwordresetotp",
            name="expires_at",
            field=models.DateTimeField(
                default=datetime.datetime(
                    2024, 6, 18, 0, 0, tzinfo=datetime.timezone.utc
                )
            ),
        ),
    ]
