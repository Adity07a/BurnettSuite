from django.db import migrations, models


def blank_phone_to_null(apps, schema_editor):
    profile = apps.get_model("users", "UserProfile")
    profile.objects.filter(phone="").update(phone=None)


class Migration(migrations.Migration):
    dependencies = [("users", "0005_profileachievement_targetrolepreference_language")]

    operations = [
        migrations.RunPython(blank_phone_to_null, migrations.RunPython.noop),
        migrations.AlterField(
            model_name="userprofile",
            name="phone",
            field=models.CharField(
                blank=True,
                max_length=16,
                null=True,
                unique=True,
            ),
        ),
    ]
