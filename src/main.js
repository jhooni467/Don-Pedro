import * as THREE from "three";
import "./style.css";

const root = document.querySelector("#game-root");
const hint = document.querySelector("#hint");
const toast = document.querySelector("#toast");
const joystick = document.querySelector("#joystick");
const joystickKnob = document.querySelector("#joystick-knob");

if (!root || !hint || !toast || !joystick || !joystickKnob) {
  throw new Error("No se pudo iniciar la interfaz de DON PEDRO.");
}

let renderer;
try {
  renderer = new THREE.WebGLRenderer({
    antialias: false,
    alpha: false,
    powerPreference: "high-performance"
  });
} catch (error) {
  root.innerHTML = '<div class="webgl-error">Este dispositivo o navegador no pudo iniciar los gráficos 3D. Prueba con otro navegador compatible con WebGL 2.</div>';
  throw error;
}

renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
root.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xa8bd9d);
scene.fog = new THREE.Fog(0xa8bd9d, 18, 38);

const camera = new THREE.PerspectiveCamera(
  58,
  window.innerWidth / window.innerHeight,
  0.05,
  80
);

scene.add(new THREE.HemisphereLight(0xfff2d7, 0x66745e, 2.0));

const sunlight = new THREE.DirectionalLight(0xffe4bd, 2.1);
sunlight.position.set(-5, 10, 7);
scene.add(sunlight);

const material = (color, extra = {}) => new THREE.MeshStandardMaterial({
  color,
  roughness: 1,
  flatShading: true,
  ...extra
});

const mats = {
  floor: material(0xc8ad87),
  tile: material(0xd7c19c),
  wall: material(0xe8d8b9),
  wallTrim: material(0x9a7655),
  red: material(0x9f2929),
  redLight: material(0xc5483d),
  wood: material(0x956b49),
  woodLight: material(0xb58a5e),
  dark: material(0x39352f),
  cream: material(0xf4e8d0),
  glass: new THREE.MeshStandardMaterial({
    color: 0xa8d4d2,
    roughness: 0.22,
    metalness: 0.08,
    transparent: true,
    opacity: 0.48
  }),
  blue: material(0x294f87),
  skin: material(0xc99269),
  moustache: material(0xe1dfd5),
  white: material(0xf4f0df),
  green: material(0x648b56)
};

const box = (parent, width, height, depth, mat, x, y, z) => {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, depth),
    mat
  );
  mesh.position.set(x, y, z);
  parent.add(mesh);
  return mesh;
};

const cylinder = (parent, top, bottom, height, segments, mat, x, y, z) => {
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(top, bottom, height, segments),
    mat
  );
  mesh.position.set(x, y, z);
  parent.add(mesh);
  return mesh;
};

const makeTextTexture = (text, background, foreground, fontSize = 72) => {
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
};

// ----- Tiendita: escenario inicial -----

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(12, 10),
  mats.floor
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -0.06;
scene.add(floor);

for (let x = -5.5; x <= 5.5; x += 1) {
  box(scene, 0.018, 0.012, 9.8, mats.tile, x, 0.005, 0);
}
for (let z = -4.5; z <= 4.5; z += 1) {
  box(scene, 11.8, 0.012, 0.018, mats.tile, 0, 0.006, z);
}

// Paredes sin techo para conservar la vista superior.
box(scene, 12, 3.3, 0.22, mats.wall, 0, 1.65, -5);
box(scene, 0.22, 3.3, 10, mats.wall, -5.9, 1.65, 0);
box(scene, 0.22, 3.3, 10, mats.wall, 5.9, 1.65, 0);
box(scene, 12, 0.22, 0.2, mats.wallTrim, 0, 3.25, -4.88);

box(scene, 11.7, 0.18, 0.08, mats.wood, 0, 0.16, -4.77);
box(scene, 0.08, 0.18, 9.8, mats.wood, -5.76, 0.16, 0);
box(scene, 0.08, 0.18, 9.8, mats.wood, 5.76, 0.16, 0);

// Letrero de la tienda.
const sign = box(scene, 4.6, 0.78, 0.12, mats.red, 0, 2.65, -4.72);
const signText = new THREE.Mesh(
  new THREE.PlaneGeometry(4.3, 0.56),
  makeTextTexture("DON PEDRO", "#9f2929", "#fff1d7", 100)
);
signText.position.set(0, 2.65, -4.645);
scene.add(signText);

function createShelf(x, z, width = 2.45) {
  const shelf = new THREE.Group();
  shelf.position.set(x, 0, z);
  scene.add(shelf);

  box(shelf, 0.12, 1.78, 0.52, mats.wood, -width / 2, 0.95, 0);
  box(shelf, 0.12, 1.78, 0.52, mats.wood, width / 2, 0.95, 0);
  box(shelf, width, 0.12, 0.58, mats.woodLight, 0, 0.18, 0);
  box(shelf, width, 0.12, 0.58, mats.woodLight, 0, 0.77, 0);
  box(shelf, width, 0.12, 0.58, mats.woodLight, 0, 1.36, 0);
  box(shelf, width, 0.12, 0.58, mats.woodLight, 0, 1.91, 0);
  box(shelf, width, 1.78, 0.06, mats.wood, 0, 1.02, -0.24);

  const colors = [
    0xd84c38, 0xe7bf43, 0x477fa5, 0x6f9a55,
    0xb94b78, 0xe58a38, 0xe9e0c7, 0x754e9b
  ];
  const levels = [0.42, 1.01, 1.60];

  levels.forEach((level, row) => {
    for (let i = 0; i < 7; i += 1) {
      const itemWidth = 0.19 + (i % 3) * 0.025;
      const itemHeight = 0.22 + ((i + row) % 2) * 0.08;
      const item = box(
        shelf,
        itemWidth,
        itemHeight,
        0.22,
        material(colors[(i + row * 3) % colors.length]),
        -width / 2 + 0.25 + i * 0.32,
        level + itemHeight / 2,
        0.035
      );
      item.rotation.y = i % 2 ? 0.06 : -0.06;
    }
  });
}

createShelf(-2.25, -4.25, 2.5);
createShelf(2.45, -4.25, 2.7);
createShelf(5.15, -0.5, 0.75);

// Mostrador y caja provisional.
const counter = new THREE.Group();
counter.position.set(2.85, 0, 1.65);
scene.add(counter);
box(counter, 2.45, 0.95, 0.86, mats.wood, 0, 0.52, 0);
box(counter, 2.55, 0.13, 0.95, mats.woodLight, 0, 1.06, 0);
box(counter, 0.62, 0.35, 0.48, mats.dark, -0.58, 1.29, -0.05);
box(counter, 0.48, 0.06, 0.04, mats.green, -0.58, 1.48, -0.27);
box(counter, 0.3, 0.18, 0.28, mats.red, 0.65, 1.2, -0.08);

for (const x of [-3.2, 0, 3.2]) {
  cylinder(scene, 0.16, 0.16, 0.12, 8, mats.cream, x, 3.0, -1.8);
}

// Refrigerador rojo interactivo.
function createFridge() {
  const group = new THREE.Group();
  group.position.set(-4.55, 0, -3.72);
  scene.add(group);

  box(group, 1.42, 2.12, 0.92, mats.red, 0, 1.08, 0);
  box(group, 1.22, 1.91, 0.72, mats.dark, 0, 1.1, 0.12);

  const drinkColors = [0x3a8b55, 0xc93e32, 0xe3bd42, 0x4686bd, 0xf0e6d4];
  for (let row = 0; row < 3; row += 1) {
    box(group, 1.12, 0.045, 0.56, mats.woodLight, 0, 0.52 + row * 0.55, 0.13);
    for (let col = 0; col < 5; col += 1) {
      cylinder(
        group, 0.065, 0.065, 0.25, 6,
        material(drinkColors[(col + row) % drinkColors.length]),
        -0.43 + col * 0.215,
        0.68 + row * 0.55,
        0.16
      );
    }
  }

  const doorHinge = new THREE.Group();
  doorHinge.position.set(0.66, 1.1, 0.53);
  group.add(doorHinge);

  const door = new THREE.Group();
  door.position.set(-0.66, -0.02, 0);
  doorHinge.add(door);

  box(door, 1.32, 1.88, 0.1, mats.redLight, 0, 0, 0);
  box(door, 1.12, 1.65, 0.025, mats.glass, 0, 0.03, 0.065);
  box(door, 0.055, 0.55, 0.08, mats.cream, 0.55, -0.08, 0.11);

  const label = new THREE.Mesh(
    new THREE.PlaneGeometry(0.95, 0.2),
    makeTextTexture("COCA-COLA", "#9f2929", "#ffffff", 76)
  );
  label.position.set(0, 0.72, 0.091);
  door.add(label);

  group.userData.interactable = true;
  group.userData.kind = "fridge";
  group.userData.displayName = "Refrigerador";
  group.userData.doorHinge = doorHinge;
  group.userData.isOpen = false;
  group.userData.targetAngle = 0;
  return group;
}

const fridge = createFridge();
const interactables = [fridge];

// Don Pedro: modelo geométrico original y provisional.
const player = new THREE.Group();
scene.add(player);
player.position.set(0, 0, 2.8);

box(player, 0.58, 0.72, 0.36, mats.blue, 0, 1.03, 0);

// Rayas verticales de la camisa azul.
for (let i = -2; i <= 2; i += 1) {
  box(player, 0.018, 0.62, 0.012, mats.white, i * 0.105, 1.03, -0.188);
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

cylinder(player, 0.43, 0.48, 0.07, 9, mats.white, 0, 2.12, 0);
cylinder(player, 0.27, 0.34, 0.32, 9, mats.white, 0, 2.29, 0);
cylinder(player, 0.29, 0.29, 0.055, 9, mats.cream, 0, 2.17, 0);

// Banqueta y toldo sencillo.
box(scene, 12, 0.16, 2.2, mats.woodLight, 0, -0.12, 6.05);
box(scene, 12, 0.18, 0.32, mats.red, 0, 3.08, 4.9);
for (let i = 0; i < 8; i += 1) {
  box(scene, 0.72, 0.08, 0.35, i % 2 === 0 ? mats.cream : mats.redLight, -4.9 + i * 1.4, 3.19, 4.9);
}

// ----- Cámara híbrida: vista alta -> primera persona -----

let cameraZoom = 0.04;
let cameraYaw = 0;
let cameraTilt = 0;
let firstPerson = false;

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const forward = new THREE.Vector3();
const cameraTarget = new THREE.Vector3();
const desiredCameraPosition = new THREE.Vector3();

function updateCamera(delta) {
  const zoom = THREE.MathUtils.smoothstep(cameraZoom, 0, 1);
  const distance = THREE.MathUtils.lerp(12.5, 0.12, zoom);
  const height = THREE.MathUtils.lerp(9.2, 1.62, zoom);

  forward.set(-Math.sin(cameraYaw), 0, -Math.cos(cameraYaw));
  desiredCameraPosition.set(
    player.position.x + Math.sin(cameraYaw) * distance,
    height + cameraTilt,
    player.position.z + Math.cos(cameraYaw) * distance
  );

  cameraTarget.set(
    player.position.x + forward.x * THREE.MathUtils.lerp(0.15, 3.4, zoom),
    THREE.MathUtils.lerp(0.72, 1.58, zoom),
    player.position.z + forward.z * THREE.MathUtils.lerp(0.15, 3.4, zoom)
  );

  camera.position.lerp(desiredCameraPosition, 1 - Math.exp(-delta * 8));
  camera.lookAt(cameraTarget);

  const shouldUseFirstPerson = cameraZoom > 0.94;
  if (shouldUseFirstPerson !== firstPerson) {
    firstPerson = shouldUseFirstPerson;
    player.visible = !firstPerson;
    hint.textContent = firstPerson
      ? "P.O.V. · Mantén pulsado un objeto para interactuar"
      : "Vista de la tienda · Pellizca para acercarte";
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
  tryEnterFullscreen();
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

// ----- Gestos sobre el mundo -----

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

function tryEnterFullscreen() {
  if (document.fullscreenElement) return;
  const request = document.documentElement.requestFullscreen;
  if (typeof request === "function") {
    request.call(document.documentElement).catch(() => {
      // El navegador puede reservar la pantalla completa para una app instalada.
    });
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
  while (object && !object.userData.interactable) {
    object = object.parent;
  }
  return object || null;
}

function interactWith(object) {
  if (!object || !object.userData.interactable) return;

  const dx = player.position.x - object.position.x;
  const dz = player.position.z - object.position.z;
  if (Math.hypot(dx, dz) > 3.7) {
    showToast("Acércate un poco más para interactuar.");
    return;
  }

  if (object.userData.kind === "fridge") {
    object.userData.isOpen = !object.userData.isOpen;
    object.userData.targetAngle = object.userData.isOpen ? -1.18 : 0;
    showToast(object.userData.isOpen ? "Refrigerador abierto" : "Refrigerador cerrado");
    hint.textContent = "Refrigerador · Mantén pulsado para abrir o cerrar";
  }
}

function cancelHold() {
  if (holdTimer !== null) {
    window.clearTimeout(holdTimer);
    holdTimer = null;
  }
}

renderer.domElement.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  tryEnterFullscreen();

  activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
  try {
    renderer.domElement.setPointerCapture(event.pointerId);
  } catch (_) {
    // Algunos navegadores no permiten capturar todos los punteros táctiles.
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
      cameraZoom = clamp(pinchStartZoom + change * 0.8, 0, 1);
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
    cameraYaw -= dx * 0.006;
    cameraTilt = clamp(cameraTilt + dy * 0.008, -1.1, 1.1);
    lastLookX = event.clientX;
    lastLookY = event.clientY;
  }
});

function finishWorldPointer(event) {
  activePointers.delete(event.pointerId);
  if (activePointers.size < 2) pinchStartDistance = 0;

  if (event.pointerId === lookPointerId) {
    cancelHold();
    if (!holdTriggered && Math.hypot(event.clientX - lookStartX, event.clientY - lookStartY) < 9 && holdTarget) {
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

// Teclado opcional para probar la escena en computadora.
const keys = new Set();
window.addEventListener("keydown", (event) => keys.add(event.key.toLowerCase()));
window.addEventListener("keyup", (event) => keys.delete(event.key.toLowerCase()));

function movePlayer(delta) {
  let inputX = joystickState.x;
  let inputY = joystickState.y;

  if (keys.has("a") || keys.has("arrowleft")) inputX -= 1;
  if (keys.has("d") || keys.has("arrowright")) inputX += 1;
  if (keys.has("w") || keys.has("arrowup")) inputY -= 1;
  if (keys.has("s") || keys.has("arrowdown")) inputY += 1;

  const inputLength = Math.hypot(inputX, inputY);
  if (inputLength > 1) {
    inputX /= inputLength;
    inputY /= inputLength;
  }

  if (inputLength > 0.08) {
    const forwardX = -Math.sin(cameraYaw);
    const forwardZ = -Math.cos(cameraYaw);
    const rightX = Math.cos(cameraYaw);
    const rightZ = -Math.sin(cameraYaw);

    const moveX = rightX * inputX + forwardX * -inputY;
    const moveZ = rightZ * inputX + forwardZ * -inputY;
    const length = Math.hypot(moveX, moveZ) || 1;
    const speed = 3.1;

    player.position.x += (moveX / length) * speed * delta;
    player.position.z += (moveZ / length) * speed * delta;
    player.position.x = clamp(player.position.x, -4.75, 4.75);
    player.position.z = clamp(player.position.z, -3.95, 4.35);

    player.rotation.y = Math.atan2(-moveX, -moveZ);
  }
}

// ----- Bucle principal -----

const clock = new THREE.Clock();

function animate() {
  const delta = Math.min(clock.getDelta(), 0.04);

  movePlayer(delta);

  const currentAngle = fridge.userData.doorHinge.rotation.y;
  const targetAngle = fridge.userData.targetAngle;
  fridge.userData.doorHinge.rotation.y = THREE.MathUtils.damp(
    currentAngle,
    targetAngle,
    7,
    delta
  );

  updateCamera(delta);
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

function resize() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setSize(width, height);
}

window.addEventListener("resize", resize);
window.addEventListener("orientationchange", () => {
  window.setTimeout(resize, 120);
});

hint.textContent = "Joystick para caminar · Pellizca para acercarte · Mantén pulsado el refrigerador";
updateCamera(1);
animate();