import Konva from "konva";
import { Stage } from "konva/lib/Stage";
import { Layout } from "../model/Shape";
import { Layer } from "konva/lib/Layer";
import { Vector2d } from "konva/lib/types";
import { ICanvas } from "../ICanvas";

export const RENDER_SCALE = 0.1;

export class KonvaCanvas implements ICanvas {
  stage: Stage;
  layer: Layer;

  constructor(canvasId: string) {
    this.initStage(canvasId);
    this.initMouse();
    // this.drawSampleRect();
  }

  initStage(canvasId: string) {
    var width = window.innerWidth;
    var height = window.innerHeight;

    this.stage = new Konva.Stage({
      container: canvasId,
      width: width,
      height: height,
      draggable: true,
    });

    this.layer = new Konva.Layer();
    this.stage.add(this.layer);
  }

  initMouse() {
    var scaleBy = 1.1;
    this.stage.on("wheel", (e) => {
      // stop default scrolling
      e.evt.preventDefault();

      var oldScale = this.stage.scaleX();
      var pointer = this.stage.getPointerPosition();

      var mousePointTo = {
        x: (pointer.x - this.stage.x()) / oldScale,
        y: (pointer.y - this.stage.y()) / oldScale,
      };

      // how to scale? Zoom in? Or zoom out?
      let direction = e.evt.deltaY > 0 ? 1 : -1;

      // when we zoom on trackpad, e.evt.ctrlKey is true
      // in that case lets revert direction
      if (e.evt.ctrlKey) {
        direction = -direction;
      }

      var newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;
      this.stage.scale({ x: newScale, y: newScale });

      var newPos = {
        x: pointer.x - mousePointTo.x * newScale,
        y: pointer.y - mousePointTo.y * newScale,
      };
      this.stage.position(newPos);
    });
  }

  zoomFit() {
    const topLeft: Vector2d = {
      x: Infinity,
      y: Infinity,
    };

    const bottomRight: Vector2d = {
      x: 0,
      y: 0,
    };
    this.layer.children.forEach((shape) => {
      if (shape.x() < topLeft.x) topLeft.x = shape.x();
      if (shape.y() < topLeft.y) topLeft.y = shape.y();

      const x = shape.x() + shape.width();
      if (x > bottomRight.x) bottomRight.x = x;
      const y = shape.y() + shape.height();
      if (y > bottomRight.y) bottomRight.y = y;
    });

    const width = window.innerWidth;
    const height = window.innerHeight;

    const scaleX = width / (bottomRight.x - topLeft.x);
    const scaleY = height / (bottomRight.y - topLeft.y);
    const minScale = Math.min(scaleX, scaleY);
    this.stage.scale({ x: minScale, y: minScale });

    this.stage.position({ x: -topLeft.x * minScale, y: -topLeft.y * minScale });
  }

  renderLayout(layout: Layout) {
    layout.shapes.forEach((shape) => {
      shape.renderKonva(this.layer);
    });
    this.zoomFit();
    this.updateNumberOfObjects();
  }

  updateNumberOfObjects() {
    document.getElementById("objectCount").innerHTML =
      this.layer.children.length.toString();
  }

  drawSampleRect() {
    const rect = new Konva.Rect({
      x: 400,
      y: 400,
      width: 100,
      height: 100,
      stroke: "black",
      strokeWidth: 2,
    });
    this.layer.add(rect);

    const rect2 = new Konva.Rect({
      x: 200,
      y: 200,
      width: 100,
      height: 100,
      stroke: "black",
      strokeWidth: 2,
    });
    this.layer.add(rect2);
  }

  clear() {
    this.layer.destroy();
    this.layer = new Layer();
    this.stage.add(this.layer);
    this.updateNumberOfObjects();
  }

  destroy() {
    this.clear();
    this.stage.destroy();
  }
}
