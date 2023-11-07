import { Vector2d } from "konva/lib/types";
import * as THREE from "three";
import {
  BoxGeometry,
  CylinderGeometry,
  InstancedMesh,
  LineBasicMaterial,
  MeshBasicMaterial,
  MeshLambertMaterial,
  Object3D,
} from "three";
import {
  konvaRotationToThreeRotation,
  konvaVectorToThreeVector3D,
  rotatePoint,
} from "../model/vector";
import { ThreeCanvas } from "./ThreeCanvas";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial";
import { WireframeGeometry2 } from "three/examples/jsm/lines/WireframeGeometry2";
import { Wireframe } from "three/examples/jsm/lines/Wireframe";

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
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    material.depthWrite = false;
    this.planeMeshes = new InstancedMesh(this.planeGeo, material, 20000);
    this.planeMeshIndex = 0;
    this.canvas3D.scene.add(this.planeMeshes);
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

  createRectangleInstance(
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
    const rot = new THREE.Euler(-Math.PI / 2, angle, 0);

    // mesh
    const dummy = new THREE.Object3D();
    dummy.position.copy(position.add(new THREE.Vector3(0, order, 0)));
    dummy.rotation.copy(rot);
    dummy.scale.set(width, height, 1);
    dummy.updateMatrix();
    this.planeMeshes.setMatrixAt(this.planeMeshIndex, dummy.matrix);
    this.planeMeshes.instanceMatrix.needsUpdate = true;

    // color
    this.planeMeshes.setColorAt(this.planeMeshIndex, new THREE.Color(color));
    this.planeMeshes.instanceColor.needsUpdate = true;

    // update meshIndex
    this.planeMeshIndex++;

    this.canvas3D.render();
    return null;
  }

  createWireframeRectangle(
    pos: Vector2d,
    width: number,
    height: number,
    rotationKonva: number
  ): Object3D {
    // transform
    const offset = konvaVectorToThreeVector3D(
      rotatePoint({ x: width / 2, y: height / 2 }, rotationKonva)
    );
    const position = konvaVectorToThreeVector3D(pos).add(offset);
    const angle = konvaRotationToThreeRotation(rotationKonva);
    const rot = new THREE.Euler(-Math.PI / 2, angle, 0);

    const vertexShader = `
      attribute vec3 center;
      varying vec3 vCenter;
  
      void main() {
        vCenter = center;
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
      }
    `;

    const fragmentShader = `
      uniform float thickness;
      varying vec3 vCenter;

      void main() {
        vec3 afwidth = fwidth( vCenter.xyz );
        vec3 edge3 = smoothstep( ( thickness - 1.0 ) * afwidth, thickness * afwidth, vCenter.xyz );
        float edge = 1.0 - min( min( edge3.x, edge3.y ), edge3.z );
        gl_FragColor.rgb = gl_FrontFacing ? vec3( 1.0, 0.0, 0.0 ) : vec3( 1.0, 1.0, 0.0 );
        gl_FragColor.a = edge;
      }
    `;

    const geo = new THREE.PlaneGeometry(width, height);
    this.setupAttributes(geo);

    // object 1
    const material1 = new THREE.MeshBasicMaterial({
      color: 0x000000,
      wireframe: true,
    });
    const go1 = new THREE.Mesh(geo, material1);
    go1.position.copy(position.clone().sub(new THREE.Vector3(width * 2, 0, 0)));
    go1.rotation.copy(rot);
    this.canvas3D.addGameObjectToScene(go1);

    // object 2
    const material2 = new THREE.ShaderMaterial({
      uniforms: { thickness: { value: 8 } },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      side: THREE.DoubleSide,
      alphaToCoverage: true, // only works when WebGLRenderer's "antialias" is set to "true"
    });
    material2.extensions.derivatives = true;
    const go2 = new THREE.Mesh(geo, material2);
    go2.position.copy(position);
    go2.rotation.copy(rot);

    this.canvas3D.addGameObjectToScene(go2);

    return go2;
  }

  createBufferGeometry() {
    const geometry = new THREE.BufferGeometry();

    // create a simple square shape. We duplicate the top left and bottom right
    // vertices because each vertex needs to appear once per triangle.
    const vertices = new Float32Array([
      -1.0,
      -1.0,
      1.0, // v0
      1.0,
      -1.0,
      1.0, // v1
      1.0,
      1.0,
      1.0, // v2
      -1.0,
      1.0,
      1.0, // v3
    ]);

    const indices = [0, 1, 2, 2, 3, 0];

    geometry.setIndex(indices);

    // itemSize = 3 because there are 3 values (components) per vertex
    geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
    const material = new THREE.MeshBasicMaterial({ color: 0xff00ff });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.scale.set(100, 100, 100);
    this.canvas3D.addGameObjectToScene(mesh);
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
    gameObject.name = "circle";
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

  setupAttributes(geometry: THREE.BufferGeometry) {
    geometry.deleteAttribute("uv");
    geometry.deleteAttribute("normal");

    const vectors = [
      new THREE.Vector3(1, 0, 0),
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(0, 0, 1),
    ];

    const position = geometry.attributes.position;
    const centers = new Float32Array(position.count * 3);

    for (let i = 0; i < position.count; i++) {
      vectors[i % 3].toArray(centers, i * 3);
    }
    console.log(vectors[0].toArray());

    geometry.setAttribute("center", new THREE.BufferAttribute(centers, 3));
  }
}
