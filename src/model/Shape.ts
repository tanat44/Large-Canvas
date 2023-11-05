import Konva from "konva";
import { Layer } from "konva/lib/Layer";
import { RENDER_SCALE } from "../KonvaCanvas/KonvaCanvas";
import { RENDER_SCALE_3D, Renderer3D } from "../ThreeCanvas/Render3D";
import { PixiCanvas } from "../PixiCanvas/PixiCanvas";

export type ShapeProperty = {
  x: number;
  y: number;
  width: number;
  height: number;
};
export enum ShapeType {
  Highway = "highway",
  Intake = "intake",
  Delivery = "delivery",
}

export enum Direction {
  Vertical,
  Horizontal,
}

export class Shape {
  name: string;
  type: ShapeType;
  parameters: any;
  properties: ShapeProperty;

  constructor() {}

  renderKonva(layer: Layer) {
    // bounding box
    const shapeProperty: ShapeProperty = {
      x: this.properties.x * RENDER_SCALE,
      y: this.properties.y * RENDER_SCALE,
      width: this.properties.width * RENDER_SCALE,
      height: this.properties.height * RENDER_SCALE,
    };

    const rect = new Konva.Rect({
      ...shapeProperty,
      stroke: "black",
      strokeWidth: 2,
    });
    layer.add(rect);

    // small boxes
    const direction =
      shapeProperty.width > shapeProperty.height
        ? Direction.Horizontal
        : Direction.Vertical;
    const majorLength =
      direction == Direction.Horizontal
        ? shapeProperty.width
        : shapeProperty.height;

    const SMALL_BOX_SIZE = 100;
    const PADDING = 20;
    let count = majorLength / SMALL_BOX_SIZE;
    count = Math.floor(count);
    let actualSize = (majorLength - PADDING * (count + 1)) / count;

    for (let i = 0; i < count; ++i) {
      const x =
        direction == Direction.Horizontal
          ? shapeProperty.x + (i + 1) * PADDING + i * actualSize
          : shapeProperty.x + PADDING;
      const y =
        direction == Direction.Vertical
          ? shapeProperty.y + (i + 1) * PADDING + i * actualSize
          : shapeProperty.y + PADDING;
      const width =
        direction == Direction.Horizontal
          ? actualSize
          : shapeProperty.width - PADDING * 2;
      const height =
        direction == Direction.Vertical
          ? actualSize
          : shapeProperty.height - PADDING * 2;
      const rect = new Konva.Rect({
        x: x,
        y: y,
        width: width,
        height: height,
        fill: "#8877ed",
      });
      layer.add(rect);

      // dot
      const dot = new Konva.Circle({
        x: x + width / 2,
        y: y + height / 2,
        radius: 40,
        fill: "#ff5c87",
      });
      layer.add(dot);

      // dot2
      const dot2 = new Konva.Circle({
        x: x + width / 2,
        y: y + height / 2,
        radius: 30,
        stroke: "white",
      });
      layer.add(dot2);
    }
  }

  renderThree() {
    // bounding box
    const shapeProperty: ShapeProperty = {
      x: this.properties.x * RENDER_SCALE_3D,
      y: this.properties.y * RENDER_SCALE_3D,
      width: this.properties.width * RENDER_SCALE_3D,
      height: this.properties.height * RENDER_SCALE_3D,
    };
    Renderer3D.drawRect(
      { x: shapeProperty.x, y: shapeProperty.y },
      shapeProperty.width,
      shapeProperty.height,
      0,
      "black"
    );

    // small boxes
    const direction =
      shapeProperty.width > shapeProperty.height
        ? Direction.Horizontal
        : Direction.Vertical;
    const majorLength =
      direction == Direction.Horizontal
        ? shapeProperty.width
        : shapeProperty.height;

    const SMALL_BOX_SIZE = 100;
    const PADDING = 20;
    let count = majorLength / SMALL_BOX_SIZE;
    count = Math.floor(count);
    let actualSize = (majorLength - PADDING * (count + 1)) / count;

    for (let i = 0; i < count; ++i) {
      const x =
        direction == Direction.Horizontal
          ? shapeProperty.x + (i + 1) * PADDING + i * actualSize
          : shapeProperty.x + PADDING;
      const y =
        direction == Direction.Vertical
          ? shapeProperty.y + (i + 1) * PADDING + i * actualSize
          : shapeProperty.y + PADDING;
      const width =
        direction == Direction.Horizontal
          ? actualSize
          : shapeProperty.width - PADDING * 2;
      const height =
        direction == Direction.Vertical
          ? actualSize
          : shapeProperty.height - PADDING * 2;
      Renderer3D.drawRect({ x: x, y: y }, width, height, 0, "#8877ed");

      // dot
      Renderer3D.drawCircle(
        { x: x + width / 2, y: y + height / 2 },
        400 * RENDER_SCALE_3D,
        "#ff5c87"
      );

      // dot2
      Renderer3D.drawCircle(
        { x: x + width / 2, y: y + height / 2 },
        300 * RENDER_SCALE_3D,
        "white"
      );
    }
  }

  renderPixi(canvas: PixiCanvas) {
    // bounding box
    const shapeProperty: ShapeProperty = {
      x: this.properties.x * RENDER_SCALE,
      y: this.properties.y * RENDER_SCALE,
      width: this.properties.width * RENDER_SCALE,
      height: this.properties.height * RENDER_SCALE,
    };

    const rect = new Konva.Rect({
      ...shapeProperty,
      stroke: "black",
      strokeWidth: 2,
    });
    canvas.drawRect(
      this.name,
      shapeProperty.x,
      shapeProperty.y,
      shapeProperty.width,
      shapeProperty.height
    );

    // small boxes
    const direction =
      shapeProperty.width > shapeProperty.height
        ? Direction.Horizontal
        : Direction.Vertical;
    const majorLength =
      direction == Direction.Horizontal
        ? shapeProperty.width
        : shapeProperty.height;

    const SMALL_BOX_SIZE = 100;
    const PADDING = 20;
    let count = majorLength / SMALL_BOX_SIZE;
    count = Math.floor(count);
    let actualSize = (majorLength - PADDING * (count + 1)) / count;

    for (let i = 0; i < count; ++i) {
      const x =
        direction == Direction.Horizontal
          ? shapeProperty.x + (i + 1) * PADDING + i * actualSize
          : shapeProperty.x + PADDING;
      const y =
        direction == Direction.Vertical
          ? shapeProperty.y + (i + 1) * PADDING + i * actualSize
          : shapeProperty.y + PADDING;
      const width =
        direction == Direction.Horizontal
          ? actualSize
          : shapeProperty.width - PADDING * 2;
      const height =
        direction == Direction.Vertical
          ? actualSize
          : shapeProperty.height - PADDING * 2;
      const rect = new Konva.Rect({
        x: x,
        y: y,
        width: width,
        height: height,
        fill: "#8877ed",
      });
      canvas.drawRect(`${this.name}_${i}`, x, y, width, height, "#ff5c87");

      canvas.drawCircle(
        `${this.name}_${i}_dot`,
        x + width / 2,
        y + height / 2,
        40,
        "#ff5c87"
      );

      canvas.drawCircle(
        `${this.name}_${i}_dot2`,
        x + width / 2,
        y + height / 2,
        30,
        "#ff5c87",
        2,
        "white"
      );
    }
  }
}

export class Layout {
  shapes: Shape[];

  constructor(data: any) {
    this.shapes = [];
    data.shapes.forEach((s: Shape) => {
      const newShape = Object.assign(new Shape(), s);
      this.shapes.push(newShape);
    });
  }
}
