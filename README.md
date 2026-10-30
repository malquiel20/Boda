# Boda · Invitación digital

Invitación de boda web hecha con **HTML, CSS y JavaScript**, sin programas ni instalaciones. Funciona en celular, tablet y computador y se puede publicar gratis en **GitHub Pages**. Las confirmaciones de asistencia se guardan en **Google Sheets** (también gratis).

Incluye todo lo que aparece en el video de referencia (sobre que se abre, música, cuenta regresiva, ubicación, programa, fotos, QR, código de vestimenta y confirmación de asistencia con cupos y restricciones alimentarias) y además varias funciones extra, como un panel para los novios.

> Todo funciona desde el primer momento con datos de ejemplo ("Valentina & Santiago"). Para hacerla tuya:
> 1. Edita **un archivo**, `js/config.js`, con sus datos: nombres, fecha, lugares y textos.
> 2. Agrega a tus invitados desde el **panel de los novios**: el nombre de cada familia y cuántas personas pueden ir. No tienes que tocar ningún archivo para eso.

---

## Índice

1. [Qué hace la página](#qué-hace-la-página)
2. [Funciones extra que agregué](#funciones-extra-que-agregué)
3. [Panel de los novios (admin.html)](#panel-de-los-novios-adminhtml)
4. [Archivos del proyecto](#archivos-del-proyecto)
5. [Cómo personalizarla](#cómo-personalizarla)
6. [Lista de invitados y enlaces personales](#lista-de-invitados-y-enlaces-personales)
7. [Guardar las respuestas en Google Sheets](#guardar-las-respuestas-en-google-sheets)
8. [Publicar la página gratis (GitHub Pages)](#publicar-la-página-gratis-github-pages)
9. [Probarla en tu computador](#probarla-en-tu-computador)
10. [Privacidad: qué es público y qué no](#privacidad-qué-es-público-y-qué-no)
11. [Preguntas frecuentes](#preguntas-frecuentes)
12. [Créditos](#créditos)

---

## Qué hace la página

La invitación se recorre de arriba hacia abajo:

| # | Sección | Qué hace |
|---|---------|----------|
| 1 | **Sobre de bienvenida** | Al abrir el enlace aparece un sobre verde con un **sello de cera** con las iniciales de los novios. Si el enlace es personal, el sobre muestra el **nombre del invitado** y para **cuántas personas** es válida la invitación. Al tocar el sello, la solapa se abre, sale la tarjeta con los nombres y la fecha, caen pétalos y empieza la música. |
| 2 | **Portada** | Foto de los novios en un marco en forma de arco, los nombres en letra caligráfica, la fecha completa ("Sábado · 18 de septiembre · 2027") y la ciudad. Si el invitado entró con su enlace, aparece "Invitación especial para…". |
| 3 | **Música de fondo** | Un **disco de vinilo** flotante (arriba a la derecha) que gira mientras suena la canción. Se toca para pausar o reanudar. La música se detiene si el invitado cambia de aplicación y vuelve a sonar al regresar. |
| 4 | **Frase y cuenta regresiva** | Una frase para los invitados y una **cuenta regresiva automática** (días, horas, minutos y segundos). El día de la boda cambia a "¡Hoy es el gran día!" y después a "¡Gracias por acompañarnos…!". |
| 5 | **Ceremonia y recepción** | Una tarjeta por evento con hora, lugar y dirección, y los botones **Ver ubicación** (Google Maps, con GPS) y **Waze**. También se puede ver el mapa dentro de la página. |
| 6 | **Programa del día** | Línea de tiempo con íconos: ceremonia, cóctel, fotos, brindis, cena, baile, ramo, torta, cierre… |
| 7 | **Galería** | Fotos de los novios. Al tocarlas se abren en grande; se pasa de una a otra deslizando el dedo o con las flechas. |
| 8 | **Código de vestimenta** | Qué ponerse ("Ellos: traje formal oscuro", "Ellas: vestido largo") y los **colores reservados**, que se muestran como muestras de color. |
| 9 | **Comparte tus fotos (QR)** | Un **código QR** que se genera solo a partir del enlace de tu álbum (Google Fotos, Drive, etc.). También hay un botón para subir fotos y el **hashtag** de la boda con botón de copiar. |
| 10 | **Confirmación de asistencia** | El formulario que se describe abajo. |
| 11 | **Recomendaciones** | Indicaciones como "solo adultos", "puntualidad", "ceremonia sin celulares" o "transporte". |
| 12 | **¡Te esperamos!** | Cierre con los nombres y la fecha. |

### El formulario de confirmación

- **Nombre en la lista de invitados.** Si el invitado entró con su enlace personal, su nombre ya aparece y no lo tiene que buscar. Si no, lo elige de una lista desplegable.
- **¿Quién responde este formulario?**
- **¿Nos acompañas?** "Sí, asistiré" o "No podré asistir".
- **¿Cuántas personas asistirán?** Solo deja elegir hasta los **cupos** que le asignaste a ese invitado.
- **Por cada persona:**
  - nombre completo;
  - **adulto o niño(a)**;
  - **restricciones alimentarias**: vegetariano, vegano, sin gluten (celíaco), sin lactosa, alergia, o una restricción escrita.
- **Teléfono** (opcional) y **mensaje para los novios** (opcional).
- **Fecha límite.** Después de esa fecha el formulario se cierra solo y aparece un aviso.
- Revisa los datos antes de enviar: si falta algo, dice exactamente qué es y lleva al campo.

---

## Funciones extra que agregué

| Función | Para qué sirve |
|---------|----------------|
| **Enlace personal por invitado** | Cada invitado recibe su propio enlace (`…/?i=codigo`). Así el sobre lo saluda por su nombre, el formulario ya sabe quién es y no puede confirmar más personas de las invitadas. |
| **Agregar al calendario** | Botones para **Google Calendar** y para **iPhone / Outlook** (archivo `.ics` con recordatorio un día antes). |
| **Waze y mapa dentro de la página** | Además de Google Maps. El mapa solo se carga si el invitado lo pide, para que la página sea rápida. |
| **Padres y padrinos** | Sección opcional con los nombres de los padres y padrinos. |
| **Regalos** | Sección opcional para la **lluvia de sobres**, datos de **transferencia** (cada dato tiene botón de copiar) y un enlace a la **mesa de regalos**. |
| **Canción que no puede faltar** | Los invitados pueden sugerir canciones para la fiesta. |
| **Modificar respuesta** | La página recuerda la respuesta en el celular del invitado. Si vuelve a entrar, ve lo que respondió y lo puede cambiar. En Google Sheets la respuesta nueva reemplaza a la anterior, no se duplica. |
| **Aviso por WhatsApp** (opcional) | Si pones tu número, el invitado puede enviarte también un resumen de su confirmación por WhatsApp. |
| **Botón flotante "Confirmar asistencia"** | Aparece mientras el invitado recorre la invitación, para que no se le olvide confirmar. Se oculta cuando ya respondió. |
| **Modo "solo con enlace"** | Si quieres, solo pueden confirmar quienes tengan su enlace personal. |
| **Pétalos al abrir el sobre** | Un detalle animado al abrir la invitación. |
| **Vista previa al compartir** | Cuando envías el enlace por WhatsApp o redes sociales aparece una imagen con "¡Nos casamos!" y un sobre. |
| **Modo demostración** | Sin configurar nada, el formulario funciona y guarda las respuestas en el mismo navegador. Sirve para probar todo antes de conectar Google Sheets. |
| **Música de ejemplo libre de derechos** | Una melodía original incluida para que la música funcione desde el principio. Cámbiala por tu canción. |
| **Accesible y adaptable** | Se ve bien en cualquier pantalla y se puede usar con teclado y con lector de pantalla. Si el celular tiene activado "reducir movimiento", desactiva las animaciones. |
| **Sin depender de otros servicios** | Las tipografías y la librería del QR están incluidas en el proyecto. Solo los mapas y el guardado de respuestas usan servicios de Google. |

---

## Panel de los novios (admin.html)

Abre `https://tu-pagina/admin.html`. Funciona como una aplicación: en el celular tiene un **menú abajo** con cuatro secciones (en el computador el menú está arriba). El botón ↻ de arriba actualiza las respuestas y el del ojo abre la invitación.

### 🏠 Inicio: cómo va todo, de un vistazo

- **Cuenta regresiva**: cuántos días faltan para la boda y para la fecha límite de confirmación.
- **Confirmaciones**: "3 de 5 invitaciones ya respondieron", con una **barra de colores** (verde: asistirán, rojo: no asistirán, beige: sin responder). Si tocas cualquiera de esos grupos, se abre la lista de esos invitados.
- **Cuántas personas asistirán**, separadas en adultos y niños, y cuántos cupos faltan por confirmar.
- **¿Qué sigue?**: el panel te dice qué hacer, con un botón para cada cosa. Por ejemplo:
  - "Envía a cada invitado su invitación";
  - "2 invitaciones siguen sin responder: envíales un recordatorio";
  - "Ya tienes la lista para el catering".
- **Para el catering**: cuántos vegetarianos, veganos, celíacos o alérgicos hay, y quiénes son.
- **Últimas respuestas**: quién confirmó y cuándo ("Ana Torres confirmó 2 personas · ayer").

### 👥 Invitados: agregar familias, elegir cupos y enviar la invitación

**Agregar un invitado (paso a paso):**
1. Toca el botón verde **"+ Agregar invitado"**.
2. Escribe el **nombre de la invitación**. Puede ser una persona, una pareja o una familia: "Familia Pérez", "Ana y Luis"… Así aparecerá en el sobre.
3. Elige **cuántas personas pueden ir** con los botones **−** y **+**. En el formulario de confirmación no podrán registrar más personas que ese número.
4. Si quieres, escribe su **WhatsApp**, por ejemplo `300 123 4567`. El código de país se agrega solo y el mensaje se abre directo en su chat.
5. Toca **Guardar invitado**. Aparece **"¡Listo!"** con el botón **"Enviar invitación por WhatsApp"**, que abre WhatsApp con el mensaje y su enlace personal listos para enviar.

**En la lista de invitados:**
- **Filtros con contador**: Todos · Sin responder · Asistirán · No asistirán. También hay un **buscador** por nombre.
- Cada invitado muestra su estado con color.
- El botón **Enviar** abre WhatsApp con el mensaje listo: el nombre del invitado, sus cupos y su enlace personal. Si el invitado tiene teléfono en la lista, se abre directo su chat.
- Cuando lo envías, el invitado queda marcado como **"Enviada"** en ese dispositivo, para que sepas a quién ya le mandaste.
- **Al tocar un nombre** se abre el detalle:
  - quién respondió y cuándo;
  - las personas que asistirán, con sus restricciones;
  - su mensaje y su canción.
  - También están los botones **Enviar recordatorio** (solo si no ha respondido), **Copiar enlace**, **Ver su invitación**, **Editar** (para cambiar el nombre, los cupos o el teléfono) y **Eliminar**. Eliminar pide tocar dos veces.
- El menú muestra en rojo cuántos invitados están **sin responder**.

### 💬 Mensajes

- Los **mensajes** que les dejaron sus invitados, del más reciente al más antiguo.
- Las **canciones sugeridas**, con un botón para **copiar la lista y pasársela al DJ**.

### 🛠️ Herramientas

- **Descargar en Excel**:
  - *Respuestas por invitación*;
  - *Lista de asistentes*, una fila por persona con sus restricciones, para las mesas y el menú.
- **Códigos QR para imprimir**: uno para subir fotos y otro para la invitación general.
- **Agregar varios invitados a la vez**: copia de Excel las columnas *nombre* y *cupos* (y el teléfono, si quieres), pégalas y toca *Agregar a la lista*. Si un nombre ya existía, se actualizan sus cupos y conserva su enlace.
- **Conexión**: indica si el panel está conectado a Google Sheets o en modo de prueba.
  - Conectado: puedes cerrar la sesión en ese dispositivo.
  - Modo de prueba: puedes borrar las respuestas de prueba. Pide tocar dos veces para no borrarlas por error.

Con Google Sheets conectado, el panel primero muestra una pantalla que pide la **clave** que pusiste en el script. Sin la clave nadie ve las respuestas. En modo de prueba muestra solo las respuestas guardadas en ese navegador.

Para cambiar los mensajes de WhatsApp, edita `mensajeInvitacion` y `mensajeRecordatorio` en `js/config.js`.

---

## Archivos del proyecto

```
Boda/
├── index.html                  ← la invitación
├── admin.html                  ← panel de los novios
├── favicon.svg                 ← ícono de la pestaña
├── css/
│   ├── estilos.css             ← diseño y colores de la invitación
│   └── admin.css               ← diseño del panel
├── js/
│   ├── config.js               ← ✏️ TUS DATOS (nombres, fecha, lugares, textos…)
│   ├── invitados.js            ← lista de invitados escrita a mano (opcional)
│   ├── app.js                  ← funcionamiento de la invitación
│   ├── admin.js                ← funcionamiento del panel
│   ├── utilidades.js           ← funciones compartidas
│   └── vendor/qrcode.js        ← librería para generar los códigos QR
├── assets/
│   ├── img/                    ← fotos e ilustraciones (cámbialas por las tuyas)
│   ├── musica/                 ← canción de fondo
│   └── fuentes/                ← tipografías incluidas
└── google-apps-script/
    └── Codigo.gs               ← script para guardar respuestas en Google Sheets
```

---

## Cómo personalizarla

### 1. Tus datos: `js/config.js`

Ábrelo con cualquier editor de texto (en GitHub puedes editarlo con el ícono del lápiz). Cada parte tiene comentarios que explican qué es. Las más importantes:

| Dato | Ejemplo | Nota |
|------|---------|------|
| `pareja.nombre1` / `nombre2` | `"Valentina"`, `"Santiago"` | Las iniciales del sello se calculan solas. |
| `fecha` | `"2027-09-18T16:00:00-05:00"` | Año-mes-día, hora y diferencia horaria. Colombia, Perú, Ecuador y Panamá: `-05:00`; México (centro): `-06:00`. |
| `fechaFin` | `"2027-09-19T02:00:00-05:00"` | Hora de fin, para el calendario. |
| `zonaHoraria` | `"America/Bogota"` | Para mostrar la fecha correcta a todos. Otros ejemplos: `America/Lima`, `America/Mexico_City`. |
| `codigoPais` | `"57"` | Se agrega a los teléfonos de WhatsApp que escribas sin él. Colombia `57`, México `52`, Perú `51`, Ecuador `593`. |
| `eventos` | ceremonia, recepción | Lugar, dirección, hora. En `mapa` puedes pegar el enlace exacto de Google Maps. |
| `programa` | lista de horas y actividades | Íconos disponibles: `anillos`, `iglesia`, `copas`, `cena`, `baile`, `pastel`, `luna`, `camara`, `ramo`. |
| `vestimenta` | `"Traje formal oscuro"`, colores | Los colores van en formato `#rrggbb`. |
| `fotos.enlace` | enlace al álbum compartido | Con este enlace se genera el QR. |
| `rsvp.fechaLimite` | `"2027-08-15"` | Último día para confirmar. |
| `rsvp.urlGoogleScript` | URL de tu script | Ver [Google Sheets](#guardar-las-respuestas-en-google-sheets). |
| `rsvp.whatsapp` | `"573001234567"` | Opcional. Con código de país, sin `+` ni espacios. |
| `rsvp.permitirSinEnlace` | `true` / `false` | `false`: solo confirman quienes tengan enlace personal. |
| `mensajeInvitacion` | texto con `{nombre}`, `{enlace}`, `{cupos}` | Es el mensaje que se envía por WhatsApp desde el panel. |
| `mensajeRecordatorio` | texto con `{nombre}`, `{enlace}`, `{fechaLimite}` | Recordatorio para quienes no han respondido. |

**Para quitar una sección**, ponle `null`. Ejemplo: `regalos: null,` o `familia: null,`. La sección desaparece de la página.

### 2. Fotos

1. Sube tus fotos a la carpeta `assets/img/` (por ejemplo `pareja.jpg`, `foto1.jpg`…).
2. En `js/config.js` cambia las rutas:
   - `portada.foto: "assets/img/pareja.jpg"`
   - en `galeria.fotos`, una línea por foto.
3. Recomendaciones:
   - fotos **verticales** (proporción 3:4);
   - unos 1200 px de alto;
   - menos de 500 KB cada una, para que la página cargue rápido. Puedes reducirlas gratis en squoosh.app.

### 3. Música

Ahora suena **"Un pacto con Dios"** de Juan Carlos Fernández (`assets/musica/un-pacto-con-dios.mp3`), desde el inicio. Para cambiarla:

1. Copia tu canción en formato `.mp3` a `assets/musica/`.
2. En `js/config.js`: `musica: { archivo: "assets/musica/mi-cancion.mp3", titulo: "Nombre de la canción" }`.
3. Para no usar música: `musica: null,`.

> Los celulares no dejan que una página reproduzca sonido sola. Por eso la música empieza **cuando el invitado toca el sello del sobre**.

### 4. Colores y estilo

Al inicio de `css/estilos.css` están los colores de toda la página:

```css
--oliva: #5c6a3e;        /* color principal (botones, títulos) */
--oliva-oscuro: #3f4829; /* fondos oscuros y nombres */
--dorado: #a9864d;       /* detalles dorados */
--vino: #7b2d3b;         /* sello de cera y botón flotante */
--marfil: #fbf8f2;       /* fondo */
```

Cambia esos códigos y toda la invitación cambia de color. Los colores del sobre están en `index.html` (los `stop-color` de los dibujos del sobre).

### 5. Título y vista previa al compartir

Cuando compartes un enlace, WhatsApp no lee los datos de `config.js`. Por eso hay que poner los nombres también en las primeras líneas de `index.html`:

```html
<title>Valentina & Santiago · Nuestra boda</title>
<meta property="og:title" content="Valentina & Santiago · ¡Nos casamos!">
<meta property="og:image" content="https://malquiel20.github.io/Boda/assets/img/compartir.jpg">
```

La imagen ya tiene la dirección completa de la página publicada (`og:image` y `og:url`). Si algún día cambias la dirección, actualízala aquí también: algunas aplicaciones solo muestran la imagen con la dirección completa.

---

## Lista de invitados y enlaces personales

Cada **invitación** puede ser una persona, una pareja o una familia, y tiene un número de **cupos**: cuántas personas pueden asistir con ella.

**Cómo agregar a tus invitados y enviarles la invitación:**

1. Abre el panel `admin.html` y entra a **Invitados**.
2. Toca **"+ Agregar invitado"**, escribe el nombre (por ejemplo "Familia Pérez") y elige con **− / +** cuántas personas pueden ir.
3. Toca **Guardar invitado** y luego **"Enviar invitación por WhatsApp"**.

Si ya tienes la lista en Excel, en **Herramientas → Agregar varios invitados a la vez** puedes pegarla completa.

Cada invitado recibe un **enlace personal**, por ejemplo `https://tu-pagina/?i=familia-perez-k7m2`. Al abrirlo:
- el sobre muestra su nombre y para cuántas personas es la invitación;
- el formulario no le deja confirmar más personas de las permitidas.

La terminación aleatoria (`-k7m2`) evita que alguien adivine el enlace de otro invitado.

**¿Dónde se guarda la lista?**
- **Con Google Sheets conectado** (lo normal): en la pestaña **Invitados** de tu hoja de cálculo. Así los enlaces funcionan en el celular de cualquier invitado. También puedes escribir o corregir invitados directamente en la hoja; el panel les crea su enlace la próxima vez que lo abras.
- **En modo de prueba**: solo en el navegador donde los agregaste. Sirve para probar abriendo los enlaces desde ese mismo dispositivo, pero tus invitados no los verían.
- **Opcional:** si prefieres escribir la lista a mano, puedes ponerla en `js/invitados.js` (el archivo explica el formato). Esos invitados se suman a los del panel.

---

## Guardar las respuestas en Google Sheets

Sin este paso la página funciona en *modo demostración*: las respuestas solo se guardan en el celular de cada invitado y los novios no las reciben. Hazlo una sola vez, te toma unos 10 minutos:

1. Entra a [sheets.google.com](https://sheets.google.com) y crea una **hoja de cálculo nueva**. Ponle un nombre, por ejemplo "Confirmaciones boda".
2. En el menú, ve a **Extensiones → Apps Script**.
3. Borra el código que aparece y pega **todo** el contenido del archivo `google-apps-script/Codigo.gs`.
4. En la línea `var CLAVE_ADMIN = "cambia-esta-clave";` escribe una clave tuya. Es la que usarás para ver las respuestas en el panel.
5. Guarda con el ícono del disquete.
6. Toca **Implementar → Nueva implementación**:
   - En el engranaje elige **Aplicación web**.
   - **Ejecutar como:** Yo.
   - **Quién tiene acceso:** Cualquier usuario.
   - Toca **Implementar**.
7. Google te pedirá permisos. Si aparece "Google no ha verificado esta app", toca **Configuración avanzada → Ir a (nombre del proyecto)** y luego **Permitir**. Es tu propio script, así que es seguro.
8. Copia la **URL de la aplicación web**. Termina en `/exec`.
9. Pégala en `js/config.js`:
   ```js
   urlGoogleScript: "https://script.google.com/macros/s/XXXXXXXX/exec",
   ```
10. Para probar, abre la URL en el navegador. Debe decir *"El script de la invitación está funcionando."*

En la hoja se crean solas tres pestañas:
- **Invitados**: tu lista de invitaciones con sus cupos. Se llena desde el panel, pero también puedes escribir en ella directamente. No cambies la columna "Código", porque es la del enlace personal.
- **Respuestas**: una fila por invitación (quién respondió, si asiste, cuántos adultos y niños, teléfono, canción y mensaje).
- **Asistentes**: una fila por persona, con sus restricciones alimentarias.

El script también revisa los cupos: aunque alguien modifique la página, no puede confirmar más personas de las que tiene su invitación.

> Si después cambias el código del script, ve a **Implementar → Administrar implementaciones → ✏️ Editar → Versión: Nueva versión → Implementar**. Si no, Google sigue usando la versión anterior. La URL no cambia.

---

## Publicar la página gratis (GitHub Pages)

1. El código está en la rama `claude/data-session-colocale-boda-rixdc2`. Únela a la rama `main`, por ejemplo con un *Pull Request* en GitHub y luego **Merge**.
2. En GitHub, entra al repositorio → **Settings → Pages**.
3. En **Source** elige **Deploy from a branch**, rama **main**, carpeta **/ (root)**, y toca **Save**.
4. Espera uno o dos minutos. Tu invitación quedará en:
   **`https://malquiel20.github.io/Boda/`**
5. El panel estará en `https://malquiel20.github.io/Boda/admin.html`.
6. Opcional: pon esa dirección en `urlSitio` dentro de `js/config.js` para que los enlaces del panel siempre usen tu dirección pública.

> Si tu repositorio es **privado**, GitHub Pages solo funciona con un plan de pago de GitHub. Puedes hacer el repositorio público o publicar la carpeta gratis en [Netlify](https://app.netlify.com/drop), arrastrándola a esa página.

---

## Probarla en tu computador

- **Lo más fácil:** abre `index.html` con doble clic.
- **Lo más fiel a la versión publicada:** en la carpeta del proyecto ejecuta `python3 -m http.server 8000` y abre `http://localhost:8000`.

Para probar el recorrido completo:
1. Abre `http://localhost:8000/admin.html` y agrega un invitado en **Invitados → Agregar invitado**.
2. Toca su nombre y luego **Ver su invitación**. Verás el sobre con su nombre y sus cupos.
3. Llena el formulario y vuelve al panel. En modo de prueba verás la respuesta porque usaste el mismo navegador.

El sobre se muestra una vez por visita y por invitado. Para volver a verlo, abre la página en una pestaña nueva o en modo incógnito.

---

## Privacidad: qué es público y qué no

- **Público:** lo que está en los archivos de la página (`config.js`, fotos y, si lo usas, `invitados.js`).
- **Lo que ve cada invitado:** con su enlace personal solo se consulta el nombre y los cupos de **esa** invitación.
- **Quien entra sin enlace:** ve la lista de nombres para elegir el suyo, pero no los enlaces de los demás. Si no quieres mostrar esa lista, pon `permitirSinEnlace: false` en `js/config.js`.
- **Privado:** los teléfonos de tus invitados, la lista completa con sus enlaces y todas las respuestas. Se guardan en **tu** Google Sheets y el panel solo los muestra con la clave. Usa una clave que no sea fácil de adivinar. El script no muestra nada mientras tenga la clave de ejemplo.
- `admin.html` está marcado para que los buscadores no lo muestren.

---

## Preguntas frecuentes

**¿Por qué la música no suena sola al entrar?**
Los navegadores no lo permiten. Suena cuando el invitado toca el sello del sobre o el disco de vinilo.

**Un invitado se equivocó al confirmar. ¿Qué hago?**
Puede volver a abrir su enlace y tocar **Modificar respuesta**. La nueva respuesta reemplaza la anterior. También puedes corregirla directamente en Google Sheets.

**¿Puedo tener solo ceremonia, sin recepción?**
Sí. Deja un solo evento en `eventos`; el título cambia solo.

**¿Cómo cierro las confirmaciones antes de tiempo?**
Cambia `rsvp.fechaLimite` por una fecha que ya pasó.

**¿Puedo usar la página sin enlaces personales?**
Sí. Con `permitirSinEnlace: true`, quien abre el enlace general elige su nombre de la lista.

**Los cambios no aparecen en la página publicada.**
GitHub Pages tarda uno o dos minutos en actualizarse. Recarga la página; si no cambia, ábrela en modo incógnito.

---

## Créditos

- Diseño, ilustraciones (rama de olivo, sobre, sello) y melodía de ejemplo: originales, creados para este proyecto.
- Tipografías: [Great Vibes](https://github.com/googlefonts/great-vibes), [Cormorant Garamond](https://github.com/CatharsisFonts/Cormorant) y [Montserrat](https://github.com/JulietaUla/Montserrat), con licencia SIL Open Font License (ver `assets/fuentes/LICENCIA-OFL.txt`).
- Códigos QR: [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) de Kazuhiko Arase, con licencia MIT.
