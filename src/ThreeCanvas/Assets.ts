import * as THREE from "three";
import {
  BoxGeometry,
  CylinderGeometry,
  LineBasicMaterial,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
} from "three";
import { ThreeCanvas } from "./ThreeCanvas";

export class Assets {
  canvas3D: ThreeCanvas;

  // geometry
  cubeGeo: BoxGeometry;
  cylinderGeo: CylinderGeometry;
  plane: Mesh;

  // material
  intersectionMaterial: MeshLambertMaterial;
  basicMaterials: Map<string, MeshBasicMaterial>;
  lineMaterials: Map<string, LineBasicMaterial>;

  constructor(canvas3D: ThreeCanvas) {
    this.canvas3D = canvas3D;
    this.basicMaterials = new Map();
    this.lineMaterials = new Map();

    // geometry
    this.cubeGeo = new BoxGeometry(1, 1, 1);
    this.cylinderGeo = new CylinderGeometry(1, 1, 1);

    // material
    const planeGeometry = new THREE.PlaneGeometry(2000, 2000);
    planeGeometry.rotateX(-Math.PI / 2);
    const planeMaterial = new THREE.ShadowMaterial({
      color: 0x000000,
      opacity: 0.2,
    });

    this.plane = new THREE.Mesh(planeGeometry, planeMaterial);
    this.plane.position.y = -200;
    this.plane.receiveShadow = true;
    this.plane.name = "Ground Plane";
    canvas3D.objects.push(this.plane);
    canvas3D.scene.add(this.plane);

    const grid = new THREE.GridHelper(2000, 100);
    grid.position.y = 0;
    (grid.material as any).opacity = 0.25;
    (grid.material as any).transparent = true;
    canvas3D.scene.add(grid);
  }

  getBasicMaterial(color: string): MeshBasicMaterial {
    if (this.basicMaterials.has(color)) return this.basicMaterials.get(color);

    const mat = new THREE.MeshBasicMaterial({
      color: color,
      side: THREE.DoubleSide,
      opacity: 0.4,
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
}
