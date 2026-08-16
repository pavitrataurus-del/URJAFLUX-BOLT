import re

with open('src/components/SpatialAnnotationEngine.tsx', 'r') as f:
    content = f.read()

old_str = 'const angle = (zone.startAngle + zone.endAngle) / 2;'
new_str = '''let angle = (zone.startAngle + zone.endAngle) / 2;
                  if (zone.startAngle > zone.endAngle) {
                    angle = (zone.startAngle + zone.endAngle + 360) / 2;
                    if (angle >= 360) angle -= 360;
                  }'''

new_content = content.replace(old_str, new_str)

with open('src/components/SpatialAnnotationEngine.tsx', 'w') as f:
    f.write(new_content)
print("Done")
