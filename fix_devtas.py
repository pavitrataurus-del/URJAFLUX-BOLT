import re

with open('src/components/SpatialAnnotationEngine.tsx', 'r') as f:
    content = f.read()

# { name: "Shikhi", angle: 337.5 }
def replace_angle(match):
    name = match.group(1)
    angle = float(match.group(2))
    new_angle = angle - 11.25
    if new_angle < 0:
        new_angle += 360
    return f'{{ name: "{name}", angle: {new_angle:g}'

# Only replace within OUTER_DEITIES block!
start_idx = content.find("OUTER_DEITIES = [")
end_idx = content.find("];", start_idx)

outer_block = content[start_idx:end_idx]
new_outer_block = re.sub(r'\{\s*name:\s*"([A-Za-z]+)",\s*angle:\s*([0-9.]+)', replace_angle, outer_block)

new_content = content[:start_idx] + new_outer_block + content[end_idx:]

with open('src/components/SpatialAnnotationEngine.tsx', 'w') as f:
    f.write(new_content)
print("Done")
