(() => {
  const ART_W = 1536;
  const ART_H = 1024;

  document.querySelectorAll('.zoomable-scene').forEach(scene => {
    const viewport = scene.querySelector('.zoom-viewport');
    const stage = scene.querySelector('[data-zoom-stage]');
    if (!viewport || !stage) return;

    let fitScale = 1;
    let userScale = 1;
    let panX = 0;
    let panY = 0;

    const pointers = new Map();
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let pinchStartDistance = 0;
    let pinchStartScale = 1;

    function viewportSize(){
      const r = viewport.getBoundingClientRect();
      return { width: r.width, height: r.height };
    }

    function clampUserScale(v){
      return Math.min(4, Math.max(1, v));
    }

    function clampPan(){
      const {width, height} = viewportSize();
      const scale = fitScale * userScale;
      const scaledW = ART_W * scale;
      const scaledH = ART_H * scale;

      const maxX = Math.max(0, (scaledW - width) / 2);
      const maxY = Math.max(0, (scaledH - height) / 2);

      panX = Math.max(-maxX, Math.min(maxX, panX));
      panY = Math.max(-maxY, Math.min(maxY, panY));
    }

    function render(){
      clampPan();
      const {width, height} = viewportSize();
      const scale = fitScale * userScale;
      const scaledW = ART_W * scale;
      const scaledH = ART_H * scale;

      // Center the full artwork first, then apply user pan.
      // Using top-left transform origin avoids the old translate(-50%) + scale cropping bug.
      const x = (width - scaledW) / 2 + panX;
      const y = (height - scaledH) / 2 + panY;
      stage.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
    }

    function fitToScreen(){
      const {width, height} = viewportSize();
      if (!width || !height) return;
      fitScale = Math.min(width / ART_W, height / ART_H);
      userScale = 1;
      panX = 0;
      panY = 0;
      render();
    }

    function zoomBy(factor){
      userScale = clampUserScale(userScale * factor);
      if (userScale === 1){ panX = 0; panY = 0; }
      render();
    }

    scene.querySelector('[data-zoom-in]')?.addEventListener('click', e => {
      e.stopPropagation();
      zoomBy(1.22);
    });
    scene.querySelector('[data-zoom-out]')?.addEventListener('click', e => {
      e.stopPropagation();
      zoomBy(1 / 1.22);
    });
    scene.querySelector('[data-zoom-reset]')?.addEventListener('click', e => {
      e.stopPropagation();
      fitToScreen();
    });

    // Desktop: wheel zoom works directly inside the scene.
    viewport.addEventListener('wheel', e => {
      e.preventDefault();
      zoomBy(e.deltaY < 0 ? 1.10 : 1 / 1.10);
    }, {passive:false});

    viewport.addEventListener('pointerdown', e => {
      // Let buttons and record interactions receive their own gestures.
      if (e.target.closest('button,a,textarea,input,.record-disc')) return;

      pointers.set(e.pointerId, {x:e.clientX, y:e.clientY});
      viewport.setPointerCapture?.(e.pointerId);

      if (pointers.size === 1 && userScale > 1){
        dragging = true;
        lastX = e.clientX;
        lastY = e.clientY;
      } else if (pointers.size === 2){
        dragging = false;
        const pts = [...pointers.values()];
        pinchStartDistance = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
        pinchStartScale = userScale;
      }
    });

    viewport.addEventListener('pointermove', e => {
      if (!pointers.has(e.pointerId)) return;
      pointers.set(e.pointerId, {x:e.clientX, y:e.clientY});

      if (pointers.size === 2){
        const pts = [...pointers.values()];
        const d = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
        if (pinchStartDistance > 0){
          userScale = clampUserScale(pinchStartScale * (d / pinchStartDistance));
          render();
        }
        return;
      }

      if (dragging && userScale > 1){
        panX += e.clientX - lastX;
        panY += e.clientY - lastY;
        lastX = e.clientX;
        lastY = e.clientY;
        render();
      }
    });

    function endPointer(e){
      pointers.delete(e.pointerId);
      if (pointers.size < 2) pinchStartDistance = 0;
      if (pointers.size === 0) dragging = false;
    }
    viewport.addEventListener('pointerup', endPointer);
    viewport.addEventListener('pointercancel', endPointer);

    const refit = () => requestAnimationFrame(fitToScreen);
    window.addEventListener('resize', refit);
    window.addEventListener('orientationchange', () => setTimeout(fitToScreen, 180));
    window.visualViewport?.addEventListener('resize', refit);

    // Scene may be hidden when the script first runs. Re-fit whenever it becomes active.
    const observer = new MutationObserver(() => {
      if (scene.classList.contains('is-active')) requestAnimationFrame(fitToScreen);
    });
    observer.observe(scene, {attributes:true, attributeFilter:['class']});

    fitToScreen();
  });
})();
