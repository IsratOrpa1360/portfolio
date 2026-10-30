/**
 * js/three-scene.js — 3D Thinking Girl ("tik-tik") & Hanging Lamp in Current Focus
 * Uses the exact Minimalist Champagne-Bronze, Warm Stone & Graphite materials
 * from the user's reference file (`1557feec.html`).
 */

(function () {
  'use strict';

  window.OrpaLampController = {
    lampIsOn: true,
    cordPullVelocity: 0,
    cordExtension: 0,
    thoughtSparkBoost: 0,
    tickCounter: 1,
    updateThemeColors: null,
    triggerPull: null,
    boostThought: null
  };

  const THOUGHT_FORMULAS = [
    '∫ f(x)dx · CNN · Logic',
    'tik-tik · Eigenvalues',
    'Scalp Image → DL Stage',
    '4x4 Keypad · Counter',
    'Data Structures · Graphs'
  ];

  function updateLampDOMState() {
    const isLit = window.OrpaLampController.lampIsOn;
    const body = document.body;
    const headerLabel = document.getElementById('headerLampLabel');
    const headerDot = document.getElementById('headerLampDot');
    const heroBadge = document.getElementById('heroPowerBadge');
    const aboutPullText = document.getElementById('aboutPullBtnText');
    const lampOffBanner = document.getElementById('lampOffBanner');
    const narrativeStatus = document.getElementById('sceneNarrativeStatus');
    const tiktikReadout = document.getElementById('tiktikLiveReadout');

    if (isLit) {
      body.classList.remove('lamp-off');
      body.classList.add('lamp-on');
      if (headerLabel) headerLabel.textContent = 'Lamp: ON';
      if (headerDot) headerDot.className = 'w-2 h-2 rounded-full bg-emerald-400';
      if (heroBadge) heroBadge.textContent = 'RUNNING · LIT';
      if (aboutPullText) aboutPullText.textContent = 'Pull Lamp Cord';
      if (lampOffBanner) lampOffBanner.classList.add('hidden');
      if (narrativeStatus) narrativeStatus.textContent = 'Lamp Lit';
      if (tiktikReadout) tiktikReadout.textContent = 'tik-tik: active';
    } else {
      body.classList.remove('lamp-on');
      body.classList.add('lamp-off');
      if (headerLabel) headerLabel.textContent = 'Lamp: OFF';
      if (headerDot) headerDot.className = 'w-2 h-2 rounded-full bg-gray-500';
      if (heroBadge) heroBadge.textContent = 'STANDBY · DIM';
      if (aboutPullText) aboutPullText.textContent = 'Turn Lamp ON';
      if (lampOffBanner) lampOffBanner.classList.remove('hidden');
      if (narrativeStatus) narrativeStatus.textContent = 'Standby';
      if (tiktikReadout) tiktikReadout.textContent = 'tik-tik: quiet';
    }
  }

  window.OrpaLampController.triggerPull = function (forceState) {
    const ctrl = window.OrpaLampController;
    ctrl.lampIsOn = typeof forceState === 'boolean' ? forceState : !ctrl.lampIsOn;
    ctrl.cordPullVelocity = 0.52;
    ctrl.thoughtSparkBoost = 1.0;
    if (typeof window.playOrpaSound === 'function') {
      window.playOrpaSound('lampSwitch');
    }
    updateLampDOMState();
    if (typeof window.showOrpaToast === 'function') {
      window.showOrpaToast(
        ctrl.lampIsOn
          ? 'Lamp cord pulled: Portfolio illumination active.'
          : 'Lamp cord pulled: Standby mode active.'
      );
    }
  };

  window.OrpaLampController.boostThought = function () {
    const ctrl = window.OrpaLampController;
    ctrl.thoughtSparkBoost = 1.5;
    ctrl.tickCounter++;
    const formulaEl = document.getElementById('thoughtFormulaText');
    if (formulaEl) {
      formulaEl.textContent = THOUGHT_FORMULAS[ctrl.tickCounter % THOUGHT_FORMULAS.length];
    }
    if (typeof window.playOrpaSound === 'function') {
      window.playOrpaSound('tick');
    }
    if (typeof window.showOrpaToast === 'function') {
      window.showOrpaToast('Analytical thought pulse triggered.');
    }
  };

  setInterval(() => {
    const ctrl = window.OrpaLampController;
    if (!ctrl.lampIsOn) return;
    ctrl.tickCounter++;
    const leftWord = document.getElementById('tiktikWordLeft');
    const counterText = document.getElementById('tiktikCounterText');
    const formulaText = document.getElementById('thoughtFormulaText');
    if (leftWord) leftWord.textContent = (ctrl.tickCounter % 2 === 0) ? 'TIK... tik...' : 'tik... TIK...';
    if (counterText) counterText.textContent = `Pulse #${String(ctrl.tickCounter).padStart(2, '0')}`;
    if (formulaText && ctrl.tickCounter % 4 === 0) {
      formulaText.textContent = THOUGHT_FORMULAS[(ctrl.tickCounter / 4) % THOUGHT_FORMULAS.length | 0];
    }
    if (typeof window.playOrpaSound === 'function') {
      window.playOrpaSound('tick');
    }
  }, 900);

  window.initOrpaThreeScene = function () {
    updateLampDOMState();
    const wrapper = document.getElementById('threeCanvasWrapper');
    const canvas = document.getElementById('aboutThreeCanvas');
    if (!wrapper || !canvas || typeof THREE === 'undefined') return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, wrapper.clientWidth / wrapper.clientHeight, 0.1, 100);
    camera.position.set(0.15, 1.45, 6.1);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(wrapper.clientWidth, wrapper.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    const ambientLight = new THREE.AmbientLight(0xd4b483, 1.2);
    scene.add(ambientLight);

    const rimLight = new THREE.DirectionalLight(0xe6cfa7, 0.9);
    rimLight.position.set(-3, 4, -2);
    scene.add(rimLight);

    const lampPointLight = new THREE.PointLight(0xe6cfa7, 3.2, 12, 1.5);
    lampPointLight.position.set(1.1, 2.3, 0.4);
    scene.add(lampPointLight);

    const diorama = new THREE.Group();
    scene.add(diorama);

    // Minimalist Champagne-Bronze & Graphite Materials from 1557feec.html
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x1a1917, roughness: 0.45, metalness: 0.5 });
    const bronzeMat = new THREE.MeshStandardMaterial({ color: 0xb89463, roughness: 0.3, metalness: 0.8 });
    const champagneGoldMat = new THREE.MeshStandardMaterial({
      color: 0xd4b483,
      emissive: 0x8c6239,
      emissiveIntensity: 0.35,
      roughness: 0.25,
      metalness: 0.85
    });
    const bulbGlowMat = new THREE.MeshStandardMaterial({
      color: 0xfffbeb,
      emissive: 0xe6cfa7,
      emissiveIntensity: 1.8,
      roughness: 0.1
    });
    const charSilhouetteMat = new THREE.MeshStandardMaterial({
      color: 0x292724,
      roughness: 0.45,
      metalness: 0.2
    });

    window.OrpaLampController.updateThemeColors = function (theme) {
      if (theme === 'light') {
        baseMat.color.setHex(0xd6cfc2);
        charSilhouetteMat.color.setHex(0x4a453e);
        ambientLight.intensity = 1.65;
      } else {
        baseMat.color.setHex(0x1a1917);
        charSilhouetteMat.color.setHex(0x292724);
        ambientLight.intensity = 1.15;
      }
    };

    const basePlatform = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2.65, 0.16, 48), baseMat);
    basePlatform.position.y = -1.2;
    diorama.add(basePlatform);

    const baseRing = new THREE.Mesh(new THREE.TorusGeometry(2.58, 0.025, 16, 64), champagneGoldMat);
    baseRing.rotation.x = Math.PI / 2;
    baseRing.position.y = -1.12;
    diorama.add(baseRing);

    const deskTop = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.07, 0.9), baseMat);
    deskTop.position.set(-0.2, -0.25, 0.5);
    diorama.add(deskTop);

    const girlGroup = new THREE.Group();
    girlGroup.position.set(-0.25, -0.15, -0.05);
    diorama.add(girlGroup);

    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.35, 1.0, 24), charSilhouetteMat);
    torso.position.y = 0.25;
    girlGroup.add(torso);

    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.03, 12, 32), champagneGoldMat);
    collar.rotation.x = Math.PI / 2;
    collar.position.y = 0.72;
    girlGroup.add(collar);

    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.15, 0.05);
    girlGroup.add(headGroup);

    const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.3, 32, 32), charSilhouetteMat);
    headGroup.add(headMesh);

    const hairBun = new THREE.Mesh(new THREE.SphereGeometry(0.15, 20, 20), baseMat);
    hairBun.position.set(-0.08, 0.25, -0.25);
    headGroup.add(hairBun);

    const leftLens = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.011, 10, 24), champagneGoldMat);
    leftLens.position.set(-0.095, 0.02, 0.28);
    headGroup.add(leftLens);

    const rightLens = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.011, 10, 24), champagneGoldMat);
    rightLens.position.set(0.095, 0.02, 0.28);
    headGroup.add(rightLens);

    const rightArmGroup = new THREE.Group();
    rightArmGroup.position.set(-0.3, 0.66, 0.05);
    girlGroup.add(rightArmGroup);

    const rightForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.05, 0.5, 16), charSilhouetteMat);
    rightForearm.position.set(0.05, 0.02, 0.32);
    rightForearm.rotation.z = 0.55;
    rightForearm.rotation.x = -0.5;
    rightArmGroup.add(rightForearm);

    const thinkingHand = new THREE.Mesh(new THREE.SphereGeometry(0.07, 16, 16), champagneGoldMat);
    thinkingHand.position.set(0.17, 0.23, 0.25);
    rightArmGroup.add(thinkingHand);

    const leftArmGroup = new THREE.Group();
    leftArmGroup.position.set(0.3, 0.66, 0.05);
    girlGroup.add(leftArmGroup);

    const leftUpperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.06, 0.62, 16), charSilhouetteMat);
    leftUpperArm.position.set(0.3, 0.08, 0.1);
    leftUpperArm.rotation.z = -1.15;
    leftArmGroup.add(leftUpperArm);

    const leftForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.05, 0.6, 16), charSilhouetteMat);
    leftForearm.position.set(0.8, 0.22, 0.2);
    leftForearm.rotation.z = -1.35;
    leftArmGroup.add(leftForearm);

    const pullingHand = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 16), champagneGoldMat);
    pullingHand.position.set(1.1, 0.27, 0.24);
    leftArmGroup.add(pullingHand);

    const tiktikGroup = new THREE.Group();
    tiktikGroup.position.set(-0.65, 1.35, 0.1);
    girlGroup.add(tiktikGroup);

    const clockRing = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.02, 14, 36), champagneGoldMat);
    tiktikGroup.add(clockRing);

    const clockSecondHand = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.2, 0.02), bulbGlowMat);
    clockSecondHand.position.y = 0.07;
    const secondPivot = new THREE.Group();
    secondPivot.add(clockSecondHand);
    tiktikGroup.add(secondPivot);

    const lampGroup = new THREE.Group();
    lampGroup.position.set(0.85, 0, 0.2);
    diorama.add(lampGroup);

    const lampPole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.055, 3.8, 20), bronzeMat);
    lampPole.position.set(0.62, 0.62, -0.22);
    lampGroup.add(lampPole);

    const lampTopArm = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.82, 16), bronzeMat);
    lampTopArm.position.set(0.28, 2.48, -0.1);
    lampTopArm.rotation.z = Math.PI / 2;
    lampGroup.add(lampTopArm);

    const lampShade = new THREE.Mesh(
      new THREE.ConeGeometry(0.48, 0.44, 32, 1, true),
      new THREE.MeshStandardMaterial({ color: 0x22201d, side: THREE.DoubleSide, roughness: 0.35, metalness: 0.7 })
    );
    lampShade.position.set(0, 2.2, 0);
    lampGroup.add(lampShade);

    const lampBulb = new THREE.Mesh(new THREE.SphereGeometry(0.15, 24, 24), bulbGlowMat);
    lampBulb.position.set(0, 2.04, 0);
    lampGroup.add(lampBulb);

    const lightConeMat = new THREE.MeshBasicMaterial({
      color: 0xe6cfa7,
      transparent: true,
      opacity: 0.12,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const lightCone = new THREE.Mesh(new THREE.ConeGeometry(1.45, 3.0, 32, 1, true), lightConeMat);
    lightCone.position.set(0, 0.45, 0);
    lampGroup.add(lightCone);

    const cordGroup = new THREE.Group();
    cordGroup.position.set(0, 1.96, 0);
    lampGroup.add(cordGroup);

    const cordLine = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.013, 1.3, 12), champagneGoldMat);
    cordLine.position.y = -0.65;
    cordGroup.add(cordLine);

    const cordHandle = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.16, 16), bulbGlowMat);
    cordHandle.position.y = -1.3;
    cordGroup.add(cordHandle);

    let isDragging = false;
    let pointerDownX = 0;
    let pointerDownY = 0;
    let targetRotY = -0.16;

    wrapper.addEventListener('pointerdown', (e) => {
      isDragging = true;
      pointerDownX = e.clientX;
      pointerDownY = e.clientY;
    });
    window.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      targetRotY += (e.clientX - pointerDownX) * 0.005;
      pointerDownX = e.clientX;
    });
    window.addEventListener('pointerup', (e) => {
      if (!isDragging) return;
      isDragging = false;
      if (Math.hypot(e.clientX - pointerDownX, e.clientY - pointerDownY) < 6 && e.target === canvas) {
        window.OrpaLampController.triggerPull();
      }
    });

    const resetBtn = document.getElementById('resetCameraBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        targetRotY = -0.16;
        if (typeof window.showOrpaToast === 'function') window.showOrpaToast('3D View Reset');
      });
    }

    window.addEventListener('resize', () => {
      if (!wrapper) return;
      camera.aspect = wrapper.clientWidth / wrapper.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(wrapper.clientWidth, wrapper.clientHeight);
    });

    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    window.OrpaLampController.updateThemeColors(currentTheme);

    const clock = new THREE.Clock();
    function animate() {
      requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      const ctrl = window.OrpaLampController;

      diorama.rotation.y += (targetRotY - diorama.rotation.y) * 0.08;

      ctrl.cordExtension += ctrl.cordPullVelocity;
      ctrl.cordPullVelocity -= ctrl.cordExtension * 0.18;
      ctrl.cordPullVelocity *= 0.78;
      if (Math.abs(ctrl.cordExtension) < 0.001 && Math.abs(ctrl.cordPullVelocity) < 0.001) {
        ctrl.cordExtension = 0;
        ctrl.cordPullVelocity = 0;
      }

      cordGroup.position.y = 1.96 - Math.max(0, ctrl.cordExtension * 0.45);
      leftArmGroup.rotation.z = -Math.max(0, ctrl.cordExtension * 0.42);

      headGroup.rotation.z = Math.sin(t * 1.5) * 0.06 + 0.04;
      headGroup.rotation.y = Math.cos(t * 1.1) * 0.08 + 0.1;

      const discreteHalfSec = Math.floor(t * 2.2);
      secondPivot.rotation.z = -discreteHalfSec * (Math.PI / 6);
      tiktikGroup.position.y = 1.35 + Math.sin(t * 2.2) * 0.025;

      if (ctrl.thoughtSparkBoost > 0.01) ctrl.thoughtSparkBoost *= 0.94;

      const targetLight = ctrl.lampIsOn ? 3.2 : 0.15;
      lampPointLight.intensity += (targetLight - lampPointLight.intensity) * 0.12;
      bulbGlowMat.emissiveIntensity = ctrl.lampIsOn ? 1.9 : 0.15;
      lightConeMat.opacity = ctrl.lampIsOn ? (0.12 + Math.sin(t * 3) * 0.015) : 0.01;

      renderer.render(scene, camera);
    }

    animate();

    setTimeout(() => {
      window.OrpaLampController.cordPullVelocity = 0.45;
      window.OrpaLampController.thoughtSparkBoost = 1.0;
    }, 750);
  };
})();
