/*
 * EJEMPLO a adaptar al código real del reproductor de OpenFing.
 * No es código listo para pegar: los nombres (video, curso, nn) son ilustrativos.
 * Es un cambio aditivo: no modifica la clave de progreso existente
 * ("openfing:video-progreso-reproduccion:...").
 */
const clave = "/media/" + curso + "/" + curso + "_" + nn; // la misma que se usa hoy

// 1. Guardar la duración apenas el video la conoce
video.addEventListener("loadedmetadata", () => {
  localStorage.setItem("openfing:video-duracion:" + clave, video.duration);
});

// 2. Marcar la clase como terminada al superar el 95 %
video.addEventListener("timeupdate", () => {
  // ...acá va lo que ya se hace hoy para guardar el progreso...
  if (video.duration > 0 && video.currentTime / video.duration >= 0.95) {
    localStorage.setItem("openfing:video-terminado:" + clave, "1");
  }
});
