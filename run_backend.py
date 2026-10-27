import os
import sys
from pathlib import Path

if getattr(sys, "frozen", False):
    bundle_dir = Path(sys._MEIPASS)
    data_dir = Path(
        os.environ.get(
            "LOCALAPPDATA",
            str(Path.home())
        )
    ) / "SIGI Free"

    os.environ.setdefault("SIGI_PACKAGED", "1")
else:
    bundle_dir = Path(__file__).resolve().parent
    data_dir = bundle_dir

os.environ.setdefault("SIGI_BUNDLE_DIR", str(bundle_dir))
os.environ.setdefault("SIGI_DATA_DIR", str(data_dir))

data_dir.mkdir(parents=True, exist_ok=True)

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "SIGI.settings")

from django.core.management import execute_from_command_line


if __name__ == "__main__":
    if getattr(sys, "frozen", False):
        execute_from_command_line([
            "manage.py",
            "migrate",
            "--noinput",
        ])

    execute_from_command_line([
        "manage.py",
        "runserver",
        "127.0.0.1:8000",
        "--noreload",
    ])