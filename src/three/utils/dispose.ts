import * as THREE from 'three';

export function dispose(scene: THREE.Scene, renderer: THREE.WebGLRenderer) {
  scene.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.geometry?.dispose();
      if (Array.isArray(child.material)) {
        child.material.forEach(m => m.dispose());
      } else {
        child.material?.dispose();
      }
    }
  });
  renderer.dispose();
}