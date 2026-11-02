import re

from django.db import migrations


MOBILE_PATTERN = re.compile(r"^\+?[1-9]\d{7,14}$")


def normalize_mobile_numbers(apps, schema_editor):
    employee_model = apps.get_model("employees", "Employee")
    for employee in employee_model.objects.exclude(phone_number="").iterator():
        normalized = re.sub(r"[\s().-]", "", employee.phone_number.strip())
        if MOBILE_PATTERN.fullmatch(normalized) and normalized != employee.phone_number:
            employee.phone_number = normalized
            employee.save(update_fields=["phone_number"])


class Migration(migrations.Migration):
    dependencies = [("employees", "0001_initial")]

    operations = [
        migrations.RunPython(
            normalize_mobile_numbers,
            migrations.RunPython.noop,
        )
    ]
