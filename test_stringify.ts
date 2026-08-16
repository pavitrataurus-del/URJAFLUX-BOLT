import { MasterChakraObject } from "./src/core/usom/MasterChakraObject";

const c = new MasterChakraObject("master-chakra", "Master Chakra", {
  position: { x: 100, y: 100 },
  rotation: 0,
  scale: { x: 1, y: 1 }
}, 420);

console.log(JSON.stringify(c, null, 2));
