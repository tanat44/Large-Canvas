import { DrawingBoard } from "./DrawingBoard";
import { Layout } from "./model/Shape";

export class Ui {
  drawingBoard: DrawingBoard;

  constructor(drawingBoard: DrawingBoard) {
    this.drawingBoard = drawingBoard;
    this.initUpload();
    this.initControl();
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
      this.drawingBoard.zoomFit();
    });

    document.getElementById("clearButton").addEventListener("click", () => {
      this.drawingBoard.clear();
    });
  }

  readFile(file: any) {
    const reader = new FileReader();
    reader.addEventListener("load", (event) => {
      const result = event.target.result;
      const data = JSON.parse(result as string);
      const layout = new Layout(data.additionalData);
      this.drawingBoard.render(layout);

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
