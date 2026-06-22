import * as THREE from 'three';
import { ROOM_D, ROOM_H, ROOM_COUNT } from './Constants.js';

export function setupLighting(scene) {
  // IBL off — RoomEnv overhead blooms via metallic fixture disc even at 0.40; ambient+points carry fill
  scene.add(new THREE.AmbientLight(0xfff8f0, 0.48));

  // Per-room warm ceiling downlights
  for (let i = 0; i < ROOM_COUNT; i++) {
    const rz = ROOM_D * i + ROOM_D / 2;
    const fill = new THREE.PointLight(0xffe8c0, 1.0, 32, 2);
    fill.position.set(0, ROOM_H - 0.3, rz);
    scene.add(fill);
  }
}

export function addExhibitSpotlight(scene, sx, sy, sz, tx, ty, tz, roomIdx, angle = Math.PI / 8) {
  // Focused exhibit spot; angle defaults to 22.5° for wall frames.
  // Pass Math.PI/14 for straight-down pedestal spots to avoid flooding the centre aisle.
  const spot = new THREE.SpotLight(0xfff5e0, 2.8, 10, angle, 0.28, 2.0);
  spot.position.set(sx, sy, sz);
  spot.target.position.set(tx, ty, tz);
  spot.castShadow = false; // enabled per-room in main3d when player is nearby
  spot.shadow.mapSize.set(512, 512);
  spot.shadow.bias = -0.001;
  scene.add(spot);
  scene.add(spot.target);
  return spot;
}
