import { Layout } from "./model/Shape";

export const CANVAS_ID = "canvas";

export interface ICanvas {
  renderLayout(layout: Layout): void;
  clear(): void;
  zoomFit(): void;
  destroy(): void;
}
