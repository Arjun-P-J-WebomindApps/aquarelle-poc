import * as THREE from 'three';

export function createCamera(aspect: number) {
  const camera = new THREE.PerspectiveCamera(55, aspect, 0.1, 200);
  camera.position.set(0, 1.6, 7);
  return camera;
}