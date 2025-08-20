import os
import re

def clean_import_paths(directory):
    pattern = re.compile(r'([\"\\'])((?:@?[\\w\\-\\/]+)(?:@\\d+\\.\\d+\\.\\d+))([\"\\'])')

    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith('.ts') or file.endswith('.tsx'):
                file_path = os.path.join(root, file)

                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()

                cleaned_content = pattern.sub(lambda m: f'{m.group(1)}{m.group(2).split(\"@\")[0]}{m.group(3)}', content)

                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(cleaned_content)

clean_import_paths('.')
print("Import paths cleaned successfully.")
