import re

with open('src/components/SpatialAnnotationEngine.tsx', 'r') as f:
    content = f.read()

content = content.replace('useState(false);\\n  const [customChakraUrl', 'useState(false);\\n  const [customChakraUrl')

