// src/experience/index.ts
import * as THREE from 'three';

import { createCamera } from './core/createCamera';
import { createRenderer } from './core/createRenderer';
import { createScene } from './core/createScene';
import { dispose } from './utils/dispose';
import { setupResize } from './utils/resize';

import { createControls } from './core/controls'; // ← new import
import { createCube, createFloor } from './objects/basic';

export function createVirtualView(container: HTMLElement) {
  const scene = createScene();
  const camera = createCamera(container.clientWidth / container.clientHeight);
  const renderer = createRenderer(container);

  const clock = new THREE.Clock();
  let rafId: number | null = null;

  // ── Build your scene ──
  const cube = createCube();
  const floor = createFloor();
  scene.add(cube, floor);

  // Lights
  scene.add(new THREE.AmbientLight(0xffffff, 0.7));
  const sun = new THREE.DirectionalLight(0xfff8e1, 1.8);
  sun.position.set(6, 12, 8);
  sun.castShadow = true;
  scene.add(sun);

  // ── Obstacles / collidable objects ──
  // Add more walls/boxes here later
  const collidableObjects: THREE.Object3D[] = [];

  // Example: add a test wall to collide with
  const wallGeo = new THREE.BoxGeometry(4, 5, 1);
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x777777 });
  const wall = new THREE.Mesh(wallGeo, wallMat);
  wall.position.set(8, 2.5, 0);
  wall.castShadow = true;
  wall.receiveShadow = true;
  scene.add(wall);
  collidableObjects.push(wall);

  // ── First-person controls (WASD + mouse look) ──
  const controlsModule = createControls({
    domElement: renderer.domElement,
    camera,
    floor,
    collidableObjects,
    initialPosition: new THREE.Vector3(0, 0, 5), // start a bit further back
  });

  // Animation loop
  const animate = () => {
    rafId = requestAnimationFrame(animate);

    // Update first-person controls (movement, look, gravity, collision)
    controlsModule.update();

    // Example object animation
    cube.rotation.y += clock.getDelta() * 0.38;

    renderer.render(scene, camera);
  };
  animate();

  // Resize handling
  const cleanupResize = setupResize(container, camera, renderer);

  // Public API
  return {
    destroy: () => {
      if (rafId) cancelAnimationFrame(rafId);
      controlsModule.dispose();
      cleanupResize();
      dispose(scene, renderer);
      renderer.domElement.remove();
    },
  };
}