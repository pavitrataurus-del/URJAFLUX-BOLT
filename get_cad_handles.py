import re

with open('/app/applet/src/components/SpatialAnnotationEngine.tsx', 'r') as f:
    content = f.read()

start_idx = content.find('{/* CAD INTERACTION HANDLES (Rotate) */}')
if start_idx != -1:
    end_idx = content.find('{/* Render Measure Lines */}', start_idx)
    if end_idx == -1:
        end_idx = start_idx + 2000
    print(content[start_idx:end_idx])
