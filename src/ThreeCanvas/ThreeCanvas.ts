// @ts-ignore
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

import * as THREE from "three";
import {
  Object3D,
  PerspectiveCamera,
  Raycaster,
  Scene,
  WebGLRenderer,
} from "three";
// @ts-ignore
import { TransformControls } from "three/addons/controls/TransformControls.js";
import { Layout } from "../model/Shape";
import { Assets } from "./Assets";
import { MouseHandler } from "./MouseHandler";

export type TickCallback = (dt: number) => void;

export class ThreeCanvas {
  container: HTMLElement;
  assets: Assets;
  mouseHandler: MouseHandler;
  objects: any[];
  static instance: ThreeCanvas;

  // Threejs
  scene: Scene;
  camera: PerspectiveCamera;
  raycaster: Raycaster;
  renderer: WebGLRenderer;
  transformControl: TransformControls;
  orbitControl: OrbitControls;

  // animation loop
  clock: THREE.Clock;
  tickCallbacks: TickCallback[];

  constructor(canvasId: string) {
    ThreeCanvas.instance = this;
    this.objects = [];
    this.raycaster = new THREE.Raycaster();
    this.setupScene(canvasId);
    this.setupLighting();
    this.setupOrbitControl();
    // this.setupTransformControl();
    this.assets = new Assets(this);
    this.tickCallbacks = [];
    this.mouseHandler = new MouseHandler(canvasId, this);

    // this.assets.createBufferGeometry();
    this.assets.createWireframeRectangle({ x: 100, y: 200 }, 200, 100, 0);
  }

  setupLighting() {
    this.scene.add(new THREE.AmbientLight(0xf0f0f0));
    const light = new THREE.SpotLight(0xffffff, 1.5);
    light.position.set(0, 1500, 200);
    light.angle = Math.PI * 0.2;
    light.castShadow = true;
    light.shadow.camera.near = 200;
    light.shadow.camera.far = 2000;
    light.shadow.bias = -0.000222;
    light.shadow.mapSize.width = 1024;
    light.shadow.mapSize.height = 1024;
    this.scene.add(light);
  }

  setupScene(canvasId: string) {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf0f0f0);

    this.container = document.getElementById(canvasId);
    var width = this.container.offsetWidth;
    var height = this.container.offsetHeight;
    this.camera = new THREE.PerspectiveCamera(70, width / height, 0.1, 999999);
    this.camera.position.set(0, 3000, 2000);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));
    this.scene.add(this.camera);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(width, height);
    this.renderer.shadowMap.enabled = true;
    this.clock = new THREE.Clock();
    this.renderer.setAnimationLoop(() => this.tick());

    this.container.appendChild(this.renderer.domElement);
    this.resize(width, height);
  }

  tick() {
    const dt = ThreeCanvas.instance.clock.getDelta();
    this.tickCallbacks.map((fn) => fn(dt));
    this.render();
  }

  registerTickCallback(callback: TickCallback) {
    this.tickCallbacks.push(callback);
  }

  setupTransformControl() {
    this.transformControl = new TransformControls(
      this.camera,
      this.renderer.domElement
    );
    this.transformControl.showY = false;
    this.transformControl.addEventListener("change", () => this.render());
    this.transformControl.addEventListener("dragging-changed", (event: any) => {
      ThreeCanvas.instance.orbitControl.enabled = !event.value;
    });
    this.scene.add(this.transformControl);
  }

  setupOrbitControl() {
    this.orbitControl = new OrbitControls(
      this.camera,
      this.renderer.domElement
    );
    this.orbitControl.damping = 0.2;
    this.orbitControl.mouseButtons = {
      MIDDLE: THREE.MOUSE.ROTATE,
      RIGHT: THREE.MOUSE.PAN,
    };
    this.orbitControl.addEventListener("change", () => this.render());
  }

  removeObject(obj: Object3D) {
    const index = this.objects.indexOf(obj);
    if (index > -1) {
      this.objects.splice(index, 1);
      this.scene.remove(obj);
    }
  }

  resetScene() {
    this.objects.map((obj) => this.scene.remove(obj));
    this.objects = [];
  }

  addGameObjectToScene(gameObject: Object3D) {
    this.scene.add(gameObject);
    this.objects.push(gameObject);
    this.render();
  }

  resize(width: number, height: number) {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    this.render();
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  renderLayout(layout: Layout) {
    layout.shapes.forEach((shape) => {
      console.log(shape.name);
      shape.renderThree(this);
    });
    this.assets.planeMeshes.computeBoundingSphere();
    this.render();
  }

  clear() {}
  zoomFit() {}
  destroy() {}
}
