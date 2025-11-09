export interface Star {
  x: number;
  y: number;
  radius: number;
  speed: number;
  vx: number;
  vy: number;
  opacity: number;
}

export interface PointerState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  lastTime: number;
  active: boolean;
}

export interface Viewport {
  width: number;
  height: number;
}
