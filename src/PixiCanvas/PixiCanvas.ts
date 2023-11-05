import { Layout } from "../model/Shape";
import { ICanvas } from "../ICanvas";
import {
  Application,
  Container,
  Graphics,
  Rectangle,
  Sprite,
  Texture,
} from "pixi.js";
import { RENDER_SCALE } from "../KonvaCanvas/KonvaCanvas";

const ZOOM_MAX = 10;
const ZOOM_MIN = 0.01;

export class PixiCanvas implements ICanvas {
  app: Application;
  mousedown: boolean = false;
  clientX: number;
  clientY: number;
  mainLayer: Container;
  main_layer_zoom_scale: number = 1;
  main_layer_zoom_offset_x: number = 0;
  main_layer_zoom_offset_y: number = 0;

  constructor(canvasId: string) {
    this.app = new Application({
      background: "#1099bb",
    });
    const canvas = document.getElementById(canvasId);
    canvas.appendChild(this.app.view as unknown as HTMLElement);

    this.mainLayer = new Container();
    this.mainLayer.scale.set(1, 1);
    this.mainLayer.position.set(0, 0);
    this.app.stage.addChild(this.mainLayer);

    this.drawRect("hi", 10, 30, 100, 20);
    canvas.addEventListener("mousewheel", (e: any) => this.zoom(e), false);

    this.app.stage.hitArea = new Rectangle(0, 0, 1000, 1000);
    // canvas.onmousedown = (e: any) => {
    //   console.log("a");
    // };
    canvas.onmousedown = (e: any) => this.onMouseDown(e);
    canvas.onmousemove = (e: any) => this.onMouseMove(e);
    canvas.onmouseup = (e: any) => this.onMouseUp(e);
  }
  clear(): void {
    throw new Error("Method not implemented.");
  }
  zoomFit(): void {
    throw new Error("Method not implemented.");
  }

  drawBunny() {
    const container = new Container();

    this.app.stage.addChild(container);

    // Create a new texture
    const texture = Texture.from("https://pixijs.com/assets/bunny.png");

    // Create a 5x5 grid of bunnies
    for (let i = 0; i < 25; i++) {
      const bunny = new Sprite(texture);

      bunny.anchor.set(0.5);
      bunny.x = (i % 5) * 40;
      bunny.y = Math.floor(i / 5) * 40;
      container.addChild(bunny);
    }

    // Move container to the center
    container.x = this.app.screen.width / 2;
    container.y = this.app.screen.height / 2;

    // Center bunny sprite in local container coordinates
    container.pivot.x = container.width / 2;
    container.pivot.y = container.height / 2;

    // Listen for animate update
    this.app.ticker.add((delta) => {
      // rotate the container!
      // use delta to create frame-independent transform
      container.rotation -= 0.01 * delta;
    });
  }

  drawRect(
    name: string,
    x: number,
    y: number,
    width: number,
    height: number,
    color: string = null,
    lineWidth: number = null,
    lineColor: string = null
  ) {
    const rect = new Graphics();
    rect.name = name;
    rect.interactive = true;
    if (lineWidth && lineColor) rect.lineStyle(lineWidth, lineColor, 1);
    let fillColor = color ? color : 0xde3249;
    rect.beginFill(fillColor);
    rect.drawRect(x, y, width, height);
    rect.endFill();
    rect.onclick = this.click;
    this.mainLayer.addChild(rect);
  }

  drawCircle(
    name: string,
    x: number,
    y: number,
    radius: number,
    color: string = null,
    lineWidth: number = null,
    lineColor: string = null
  ) {
    const rect = new Graphics();
    rect.name = name;
    rect.interactive = true;
    if (lineWidth && lineColor) rect.lineStyle(lineWidth, lineColor, 1);
    let fillColor = color ? color : 0xde3249;
    rect.beginFill(fillColor);
    rect.drawCircle(x, y, radius);
    rect.endFill();
    rect.onclick = this.click;
    this.mainLayer.addChild(rect);
  }

  click(e: any) {
    console.log(e);
  }

  renderLayout(layout: Layout) {
    let count = 0;
    for (const shape of layout.shapes) {
      shape.renderPixi(this);
      ++count;
    }

    console.log("rendered ", count);
  }

  destroy() {
    this.app.destroy();
  }

  onMouseDown(e: any) {
    this.clientX = -1;
    this.clientY = -1;
    this.mousedown = true;
  }

  onMouseUp(e: any) {
    this.mousedown = false;
  }

  onMouseMove(e: any) {
    if (this.mousedown) {
      // If this is the first iteration through then set clientX and clientY to match the inital mouse position
      if (this.clientX == -1 && this.clientY == -1) {
        this.clientX = e.clientX;
        this.clientY = e.clientY;
      }

      // Run a relative check of the last two mouse positions to detect which direction to pan on x
      let xPos = 0;
      if (e.clientX == this.clientX) {
        xPos = 0;
      } else if (e.clientX < this.clientX) {
        xPos = -Math.abs(e.clientX - this.clientX);
      } else if (e.clientX > this.clientX) {
        xPos = Math.abs(e.clientX - this.clientX);
      }

      // Run a relative check of the last two mouse positions to detect which direction to pan on y
      let yPos = 0;
      if (e.clientY == this.clientY) {
        yPos = 0;
      } else if (e.clientY < this.clientY) {
        yPos = -Math.abs(e.clientY - this.clientY);
      } else if (e.clientY > this.clientY) {
        yPos = Math.abs(this.clientY - e.clientY);
      }

      // Set the relative positions for comparison in the next frame
      this.clientX = e.clientX;
      this.clientY = e.clientY;

      // Change the main layer zoom offset x and y for use when mouse wheel listeners are fired.

      this.main_layer_zoom_offset_x = this.mainLayer.position.x + xPos;
      this.main_layer_zoom_offset_y = this.mainLayer.position.y + yPos;

      // Move the main layer based on above calucalations
      this.mainLayer.position.set(
        this.main_layer_zoom_offset_x,
        this.main_layer_zoom_offset_y
      );
    }
  }

  wheelDistance(evt: any) {
    if (!evt) evt = event;
    var w = evt.wheelDelta,
      d = evt.detail;
    if (d) {
      if (w) return (w / d / 40) * d > 0 ? 1 : -1; // Opera
      else return -d / 3; // Firefox;         TODO: do not /3 for OS X
    } else return w / 120; // IE/Safari/Chrome TODO: /3 for Chrome OS X
  }

  wheelDirection(evt: any) {
    if (!evt) evt = event;
    return evt.detail < 0 ? 1 : evt.wheelDelta > 0 ? 1 : -1;
  }

  zoom(evt: any) {
    // Find the direction that was scrolled
    var direction = this.wheelDirection(evt);

    // Find the normalized distance
    var distance = this.wheelDistance(evt);

    // Set the old scale to be referenced later
    var old_scale = this.main_layer_zoom_scale;

    // Find the position of the clients mouse
    const x = evt.clientX;
    const y = evt.clientY;

    // Manipulate the scale based on direction
    this.main_layer_zoom_scale = old_scale + distance;

    //Check to see that the scale is not outside of the specified bounds
    if (this.main_layer_zoom_scale > ZOOM_MAX)
      this.main_layer_zoom_scale = ZOOM_MAX;
    else if (this.main_layer_zoom_scale < ZOOM_MIN)
      this.main_layer_zoom_scale = ZOOM_MIN;

    // This is the magic. I didn't write this, but it is what allows the zoom to work.
    this.main_layer_zoom_offset_x =
      (this.main_layer_zoom_offset_x - x) *
        (this.main_layer_zoom_scale / old_scale) +
      x;
    this.main_layer_zoom_offset_y =
      (this.main_layer_zoom_offset_y - y) *
        (this.main_layer_zoom_scale / old_scale) +
      y;

    //Set the position and scale of the DisplayObjectContainer
    this.mainLayer.scale.set(
      this.main_layer_zoom_scale,
      this.main_layer_zoom_scale
    );
    this.mainLayer.position.set(
      this.main_layer_zoom_offset_x,
      this.main_layer_zoom_offset_y
    );
  }
}
