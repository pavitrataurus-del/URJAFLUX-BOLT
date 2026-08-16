import { Renderer } from '../RendererContracts';
import { RenderingBackend } from '../RenderingBackend';
import { CameraEngine } from '../../workspace/CameraEngine';
import { USOMBaseObject, USOMObjectType } from '../../usom/types';
import { MasterChakraObject } from '../../usom/MasterChakraObject';
import { HandleCalculator, HandleType } from '../../usom/HandleCalculator';

export class MasterChakraRenderer implements Renderer {
  public canRender(obj: USOMBaseObject): boolean {
    return obj.type === USOMObjectType.CHAKRA;
  }

  public render(obj: USOMBaseObject, backend: RenderingBackend, camera: CameraEngine): void {
    const chakra = obj as MasterChakraObject;
    const geom = chakra.geometry;
    
    // Zoom factor for constant size handles/strokes
    const zoom = camera.getZoom();
    const inverseZoom = 1 / zoom;

    // 1. Render Master Chakra Geometry
    // We draw the outer circle and sector lines
    backend.save();
    backend.drawCircle({x: 0, y: 0}, geom.radius, {
      stroke: '#4B5563', // Neutral 600 from Design System
      strokeWidth: 2 * inverseZoom,
      fill: 'rgba(255, 255, 255, 0.05)'
    });
    
    // Draw sectors
    for (const sector of geom.sectors) {
      // sector line from center to radius
      const startAngleRad = sector.startAngle * (Math.PI / 180);
      backend.drawLine({x: 0, y: 0}, {
        x: Math.cos(startAngleRad) * geom.radius,
        y: Math.sin(startAngleRad) * geom.radius
      }, {
        stroke: 'rgba(75, 85, 99, 0.5)', // Neutral 600 with opacity
        strokeWidth: 1 * inverseZoom,
        dash: [4 * inverseZoom, 4 * inverseZoom]
      });
    }
    backend.restore();

    // 2. Selection Ring
    if (chakra.isSelected) {
      backend.save();
      backend.drawCircle({x: 0, y: 0}, geom.radius + (4 * inverseZoom), {
        stroke: '#2563EB', // Primary 500 from Design System
        strokeWidth: 2 * inverseZoom
      });
      backend.restore();
    }

    // 3. Handles 
    if (chakra.isSelected) {
      const handles = HandleCalculator.calculateChakraHandles(geom);
      for (const handle of handles) {
        backend.save();
        
        // Translate to handle position
        backend.translate(handle.position.x, handle.position.y);
        
        // Anti-zoom scale so handles stay same size on screen
        backend.scale(inverseZoom, inverseZoom);
        
        if (handle.type === HandleType.ROTATE) {
          backend.drawCircle({x: 0, y: 0}, 6, {
            stroke: '#2563EB',
            fill: '#FFFFFF',
            strokeWidth: 2
          });
          // Small inner dot for rotation
          backend.drawCircle({x: 0, y: 0}, 2, {
            fill: '#2563EB'
          });
        } else if (handle.type === HandleType.SCALE) {
          backend.drawRect({x: -5, y: -5, width: 10, height: 10}, {
            stroke: '#2563EB',
            fill: '#FFFFFF',
            strokeWidth: 2
          });
        }
        
        backend.restore();
      }
    }
  }

  public dispose(): void {
    // No-op
  }
}
