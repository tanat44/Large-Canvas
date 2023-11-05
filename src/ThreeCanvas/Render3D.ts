import { Vector2d } from "konva/lib/types";
import * as THREE from "three";
import { Object3D } from "three";
import { ThreeCanvas } from "./ThreeCanvas";
import {
  konvaVectorToThreeVector3D,
  rotatePoint,
  konvaRotationToThreeRotation,
} from "../model/vector";

export const RENDER_SCALE_3D = 0.005;

export class Renderer3D {
  static drawRect(
    pos: Vector2d,
    width: number,
    height: number,
    rotationKonva: number,
    color: string
  ): Object3D {
    const canvas = ThreeCanvas.instance;
    const gameObject = new THREE.Mesh(
      canvas.assets.cubeGeo,
      canvas.assets.getBasicMaterial(color)
    );
    const center = konvaVectorToThreeVector3D(pos);
    const offset = konvaVectorToThreeVector3D(
      rotatePoint({ x: width / 2, y: height / 2 }, rotationKonva)
    );
    const rot = konvaRotationToThreeRotation(rotationKonva);
    gameObject.position.copy(center.add(offset));
    gameObject.scale.set(width, 0.1, height);
    gameObject.rotateY(rot);
    canvas.addGameObjectToScene(gameObject);
    return gameObject;
  }

  static drawCircle(pos: Vector2d, radius: number, color: string): Object3D {
    const canvas = ThreeCanvas.instance;
    const gameObject = new THREE.Mesh(
      canvas.assets.cylinderGeo,
      canvas.assets.getBasicMaterial(color)
    );
    const center = konvaVectorToThreeVector3D(pos);
    gameObject.position.copy(center);
    gameObject.scale.set(radius, 0.2, radius);
    canvas.addGameObjectToScene(gameObject);
    return gameObject;
  }

  static drawLine(points: Vector2d[], color: string): Object3D {
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
