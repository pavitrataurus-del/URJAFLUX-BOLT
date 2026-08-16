import re

with open('src/components/SpatialAnnotationEngine.tsx', 'r') as f:
    content = f.read()

content = content.replace('\\\\n', '\\n')
with open('src/components/SpatialAnnotationEngine.tsx', 'w') as f:
    f.write(content)
