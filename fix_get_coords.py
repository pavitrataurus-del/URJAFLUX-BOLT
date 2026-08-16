import re

with open('/app/applet/src/components/SpatialAnnotationEngine.tsx', 'r') as f:
    content = f.read()

target = """  const getCanvasCoords = (e: any) => {
    const mainEl = e.currentTarget.closest("main");"""

replacement = """  const getCanvasCoords = (e: any) => {
    const mainEl = document.querySelector("main");"""

if target in content:
    content = content.replace(target, replacement)
    with open('/app/applet/src/components/SpatialAnnotationEngine.tsx', 'w') as f:
        f.write(content)
        print("getCanvasCoords fixed.")
else:
    print("Not found. Let me try regex.")
    content = re.sub(r'const mainEl = e\.currentTarget\.closest\("main"\);', 'const mainEl = document.querySelector("main");', content)
    with open('/app/applet/src/components/SpatialAnnotationEngine.tsx', 'w') as f:
        f.write(content)
        print("getCanvasCoords fixed with regex.")
