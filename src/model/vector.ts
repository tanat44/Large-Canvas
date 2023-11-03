import { Vector2d } from "konva/lib/types";
import { Vector3 } from "three";
import { DEG2RAD, RAD2DEG } from "three/src/math/MathUtils";

export type Degree = number;

export const threeVectorToKonvaVector = (v3: Vector3): Vector2d => {
  return { x: v3.x, y: -v3.y };
};

export const threeVector3DToKonvaVector = (v3: Vector3): Vector2d => {
  return { x: v3.x, y: v3.z };
};

export const threeVectorsToKonvaVectors = (v3: Vector3[]): Vector2d[] =>
  v3.map((v) => threeVector3DToKonvaVector(v));

export const konvaVectorToThreeVector = (v2: Vector2d): Vector3 =>
  new Vector3(v2.x, -v2.y, 0);

export const konvaVectorToThreeVector3D = (v2: Vector2d): Vector3 =>
  new Vector3(v2.x, 0, v2.y);

export const rotatePoint = ({ x, y }: Vector2d, deg: number) => {
  const rad = deg * DEG2RAD;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const newX = x * cos - y * sin;
  const newY = x * sin + y * cos;
  return { x: newX, y: newY };
};

export const signedAngleBetweenVector = (v1: Vector3, v2: Vector3): Degree => {
  const normal = new Vector3(0, 0, 1);
  const cross = v1.clone().cross(v2);
  const sign = cross.dot(normal) > 0 ? -1 : 1;
  return sign * v1.angleTo(v2) * RAD2DEG;
};

export const konvaVectorToArray = (v2: Vector2d) => [v2.x, v2.y];

export const konvaRotationToThreeRotation = (rotation: number) =>
  -rotation * DEG2RAD;
