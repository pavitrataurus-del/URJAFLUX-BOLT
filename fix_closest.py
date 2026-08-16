import re

with open('/app/applet/src/components/SpatialAnnotationEngine.tsx', 'r') as f:
    content = f.read()

target = """                        // Ignore if clicking the rotation handle
                        if ((e.target as HTMLElement).closest('.group') && (e.target as HTMLElement).closest('.group')?.hasAttribute('title')) return;"""

if target in content:
    content = content.replace(target, '')
    with open('/app/applet/src/components/SpatialAnnotationEngine.tsx', 'w') as f:
        f.write(content)
        print("closest check removed.")
else:
    print("Not found.")
