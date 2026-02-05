// src/experience/controls.ts
import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';

interface ControlsOptions {
  domElement: HTMLElement;
  camera: THREE.Camera;
  floor: THREE.Object3D;
  collidableObjects: THREE.Object3D[];
  initialPosition?: THREE.Vector3;
}

export function createControls(options: ControlsOptions) {
  const { domElement, camera, floor, collidableObjects, initialPosition = new THREE.Vector3(0, 1.6, 10) } = options;

  const controls = new PointerLockControls(camera, domElement);

  // Position the camera directly (no wrapper object anymore)
  camera.position.copy(initialPosition);

  // State
  const move = { forward: false, backward: false, left: false, right: false };

  const velocity = new THREE.Vector3();
  const direction = new THREE.Vector3();

  const moveSpeed = 14;
  const friction = 10;

  let isLocked = false;

  // ── Pointer Lock ─────────────────────────────────────────
  const tryLock = () => {
    if (isLocked) return;
    console.log("→ Trying to lock pointer...");
    (controls.lock() as unknown as Promise<void>).catch(err => {
      console.warn("Pointer lock rejected:", err?.name || err);
    });
  };

  const onLock = () => {
    isLocked = true;
    console.log("→ Pointer locked – mouse look active");
    document.getElementById("blocker")?.classList.add("hidden");
  };

  const onUnlock = () => {
    isLocked = false;
    console.log("→ Pointer unlocked");
    document.getElementById("blocker")?.classList.remove("hidden");
  };

  controls.addEventListener("lock", onLock);
  controls.addEventListener("unlock", onUnlock);
  domElement.addEventListener("click", tryLock);

  // ── Keyboard ─────────────────────────────────────────────
  const onKeyDown = (e: KeyboardEvent) => {
    switch (e.code) {
      case "KeyW": move.forward  = true; break;
      case "KeyS": move.backward = true; break;
      case "KeyA": move.left     = true; break;
      case "KeyD": move.right    = true; break;
    }
  };

  const onKeyUp = (e: KeyboardEvent) => {
    switch (e.code) {
      case "KeyW": move.forward  = false; break;
      case "KeyS": move.backward = false; break;
      case "KeyA": move.left     = false; break;
      case "KeyD": move.right    = false; break;
    }
  };

  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("keyup", onKeyUp);

  // ── Update ───────────────────────────────────────────────
  function update() {
    const delta = 1 / 60; // fixed timestep

    // Friction
    velocity.x *= Math.pow(0.1, delta * friction);
    velocity.z *= Math.pow(0.1, delta * friction);

    // Input → velocity (in local space)
    direction.set(0, 0, 0);
    if (move.forward)  direction.z -= 1;
    if (move.backward) direction.z += 1;
    if (move.left)     direction.x -= 1;
    if (move.right)    direction.x += 1;

    if (direction.lengthSq() > 0) {
      direction.normalize();
      const localDir = new THREE.Vector3(direction.x, 0, direction.z);
      localDir.applyQuaternion(camera.quaternion); // respect camera rotation

      velocity.x = localDir.x * moveSpeed;
      velocity.z = localDir.z * moveSpeed;
    }

    // Forward-only collision (allow backward/strafe even when close)
    let canMoveForward = true;

    if (move.forward) {
      const forwardDir = new THREE.Vector3();
      controls.getDirection(forwardDir);
      const ray = new THREE.Raycaster(camera.position, forwardDir, 0, 1.4);

      const hits = ray.intersectObjects(collidableObjects);
      if (hits.length > 0 && hits[0].distance < 1.2) {
        canMoveForward = false;
      }
    }

    // Apply movement
    if (canMoveForward || !move.forward) {
      camera.translateX(velocity.x * delta);
      camera.translateZ(velocity.z * delta);
    }

    // Optional floor snap (no gravity, just keep at eye height if close)
    const downRay = new THREE.Raycaster(camera.position, new THREE.Vector3(0, -1, 0), 0, 5);
    const hits = downRay.intersectObject(floor);

    if (hits.length > 0) {
      const dist = hits[0].distance;
      if (dist < 0.3 && dist > 0.01) {
        camera.position.y = hits[0].point.y + 1.6;
      }
    }
  }

  return {
    update,
    lock: tryLock,
    unlock: () => controls.unlock(),
    isLocked: () => isLocked,
    dispose: () => {
      controls.dispose();
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keyup", onKeyUp);
      domElement.removeEventListener("click", tryLock);
      controls.removeEventListener("lock", onLock);
      controls.removeEventListener("unlock", onUnlock);
    },
  };
}