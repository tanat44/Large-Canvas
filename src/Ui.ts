import { Canvas3D } from "../Canvas3D/Canvas3D";
import { Canvas2D } from "./Canvas2D";
import { CANVAS_ID, ICanvas } from "./ICanvas";
import { Layout } from "./model/Shape";

enum CanvasMode {
  Konva = 0,
  Three = 1,
}

export class Ui {
  canvas: ICanvas;
  mode: CanvasMode;

  constructor() {
    this.initUpload();
    this.initControl();
    this.mode = CanvasMode.Konva;
    this.initCanvas();
  }

  initUpload() {
    document.getElementById("uploadButton").addEventListener("click", () => {
      document.getElementById("uploadFileInput").click();
    });

    document
      .getElementById("uploadFileInput")
      .addEventListener("change", (event) => {
        const fileList = (event.target as any).files;
        this.readFile(fileList[0]);
      });
  }

  initControl() {
    document.getElementById("zoomFitButton").addEventListener("click", () => {
      this.canvas.zoomFit();
    });

    document.getElementById("clearButton").addEventListener("click", () => {
      this.canvas.clear();
    });

    document.getElementById("toggleCanvas").addEventListener("click", () => {
      this.toggleCanvas();
    });
  }

  toggleCanvas() {
    this.canvas.destroy();
    // remove all child
    const canvasContainer = document.getElementById(CANVAS_ID);
    while (canvasContainer.firstChild) {
      canvasContainer.removeChild(canvasContainer.firstChild);
    }
    if (this.mode === CanvasMode.Konva) {
      this.mode = CanvasMode.Three;
    } else if (this.mode === CanvasMode.Three) {
      this.mode = CanvasMode.Konva;
    }
    this.initCanvas();
  }

  initCanvas() {
    console.log(`Initializing Canvas: ${CanvasMode[this.mode]}`);
    if (this.mode === CanvasMode.Konva) {
      this.canvas = new Canvas2D(CANVAS_ID);
      document.getElementById("toggleCanvas").innerText =
        "Switch to Three Canvas";
    } else if (this.mode === CanvasMode.Three) {
      this.canvas = new Canvas3D(CANVAS_ID);
      document.getElementById("toggleCanvas").innerText =
        "Switch to Konva Canvas";
    }
  }

  readFile(file: any) {
    const reader = new FileReader();
    reader.addEventListener("load", (event) => {
      const result = event.target.result;
      const data = JSON.parse(result as string);
      const layout = new Layout(data.additionalData);
      this.canvas.renderLayout(layout);

      // clear input
      (document.getElementById("uploadFileInput") as HTMLInputElement).value =
        "";
    });

    reader.addEventListener("progress", (event) => {
      if (event.loaded && event.total) {
        const percent = (event.loaded / event.total) * 100;
        console.log(`Progress: ${Math.round(percent)}`);
      }
    });
    reader.readAsText(file);
  }
}
