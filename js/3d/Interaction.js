import * as THREE from 'three';
import { openPanel } from '../panel.js';
import { getExhibitById } from '../../data/exhibits.js';
import { STRAND_COLORS } from './Constants.js';

const REACH = 7.5;

export class Interaction {
  constructor(camera, exhibitMeshes, scene, fpControls) {
    this.camera        = camera;
    this.exhibitMeshes = exhibitMeshes;
    this.scene         = scene;
    this.controls      = fpControls;
    this.raycaster     = new THREE.Raycaster();
    this.raycaster.far = REACH;
    this.hoveredId     = null;
    this._lines        = [];
    this._hoverLabel   = document.getElementById('hover-label');

    document.addEventListener('pointerdown', e => {
      if (e.button === 0 && this.controls.isLocked && this.hoveredId) {
        this._activate(this.hoveredId);
      }
    });
  }

  update() {
    this.raycaster.setFromCamera({ x: 0, y: 0 }, this.camera);
    const meshes = [...this.exhibitMeshes.values()].map(v => v.mesh);
    const hits   = this.raycaster.intersectObjects(meshes, false);

    const newId = hits.length > 0 ? hits[0].object.userData.exhibitId : null;

    if (newId !== this.hoveredId) {
      if (this.hoveredId) this._setHover(this.hoveredId, false);
      this.hoveredId = newId;
      if (newId) {
        this._setHover(newId, true);
        this._showLabel(newId);
      } else {
        this._hideLabel();
      }
    }
  }

  clearInfluenceLines() {
    this._lines.forEach(l => {
      this.scene.remove(l);
      l.geometry.dispose();
      l.material.dispose();
    });
    this._lines = [];
  }

  _activate(id) {
    const exhibit = getExhibitById(id);
    if (!exhibit) return;
    this.controls.unlock();
    openPanel(exhibit);
    this._drawInfluenceLines(id, exhibit);
  }

  _drawInfluenceLines(id, exhibit) {
    this.clearInfluenceLines();
    const srcData = this.exhibitMeshes.get(id);
    if (!srcData) return;

    const srcPos = new THREE.Vector3();
    srcData.mesh.getWorldPosition(srcPos);
    srcPos.y += 0.2;

    exhibit.influences.forEach(targetId => {
      const tgt = this.exhibitMeshes.get(targetId);
      if (!tgt) return;
      const tgtPos = new THREE.Vector3();
      tgt.mesh.getWorldPosition(tgtPos);
      tgtPos.y += 0.2;

      const mid = srcPos.clone().lerp(tgtPos, 0.5);
      mid.y += 1.5;
      const curve   = new THREE.QuadraticBezierCurve3(srcPos, mid, tgtPos);
      const points  = curve.getPoints(20);
      const geo     = new THREE.BufferGeometry().setFromPoints(points);
      const mat     = new THREE.LineBasicMaterial({
        color: STRAND_COLORS[exhibit.strand] || 0x888888,
        transparent: true,
        opacity: 0.55,
      });
      const line = new THREE.Line(geo, mat);
      this.scene.add(line);
      this._lines.push(line);
    });
  }

  _setHover(id, hover) {
    const d = this.exhibitMeshes.get(id);
    if (!d) return;
    const mat = d.mesh.material;

    if (mat.isMeshStandardMaterial) {
      // Emissive highlight — correct PBR path for MeshStandardMaterial
      mat.emissive.set(hover ? 0x1a1205 : 0x000000);
      mat.emissiveIntensity = hover ? 1.4 : 0;
    } else {
      // MeshBasicMaterial (artwork inner plane) — brighten via color
      if (!d._baseColor) d._baseColor = mat.color.clone();
      mat.color.copy(d._baseColor);
      if (hover) mat.color.multiplyScalar(1.35);
    }
  }

  _showLabel(id) {
    const d = this.exhibitMeshes.get(id);
    if (!d || !this._hoverLabel) return;
    const name = d.exhibit.name.split(' — ')[0];
    this._hoverLabel.textContent = `${name}  ·  ${d.exhibit.date}`;
    this._hoverLabel.hidden = false;
  }

  _hideLabel() {
    if (this._hoverLabel) this._hoverLabel.hidden = true;
  }
}
