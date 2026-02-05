import * as THREE from 'three';

export function createCube() {
  const geometry = new THREE.BoxGeometry(1.8, 1.8, 1.8);
  const material = new THREE.MeshStandardMaterial({
    color: 0xff3366,
    metalness: 0.15,
    roughness: 0.65,
  });
  return new THREE.Mesh(geometry, material);
}

export function createFloor() {
  const geometry = new THREE.PlaneGeometry(40, 40);
  const material = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = -1.2;
  mesh.receiveShadow = true;
  return mesh;
}