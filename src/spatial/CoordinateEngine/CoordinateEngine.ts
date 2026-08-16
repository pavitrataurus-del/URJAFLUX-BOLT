export class CoordinateEngine {
  /**
   * Converts a screen client coordinate (like from a MouseEvent) to Canvas coordinates (respecting pan & zoom).
   * Note: The containerRect must be the bounding box of the main scrollable/pannable area.
   */
  public static screenToCanvas(
    clientX: number, 
    clientY: number, 
    containerRect: DOMRect, 
    pan: { x: number; y: number }, 
    zoom: number
  ) {
    const x = (clientX - containerRect.left - pan.x) / zoom;
    const y = (clientY - containerRect.top - pan.y) / zoom;
    return { x, y };
  }

  /**
   * Converts a coordinate on the Canvas to a coordinate relative to the Blueprint image's local space.
   * If the blueprint is placed at (0,0) in the canvas, this is identical to Canvas coordinates, 
   * but it allows for future offsets if the blueprint is centered or moved.
   */
  public static canvasToBlueprintLocal(
    canvasX: number, 
    canvasY: number, 
    blueprintOffset: { x: number; y: number } = { x: 0, y: 0 }
  ) {
    return {
      x: canvasX - blueprintOffset.x,
      y: canvasY - blueprintOffset.y
    };
  }

  /**
   * Converts a Blueprint local coordinate back to Screen coordinates (useful for fixed overlays or tooltips).
   */
  public static blueprintLocalToScreen(
    localX: number, 
    localY: number, 
    blueprintOffset: { x: number; y: number } = { x: 0, y: 0 },
    containerRect: DOMRect,
    pan: { x: number; y: number },
    zoom: number
  ) {
    const canvasX = localX + blueprintOffset.x;
    const canvasY = localY + blueprintOffset.y;
    const screenX = (canvasX * zoom) + pan.x + containerRect.left;
    const screenY = (canvasY * zoom) + pan.y + containerRect.top;
    return { x: screenX, y: screenY };
  }
}
