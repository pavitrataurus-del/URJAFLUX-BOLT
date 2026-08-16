import re

with open('src/components/SpatialAnnotationEngine.tsx', 'r') as f:
    content = f.read()

content = content.replace('UploadCloud,\\n  Upload,', 'UploadCloud,\n  Upload,')
content = content.replace('UploadCloud,\\\\n  Upload,', 'UploadCloud,\n  Upload,')

with open('src/components/SpatialAnnotationEngine.tsx', 'w') as f:
    f.write(content)
