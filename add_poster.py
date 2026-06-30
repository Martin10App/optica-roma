import os
src_dir = r"C:\Users\OPTICA ROMA\Desktop\pagina nueva optica\src"
for root, dirs, files in os.walk(src_dir):
    for file in files:
        if file.endswith('.tsx'):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
            if '<video' in content and 'poster=' not in content:
                new_content = content.replace('<video', '<video poster="/media/portada-cadenas.jpeg"')
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f'Updated {file}')
