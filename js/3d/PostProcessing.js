// js/3d/PostProcessing.js — EffectComposer pipeline
// Pass order: RenderPass → FXAAPass → GammaCorrection
//
// Design note: We do NOT use OutputPass because it reads renderer.toneMapping each
// frame and applies it — but PBR material shaders (MeshStandardMaterial) ALSO apply
// renderer.toneMapping, causing double-ACES tone mapping on accurate GPUs (Metal).
// Instead: renderer.toneMapping = ACESFilmic handles TM in PBR shaders, and
// GammaCorrectionShader handles the sRGB gamma conversion as the final pass.
import { EffectComposer }      from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass }          from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass }          from 'three/addons/postprocessing/ShaderPass.js';
import { FXAAShader }          from 'three/addons/shaders/FXAAShader.js';
import { GammaCorrectionShader } from 'three/addons/shaders/GammaCorrectionShader.js';

export function buildComposer(renderer, scene, camera) {
  const W = renderer.domElement.width;
  const H = renderer.domElement.height;

  const composer = new EffectComposer(renderer);

  // 1. Beauty pass
  composer.addPass(new RenderPass(scene, camera));

  // 2. FXAA — anti-aliasing on the composited image
  const fxaa = new ShaderPass(FXAAShader);
  fxaa.material.uniforms['resolution'].value.set(1 / W, 1 / H);
  composer.addPass(fxaa);

  // 3. sRGB gamma conversion (replaces OutputPass to avoid double tone mapping)
  const gamma = new ShaderPass(GammaCorrectionShader);
  composer.addPass(gamma);

  return { composer, fxaa };
}

export function resizeComposer(composerBundle, W, H) {
  const { composer, fxaa } = composerBundle;
  composer.setSize(W, H);
  fxaa.material.uniforms['resolution'].value.set(1 / W, 1 / H);
}
