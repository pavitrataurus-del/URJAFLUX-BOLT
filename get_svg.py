with open('/app/applet/src/components/SpatialAnnotationEngine.tsx', 'r') as f:
    content = f.read()

start_idx = content.find('const VastuChakraSVGOverlay =')
end_idx = content.find('const selectedItem = annotations.find', start_idx)
if end_idx == -1:
    end_idx = start_idx + 6000
print(content[start_idx:end_idx])
