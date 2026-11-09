// Androids synlige appflate kan være mindre enn høyden rapportert som 100dvh.
(() => {
  const mobile = matchMedia('(max-width:55.999rem)');
  let frame;
  function measure() {
    frame = null;
    if (!mobile.matches) {document.documentElement.style.removeProperty('--app-viewport-height');return;}
    const viewport = window.visualViewport;
    // Behold vanlig zoom og la nettleseren håndtere tastaturet i skjemaene.
    if (viewport && Math.abs(viewport.scale - 1) > .02) return;
    const focused = document.activeElement;
    if (focused?.matches('textarea,input:not([type=checkbox]):not([type=radio]):not([type=button]):not([type=submit])')) return;
    const height = Math.floor(Math.min(innerHeight,viewport?.height || innerHeight));
    if (height > 0) document.documentElement.style.setProperty('--app-viewport-height',height+'px');
  }
  function schedule() {if (frame === undefined || frame === null) frame=requestAnimationFrame(measure);}
  window.addEventListener('resize',schedule);
  window.addEventListener('orientationchange',schedule);
  window.addEventListener('pageshow',schedule);
  window.visualViewport?.addEventListener('resize',schedule);
  document.addEventListener('focusout',schedule);
  mobile.addEventListener('change',schedule);
  measure();
})();
