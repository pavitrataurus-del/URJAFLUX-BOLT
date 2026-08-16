import re

with open('src/components/SpatialAnnotationEngine.tsx', 'r') as f:
    content = f.read()

pattern = re.compile(
    r'// --- M3A Engine Bridge ---.*?setEngineChakra\(Object\.assign\(Object\.create\(Object\.getPrototypeOf\(chakra\)\), chakra\)\);\s*\}, \[chakraState\]\);',
    re.DOTALL
)

replacement = """// --- M3A Engine Bridge ---
  const [engineChakra, setEngineChakra] = useState<any>(null);

  useEffect(() => {
    const engine = engineAdapter.getEngine();
    if (!engine) {
      const t = setTimeout(() => setChakraState(c => ({...c})), 100);
      return () => clearTimeout(t);
    }
    
    const newChakra = new MasterChakraObject("master-chakra", "Master Chakra", {
      position: { x: chakraState.x, y: chakraState.y },
      rotation: chakraState.rotation,
      scale: { x: chakraState.scale, y: chakraState.scale }
    }, 420);
    newChakra.isLocked = chakraState.isLocked;

    let engineObj = engineAdapter.getObject("master-chakra");
    if (!engineObj) {
      engine.objects._add(newChakra);
      engineObj = engineAdapter.getObject("master-chakra")!;
    } else {
      engine.objects._update("master-chakra", newChakra);
      engineObj = engineAdapter.getObject("master-chakra")!;
    }
    
    // Rehydrate into a class instance so getters work
    const hydratedChakra = new MasterChakraObject(
      engineObj.id, 
      engineObj.name, 
      engineObj.transform, 
      420
    );
    hydratedChakra.isLocked = engineObj.isLocked;
    
    setEngineChakra(hydratedChakra);
  }, [chakraState]);"""

new_content = pattern.sub(replacement, content)
with open('src/components/SpatialAnnotationEngine.tsx', 'w') as f:
    f.write(new_content)

print(f"Replaced? {new_content != content}")
