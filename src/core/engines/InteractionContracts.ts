import { Point2D } from '../spatial/math';
import { USOMId, BoundingBox } from '../usom/types';


export interface InteractionEvent {
  pointerPosition: Point2D;
  targetId?: USOMId;
  modifiers: {
    shift: boolean;
    ctrl: boolean;
    alt: boolean;
  };
}

export interface DragEvent extends InteractionEvent {
  startPosition: Point2D;
  delta: Point2D;
}

export interface Interactable {
  hitTest(point: Point2D): boolean;
  getBoundingBox(): BoundingBox;
}

export interface InteractionHandler {
  onHoverStart?(event: InteractionEvent): void;
  onHoverEnd?(event: InteractionEvent): void;
  onClick?(event: InteractionEvent): void;
  onDragStart?(event: DragEvent): void;
  onDrag?(event: DragEvent): void;
  onDragEnd?(event: DragEvent): void;
}
