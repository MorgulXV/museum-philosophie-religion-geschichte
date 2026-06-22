import * as THREE from 'three';

export function setupLighting(scene) {
  // 3 lights replacing 44 (was: AmbientLight + 5 PointLights + 39 exhibit SpotLights).
  // AmbientLight and HemisphereLight add zero per-fragment BRDF cost.
  // The single DirectionalLight does 1 BRDF evaluation per lit fragment with no
  // per-fragment distance attenuation — cheapest possible directional shading.
  scene.add(new THREE.AmbientLight(0xfff8f0, 0.45));
  scene.add(new THREE.HemisphereLight(0xfff5d0, 0x0d0d1a, 0.65));  // warm ceiling, dark floor
  const key = new THREE.DirectionalLight(0xfff0d0, 1.0);
  key.position.set(0.5, 1, 0.3);
  scene.add(key);
}
