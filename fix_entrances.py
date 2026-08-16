import re

with open('src/components/SpatialAnnotationEngine.tsx', 'r') as f:
    content = f.read()

def replace_angle(match):
    code = match.group(1)
    angle = float(match.group(2))
    new_angle = angle - 11.25
    if new_angle < 0:
        new_angle += 360
    return f'{{ code: "{code}", angle: {new_angle:g}'

# { code: "N1", angle: 331.875
new_content = re.sub(r'\{\s*code:\s*"([A-Z0-9]+)",\s*angle:\s*([0-9.]+)', replace_angle, content)

with open('src/components/SpatialAnnotationEngine.tsx', 'w') as f:
    f.write(new_content)
print("Done")
