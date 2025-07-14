import re
import os
import sys
import json
import zipfile

# Read version from manifest.json
try:
    with open("manifest.json", "r") as manifest_file:
        manifest_data = json.load(manifest_file)
        version = manifest_data["version"]
except FileNotFoundError:
    print("Error: manifest.json not found")
    sys.exit(1)
except KeyError:
    print("Error: version not found in manifest.json")
    sys.exit(1)
except json.JSONDecodeError:
    print("Error: manifest.json is not valid JSON")
    sys.exit(1)

excluded_file_paths = [
    r"^.git", r"^build", r"^.prettierrc", r"^.git", r"^ts", r"^node_modules", 
    r"LICENSE", r"^package", r"^readme", r"^tsconfig", r".vscode", r"^_config", 
    r"^CNAME", r"^res/webstore.png", r"^res/firefoxaddon", r"^res/logo_transparent.png", 
    r"^tailwind", r"^input", r"^screenshots"
]

if os.name == 'nt':
    excluded_file_paths = [path.replace(r"/", r"\\") for path in excluded_file_paths]


def shouldBeAdded(file_path):
    for each_path in excluded_file_paths:
        if (re.match(each_path, file_path)):
            return False
    return True


print(f"Version string: {version}")
with zipfile.ZipFile(f"./build/fontonic-v{version}.zip", "w") as zip_file:
    for root, _, files in os.walk("./"):
        for file in files:
            full_path = os.path.join(root, file)
            archive_path = os.path.relpath(full_path, "./")
            if (shouldBeAdded(archive_path)):
                print(f"Added: {archive_path}")
                zip_file.write(full_path, archive_path)


print("Zip created successfully.")
