// js/3d/PostProcessing.js — EffectComposer pipeline
// Pass order: RenderPass → UnrealBloomPass → FXAAPass → GammaCorrection
//
// Design note: We do NOT use OutputPass because it reads renderer.toneMapping each
// frame and applies it — but PBR material shaders (MeshStandardMaterial) ALSO apply
// renderer.toneMapping, causing double-ACES tone mapping on accurate GPUs (Metal).
// Instead: renderer.toneMapping = ACESFilmic handles TM in PBR shaders, and
// GammaCorrectionShader handles the sRGB gamma conversion as the final pass.
import * as THREE from 'three';
import { EffectComposer }      from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass }          from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass }     from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass }          from 'three/addons/postprocessing/ShaderPass.js';
import { FXAAShader }          from 'three/addons/shaders/FXAAShader.js';
import { GammaCorrectionShader } from 'three/addons/shaders/GammaCorrectionShader.js';

export function buildComposer(renderer, scene, camera) {
  const W = renderer.domElement.width;
  const H = renderer.domElement.height;

  const composer = new EffectComposer(renderer);

  // 1. Beauty pass
  composer.addPass(new RenderPass(scene, camera));

  // 2. Bloom — subtle halo for any scene highlights above threshold
  // emissiveIntensity is now below threshold (0.45 < 0.88) so the disc glows
  // warmly without causing mip-pyramid spill across the viewport.
  const bloom = new UnrealBloomPass(
    new THREE.Vector2(W, H),
    0.15,   // strength — subtle
    0.20,   // radius
    0.88    // threshold
  );
  composer.addPass(bloom);

  // 3. FXAA — anti-aliasing on the composited image
  const fxaa = new ShaderPass(FXAAShader);
  fxaa.material.uniforms['resolution'].value.set(1 / W, 1 / H);
  composer.addPass(fxaa);

  // 4. sRGB gamma conversion (replaces OutputPass to avoid double tone mapping)
  const gamma = new ShaderPass(GammaCorrectionShader);
  composer.addPass(gamma);

  return { composer, bloom, fxaa };
}

export function resizeComposer(composerBundle, W, H) {
  const { composer, bloom, fxaa } = composerBundle;
  composer.setSize(W, H);
  bloom.resolution.set(W, H);
  fxaa.material.uniforms['resolution'].value.set(1 / W, 1 / H);
}
