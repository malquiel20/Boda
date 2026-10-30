/*
 * =====================================================================
 *  CONFIGURACIÓN DE LA INVITACIÓN
 * =====================================================================
 *  Este es el ÚNICO archivo que necesitas editar para personalizar la
 *  invitación (además de la lista de invitados en js/invitados.js).
 *
 *  - Cambia los textos que están entre comillas.
 *  - Si no quieres una sección, borra su bloque o ponle el valor null.
 *    Ejemplo:  regalos: null,
 *  - No borres las comas al final de cada línea.
 * =====================================================================
 */
window.BODA = {

  // ---------------------------------------------------------------
  // Los novios
  // ---------------------------------------------------------------
  pareja: {
    nombre1: "Valentina",
    nombre2: "Santiago",
    // Iniciales del sello del sobre. Si lo dejas vacío se calculan solas.
    iniciales: "",
  },

  // ---------------------------------------------------------------
  // Fecha y hora (formato: AAAA-MM-DDTHH:MM:SS y la diferencia horaria)
  // Colombia, Perú, Ecuador y Panamá: -05:00 · México (centro): -06:00
  // ---------------------------------------------------------------
  fecha: "2027-09-18T16:00:00-05:00",
  fechaFin: "2027-09-19T02:00:00-05:00",   // se usa para el calendario
  zonaHoraria: "America/Bogota",           // para mostrar la fecha correcta
  ciudad: "Bogotá, Colombia",
  codigoPais: "57",                        // para WhatsApp: 57 Colombia, 52 México, 51 Perú, 593 Ecuador

  // ---------------------------------------------------------------
  // Sobre de bienvenida (se abre al tocar el sello)
  // ---------------------------------------------------------------
  sobre: {
    mostrar: true,
    saludoGeneral: "Querido invitado",   // cuando el enlace no trae un invitado
    textoAyuda: "Toca el sello para abrir tu invitación",
  },

  // ---------------------------------------------------------------
  // Portada
  // ---------------------------------------------------------------
  portada: {
    titulo: "¡Nos casamos!",
    foto: "assets/img/pareja.svg",       // cambia por tu foto, ej: assets/img/pareja.jpg
    textoFoto: "Foto de los novios",
  },

  // Frase que aparece junto a la cuenta regresiva
  frase: {
    texto: "Dos almas que se encontraron y decidieron caminar juntas para siempre. Queremos que seas parte del día más importante de nuestras vidas.",
    autor: "",
  },

  // ---------------------------------------------------------------
  // Padres y padrinos (opcional: pon null para ocultar)
  // ---------------------------------------------------------------
  familia: {
    titulo: "Con la bendición de nuestros padres",
    grupos: [
      { titulo: "Padres de la novia", nombres: ["María Fernanda Ruiz", "Jorge Alberto López"] },
      { titulo: "Padres del novio", nombres: ["Claudia Patricia Gómez", "Andrés Felipe Torres"] },
      { titulo: "Padrinos", nombres: ["Laura Martínez", "Daniel Castro"] },
    ],
  },

  // ---------------------------------------------------------------
  // Ceremonia y recepción
  // icono: anillos, iglesia, copas, cena, baile, pastel, luna, camara, ramo
  // mapa: enlace de Google Maps (opcional). Si lo dejas vacío se
  //       busca automáticamente con el lugar y la dirección.
  // ---------------------------------------------------------------
  eventos: [
    {
      titulo: "Ceremonia religiosa",
      icono: "iglesia",
      lugar: "Parroquia Nuestra Señora del Rosario",
      direccion: "Calle 85 #9-50, Bogotá",
      hora: "4:00 p. m.",
      mapa: "",
    },
    {
      titulo: "Recepción",
      icono: "copas",
      lugar: "Hacienda Los Olivos",
      direccion: "Km 3 vía Chía - Cajicá, Cundinamarca",
      hora: "6:00 p. m.",
      mapa: "",
    },
  ],

  // ---------------------------------------------------------------
  // Programa del día
  // ---------------------------------------------------------------
  programa: [
    { hora: "4:00 p. m.", actividad: "Ceremonia", icono: "anillos" },
    { hora: "6:00 p. m.", actividad: "Recepción y cóctel", icono: "copas" },
    { hora: "6:45 p. m.", actividad: "Sesión de fotos", icono: "camara" },
    { hora: "7:30 p. m.", actividad: "Brindis", icono: "copas" },
    { hora: "8:00 p. m.", actividad: "Cena", icono: "cena" },
    { hora: "9:15 p. m.", actividad: "Primer baile y fiesta", icono: "baile" },
    { hora: "11:00 p. m.", actividad: "Lanzamiento del ramo", icono: "ramo" },
    { hora: "12:00 a. m.", actividad: "Torta y hora loca", icono: "pastel" },
    { hora: "2:00 a. m.", actividad: "Gracias por venir", icono: "luna" },
  ],

  // ---------------------------------------------------------------
  // Galería de fotos (agrega o quita las que quieras)
  // ---------------------------------------------------------------
  galeria: {
    titulo: "Nuestra historia",
    texto: "Algunos de nuestros momentos favoritos juntos.",
    fotos: [
      { src: "assets/img/galeria-1.svg", alt: "Foto de los novios 1" },
      { src: "assets/img/galeria-2.svg", alt: "Foto de los novios 2" },
      { src: "assets/img/galeria-3.svg", alt: "Foto de los novios 3" },
      { src: "assets/img/galeria-4.svg", alt: "Foto de los novios 4" },
      { src: "assets/img/galeria-5.svg", alt: "Foto de los novios 5" },
      { src: "assets/img/galeria-6.svg", alt: "Foto de los novios 6" },
    ],
  },

  // ---------------------------------------------------------------
  // Código de vestimenta
  // ---------------------------------------------------------------
  vestimenta: {
    titulo: "Formal",
    ellos: "Traje formal oscuro",
    ellas: "Vestido largo",
    textoColores: "Con cariño, nos reservamos estos colores:",
    coloresReservados: [
      { nombre: "Blanco", color: "#ffffff" },
      { nombre: "Beige", color: "#e8dcc6" },
      { nombre: "Verde oliva", color: "#6b7446" },
    ],
  },

  // ---------------------------------------------------------------
  // Regalos (opcional: pon null para ocultar)
  // En "datos" puedes poner cuentas bancarias; el invitado puede copiarlas.
  // La "Mesa de regalos" solo aparece cuando le pones un enlace.
  // ---------------------------------------------------------------
  regalos: {
    texto: "Tu presencia es nuestro mejor regalo. Si deseas tener un detalle con nosotros, te dejamos estas opciones:",
    opciones: [
      {
        icono: "sobre",
        titulo: "Lluvia de sobres",
        texto: "El día de la boda tendremos un buzón para recibir tus buenos deseos en un sobre.",
      },
      {
        icono: "tarjeta",
        titulo: "Transferencia",
        texto: "Si lo prefieres, puedes hacer una transferencia:",
        datos: [
          { etiqueta: "Banco", valor: "Banco Ejemplo" },
          { etiqueta: "Cuenta de ahorros", valor: "000-000000-00" },
          { etiqueta: "Titular", valor: "Valentina López" },
        ],
      },
      {
        icono: "regalo",
        titulo: "Mesa de regalos",
        texto: "También tenemos una lista de regalos en línea.",
        enlace: "",
        textoBoton: "Ver mesa de regalos",
      },
    ],
  },

  // ---------------------------------------------------------------
  // Comparte tus fotos (código QR)
  // enlace: álbum compartido de Google Fotos, carpeta de Google Drive, etc.
  // ---------------------------------------------------------------
  fotos: {
    titulo: "¡Captura nuestro gran día!",
    texto: "Escanea el código o toca el botón para subir las fotos y videos que tomes durante la boda.",
    enlace: "https://photos.google.com/",
    textoBoton: "Subir mis fotos",
    hashtag: "#ValentinaYSantiago2027",
  },

  // ---------------------------------------------------------------
  // Confirmación de asistencia
  // urlGoogleScript: pega aquí la URL de tu Google Apps Script
  //   (ver README, sección "Guardar las respuestas en Google Sheets").
  //   Si la dejas vacía la página funciona en "modo demostración".
  // whatsapp: número con código de país, sin + ni espacios (opcional).
  // ---------------------------------------------------------------
  rsvp: {
    fechaLimite: "2027-08-15",
    urlGoogleScript: "",
    whatsapp: "",
    permitirSinEnlace: true,   // false = solo pueden confirmar con su enlace personal
    preguntarCancion: true,
    restricciones: ["Vegetariano", "Vegano", "Sin gluten (celíaco)", "Sin lactosa", "Alergia"],
  },

  // ---------------------------------------------------------------
  // Recomendaciones
  // icono: adultos, reloj, camara, auto, corazon, copas, sol, regalo
  // ---------------------------------------------------------------
  recomendaciones: [
    { icono: "adultos", titulo: "Solo adultos", texto: "Amamos a los niños, pero esta vez queremos que disfrutes la noche sin preocupaciones." },
    { icono: "reloj", titulo: "Puntualidad", texto: "La ceremonia empieza a la hora indicada. ¡Llega unos minutos antes!" },
    { icono: "camara", titulo: "Ceremonia sin celulares", texto: "Tendremos fotógrafo. Te pedimos disfrutar la ceremonia con los ojos y el corazón." },
    { icono: "auto", titulo: "Transporte", texto: "Hay parqueadero en la hacienda. Si vas a brindar, ¡no manejes!" },
  ],

  // ---------------------------------------------------------------
  // Cierre
  // ---------------------------------------------------------------
  cierre: {
    titulo: "¡Te esperamos!",
    texto: "Gracias por ser parte de nuestra historia.",
  },

  // ---------------------------------------------------------------
  // Música de fondo (se reproduce al abrir el sobre)
  // ---------------------------------------------------------------
  musica: {
    archivo: "assets/musica/melodia-ejemplo.mp3",
    titulo: "Melodía de ejemplo",
  },

  // ---------------------------------------------------------------
  // Mensajes para enviar por WhatsApp desde el panel (admin.html)
  // {nombre}, {enlace} y {cupos} se reemplazan automáticamente.
  // ---------------------------------------------------------------
  mensajeInvitacion: "¡Hola {nombre}! Con mucha alegría queremos invitarte a nuestra boda. Esta es tu invitación personal (válida para {cupos}): {enlace}",
  // Recordatorio para quienes no han respondido. También acepta {fechaLimite}.
  mensajeRecordatorio: "¡Hola {nombre}! Te recordamos confirmar tu asistencia a nuestra boda antes del {fechaLimite}. Puedes hacerlo aquí: {enlace}",

  // Dirección pública de la página (ej: https://usuario.github.io/Boda/).
  // Si la dejas vacía se usa la dirección actual del navegador.
  urlSitio: "",
};
