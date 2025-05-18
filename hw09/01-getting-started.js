// main.js
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

// Scene & Renderer
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000);
document.body.appendChild(renderer.domElement);

// Camera & Orbit Controls
let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 30, 100);
let controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Stats
const stats = new Stats();
document.body.appendChild(stats.dom);

// Lights
const ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5, 12, 8);
dirLight.castShadow = true;
scene.add(dirLight);

// Texture Loader
const loader = new THREE.TextureLoader();

// Sun
const sunGeometry = new THREE.SphereGeometry(10, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);


// Planet Data
const planetsData = [
  {
    name: 'Mercury', radius: 1.5, distance: 20, color: '#a6a6a6',
    rotationSpeed: 0.02, orbitSpeed: 0.02, texture: 'mercury.jpg'
  },
  {
    name: 'Venus', radius: 3, distance: 35, color: '#e39e1c',
    rotationSpeed: 0.015, orbitSpeed: 0.015, texture: 'venus.jpg'
  },
  {
    name: 'Earth', radius: 3.5, distance: 50, color: '#3498db',
    rotationSpeed: 0.01, orbitSpeed: 0.01, texture: 'earth.jpg'
  },
  {
    name: 'Mars', radius: 2.5, distance: 65, color: '#c0392b',
    rotationSpeed: 0.008, orbitSpeed: 0.008, texture: 'mars.jpg'
  }
];

const planetGroups = [];
const gui = new GUI();
const cameraFolder = gui.addFolder('Camera');
cameraFolder.add({ switchCamera: switchCamera }, 'switchCamera').name('Switch Camera Type');
cameraFolder.add({ get cameraType() { return (camera instanceof THREE.PerspectiveCamera) ? 'Perspective' : 'Orthographic'; } }, 'cameraType').name('Current Camera').listen();

function createPlanet(planet) {
  const group = new THREE.Group();
  const geo = new THREE.SphereGeometry(planet.radius, 32, 32);
  const mat = new THREE.MeshStandardMaterial({
        map: loader.load(`./textures/${planet.texture}`),
        roughness: 0.8,
        metalness: 0.2
    });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.x = planet.distance;
  group.add(mesh);
  scene.add(group);

  planetGroups.push({ group, mesh, data: planet, angle: 0 });

  const folder = gui.addFolder(planet.name);
  folder.add(planet, 'rotationSpeed', 0, 0.1, 0.001).name('Rotation Speed');
  folder.add(planet, 'orbitSpeed', 0, 0.1, 0.001).name('Orbit Speed');
}

planetsData.forEach(createPlanet);

function switchCamera() {
  const prevPos = camera.position.clone();
  const prevLook = controls.target.clone();
  scene.remove(camera);
  if (camera instanceof THREE.PerspectiveCamera) {
    camera = new THREE.OrthographicCamera(
      window.innerWidth / -16, window.innerWidth / 16,
      window.innerHeight / 16, window.innerHeight / -16,
      -200, 1000
    );
  } else {
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  }
  camera.position.copy(prevPos);
  camera.lookAt(prevLook);
  controls.dispose();
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
}

window.addEventListener('resize', () => {
  if (camera instanceof THREE.PerspectiveCamera) {
    camera.aspect = window.innerWidth / window.innerHeight;
  } else {
    camera.left = window.innerWidth / -16;
    camera.right = window.innerWidth / 16;
    camera.top = window.innerHeight / 16;
    camera.bottom = window.innerHeight / -16;
  }
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
  stats.update();
  controls.update();
  planetGroups.forEach(obj => {
    obj.mesh.rotation.y += obj.data.rotationSpeed;
    obj.angle -= obj.data.orbitSpeed;
    obj.mesh.position.x = Math.cos(obj.angle) * obj.data.distance;
    obj.mesh.position.z = Math.sin(obj.angle) * obj.data.distance;
  });
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();
