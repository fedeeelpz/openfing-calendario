// ==UserScript==
// @name         OpenFing: guardar duración (solo para la demo)
// @match        https://open.fing.edu.uy/courses/*
// @run-at       document-idle
// ==/UserScript==
// Para la demo con Tampermonkey. Desaparece si OpenFing guarda la duración (ver reproductor-ejemplo.js).
(() => {
  const guardar = v => {
    const m = location.pathname.match(/courses\/([^\/]+)\/(\d+)/);
    if (m && v.duration > 0)
      localStorage.setItem("openfing-duracion:" + m[1] + "/" + m[1] + "_" + m[2].padStart(2, "0"), v.duration);
  };
  ["loadedmetadata", "play"].forEach(ev =>
    document.addEventListener(ev, e => e.target.tagName === "VIDEO" && guardar(e.target), true));
})();
