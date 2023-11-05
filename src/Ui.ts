import { ThreeCanvas } from "./ThreeCanvas/ThreeCanvas";
import { KonvaCanvas } from "./KonvaCanvas/KonvaCanvas";
import { CANVAS_ID, ICanvas } from "./ICanvas";
import { Layout } from "./model/Shape";
import { PixiCanvas } from "./PixiCanvas/PixiCanvas";

enum CanvasMode {
  Konva = 0,
  Three = 1,
  Pixi = 2,
}

export class Ui {
  canvas: ICanvas;
  mode: CanvasMode;

  constructor() {
    this.mode = CanvasMode.Pixi;

    this.initCanvasMode();
    this.initUpload();
    this.initControl();
  }

  initCanvasMode() {
    // select mode
    const select = document.getElementById("canvasEngine") as HTMLSelectElement;
    for (const key in CanvasMode) {
      const mode = CanvasMode[key];
      if (typeof mode !== "string") continue;
      const option = document.createElement("option");
      option.innerHTML = mode as string;
      option.value = CanvasMode[mode as unknown as number];
      select.appendChild(option);
    }
    select.value = this.mode.toString();
    select.addEventListener("change", () => this.changeCanvas());
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
  }

  changeCanvas() {
    // destroy current canvas
    this.canvas.destroy();
    const canvasContainer = document.getElementById(CANVAS_ID);
    while (canvasContainer.firstChild) {
      canvasContainer.removeChild(canvasContainer.firstChild);
    }
    const select = document.getElementById("canvasEngine") as HTMLSelectElement;
    const value = parseInt(select.value);
    this.mode = value;
    this.initCanvas();
  }

  initCanvas() {
    console.log(`Initializing Canvas: ${CanvasMode[this.mode]}`);
    if (this.mode === CanvasMode.Konva) {
      this.canvas = new KonvaCanvas(CANVAS_ID);
    } else if (this.mode === CanvasMode.Three) {
      this.canvas = new ThreeCanvas(CANVAS_ID);
    } else if (this.mode === CanvasMode.Pixi) {
      this.canvas = new PixiCanvas(CANVAS_ID);
    } else {
      console.error("Cannot init unknown CanvasMode");
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
