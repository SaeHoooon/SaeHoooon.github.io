import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import {initStats,initRenderer,initCamera} from './util.js';

const textureLoader = new THREE.TextureLoader();

const scene = new THREE.Scene();

const renderer = initRenderer({ antialias: true });
const stats = initStats();

let camera = initCamera(new THREE.Vector3(-120, 80, 120));

let orbitControls = new OrbitControls(camera, renderer.domElement);
orbitControls.enableDamping = true;

const gui = new GUI();

const controls = new function () {
  this.perspective = "Perspective";   

  this.switchCamera = () => {

    if (this.perspective === "Perspective") {

      scene.remove(camera);

      camera = new THREE.OrthographicCamera(
        window.innerWidth / -16,
        window.innerWidth / 16,
        window.innerHeight / 16,
        window.innerHeight / -16,
        -200,
        500
      );
      camera.position.set(120, 60, 180);
      camera.lookAt(scene.position);

      orbitControls.dispose();
      orbitControls = new OrbitControls(camera, renderer.domElement);
      orbitControls.enableDamping = true;

      this.perspective = "Orthographic";
      return;
    }

    if (this.perspective === "Orthographic") {

      scene.remove(camera);

      camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );
      camera.position.set(120, 60, 180);
      camera.lookAt(scene.position);

      orbitControls.dispose();
      orbitControls = new OrbitControls(camera, renderer.domElement);
      orbitControls.enableDamping = true;

      this.perspective = "Perspective";
      return;
    }
  };
};
const fold = gui.addFolder("Camera");
fold.add(controls, 'switchCamera').name("Switch Camera Type");
fold.add(controls, 'perspective').listen().name("Current Camera");

const sunGeometry = new THREE.SphereGeometry(10, 40, 40);
const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffdd33 });
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
sun.position.set(0, 10, 0);
scene.add(sun);

const planets = [];

function createPlanet(name, radius, distance, color, rotationSpeed, orbitSpeed, texturePath) {
  const pivot = new THREE.Object3D();
  scene.add(pivot);

  const geom = new THREE.SphereGeometry(radius, 32, 32);

  let mat;

  mat = new THREE.MeshBasicMaterial({
    map: textureLoader.load(texturePath),
    color: new THREE.Color(color)})


  const mesh = new THREE.Mesh(geom, mat);
  mesh.position.set(distance, 10, 0);
  pivot.add(mesh);

  const planet = { name, pivot, mesh, rotationSpeed, orbitSpeed, angle: 0 };
  planets.push(planet);

  const folder = gui.addFolder(name);
  folder.add(planet, 'rotationSpeed', 0, 0.1, 0.001).name("Rotation Speed");
  folder.add(planet, 'orbitSpeed', 0, 0.1, 0.001).name("Orbit Speed");

  return planet;
}


createPlanet('Mercury', 1.5, 20, '#a6a6a6', 0.02, 0.02, './Mercury.jpg');
createPlanet('Venus',   3.0, 35, '#e39e1c', 0.015, 0.015, './Venus.jpg');
createPlanet('Earth',   3.5, 50, '#3498db', 0.01, 0.01, './Earth.jpg');
createPlanet('Mars',    2.5, 65, '#c0392b', 0.008, 0.008, './Mars.jpg');

window.addEventListener('resize', () => {
  const w = window.innerWidth;
  const h = window.innerHeight;

  renderer.setSize(w, h);

  if (camera instanceof THREE.PerspectiveCamera) {
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  } else {
    camera.left   = w / -16;
    camera.right  = w / 16;
    camera.top    = h / 16;
    camera.bottom = h / -16;
    camera.updateProjectionMatrix();
  }
});

function animate() {
  stats.update();
  orbitControls.update();

  sun.rotation.y += 0.002;

  planets.forEach((p) => {
    p.angle += p.orbitSpeed;
    p.pivot.rotation.y = p.angle;
    p.mesh.rotation.y += p.rotationSpeed;
  });

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();
