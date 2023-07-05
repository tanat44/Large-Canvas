import { DrawingBoard } from "./DrawingBoard";
import { Ui } from "./Ui";
import "./styles.css";

const drawingBoard = new DrawingBoard();
const ui = new Ui(drawingBoard);
