import os
import re
import unicodedata

def slugify(value):
    """
    Normalizes string, converts to lowercase, removes non-alpha characters,
    and converts spaces to hyphens.
    """
    value = str(value)
    # Normalize unicode characters
    value = unicodedata.normalize('NFKD', value).encode('ascii', 'ignore').decode('ascii')
    value = value.lower()
    value = re.sub(r'[^\w\s-]', '', value).strip()
    value = re.sub(r'[-\s]+', '-', value)
    return value

def main():
    media_dir = r"C:\Users\OPTICA ROMA\Desktop\pagina nueva optica\public\media"
    src_dir = r"C:\Users\OPTICA ROMA\Desktop\pagina nueva optica\src"
    
    renames = {}
    
    # 1. Rename files
    for filename in os.listdir(media_dir):
        old_path = os.path.join(media_dir, filename)
        if os.path.isfile(old_path):
            name, ext = os.path.splitext(filename)
            new_name = slugify(name) + ext.lower()
            if new_name != filename:
                new_path = os.path.join(media_dir, new_name)
                # Handle case where lowercasing might conflict in windows
                if os.path.exists(new_path) and filename.lower() != new_name.lower():
                    print(f"Warning: {new_name} already exists. Skipping {filename}.")
                    continue
                os.rename(old_path, new_path)
                renames[filename] = new_name
                print(f"Renamed: '{filename}' -> '{new_name}'")
                
    # 2. Update references in source code
    if renames:
        for root, dirs, files in os.walk(src_dir):
            for file in files:
                if file.endswith(('.tsx', '.ts', '.css')):
                    file_path = os.path.join(root, file)
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                        
                    new_content = content
                    for old_filename, new_filename in renames.items():
                        new_content = new_content.replace(old_filename, new_filename)
                        # Also replace URL encoded versions like %20 just in case
                        url_encoded_old = old_filename.replace(" ", "%20")
                        new_content = new_content.replace(url_encoded_old, new_filename)
                        
                    if new_content != content:
                        with open(file_path, 'w', encoding='utf-8') as f:
                            f.write(new_content)
                        print(f"Updated references in: {file_path}")
    else:
        print("No files needed renaming.")

if __name__ == '__main__':
    main()
