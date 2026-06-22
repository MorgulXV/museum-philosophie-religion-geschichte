import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { ROOM_W, ROOM_D, ROOM_COUNT, TOTAL_D, DOOR_W } from './Constants.js';

const SPEED      = 5.0;
const EYE_Y      = 1.7;
const WALL_MARG  = 0.42;
const DOOR_MARG  = 0.32;
const DIV_RADIUS = 0.85; // z-range around a divider where X is constrained

export class FPControls {
  constructor(camera, domElement) {
    // Set position and direction BEFORE PLC reads the camera quaternion
    camera.position.set(0, EYE_Y, 5);
    camera.lookAt(0, EYE_Y, 100);

    this._plc = new PointerLockControls(camera, domElement);
    this.camera = camera;
    this._keys  = new Set();

    document.addEventListener('keydown', e => this._keys.add(e.code));
    document.addEventListener('keyup',   e => this._keys.delete(e.code));
  }

  get isLocked() { return this._plc.isLocked; }
  lock()   { this._plc.lock(); }
  unlock() { this._plc.unlock(); }

  addEventListener(t, fn)    { this._plc.addEventListener(t, fn); }
  removeEventListener(t, fn) { this._plc.removeEventListener(t, fn); }

  update(dt) {
    if (!this._plc.isLocked) return;

    const k = this._keys;
    const fwd   = (k.has('KeyW') || k.has('ArrowUp')    ? 1 : 0) - (k.has('KeyS') || k.has('ArrowDown')  ? 1 : 0);
    const right = (k.has('KeyD') || k.has('ArrowRight') ? 1 : 0) - (k.has('KeyA') || k.has('ArrowLeft')  ? 1 : 0);

    const prevX = this.camera.position.x;
    const prevZ = this.camera.position.z;

    if (fwd !== 0)   this._plc.moveForward(fwd   * SPEED * dt);
    if (right !== 0) this._plc.moveRight(right   * SPEED * dt);

    this.camera.position.y = EYE_Y;

    const resolved = this._collide(this.camera.position.x, this.camera.position.z, prevX, prevZ);
    this.camera.position.x = resolved.x;
    this.camera.position.z = resolved.z;
  }

  _collide(nx, nz, px, pz) {
    nz = Math.max(0.45, Math.min(TOTAL_D - 0.45, nz));

    const halfW    = ROOM_W / 2 - WALL_MARG;
    const doorHalf = DOOR_W / 2 - DOOR_MARG;

    for (let i = 1; i < ROOM_COUNT; i++) {
      const wz = ROOM_D * i;
      const near    = Math.abs(nz - wz) < DIV_RADIUS;
      const crossing = (px < wz) !== (nz < wz);

      if (near) {
        if (crossing && Math.abs(nx) > doorHalf) {
          nz = pz; // block: not in doorway
        } else {
          nx = Math.max(-doorHalf, Math.min(doorHalf, nx)); // constrain X at doorway
        }
        break;
      }
    }

    nx = Math.max(-halfW, Math.min(halfW, nx));
    return { x: nx, z: nz };
  }

  getRoomIndex() {
    return Math.max(0, Math.min(ROOM_COUNT - 1, Math.floor(this.camera.position.z / ROOM_D)));
  }
}
