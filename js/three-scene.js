/**
 * js/three-scene.js — Interactive 3D Book + Table Lamp
 * Replaces the previous "tik-tik" thinking girl and hanging lamp.
 * Keeps the exact same OrpaLampController interface so script.js works unchanged.
 */

(function () {
  'use strict';

  window.OrpaLampController = {
    lampIsOn: true,
    bookOpenAmount: 0,
    targetBookOpen: 0,
    bookAnimating: false,
    updateThemeColors: null,
    triggerPull: null,
    boostThought: null
  };

  function updateLampDOMState() {
    const isLit = window.OrpaLampController.lampIsOn;
    const body = document.body;
    const headerLabel  = document.getElementById('headerLampLabel');
    const headerDot    = document.getElementById('headerLampDot');
    const heroBadge    = document.getElementById('heroPowerBadge');
    const pullText     = document.getElementById('aboutPullBtnText');
    const lampOffBanner = document.getElementById('lampOffBanner');
    const narrative    = document.getElementById('sceneNarrativeStatus');
    const readout      = document.getElementById('tiktikLiveReadout');

    if (isLit) {
      body.classList.remove('lamp-off');
      body.classList.add('lamp-on');
      if (headerLabel)   headerLabel.textContent  = 'Lamp: ON';
      if (headerDot)     headerDot.className       = 'w-2 h-2 rounded-full bg-emerald-400';
      if (heroBadge)     heroBadge.textContent     = 'RUNNING · LIT';
      if (pullText)      pullText.textContent      = 'Close Book';
      if (lampOffBanner) lampOffBanner.classList.add('hidden');
      if (narrative)     narrative.textContent     = 'Lamp Lit · Book Open';
      if (readout)       readout.textContent       = 'book: open';
    } else {
      body.classList.remove('lamp-on');
      body.classList.add('lamp-off');
      if (headerLabel)   headerLabel.textContent  = 'Lamp: OFF';
      if (headerDot)     headerDot.className       = 'w-2 h-2 rounded-full bg-gray-500';
      if (heroBadge)     heroBadge.textContent     = 'STANDBY · DIM';
      if (pullText)      pullText.textContent      = 'Open Book';
      if (lampOffBanner) lampOffBanner.classList.remove('hidden');
      if (narrative)     narrative.textContent     = 'Standby · Closed';
      if (readout)       readout.textContent       = 'book: closed';
    }
  }

  window.OrpaLampController.triggerPull = function (forceState) {
    const ctrl = window.OrpaLampController;
    if (ctrl.bookAnimating) return;
    ctrl.lampIsOn = typeof forceState === 'boolean' ? forceState : !ctrl.lampIsOn;
    ctrl.targetBookOpen = ctrl.lampIsOn ? 1 : 0;
    updateLampDOMState();
    if (typeof window.showOrpaToast === 'function') {
      window.showOrpaToast(
        ctrl.lampIsOn
          ? 'Lamp on — book opening.'
          : 'Lamp off — book closing.'
      );
    }
  };

  window.OrpaLampController.boostThought = function () {
    if (typeof window.showOrpaToast === 'function') {
      window.showOrpaToast('Turning the page...');
    }
  };

  window.initOrpaThreeScene = function () {
    updateLampDOMState();
    const wrapper = document.getElementById('threeCanvasWrapper');
    const canvas  = document.getElementById('aboutThreeCanvas');
    if (!wrapper || !canvas || typeof THREE === 'undefined') return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, wrapper.clientWidth / wrapper.clientHeight, 0.1, 100);
    camera.position.set(0, 2.4, 8.2);
    camera.lookAt(0, 0.1, 0);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(wrapper.clientWidth, wrapper.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;

    // ── Lights ──────────────────────────────────────────────────────
    const ambientLight = new THREE.AmbientLight(0xd4b483, 0.45);
    scene.add(ambientLight);

    const lampPointLight = new THREE.PointLight(0xffd58a, 0, 16, 1.8);
    lampPointLight.castShadow = true;
    // Will be added to shadeGroup after it is created, so it tracks lamp position

    const rimLight = new THREE.DirectionalLight(0xe6cfa7, 0.28);
    rimLight.position.set(-5, 4, 2);
    scene.add(rimLight);

    // ── Materials ────────────────────────────────────────────────────
    const darkCoverMat = new THREE.MeshStandardMaterial({
      color: 0x1c1916, roughness: 0.38, metalness: 0.18
    });
    const goldTrimMat = new THREE.MeshStandardMaterial({
      color: 0xd4b483, roughness: 0.18, metalness: 0.88,
      emissive: 0x8c6239, emissiveIntensity: 0.22
    });
    const pageMat = new THREE.MeshStandardMaterial({
      color: 0xf5f0e4, roughness: 0.82, metalness: 0.0
    });
    const pageEdgeMat = new THREE.MeshStandardMaterial({
      color: 0xe8e2d0, roughness: 0.88
    });
    const deskMat = new THREE.MeshStandardMaterial({
      color: 0x242018, roughness: 0.62, metalness: 0.08
    });
    const lampBaseMat = new THREE.MeshStandardMaterial({
      color: 0xb89463, roughness: 0.22, metalness: 0.82
    });
    const lampShadeMat = new THREE.MeshStandardMaterial({
      color: 0x1c1814, roughness: 0.42, metalness: 0.12, side: THREE.DoubleSide
    });
    const bulbMat = new THREE.MeshStandardMaterial({
      color: 0xfffcf0, emissive: 0xe6cfa7, emissiveIntensity: 0.2, roughness: 0.08
    });

    window.OrpaLampController.updateThemeColors = function (theme) {
      if (theme === 'light') {
        deskMat.color.setHex(0xccc5b5);
        ambientLight.intensity = 0.75;
      } else {
        deskMat.color.setHex(0x242018);
        ambientLight.intensity = 0.45;
      }
    };

    // ── Desk surface ─────────────────────────────────────────────────
    const desk = new THREE.Mesh(new THREE.BoxGeometry(10, 0.14, 5), deskMat);
    desk.position.y = -1.38;
    desk.receiveShadow = true;
    scene.add(desk);

    // Desk front edge highlight (bronze strip)
    const deskEdge = new THREE.Mesh(new THREE.BoxGeometry(10, 0.022, 0.022), goldTrimMat);
    deskEdge.position.set(0, -1.31, 2.5);
    scene.add(deskEdge);

    // ── Book ─────────────────────────────────────────────────────────
    const bookGroup = new THREE.Group();
    bookGroup.position.set(-0.7, -0.74, 0.1);
    scene.add(bookGroup);

    const BW = 1.65, BH = 2.25, CT = 0.062, PT = 0.32;
    const SPINE_X = -BW / 2;

    // Back cover
    const backCover = new THREE.Mesh(new THREE.BoxGeometry(BW, BH, CT), darkCoverMat);
    backCover.position.set(0, 0, -(PT / 2) - CT / 2);
    backCover.castShadow = true;
    bookGroup.add(backCover);

    // Spine strip
    const spine = new THREE.Mesh(new THREE.BoxGeometry(0.058, BH, PT + CT * 2 + 0.01), darkCoverMat);
    spine.position.set(SPINE_X - 0.029, 0, 0);
    bookGroup.add(spine);

    // Spine gold bands
    [-BH / 2 + 0.07, -BH / 2 + 0.24, BH / 2 - 0.07, BH / 2 - 0.24].forEach((yp) => {
      const band = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.026, PT + CT * 2 + 0.015), goldTrimMat);
      band.position.set(SPINE_X - 0.031, yp, 0);
      bookGroup.add(band);
    });

    // Page block (cream)
    const pageBlock = new THREE.Mesh(new THREE.BoxGeometry(BW - 0.015, BH - 0.04, PT), pageMat);
    pageBlock.position.set(0.007, 0, 0);
    pageBlock.castShadow = true;
    bookGroup.add(pageBlock);

    // Page-edge layering lines (top and right edges visible when open)
    for (let i = 0; i < 10; i++) {
      const lineZ = -(PT / 2) + (PT / 10) * i + PT / 20;
      const eline = new THREE.Mesh(new THREE.BoxGeometry(BW - 0.02, 0.006, 0.003), pageEdgeMat);
      eline.position.set(0.007, BH / 2 - 0.018, lineZ);
      bookGroup.add(eline);
    }

    // ── Front cover (pivots from spine edge) ─────────────────────────
    const frontPivot = new THREE.Group();
    frontPivot.position.set(SPINE_X, 0, PT / 2 + CT / 2);
    bookGroup.add(frontPivot);

    const frontCover = new THREE.Mesh(new THREE.BoxGeometry(BW, BH, CT), darkCoverMat);
    frontCover.position.set(BW / 2, 0, 0);
    frontCover.castShadow = true;
    frontPivot.add(frontCover);

    // Gold border on front cover
    const borderInset = 0.07;
    [
      { x: BW / 2, y: BH / 2 - borderInset, w: BW - borderInset * 2, h: 0.018 },
      { x: BW / 2, y: -(BH / 2 - borderInset), w: BW - borderInset * 2, h: 0.018 },
    ].forEach((tp) => {
      const t = new THREE.Mesh(new THREE.BoxGeometry(tp.w, tp.h, CT + 0.004), goldTrimMat);
      t.position.set(tp.x, tp.y, 0);
      frontPivot.add(t);
    });
    const leftBorder = new THREE.Mesh(new THREE.BoxGeometry(0.018, BH - borderInset * 2, CT + 0.004), goldTrimMat);
    leftBorder.position.set(borderInset, 0, 0);
    frontPivot.add(leftBorder);
    const rightBorder = leftBorder.clone();
    rightBorder.position.set(BW - borderInset, 0, 0);
    frontPivot.add(rightBorder);

    // Small decorative emblem on front cover center
    const emblem = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.018, 10, 32), goldTrimMat);
    emblem.position.set(BW / 2, 0.15, CT + 0.004);
    frontPivot.add(emblem);

    const emblemDot = new THREE.Mesh(new THREE.SphereGeometry(0.05, 16, 16), goldTrimMat);
    emblemDot.position.set(BW / 2, 0.15, CT + 0.015);
    frontPivot.add(emblemDot);

    // ── Table Lamp ───────────────────────────────────────────────────
    const lampGroup = new THREE.Group();
    lampGroup.position.set(2.15, -1.31, 0.5);
    scene.add(lampGroup);

    // Base disc
    const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.48, 0.09, 36), lampBaseMat);
    lampBase.position.y = 0.045;
    lampBase.castShadow = true;
    lampGroup.add(lampBase);

    // Base weight ring
    const weightRing = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.2, 36), lampBaseMat);
    weightRing.position.y = 0.19;
    lampGroup.add(weightRing);

    // Neck pole
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.04, 3.1, 20), lampBaseMat);
    pole.position.y = 1.64;
    pole.castShadow = true;
    lampGroup.add(pole);

    // Arm extending toward book (negative X = toward book on the left)
    const armGroup = new THREE.Group();
    armGroup.position.set(0, 3.2, 0);
    lampGroup.add(armGroup);

    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 1.35, 16), lampBaseMat);
    arm.rotation.z = Math.PI / 2;
    arm.position.x = -0.675;
    armGroup.add(arm);

    // Shade + bulb group at arm end
    const shadeGroup = new THREE.Group();
    shadeGroup.position.set(-1.35, 0, 0);
    armGroup.add(shadeGroup);

    const shade = new THREE.Mesh(new THREE.ConeGeometry(0.55, 0.56, 36, 1, true), lampShadeMat);
    shade.position.y = -0.3;
    shadeGroup.add(shade);

    const shadeRim = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.018, 12, 52), lampBaseMat);
    shadeRim.position.y = -0.57;
    shadeGroup.add(shadeRim);

    const shadeTopCap = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.05, 24), lampBaseMat);
    shadeTopCap.position.y = 0.025;
    shadeGroup.add(shadeTopCap);

    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.13, 22, 22), bulbMat);
    bulb.position.y = -0.14;
    shadeGroup.add(bulb);

    // Filament inside bulb
    const filamentMat = new THREE.MeshStandardMaterial({ color: 0xffcc88, emissive: 0xffcc44, emissiveIntensity: 0.5 });
    const filament = new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.006, 8, 16), filamentMat);
    filament.position.y = -0.14;
    filament.rotation.x = Math.PI / 2;
    shadeGroup.add(filament);

    // Light cone (subtle visible glow under shade)
    const lightConeMat = new THREE.MeshBasicMaterial({
      color: 0xffd58a, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false
    });
    const lightCone = new THREE.Mesh(new THREE.ConeGeometry(1.2, 2.8, 36, 1, true), lightConeMat);
    lightCone.position.y = -1.6;
    shadeGroup.add(lightCone);

    // Position point light at bulb location, parented to shadeGroup for correct rotation tracking
    lampPointLight.position.set(0, -0.14, 0);
    shadeGroup.add(lampPointLight);

    // ON/OFF toggle knob on pole
    const switchMat = new THREE.MeshStandardMaterial({ color: 0xd4b483, roughness: 0.28, metalness: 0.75 });
    const switchKnob = new THREE.Mesh(new THREE.SphereGeometry(0.07, 18, 18), switchMat);
    switchKnob.position.set(0.068, 1.8, 0);
    lampGroup.add(switchKnob);

    // Switch plate
    const switchPlate = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.12, 0.03), switchMat);
    switchPlate.position.set(0.062, 1.8, 0);
    lampGroup.add(switchPlate);

    // ── Book page overlay element ────────────────────────────────────
    const bookOverlay = document.getElementById('bookPageOverlay');

    // ── Drag-to-rotate ───────────────────────────────────────────────
    let isDragging = false, startX = 0;
    let targetRotY = 0.1;

    wrapper.addEventListener('pointerdown', (e) => { isDragging = true; startX = e.clientX; });
    window.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      targetRotY += (e.clientX - startX) * 0.0038;
      startX = e.clientX;
    });
    window.addEventListener('pointerup', () => { isDragging = false; });

    const resetBtn = document.getElementById('resetCameraBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        targetRotY = 0.1;
        if (typeof window.showOrpaToast === 'function') window.showOrpaToast('View reset.');
      });
    }

    window.addEventListener('resize', () => {
      camera.aspect = wrapper.clientWidth / wrapper.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(wrapper.clientWidth, wrapper.clientHeight);
    });

    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    window.OrpaLampController.updateThemeColors(currentTheme);

    // ── Animation loop ───────────────────────────────────────────────
    const clock = new THREE.Clock();
    function animate() {
      requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      const ctrl = window.OrpaLampController;

      // Gentle scene rotation following drag
      scene.rotation.y += (targetRotY - scene.rotation.y) * 0.055;

      // Book open / close animation
      const prev = ctrl.bookOpenAmount;
      ctrl.bookOpenAmount += (ctrl.targetBookOpen - ctrl.bookOpenAmount) * 0.048;
      ctrl.bookAnimating = Math.abs(ctrl.bookOpenAmount - ctrl.targetBookOpen) > 0.018;

      // Front cover swings open: 0 = closed, ~110°
      frontPivot.rotation.y = -ctrl.bookOpenAmount * Math.PI * 0.61;

      // Subtle book float when open
      bookGroup.position.y = -0.74 + Math.sin(t * 0.75) * 0.006 * ctrl.bookOpenAmount;

      // Lamp light intensity fades in / out
      const targetIntensity = ctrl.lampIsOn ? 4.2 : 0;
      lampPointLight.intensity += (targetIntensity - lampPointLight.intensity) * 0.09;

      // Bulb glow
      bulbMat.emissiveIntensity = ctrl.lampIsOn
        ? 1.35 + Math.sin(t * 3.8) * 0.045
        : 0.04;
      filamentMat.emissiveIntensity = ctrl.lampIsOn ? 1.2 : 0.05;

      // Light cone opacity
      lightConeMat.opacity = ctrl.lampIsOn ? 0.08 + Math.sin(t * 2.6) * 0.01 : 0;

      // Book page overlay — fade in as cover opens past midpoint
      if (bookOverlay) {
        const openFraction = ctrl.bookOpenAmount;
        if (openFraction > 0.5) {
          const fadeIn = (openFraction - 0.5) / 0.5;
          bookOverlay.style.opacity = fadeIn.toFixed(3);
          bookOverlay.classList.remove('hidden');
        } else {
          bookOverlay.style.opacity = '0';
          if (openFraction < 0.08) bookOverlay.classList.add('hidden');
        }
      }

      renderer.render(scene, camera);
    }

    animate();

    // Auto-open book shortly after page load
    setTimeout(() => {
      const ctrl = window.OrpaLampController;
      ctrl.lampIsOn = true;
      ctrl.targetBookOpen = 1;
      updateLampDOMState();
    }, 850);
  };
})();
