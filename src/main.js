import * as THREE from "three";
import "./style.css";

const root = document.querySelector("#game-root");
const hint = document.querySelector("#hint");
const toast = document.querySelector("#toast");
const joystick = document.querySelector("#joystick");
const joystickKnob = document.querySelector("#joystick-knob");
const orientationOverlay = document.querySelector("#orientation-overlay");

if (!root || !hint || !toast || !joystick || !joystickKnob || !orientationOverlay) {
  throw new Error("Falta un elemento necesario de la interfaz de DON PEDRO.");
}

// ----- Renderizado móvil -----

let renderer;
try {
  renderer = new THREE.WebGLRenderer({
    antialias: false,
    alpha: false,
    powerPreference: "high-performance"
  });
} catch (error) {
  root.innerHTML = '<div class="webgl-error">No se pudieron iniciar los gráficos 3D. Prueba con un navegador compatible con WebGL 2.</div>';
  throw error;
}

renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;
root.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xa8bd9d);
scene.fog = new THREE.Fog(0xa8bd9d, 34, 76);

const camera = new THREE.PerspectiveCamera(
  55,
  window.innerWidth / window.innerHeight,
  0.08,
  110
);

scene.add(new THREE.HemisphereLight(0xfff3dc, 0x63765d, 2.0));

const sunlight = new THREE.DirectionalLight(0xffe7c4, 2.0);
sunlight.position.set(-12, 18, 10);
scene.add(sunlight);

const mat = (color, extra = {}) => new THREE.MeshStandardMaterial({
  color,
  roughness: 1,
  flatShading: true,
  ...extra
});

const mats = {
  grass: mat(0xa8bd9d),
  grassDark: mat(0x829b78),
  tile: mat(0xd9c79e),
  tileLine: mat(0xc8b58d),
  cream: mat(0xf2e5c9),
  wall: mat(0xe7d8b8),
  wallShade: mat(0xd5c4a2),
  wood: mat(0x8d6443),
  woodLight: mat(0xb58a5b),
  woodDark: mat(0x65472f),
  red: mat(0x9f2929),
  redLight: mat(0xc94a3e),
  redDark: mat(0x702222),
  white: mat(0xf6efdc),
  blue: mat(0x294f87),
  blueLight: mat(0x6689ad),
  skin: mat(0xc9916c),
  moustache: mat(0xe0ded4),
  dark: mat(0x39352f),
  glass: mat(0xa9d1d0, { transparent: true, opacity: 0.48, roughness: 0.2 }),
  road: mat(0x666866),
  roadLine: mat(0xe8dcb8),
  sidewalk: mat(0xc6b99c),
  green: mat(0x668a56),
  greenLight: mat(0x87a96b),
  terracotta: mat(0xb96d4a),
  window: mat(0x759ba0, { metalness: 0.05, roughness: 0.35 })
};

const box = (parent, width, height, depth, material, x, y, z) => {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, depth),
    material
  );
  mesh.position.set(x, y, z);
  parent.add(mesh);
  return mesh;
};

const cylinder = (parent, top, bottom, height, segments, material, x, y, z) => {
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(top, bottom, height, segments),
    material
  );
  mesh.position.set(x, y, z);
  parent.add(mesh);
  return mesh;
};

const plane = (parent, width, height, material, x, y, z) => {
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height), material);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(x, y, z);
  parent.add(mesh);
  return mesh;
};

function textMaterial(text, background, foreground, fontSize = 84) {
  const canvas = document.createElement("canvas");
  canvas.width = 768;
  canvas.height = 192;
  const context = canvas.getContext("2d");
  context.fillStyle = background;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = foreground;
  context.font = "900 " + fontSize + "px Trebuchet MS, Arial, sans-serif";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(text, canvas.width / 2, canvas.height / 2);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return new THREE.MeshBasicMaterial({ map: texture });
}

// ----- Mundo exterior continuo -----
// El suelo no es una plataforma elevada: la tienda conecta directamente con la banqueta y la calle.

plane(scene, 70, 70, mats.grass, 0, -0.09, 8);

// Camino exterior y banqueta frente a la tienda.
plane(scene, 50, 9, mats.sidewalk, 0, -0.045, 9.2);
plane(scene, 50, 8, mats.road, 0, -0.04, 17.5);
plane(scene, 50, 0.12, mats.roadLine, 0, -0.025, 13.5);
plane(scene, 50, 0.12, mats.roadLine, 0, -0.025, 21.5);

for (let x = -23; x <= 23; x += 4) {
  box(scene, 2.0, 0.015, 0.14, mats.cream, x, -0.005, 17.5);
}

// Guarniciones a ambos lados de la calle.
box(scene, 50, 0.18, 0.24, mats.woodLight, 0, 0.01, 13.35);
box(scene, 50, 0.18, 0.24, mats.woodLight, 0, 0.01, 21.65);

// Banqueta con losas grandes, sin bordes de maqueta.
for (let x = -24; x <= 24; x += 2.5) {
  box(scene, 0.025, 0.012, 8.5, mats.tileLine, x, -0.012, 9.2);
}

// ----- Colisiones del mundo -----

const colliders = [];
function addCollider(centerX, centerZ, halfX, halfZ) {
  colliders.push({
    minX: centerX - halfX,
    maxX: centerX + halfX,
    minZ: centerZ - halfZ,
    maxZ: centerZ + halfZ
  });
}

function addWall(width, height, depth, material, x, y, z, collider = true) {
  const mesh = box(scene, width, height, depth, material, x, y, z);
  if (collider) addCollider(x, z, width / 2 + 0.12, depth / 2 + 0.12);
  return mesh;
}

// ----- Tiendita DON PEDRO -----
// Interior amplio, abierto hacia la banqueta. Sin techo y sin plataforma con laterales gruesos.

const storeWidth = 15.0;
const storeBackZ = -7.2;
const storeFrontZ = 5.1;

plane(scene, 14.55, 12.2, mats.tile, 0, -0.025, -1.05);

// Juntas discretas del piso interior.
for (let x = -7.0; x <= 7.0; x += 1) {
  box(scene, 0.018, 0.012, 12.0, mats.tileLine, x, -0.016, -1.05);
}
for (let z = -6.8; z <= 4.8; z += 1) {
  box(scene, 14.3, 0.012, 0.018, mats.tileLine, 0, -0.015, z);
}

// Pared trasera y laterales. El frente queda completamente abierto.
addWall(storeWidth, 3.2, 0.24, mats.wall, 0, 1.58, storeBackZ);
addWall(0.24, 3.2, 12.3, mats.wall, -7.38, 1.58, -1.05);
addWall(0.24, 3.2, 12.3, mats.wall, 7.38, 1.58, -1.05);

// Zócalos interiores.
box(scene, 14.7, 0.18, 0.10, mats.wood, 0, 0.12, -7.04);
box(scene, 0.10, 0.18, 12.0, mats.wood, -7.22, 0.12, -1.0);
box(scene, 0.10, 0.18, 12.0, mats.wood, 7.22, 0.12, -1.0);

// Marcos y pequeños detalles de pared.
for (const x of [-5.0, 5.0]) {
  box(scene, 1.45, 1.0, 0.08, mats.wood, x, 2.05, -7.02);
  box(scene, 1.26, 0.8, 0.025, mats.window, x, 2.05, -6.96);
  box(scene, 0.06, 0.85, 0.035, mats.white, x, 2.05, -6.92);
  box(scene, 1.32, 0.05, 0.035, mats.white, x, 2.05, -6.92);
}

// Fachada, entrada y toldo mexicano.
box(scene, 15.0, 0.18, 1.25, mats.red, 0, 3.0, 4.65);
box(scene, 15.0, 0.10, 1.15, mats.redDark, 0, 2.82, 4.65);

for (let i = 0; i < 10; i += 1) {
  const stripeX = -6.75 + i * 1.5;
  box(
    scene,
    0.72,
    0.08,
    1.18,
    i % 2 === 0 ? mats.white : mats.redLight,
    stripeX,
    3.11,
    4.65
  );
}

// Columnas laterales: el acceso central permanece despejado.
for (const x of [-7.2, 7.2]) {
  box(scene, 0.32, 3.0, 0.34, mats.wood, x, 1.5, 4.65);
  addCollider(x, 4.65, 0.27, 0.3);
}

// Letrero exterior orientado hacia la calle.
box(scene, 5.0, 0.88, 0.18, mats.red, 0, 3.78, 5.12);
const frontSign = new THREE.Mesh(
  new THREE.PlaneGeometry(4.65, 0.62),
  textMaterial("DON PEDRO", "#9f2929", "#fff0d5", 102)
);
frontSign.position.set(0, 3.78, 5.225);
scene.add(frontSign);

// Letrero interior.
box(scene, 4.0, 0.65, 0.12, mats.red, 0, 2.72, -7.0);
const insideSign = new THREE.Mesh(
  new THREE.PlaneGeometry(3.7, 0.45),
  textMaterial("DON PEDRO", "#9f2929", "#fff0d5", 94)
);
insideSign.position.set(0, 2.72, -6.925);
scene.add(insideSign);

// Iluminación interior.
for (const x of [-4.5, 0, 4.5]) {
  box(scene, 1.15, 0.08, 0.18, mats.cream, x, 2.95, -1.9);
  box(scene, 0.9, 0.035, 0.08, mats.white, x, 2.88, -1.9);
}

// ----- Estantes y productos -----

const productMaterials = [
  mat(0xd84c38), mat(0xe7bf43), mat(0x477fa5), mat(0x6f9a55),
  mat(0xb94b78), mat(0xe58a38), mat(0xe9e0c7), mat(0x754e9b)
];

function createShelf(x, z, width = 2.8, rotation = 0, addCollision = true) {
  const shelf = new THREE.Group();
  shelf.position.set(x, 0, z);
  shelf.rotation.y = rotation;
  scene.add(shelf);

  box(shelf, 0.13, 1.85, 0.58, mats.wood, -width / 2, 0.98, 0);
  box(shelf, 0.13, 1.85, 0.58, mats.wood, width / 2, 0.98, 0);
  box(shelf, width, 0.12, 0.62, mats.woodLight, 0, 0.18, 0);
  box(shelf, width, 0.12, 0.62, mats.woodLight, 0, 0.78, 0);
  box(shelf, width, 0.12, 0.62, mats.woodLight, 0, 1.38, 0);
  box(shelf, width, 0.12, 0.62, mats.woodLight, 0, 1.92, 0);
  box(shelf, width, 1.82, 0.07, mats.woodDark, 0, 1.05, -0.27);

  const levels = [0.42, 1.02, 1.62];
  levels.forEach((level, row) => {
    for (let i = 0; i < 8; i += 1) {
      const itemWidth = 0.20 + (i % 3) * 0.02;
      const itemHeight = 0.22 + ((i + row) % 2) * 0.07;
      const item = box(
        shelf,
        itemWidth,
        itemHeight,
        0.22,
        productMaterials[(i + row * 3) % productMaterials.length],
        -width / 2 + 0.22 + i * ((width - 0.42) / 7),
        level + itemHeight / 2,
        0.06
      );
      item.rotation.y = i % 2 ? 0.045 : -0.045;
    }
  });

  if (addCollision) {
    const sideFacing = Math.abs(Math.sin(rotation)) > 0.5;
    addCollider(
      x,
      z,
      (sideFacing ? 0.72 : width / 2 + 0.1),
      (sideFacing ? width / 2 + 0.1 : 0.72)
    );
  }
  return shelf;
}

// Estantes del fondo.
createShelf(-3.0, -6.1, 3.6);
createShelf(3.0, -6.1, 3.6);

// Estantes laterales orientados hacia el pasillo central.
createShelf(-6.65, -1.5, 3.0, Math.PI / 2);
createShelf(6.65, -1.35, 3.0, -Math.PI / 2);

// Góndolas bajas en el centro, dejando pasillos amplios.
createShelf(-2.25, -2.1, 2.55);
createShelf(2.2, -2.1, 2.55);

// ----- Refrigerador rojo de bebidas, con puerta interactiva -----

function createFridge() {
  const group = new THREE.Group();
  group.position.set(-6.55, 0, -4.65);
  group.rotation.y = Math.PI / 2;
  scene.add(group);

  box(group, 1.48, 2.22, 0.98, mats.red, 0, 1.12, 0);
  box(group, 1.28, 2.02, 0.78, mats.dark, 0, 1.12, 0.12);

  const drinkColors = [0x3a8b55, 0xc93e32, 0xe3bd42, 0x4686bd, 0xf0e6d4];
  for (let row = 0; row < 3; row += 1) {
    box(group, 1.16, 0.045, 0.60, mats.woodLight, 0, 0.52 + row * 0.58, 0.13);
    for (let col = 0; col < 5; col += 1) {
      cylinder(
        group, 0.065, 0.065, 0.26, 6,
        mat(drinkColors[(col + row) % drinkColors.length]),
        -0.46 + col * 0.23,
        0.68 + row * 0.58,
        0.16
      );
    }
  }

  const hinge = new THREE.Group();
  hinge.position.set(0.68, 1.12, 0.56);
  group.add(hinge);

  const door = new THREE.Group();
  door.position.set(-0.68, -0.02, 0);
  hinge.add(door);

  box(door, 1.36, 1.96, 0.10, mats.redLight, 0, 0, 0);
  box(door, 1.15, 1.72, 0.025, mats.glass, 0, 0.03, 0.065);
  box(door, 0.055, 0.58, 0.08, mats.cream, 0.57, -0.08, 0.11);

  const label = new THREE.Mesh(
    new THREE.PlaneGeometry(0.98, 0.21),
    textMaterial("BEBIDAS", "#9f2929", "#ffffff", 78)
  );
  label.position.set(0, 0.75, 0.092);
  door.add(label);

  group.userData.interactable = true;
  group.userData.kind = "fridge";
  group.userData.displayName = "Refrigerador";
  group.userData.hinge = hinge;
  group.userData.isOpen = false;
  group.userData.targetAngle = 0;
  addCollider(-6.55, -4.65, 0.67, 0.83);
  return group;
}

const fridge = createFridge();
const interactables = [fridge];

// ----- Mostrador y caja -----

const counter = new THREE.Group();
counter.position.set(4.25, 0, 2.0);
scene.add(counter);
box(counter, 2.35, 1.0, 0.92, mats.wood, 0, 0.55, 0);
box(counter, 2.48, 0.14, 1.0, mats.woodLight, 0, 1.12, 0);
box(counter, 0.58, 0.34, 0.46, mats.dark, -0.55, 1.34, -0.05);
box(counter, 0.42, 0.055, 0.035, mats.green, -0.55, 1.52, -0.28);
box(counter, 0.25, 0.17, 0.23, mats.red, 0.68, 1.25, -0.05);
addCollider(4.25, 2.0, 1.3, 0.72);

// ----- Exterior: casas, árboles y objetos del barrio -----

function createTree(x, z, scale = 1) {
  const tree = new THREE.Group();
  tree.position.set(x, 0, z);
  tree.scale.setScalar(scale);
  scene.add(tree);

  cylinder(tree, 0.22, 0.28, 1.7, 6, mats.wood, 0, 0.85, 0);
  const crown1 = new THREE.Mesh(
    new THREE.DodecahedronGeometry(1.05, 0),
    mats.green
  );
  crown1.position.set(0, 2.0, 0);
  tree.add(crown1);

  const crown2 = new THREE.Mesh(
    new THREE.DodecahedronGeometry(0.75, 0),
    mats.greenLight
  );
  crown2.position.set(0.48, 2.45, 0.08);
  tree.add(crown2);

  addCollider(x, z, 0.42 * scale, 0.42 * scale);
}

function createHouse(x, z, wallColor, roofColor) {
  const house = new THREE.Group();
  house.position.set(x, 0, z);
  scene.add(house);

  box(house, 8.0, 3.5, 5.0, wallColor, 0, 1.75, 0);
  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(6.1, 2.2, 4),
    roofColor
  );
  roof.rotation.y = Math.PI / 4;
  roof.position.set(0, 4.55, 0);
  house.add(roof);

  // Fachada orientada hacia la tiendita.
  box(house, 1.25, 2.15, 0.12, mats.wood, 0, 1.08, -2.56);
  box(house, 0.9, 0.95, 0.06, mats.window, -2.25, 2.05, -2.57);
  box(house, 0.9, 0.95, 0.06, mats.window, 2.25, 2.05, -2.57);
  box(house, 0.07, 1.02, 0.08, mats.white, -2.25, 2.05, -2.52);
  box(house, 0.07, 1.02, 0.08, mats.white, 2.25, 2.05, -2.52);

  addCollider(x, z, 4.2, 2.7);
  return house;
}

createHouse(-11.5, 27.0, mat(0xe0c59b), mats.terracotta);
createHouse(11.5, 27.0, mat(0xc5d0b3), mats.redDark);

// Árboles y jardineras de la banqueta.
createTree(-10.5, 8.5, 1.0);
createTree(10.7, 8.8, 1.05);
createTree(-18.0, 3.5, 1.15);
createTree(18.0, 3.0, 1.15);
createTree(-18.0, 24.0, 0.9);
createTree(18.0, 24.0, 0.9);

// Jardineras bajas al lado de la entrada.
for (const x of [-8.8, 8.8]) {
  box(scene, 1.15, 0.45, 1.0, mats.wood, x, 0.22, 5.9);
  const plant = new THREE.Mesh(
    new THREE.DodecahedronGeometry(0.46, 0),
    mats.green
  );
  plant.position.set(x, 0.78, 5.9);
  scene.add(plant);
  addCollider(x, 5.9, 0.65, 0.58);
}

// Cajas de refresco junto a la entrada.
for (let i = 0; i < 3; i += 1) {
  box(scene, 0.62, 0.38, 0.48, i % 2 ? mats.red : mats.redDark, -5.9 + i * 0.08, 0.19, 5.2 + i * 0.04);
}

// Poste de luz y bote de basura.
cylinder(scene, 0.07, 0.1, 5.8, 7, mats.dark, 14.2, 2.9, 9.5);
box(scene, 0.9, 0.12, 0.16, mats.dark, 14.2, 5.72, 9.5);
box(scene, 0.45, 0.7, 0.45, mats.dark, 14.2, 6.05, 9.5);
addCollider(14.2, 9.5, 0.25, 0.25);

cylinder(scene, 0.36, 0.4, 0.8, 8, mats.dark, -8.9, 0.4, 7.2);
cylinder(scene, 0.4, 0.4, 0.08, 8, mats.woodLight, -8.9, 0.82, 7.2);
addCollider(-8.9, 7.2, 0.45, 0.45);

// ----- Don Pedro: personaje Low Poly retro -----

const player = new THREE.Group();
scene.add(player);
player.position.set(0, 0, 2.0);

box(player, 0.58, 0.74, 0.36, mats.blue, 0, 1.03, 0);

// Camisa azul de rayas blancas.
for (let i = -2; i <= 2; i += 1) {
  box(player, 0.018, 0.64, 0.014, mats.white, i * 0.105, 1.03, -0.19);
}

for (const side of [-1, 1]) {
  const arm = cylinder(player, 0.105, 0.12, 0.64, 6, mats.blue, side * 0.38, 1.03, 0);
  arm.rotation.z = side * -0.12;
  cylinder(player, 0.09, 0.09, 0.16, 6, mats.skin, side * 0.41, 0.68, 0);
}

for (const side of [-1, 1]) {
  cylinder(player, 0.13, 0.14, 0.66, 6, mats.dark, side * 0.16, 0.37, 0);
  box(player, 0.25, 0.13, 0.38, mats.dark, side * 0.16, 0.08, -0.055);
}

const head = new THREE.Mesh(
  new THREE.SphereGeometry(0.31, 8, 6),
  mats.skin
);
head.position.set(0, 1.82, 0);
player.add(head);

for (const side of [-1, 1]) {
  const eye = new THREE.Mesh(
    new THREE.SphereGeometry(0.035, 6, 5),
    mats.dark
  );
  eye.position.set(side * 0.105, 1.87, -0.276);
  player.add(eye);

  const brow = box(player, 0.12, 0.025, 0.025, mats.dark, side * 0.105, 1.94, -0.28);
  brow.rotation.z = side * 0.08;

  const moustache = new THREE.Mesh(
    new THREE.SphereGeometry(0.105, 7, 5),
    mats.moustache
  );
  moustache.scale.set(1.12, 0.46, 0.42);
  moustache.position.set(side * 0.085, 1.75, -0.29);
  player.add(moustache);
}

const nose = new THREE.Mesh(
  new THREE.SphereGeometry(0.055, 6, 5),
  mats.skin
);
nose.position.set(0, 1.81, -0.31);
player.add(nose);

// Sombrero vaquero blanco.
cylinder(player, 0.43, 0.48, 0.07, 9, mats.white, 0, 2.12, 0);
cylinder(player, 0.27, 0.34, 0.32, 9, mats.white, 0, 2.29, 0);
cylinder(player, 0.29, 0.29, 0.055, 9, mats.cream, 0, 2.17, 0);

// ----- Cámara híbrida y controles de zoom -----

let cameraZoom = 0.04;
let cameraYaw = 0;
let cameraPitch = 0;
let isFirstPerson = false;

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const cameraForward = new THREE.Vector3();
const cameraTarget = new THREE.Vector3();
const desiredCameraPosition = new THREE.Vector3();

function updateCamera(delta) {
  const zoom = THREE.MathUtils.smoothstep(cameraZoom, 0, 1);
  const distance = THREE.MathUtils.lerp(18.0, 0.12, zoom);
  const baseElevation = THREE.MathUtils.lerp(0.76, 0.025, zoom);
  const elevation = clamp(baseElevation - cameraPitch, 0.10, 1.28);
  const focusHeight = THREE.MathUtils.lerp(0.25, 1.62, zoom);
  const horizontalDistance = distance * Math.cos(elevation);
  const verticalDistance = distance * Math.sin(elevation);

  cameraForward.set(-Math.sin(cameraYaw), 0, -Math.cos(cameraYaw));

  desiredCameraPosition.set(
    player.position.x + Math.sin(cameraYaw) * horizontalDistance,
    player.position.y + focusHeight + verticalDistance,
    player.position.z + Math.cos(cameraYaw) * horizontalDistance
  );

  cameraTarget.set(
    player.position.x + cameraForward.x * THREE.MathUtils.lerp(0.0, 2.8, zoom),
    player.position.y + focusHeight,
    player.position.z + cameraForward.z * THREE.MathUtils.lerp(0.0, 2.8, zoom)
  );

  camera.position.lerp(desiredCameraPosition, 1 - Math.exp(-delta * 22));
  camera.lookAt(cameraTarget);

  const nextFirstPerson = cameraZoom > 0.965;
  if (nextFirstPerson !== isFirstPerson) {
    isFirstPerson = nextFirstPerson;
    player.visible = !isFirstPerson;
    hint.textContent = isFirstPerson
      ? "P.O.V. · Mantén pulsado un objeto para usarlo"
      : "Explora la tienda y el barrio";
  }
}

// ----- Joystick fijo -----

const joystickState = { x: 0, y: 0, pointerId: null };
const joystickRadius = 43;

function setJoystickFromPointer(event) {
  const rect = joystick.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  let dx = event.clientX - centerX;
  let dy = event.clientY - centerY;
  const length = Math.hypot(dx, dy);

  if (length > joystickRadius) {
    dx = (dx / length) * joystickRadius;
    dy = (dy / length) * joystickRadius;
  }

  joystickState.x = dx / joystickRadius;
  joystickState.y = dy / joystickRadius;
  joystickKnob.style.transform = "translate(" + dx + "px, " + dy + "px)";
}

function resetJoystick() {
  joystickState.x = 0;
  joystickState.y = 0;
  joystickState.pointerId = null;
  joystickKnob.style.transform = "translate(0, 0)";
}

joystick.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  event.stopPropagation();
  requestImmersiveLandscape();
  joystickState.pointerId = event.pointerId;
  joystick.setPointerCapture(event.pointerId);
  setJoystickFromPointer(event);
});

joystick.addEventListener("pointermove", (event) => {
  if (event.pointerId === joystickState.pointerId) {
    event.preventDefault();
    setJoystickFromPointer(event);
  }
});

joystick.addEventListener("pointerup", (event) => {
  if (event.pointerId === joystickState.pointerId) resetJoystick();
});
joystick.addEventListener("pointercancel", resetJoystick);
joystick.addEventListener("lostpointercapture", resetJoystick);

// ----- Orientación horizontal -----
// La orientación se solicita tras un gesto del usuario. Si el navegador no puede bloquearla,
// la pantalla de orientación pide girar el dispositivo físicamente.

function updateOrientationOverlay() {
  const portrait = window.innerHeight > window.innerWidth;
  orientationOverlay.classList.toggle("visible", portrait);
  orientationOverlay.setAttribute("aria-hidden", portrait ? "false" : "true");
  if (portrait) resetJoystick();
}

function requestImmersiveLandscape() {
  const requestFullscreen = document.documentElement.requestFullscreen;
  let fullscreenPromise = Promise.resolve();

  if (!document.fullscreenElement && typeof requestFullscreen === "function") {
    try {
      fullscreenPromise = requestFullscreen.call(document.documentElement);
    } catch (_) {
      fullscreenPromise = Promise.resolve();
    }
  }

  Promise.resolve(fullscreenPromise)
    .catch(() => {})
    .then(() => {
      if (screen.orientation && typeof screen.orientation.lock === "function") {
        return screen.orientation.lock("landscape").catch(() => {});
      }
      return undefined;
    });
}

orientationOverlay.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  requestImmersiveLandscape();
});

window.addEventListener("resize", updateOrientationOverlay);
window.addEventListener("orientationchange", () => {
  window.setTimeout(() => {
    updateOrientationOverlay();
    resizeRenderer();
  }, 120);
});

// ----- Gestos en el mundo: mirar, pellizcar y mantener pulsado -----

const raycaster = new THREE.Raycaster();
const pointerNdc = new THREE.Vector2();
const activePointers = new Map();

let pinchStartDistance = 0;
let pinchStartZoom = cameraZoom;
let lookPointerId = null;
let lookStartX = 0;
let lookStartY = 0;
let lastLookX = 0;
let lastLookY = 0;
let holdTimer = null;
let holdTarget = null;
let holdTriggered = false;
let toastTimer = null;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    toast.classList.remove("visible");
  }, 1700);
}

function cancelHold() {
  if (holdTimer !== null) {
    window.clearTimeout(holdTimer);
    holdTimer = null;
  }
}

function getInteractableAt(clientX, clientY) {
  const rect = renderer.domElement.getBoundingClientRect();
  pointerNdc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
  pointerNdc.y = -((clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointerNdc, camera);

  const hits = raycaster.intersectObjects(interactables, true);
  if (!hits.length) return null;

  let object = hits[0].object;
  while (object && !object.userData.interactable) object = object.parent;
  return object || null;
}

function interactWith(object) {
  if (!object || !object.userData.interactable) return;

  const dx = player.position.x - object.position.x;
  const dz = player.position.z - object.position.z;
  if (Math.hypot(dx, dz) > 3.0) {
    showToast("Acércate un poco más.");
    return;
  }

  if (object.userData.kind === "fridge") {
    object.userData.isOpen = !object.userData.isOpen;
    object.userData.targetAngle = object.userData.isOpen ? -1.18 : 0;
    showToast(object.userData.isOpen ? "Refrigerador abierto" : "Refrigerador cerrado");
    hint.textContent = "Refrigerador · Mantén pulsado para abrir o cerrar";
  }
}

renderer.domElement.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  requestImmersiveLandscape();

  activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
  try {
    renderer.domElement.setPointerCapture(event.pointerId);
  } catch (_) {
    // Captura no disponible en algunos navegadores.
  }

  if (activePointers.size >= 2) {
    cancelHold();
    lookPointerId = null;
    const points = Array.from(activePointers.values());
    pinchStartDistance = Math.hypot(
      points[0].x - points[1].x,
      points[0].y - points[1].y
    );
    pinchStartZoom = cameraZoom;
    return;
  }

  lookPointerId = event.pointerId;
  lookStartX = event.clientX;
  lookStartY = event.clientY;
  lastLookX = event.clientX;
  lastLookY = event.clientY;
  holdTriggered = false;
  holdTarget = getInteractableAt(event.clientX, event.clientY);

  cancelHold();
  if (holdTarget) {
    holdTimer = window.setTimeout(() => {
      holdTriggered = true;
      interactWith(holdTarget);
    }, 520);
  }
});

renderer.domElement.addEventListener("pointermove", (event) => {
  if (activePointers.has(event.pointerId)) {
    activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
  }

  if (activePointers.size >= 2) {
    const points = Array.from(activePointers.values());
    const distance = Math.hypot(
      points[0].x - points[1].x,
      points[0].y - points[1].y
    );
    if (pinchStartDistance > 0) {
      const change = (distance - pinchStartDistance) / Math.max(120, pinchStartDistance);
      cameraZoom = clamp(pinchStartZoom + change * 0.85, 0, 1);
    }
    return;
  }

  if (event.pointerId !== lookPointerId) return;

  const totalMovement = Math.hypot(
    event.clientX - lookStartX,
    event.clientY - lookStartY
  );

  if (totalMovement > 9) cancelHold();

  if (totalMovement > 5) {
    const dx = event.clientX - lastLookX;
    const dy = event.clientY - lastLookY;

    // Eje vertical invertido respecto al prototipo anterior:
    // deslizar hacia arriba mira hacia arriba; deslizar hacia abajo mira hacia abajo.
    cameraYaw -= dx * 0.0052;
    cameraPitch = clamp(cameraPitch - dy * 0.0042, -0.52, 0.52);

    lastLookX = event.clientX;
    lastLookY = event.clientY;
  }
});

function finishWorldPointer(event) {
  activePointers.delete(event.pointerId);
  if (activePointers.size < 2) pinchStartDistance = 0;

  if (event.pointerId === lookPointerId) {
    cancelHold();
    if (
      !holdTriggered &&
      holdTarget &&
      Math.hypot(event.clientX - lookStartX, event.clientY - lookStartY) < 9
    ) {
      showToast("Mantén pulsado para interactuar.");
    }
    lookPointerId = null;
    holdTarget = null;
  }
}

renderer.domElement.addEventListener("pointerup", finishWorldPointer);
renderer.domElement.addEventListener("pointercancel", finishWorldPointer);
renderer.domElement.addEventListener("lostpointercapture", finishWorldPointer);
renderer.domElement.addEventListener("contextmenu", (event) => event.preventDefault());

renderer.domElement.addEventListener("wheel", (event) => {
  cameraZoom = clamp(cameraZoom - event.deltaY * 0.001, 0, 1);
}, { passive: true });

// Teclado para pruebas en computadora.
const keys = new Set();
window.addEventListener("keydown", (event) => keys.add(event.key.toLowerCase()));
window.addEventListener("keyup", (event) => keys.delete(event.key.toLowerCase()));

// ----- Movimiento y colisiones -----

const PLAYER_RADIUS = 0.34;

function collidesAt(x, z) {
  if (x < -24 || x > 24 || z < -12 || z > 31) return true;

  return colliders.some((c) =>
    x + PLAYER_RADIUS > c.minX &&
    x - PLAYER_RADIUS < c.maxX &&
    z + PLAYER_RADIUS > c.minZ &&
    z - PLAYER_RADIUS < c.maxZ
  );
}

function movePlayer(delta) {
  let inputX = joystickState.x;
  let inputY = joystickState.y;

  if (keys.has("a") || keys.has("arrowleft")) inputX -= 1;
  if (keys.has("d") || keys.has("arrowright")) inputX += 1;
  if (keys.has("w") || keys.has("arrowup")) inputY -= 1;
  if (keys.has("s") || keys.has("arrowdown")) inputY += 1;

  const inputLength = Math.hypot(inputX, inputY);
  if (inputLength < 0.08) return;

  if (inputLength > 1) {
    inputX /= inputLength;
    inputY /= inputLength;
  }

  const forwardX = -Math.sin(cameraYaw);
  const forwardZ = -Math.cos(cameraYaw);
  const rightX = Math.cos(cameraYaw);
  const rightZ = -Math.sin(cameraYaw);

  const moveX = rightX * inputX + forwardX * -inputY;
  const moveZ = rightZ * inputX + forwardZ * -inputY;
  const length = Math.hypot(moveX, moveZ) || 1;
  const speed = 3.2;

  const stepX = (moveX / length) * speed * delta;
  const stepZ = (moveZ / length) * speed * delta;

  // Resolución por ejes para permitir deslizarse junto a estantes y paredes.
  const nextX = player.position.x + stepX;
  if (!collidesAt(nextX, player.position.z)) player.position.x = nextX;

  const nextZ = player.position.z + stepZ;
  if (!collidesAt(player.position.x, nextZ)) player.position.z = nextZ;

  player.rotation.y = Math.atan2(-moveX, -moveZ);
}

// ----- Bucle principal -----

const clock = new THREE.Clock();

function animate() {
  const delta = Math.min(clock.getDelta(), 0.04);

  movePlayer(delta);

  const currentAngle = fridge.userData.hinge.rotation.y;
  fridge.userData.hinge.rotation.y = THREE.MathUtils.damp(
    currentAngle,
    fridge.userData.targetAngle,
    7,
    delta
  );

  updateCamera(delta);
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

function resizeRenderer() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
  renderer.setSize(width, height);
}

window.addEventListener("resize", () => {
  resizeRenderer();
  updateOrientationOverlay();
});

hint.textContent = "Desliza para mirar · Pellizca para acercar";
updateOrientationOverlay();
updateCamera(1);
animate();