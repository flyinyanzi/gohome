
(() => {
  const ART_W = 1536;
  const ART_H = 1024;

  document.querySelectorAll(".zoomable-scene").forEach(scene => {
    const viewport = scene.querySelector(".zoom-viewport");
    const stage = scene.querySelector("[data-zoom-stage]");
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

    // Mobile Safari can report a layout viewport larger than what is actually visible.
    // visualViewport is the real visible area; fall back to the element rect elsewhere.
    function visibleSize(){
      const vv = window.visualViewport;
      if (vv && vv.width > 0 && vv.height > 0){
        return {
          width: vv.width,
          height: vv.height,
          offsetLeft: vv.offsetLeft || 0,
          offsetTop: vv.offsetTop || 0
        };
      }

      const r = viewport.getBoundingClientRect();
      return {
        width: r.width,
        height: r.height,
        offsetLeft: 0,
        offsetTop: 0
      };
    }

    // Important: allow the user to zoom OUT below the automatic fit.
    // This gives a safety margin on phones with browser chrome / unusual aspect ratios.
    function clampUserScale(v){
      return Math.min(4, Math.max(0.62, v));
    }

    function clampPan(){
      const {width, height} = visibleSize();
      const scale = fitScale * userScale;
      const scaledW = ART_W * scale;
      const scaledH = ART_H * scale;

      // When artwork is smaller than the viewport, keep it centered.
      const maxX = Math.max(0, (scaledW - width) / 2);
      const maxY = Math.max(0, (scaledH - height) / 2);

      panX = Math.max(-maxX, Math.min(maxX, panX));
      panY = Math.max(-maxY, Math.min(maxY, panY));
    }

    function render(){
      clampPan();

      const {width, height, offsetLeft, offsetTop} = visibleSize();
      const scale = fitScale * userScale;
      const scaledW = ART_W * scale;
      const scaledH = ART_H * scale;

      // True "contain": center the complete artwork inside the visible browser area.
      // Any spare width/height becomes intentional dark letterboxing.
      const x = offsetLeft + (width - scaledW) / 2 + panX;
      const y = offsetTop + (height - scaledH) / 2 + panY;

      stage.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
    }

    function fitToScreen(){
      const {width, height} = visibleSize();
      if (!width || !height) return;

      // 0.94 leaves a small safety frame around all four edges.
      // This is deliberate: never crop the room just to fill the screen.
      fitScale = Math.min(width / ART_W, height / ART_H) * 0.94;
      userScale = 1;
      panX = 0;
      panY = 0;
      render();
    }

    function zoomBy(factor){
      userScale = clampUserScale(userScale * factor);

      // Center again whenever the artwork becomes smaller than its original fit.
      if (userScale <= 1){
        panX = 0;
        panY = 0;
      }
      render();
    }

    scene.querySelector("[data-zoom-in]")?.addEventListener("click", e => {
      e.stopPropagation();
      zoomBy(1.18);
    });

    scene.querySelector("[data-zoom-out]")?.addEventListener("click", e => {
      e.stopPropagation();
      zoomBy(1 / 1.18);
    });

    scene.querySelector("[data-zoom-reset]")?.addEventListener("click", e => {
      e.stopPropagation();
      fitToScreen();
    });

    viewport.addEventListener("wheel", e => {
      e.preventDefault();
      zoomBy(e.deltaY < 0 ? 1.08 : 1 / 1.08);
    }, {passive:false});

    viewport.addEventListener("pointerdown", e => {
      if (e.target.closest("button,a,textarea,input,.record-disc")) return;

      pointers.set(e.pointerId, {x:e.clientX, y:e.clientY});
      viewport.setPointerCapture?.(e.pointerId);

      if (pointers.size === 1 && userScale > 1){
        dragging = true;
        lastX = e.clientX;
        lastY = e.clientY;
      } else if (pointers.size === 2){
        dragging = false;
        const pts = [...pointers.values()];
        pinchStartDistance = Math.hypot(
          pts[1].x - pts[0].x,
          pts[1].y - pts[0].y
        );
        pinchStartScale = userScale;
      }
    });

    viewport.addEventListener("pointermove", e => {
      if (!pointers.has(e.pointerId)) return;
      pointers.set(e.pointerId, {x:e.clientX, y:e.clientY});

      if (pointers.size === 2){
        const pts = [...pointers.values()];
        const distance = Math.hypot(
          pts[1].x - pts[0].x,
          pts[1].y - pts[0].y
        );

        if (pinchStartDistance > 0){
          userScale = clampUserScale(
            pinchStartScale * (distance / pinchStartDistance)
          );

          if (userScale <= 1){
            panX = 0;
            panY = 0;
          }

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

    viewport.addEventListener("pointerup", endPointer);
    viewport.addEventListener("pointercancel", endPointer);

    // Safari changes the visible area while its top/bottom bars appear or disappear.
    // Re-fit after those changes, not just after orientation changes.
    let resizeTimer;
    function scheduleRefit(){
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(fitToScreen, 80);
    }

    window.addEventListener("resize", scheduleRefit);
    window.addEventListener("orientationchange", () => {
      setTimeout(fitToScreen, 100);
      setTimeout(fitToScreen, 350);
    });

    if (window.visualViewport){
      window.visualViewport.addEventListener("resize", scheduleRefit);
      window.visualViewport.addEventListener("scroll", render);
    }

    const observer = new MutationObserver(() => {
      if (scene.classList.contains("is-active")){
        requestAnimationFrame(() => {
          fitToScreen();
          setTimeout(fitToScreen, 120);
        });
      }
    });

    observer.observe(scene, {
      attributes:true,
      attributeFilter:["class"]
    });

    fitToScreen();
  });
})();
