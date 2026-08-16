import re

with open('src/components/SpatialAnnotationEngine.tsx', 'r') as f:
    lines = f.readlines()

new_lines = []
for i, line in enumerate(lines):
    # Only touch the Vastu Engine Node section and other UI elements that render values, NOT the state setters
    if "value={Math.round(chakraState.x)}" in line:
        line = line.replace("chakraState.x", "(engineChakra?.transform.position.x ?? chakraState.x)")
    elif "value={Math.round(chakraState.y)}" in line:
        line = line.replace("chakraState.y", "(engineChakra?.transform.position.y ?? chakraState.y)")
    elif "value={chakraState.rotation}" in line:
        line = line.replace("chakraState.rotation", "(engineChakra?.transform.rotation ?? chakraState.rotation)")
    elif "{chakraState.rotation}°" in line:
        line = line.replace("chakraState.rotation", "(engineChakra?.transform.rotation ?? chakraState.rotation)")
    elif "value={chakraState.scale}" in line:
        line = line.replace("chakraState.scale", "(engineChakra?.transform.scale.x ?? chakraState.scale)")
    elif "chakraState.scale.toFixed(2)" in line:
        line = line.replace("chakraState.scale", "(engineChakra?.transform.scale.x ?? chakraState.scale)")
    elif "checked={chakraState.isLocked}" in line:
        line = line.replace("chakraState.isLocked", "(engineChakra?.isLocked ?? chakraState.isLocked)")
    elif "disabled={chakraState.isLocked}" in line:
        line = line.replace("chakraState.isLocked", "(engineChakra?.isLocked ?? chakraState.isLocked)")
    new_lines.append(line)

with open('src/components/SpatialAnnotationEngine.tsx', 'w') as f:
    f.writelines(new_lines)
