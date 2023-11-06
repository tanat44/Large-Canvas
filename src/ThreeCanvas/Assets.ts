import { Vector2d } from "konva/lib/types";
import * as THREE from "three";
import {
  BoxGeometry,
  CylinderGeometry,
  InstancedMesh,
  LineBasicMaterial,
  MeshBasicMaterial,
  MeshLambertMaterial,
  Object3D
} from "three";
import {
  konvaRotationToThreeRotation,
  konvaVectorToThreeVector3D,
  rotatePoint,
} from "../model/vector";
import { ThreeCanvas } from "./ThreeCanvas";

export class Assets {
  canvas3D: ThreeCanvas;

  // geometry
  cubeGeo: BoxGeometry;
  cylinderGeo: CylinderGeometry;
  planeGeo: THREE.PlaneGeometry;
  circleGeo: THREE.CircleGeometry;

  // material
  intersectionMaterial: MeshLambertMaterial;
  basicMaterials: Map<string, MeshBasicMaterial>;
  lineMaterials: Map<string, LineBasicMaterial>;

  // mesh
  planeMeshes: InstancedMesh;
  planeMeshIndex: number;

  constructor(canvas3D: ThreeCanvas) {
    this.canvas3D = canvas3D;
    this.basicMaterials = new Map();
    this.lineMaterials = new Map();

    // geometry
    this.cubeGeo = new BoxGeometry(1, 1, 1);
    this.cylinderGeo = new CylinderGeometry(1, 1, 1);
    this.planeGeo = new THREE.PlaneGeometry(1, 1);
    this.circleGeo = new THREE.CircleGeometry(1, 32);

    // material
    const planeGeometry = new THREE.PlaneGeometry(2000, 2000);
    planeGeometry.rotateX(-Math.PI / 2);
    const grid = new THREE.GridHelper(2000, 100);
    grid.position.y = 0;
    (grid.material as any).opacity = 0.25;
    (grid.material as any).transparent = true;
    canvas3D.scene.add(grid);

    //mesh
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff })
    material.depthWrite = false
    this.planeMeshes = new InstancedMesh(
      this.planeGeo,
      material,
      20000
    );
    this.planeMeshIndex = 0;
    this.canvas3D.scene.add(this.planeMeshes)
  }

  getBasicMaterial(color: string): MeshBasicMaterial {
    if (this.basicMaterials.has(color)) return this.basicMaterials.get(color);

    const mat = new THREE.MeshBasicMaterial({
      color: color,
      side: THREE.DoubleSide,
      opacity: 1.0,
      transparent: true,
    });
    this.basicMaterials.set(color, mat);
    return mat;
  }

  getLineMaterial(color: string): LineBasicMaterial {
    if (this.lineMaterials.has(color)) return this.lineMaterials.get(color);

    const mat = new THREE.LineBasicMaterial({
      color: color,
    });
    this.lineMaterials.set(color, mat);
    return mat;
  }

  createRectangle(
    pos: Vector2d,
    width: number,
    height: number,
    rotationKonva: number,
    color: string,
    order: number
  ): Object3D {
    // transform
    const offset = konvaVectorToThreeVector3D(
      rotatePoint({ x: width / 2, y: height / 2 }, rotationKonva)
    );
    const position = konvaVectorToThreeVector3D(pos).add(offset);
    const angle = konvaRotationToThreeRotation(rotationKonva);
    const rot = new THREE.Euler(-Math.PI / 2, angle, 0)

    // mesh
    const dummy = new THREE.Object3D();
    dummy.position.copy(position.add(new THREE.Vector3(0, order, 0)))
    dummy.rotation.copy(rot)
    dummy.scale.set(width,height,1)
    dummy.updateMatrix();
    this.planeMeshes.setMatrixAt( this.planeMeshIndex, dummy.matrix );
    this.planeMeshes.instanceMatrix.needsUpdate = true;

    // color
    this.planeMeshes.setColorAt( this.planeMeshIndex, new THREE.Color(color));
    this.planeMeshes.instanceColor.needsUpdate = true;

    // update meshIndex
    this.planeMeshIndex++;

    this.canvas3D.render()
    return null;
  }

  createCircle(pos: Vector2d, radius: number, color: string): Object3D {
    const canvas = ThreeCanvas.instance;
    const gameObject = new THREE.Mesh(
      canvas.assets.circleGeo,
      canvas.assets.getBasicMaterial(color)
    );
    const center = konvaVectorToThreeVector3D(pos);
    gameObject.position.copy(center);
    gameObject.rotateX(-Math.PI / 2);
    gameObject.scale.set(radius, radius, 1);
    gameObject.name = "circle"
    canvas.addGameObjectToScene(gameObject);
    return gameObject;
  }

  createLine(points: Vector2d[], color: string): Object3D {
    const canvas = ThreeCanvas.instance;
    const points3D = points.map((point) => konvaVectorToThreeVector3D(point));
    const geometry = new THREE.BufferGeometry().setFromPoints(points3D);
    const gameObject = new THREE.Line(
      geometry,
      canvas.assets.getLineMaterial(color)
    );
    canvas.addGameObjectToScene(gameObject);
    return gameObject;
  }
}
