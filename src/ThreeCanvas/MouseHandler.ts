import {
  InstancedMesh,
  Matrix4,
  Object3D,
  Plane,
  Vector2,
  Vector3
} from "three";
import { ThreeCanvas } from "./ThreeCanvas";

const LEFT_BUTTON = 0;

export class MouseHandler {
  canvas: ThreeCanvas;

  clickPosition: Vector3;
  objectOriginalPosition: Vector3;
  draggingObject: Object3D;
  draggingInstance: number;

  constructor(canvasId: string, canvas: ThreeCanvas) {
    this.canvas = canvas;

    const container = document.getElementById(canvasId);
    container.addEventListener("mousedown", (e: MouseEvent) =>
      this.onMouseDown(e)
    );
    container.addEventListener("mousemove", (e: MouseEvent) =>
      this.onMouseMove(e)
    );
    container.addEventListener("mouseup", (e: MouseEvent) => this.onMouseUp(e));
    this.draggingInstance = null;
    this.objectOriginalPosition = new Vector3();
    this.clickPosition = new Vector3();
  }

  onMouseDown(e: MouseEvent) {
    if (e.button !== LEFT_BUTTON) return;
    const pointer = new Vector2();
    pointer.x = (e.clientX / this.canvas.container.offsetWidth) * 2 - 1;
    pointer.y = -(e.clientY / this.canvas.container.offsetHeight) * 2 + 1;
    this.canvas.raycaster.setFromCamera(pointer, this.canvas.camera);

    const intersection = this.canvas.raycaster.intersectObjects(
      this.canvas.scene.children
    );
    if (intersection.length == 0) return;

    // drag object
    this.draggingObject = intersection[0].object;
    if (!this.draggingObject) return;
    this.objectOriginalPosition.copy(this.draggingObject.position);

    // draginstace of object
    this.draggingInstance = intersection[0].instanceId;
    if (this.draggingInstance) {
      const instanceMesh = this.draggingObject as InstancedMesh
      const matrix = new Matrix4()
      instanceMesh.getMatrixAt(this.draggingInstance, matrix)
      this.objectOriginalPosition.setFromMatrixPosition(matrix)
    }
    this.clickPosition = this.findGroundPlaneIntersection(e)
  }

  onMouseMove(e: MouseEvent) {
    if (!this.draggingObject) return;
    const x = this.findGroundPlaneIntersection(e)
    x.sub(this.clickPosition).add(this.objectOriginalPosition)

    if (!this.draggingInstance) {
      // move normal object 3d
      this.draggingObject.position.copy(x)
    } else {
      // move instance instanceMesh
      const instanceMesh = this.draggingObject as InstancedMesh
      const matrix = new Matrix4()
      instanceMesh.getMatrixAt(this.draggingInstance, matrix)
      matrix.setPosition(x)
      instanceMesh.setMatrixAt(this.draggingInstance, matrix)
      instanceMesh.instanceMatrix.needsUpdate = true;
    }
    this.canvas.render()
  }

  findGroundPlaneIntersection(e: MouseEvent){
    var groundPlane = new Plane(new Vector3(0, 1, 0), 0);
    const pointer = new Vector2();
    pointer.x = (e.clientX / this.canvas.container.offsetWidth) * 2 - 1;
    pointer.y = -(e.clientY / this.canvas.container.offsetHeight) * 2 + 1;
    this.canvas.raycaster.setFromCamera(pointer, this.canvas.camera);
    var intersect = new Vector3();
    this.canvas.raycaster.ray.intersectPlane(groundPlane, intersect);
    return intersect
  }


  onMouseUp(e: MouseEvent) {
    this.draggingObject = null;
    this.draggingInstance = null;
  }
}
