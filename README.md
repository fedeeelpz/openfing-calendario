# Calendario semanal para OpenFing

Propuesta de funcionalidad para OpenFing(https://open.fing.edu.uy/): un calendario personal donde cada estudiante planifica qué clases grabadas va a ver cada semana, ve cuáles le faltan y llega a ellas con un clic.

**Demo:** https://fedeeelpz.github.io/openfing-calendario/

## El problema

Las clases grabadas permiten cursar a ritmo propio, pero es fácil perder el hilo: no queda claro qué clases correspondían a la semana, cuáles ya se vieron y dónde se había quedado uno en un video.

## La idea

Una grilla semanal: cada **fila es un curso** y cada **columna un día** (L M M J V S D). Cada celda muestra las clases planificadas para ese día, con su link directo junto al progreso en porcentaje que se lleva de dicha clase. 

- El botón **+** abre un formulario para agregar una clase (curso, día, nombre y link).
- Cada clase tiene tres estados: **pendiente**, **en progreso** (con el minuto donde quedó el estudiante, y el link pasa a "Seguir viendo") y **vista**.
- Se puede navegar entre semanas y pasar las clases sin terminar a la semana siguiente.
- Todo se guarda en el navegador (`localStorage`): sin cuentas ni servidor, sin datos personales.

## Cómo probar la demo

1. Abrí la demo (o `index.html` en tu navegador, no requiere instalar nada).
2. Tocá **+** y agregá una clase con un link de OpenFing, por ejemplo `https://open.fing.edu.uy/courses/pye-2022/8/`.
3. Tocá el estado de la clase para pasar de pendiente a en progreso y a vista.

### Probar con el progreso real de OpenFing (opcional)

OpenFing ya guarda el segundo donde quedó cada video, en claves de `localStorage` con la forma `openfing:video-progreso-reproduccion:/media/<curso>/<curso>_<NN>`. Como la demo vive en otro dominio, no puede leerlas directamente, así que se pasan a mano:(el nombre de la clave incluye comillas literales, por eso el comando las quita).
1. **Guardar la duración de la clase** (una vez por clase). OpenFing guarda el progreso pero no la duración del video, y el calendario la necesita para mostrar el porcentaje y para saber si la clase se terminó:
   ```js
   (()=>{const m=location.pathname.match(/courses\/([^\/]+)\/(\d+)/);localStorage.setItem('openfing-duracion:'+m[1]+'/'+m[1]+'_'+m[2].padStart(2,'0'),document.querySelector('video').duration)})()
   ```
   Alternativa sin comandos: instalar `demo-duracion.user.js` con Tampermonkey, que lo hace solo al abrir o reproducir cada clase.
2. **Copiar el progreso** (copia al portapapeles el progreso y las duraciones guardadas):
   ```js
   copy(JSON.stringify({p:Object.fromEntries(Object.keys(localStorage).filter(k=>k.includes('video-progreso-reproduccion:/media/')).map(k=>[k.split('/media/')[1].replace(/"/g,''),+localStorage[k]])),d:Object.fromEntries(Object.keys(localStorage).filter(k=>k.startsWith('openfing-duracion:')).map(k=>[k.slice(18),+localStorage[k]]))}))
   ```
3. En el calendario, tocá **Importar progreso** y pegá el resultado.

Las clases con link de OpenFing pasan a **en progreso** con su minuto. Para que pasen a **vista** hace falta conocer la duración del video, que hoy no se guarda: para la demo se puede instalar `demo-duracion.user.js` con Tampermonkey (guarda la duración de cada clase que se abre). Con duración, una clase pasa a vista al llegar al final del video, y mientras está en progreso muestra el porcentaje visto

> Estos pasos manuales son solo para la demo. Integrado al sitio, el calendario lee el progreso directamente.

## Propuesta de integración

**Etapa 1 – Cambio mínimo en el reproductor.** Guardar la duración del video (y/o un indicador de "terminada" al superar el 95 %) junto al progreso que ya se guarda. Es un cambio aditivo que no modifica las claves existentes. Ver `reproductor-ejemplo.js` (ejemplo ilustrativo, a adaptar al código real).

**Etapa 2 – Página del calendario en el sitio.** Pasar `index.html`, `calendario.css` y `calendario.js` a la estructura del sitio (Hugo), usando las variables de color y el tema claro/oscuro de OpenFing, y leyendo el progreso directamente. Mejoras posibles: elegir curso y clase desde una lista en vez de pegar links, y mostrar la duración de cada clase.

## Límites conocidos

- El estado vive en el navegador, así que es **por dispositivo**. Sincronizar entre dispositivos requeriría cuentas, que quedan fuera de esta propuesta.
- Las clases se emparejan con el progreso por la URL (`/courses/<curso>/<n>/` ↔ `<curso>_<NN>`); habría que verificarlo con los cursos que usen otros nombres de carpeta.

## Archivos

| Archivo | Contenido |
|---|---|
| `index.html` | Estructura del calendario y del formulario "+" |
| `calendario.css` | Estilos (con tema claro/oscuro) |
| `calendario.js` | Funcionamiento |
| `reproductor-ejemplo.js` | Fragmento propuesto para el reproductor |
| `demo-duracion.user.js` | Script solo para la demo (Tampermonkey) |

## Autoría

Propuesto por Federico Lopez, estudiante de la Facultad de Ingeniería. Me ofrezco a implementarlo en el sitio si les interesa.

Licencia MIT (ver `LICENSE`).
