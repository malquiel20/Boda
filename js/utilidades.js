/*
 * Funciones compartidas por la invitación (index.html) y el panel (admin.html).
 * No necesitas editar este archivo.
 */
(function () {
  "use strict";

  const BODA = window.BODA || {};
  const INVITADOS = Array.isArray(window.INVITADOS) ? window.INVITADOS : [];

  // ---------- Íconos (líneas finas, 24x24) ----------
  const ICONOS = {
    anillos: '<circle cx="8.5" cy="14.5" r="5.5"/><circle cx="15.5" cy="14.5" r="5.5"/><path d="M8.5 9 6.8 6.6 8.5 4.6l1.7 2z"/>',
    iglesia: '<path d="M12 2v4M10 4h4"/><path d="M5 21V11l7-5 7 5v10"/><path d="M3 21h18"/><path d="M10 21v-4a2 2 0 0 1 4 0v4"/>',
    copas: '<path d="M5 3h5l-.8 6.3a1.7 1.7 0 0 1-3.4 0z"/><path d="M7.5 11v7M5 18h5"/><path d="M14 3h5l-.8 6.3a1.7 1.7 0 0 1-3.4 0z"/><path d="M16.5 11v7M14 18h5"/>',
    cena: '<circle cx="12" cy="12.5" r="5"/><path d="M3.5 4v5a2 2 0 0 0 2 2v9M5.5 4v4.5"/><path d="M20.5 4c-1.8 0-2.5 3-2.5 6.5h2.5V20"/>',
    baile: '<path d="M9 18V5l11-2v13"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/>',
    pastel: '<path d="M4 21h16M5.5 21v-6.5h13V21M7.5 14.5V11h9v3.5"/><path d="M12 11V8.5"/><path d="M12 7c-1.1-.9-.3-2.6 0-3 .3.4 1.1 2.1 0 3z"/>',
    luna: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
    camara: '<path d="M3 8h4l2-3h6l2 3h4v11H3z"/><circle cx="12" cy="13" r="3.8"/>',
    ramo: '<circle cx="12" cy="6.5" r="2.8"/><circle cx="8" cy="9" r="2.4"/><circle cx="16" cy="9" r="2.4"/><path d="M9 12.5l3 8.5 3-8.5"/><path d="M10 16h4"/>',
    ubicacion: '<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>',
    reloj: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.2 2"/>',
    calendario: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    regalo: '<rect x="3" y="8" width="18" height="4.5" rx="1"/><path d="M5 12.5V21h14v-8.5M12 8v13"/><path d="M12 8C10.5 5 7 4.3 7 6.4 7 8 12 8 12 8zM12 8c1.5-3 5-3.7 5-1.6C17 8 12 8 12 8z"/>',
    sobre: '<rect x="3" y="6" width="18" height="13" rx="1.5"/><path d="m3.5 7 8.5 6.3L20.5 7"/>',
    tarjeta: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M7 15h4"/>',
    corazon: '<path d="M12 20s-7.5-4.6-7.5-10.2A4.1 4.1 0 0 1 12 7.4a4.1 4.1 0 0 1 7.5 2.4C19.5 15.4 12 20 12 20z"/>',
    auto: '<path d="M3 17v-4.5L5.2 7h13.6l2.2 5.5V17"/><path d="M3 17h18M6 17v2M18 17v2"/><circle cx="7.5" cy="13.5" r="1"/><circle cx="16.5" cy="13.5" r="1"/>',
    adultos: '<circle cx="9" cy="7" r="3"/><path d="M3 20v-.5a6 6 0 0 1 12 0v.5"/><circle cx="17" cy="9" r="2.4"/><path d="M15.8 14.3A4.6 4.6 0 0 1 21 18.8v1.2"/>',
    sol: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6 6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4"/>',
    traje: '<path d="M8 3h8l3 4-2.5 14h-9L5 7z"/><path d="M10.5 3 12 6l1.5-3M12 6l-1 3 1 6 1-6z"/>',
    vestido: '<path d="M9.5 3h5l-.8 4.5L18 21H6l4.3-13.5z"/><path d="M10.3 7.5h3.4"/>',
    chat: '<path d="M4 20l1.4-4A8 8 0 1 1 8.5 19z"/><path d="M9 10.5h6M9 13.5h4"/>',
    copiar: '<rect x="8.5" y="8.5" width="11.5" height="11.5" rx="2"/><path d="M15.5 8.5V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v9.5a1 1 0 0 0 1 1h3.5"/>',
    navegar: '<path d="M3 11.5 21 3l-8.5 18-2-7.5z"/>',
    mapa: '<path d="M9 4 3 6.5v13.5L9 17.5l6 2.5 6-2.5V4l-6 2.5z"/><path d="M9 4v13.5M15 6.5V20"/>',
    descargar: '<path d="M12 4v11M7.5 10.5 12 15l4.5-4.5"/><path d="M4 19h16"/>',
    subir: '<path d="M12 16V5M7.5 9.5 12 5l4.5 4.5"/><path d="M4 19h16"/>',
    musica: '<path d="M9 18V5l11-2v13"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    cerrar: '<path d="M6 6l12 12M18 6 6 18"/>',
    izquierda: '<path d="m15 5-7 7 7 7"/>',
    derecha: '<path d="m9 5 7 7-7 7"/>',
    abajo: '<path d="m6 9 6 6 6-6"/>',
    enlace: '<path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4L11.5 6"/><path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1.5-1.4"/>',
    personas: '<circle cx="12" cy="8" r="3.5"/><path d="M5 20v-.5a7 7 0 0 1 14 0v.5"/>',
    casa: '<path d="M4 11 12 4l8 7"/><path d="M6 9.5V20h12V9.5"/><path d="M10 20v-5h4v5"/>',
    ajustes: '<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
    candado: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    actualizar: '<path d="M20 12a8 8 0 1 1-2.4-5.7"/><path d="M20 4v5h-5"/>',
    campana: '<path d="M6 16v-5a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
    tabla: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9.5h18M3 15h18M9.5 4v16"/>',
    qr: '<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><path d="M14 14h2v2h-2zM18 18h2v2h-2zM14 18.5h2M18.5 14h1.5"/>',
    agregar: '<circle cx="10" cy="8" r="3.5"/><path d="M3 20v-.5a7 7 0 0 1 11-5.8"/><path d="M18 14v6M15 17h6"/>',
    basura: '<path d="M4 7h16M9.5 7V4h5v3M6 7l1 13h10l1-13"/>',
    ojo: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
    nino: '<circle cx="12" cy="9" r="3"/><path d="M7 20v-1a5 5 0 0 1 10 0v1"/>',
  };

  function icono(nombre, clase) {
    const trazo = ICONOS[nombre] || ICONOS.corazon;
    return '<svg class="icono ' + (clase || "") + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + trazo + "</svg>";
  }

  // ---------- Texto ----------
  function esc(valor) {
    return String(valor == null ? "" : valor)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function slug(texto) {
    return String(texto || "")
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
      .slice(0, 40);
  }

  function codigoAleatorio(largo) {
    const letras = "abcdefghjkmnpqrstuvwxyz23456789";
    let r = "";
    const n = largo || 4;
    if (window.crypto && window.crypto.getRandomValues) {
      const bytes = new Uint8Array(n);
      window.crypto.getRandomValues(bytes);
      for (let i = 0; i < n; i++) r += letras[bytes[i] % letras.length];
    } else {
      for (let i = 0; i < n; i++) r += letras[Math.floor(Math.random() * letras.length)];
    }
    return r;
  }

  function iniciales() {
    const p = BODA.pareja || {};
    if (p.iniciales) return p.iniciales;
    const a = (p.nombre1 || "").trim().charAt(0).toUpperCase();
    const b = (p.nombre2 || "").trim().charAt(0).toUpperCase();
    return a && b ? a + "&" + b : a || b || "♥";
  }

  function nombresPareja(union) {
    const p = BODA.pareja || {};
    return [p.nombre1, p.nombre2].filter(Boolean).join(union || " & ");
  }

  function textoCupos(n) {
    const c = Number(n) || 1;
    return c === 1 ? "1 persona" : c + " personas";
  }

  // ---------- Fechas ----------
  function fechaBoda() {
    const f = new Date(BODA.fecha);
    return isNaN(f) ? null : f;
  }

  function fechaFinBoda() {
    const f = new Date(BODA.fechaFin);
    if (!isNaN(f)) return f;
    const inicio = fechaBoda();
    return inicio ? new Date(inicio.getTime() + 6 * 3600 * 1000) : null;
  }

  function formatearFecha(fecha, opciones) {
    if (!fecha) return "";
    const base = { timeZone: BODA.zonaHoraria || undefined };
    try {
      return new Intl.DateTimeFormat("es", Object.assign(base, opciones)).format(fecha);
    } catch (e) {
      delete base.timeZone;
      return new Intl.DateTimeFormat("es", Object.assign(base, opciones)).format(fecha);
    }
  }

  // "2027-08-15" -> fin de ese día en la zona del evento
  function fechaLimiteRsvp() {
    const r = BODA.rsvp || {};
    if (!r.fechaLimite) return null;
    const offset = (String(BODA.fecha || "").match(/([+-]\d{2}:\d{2}|Z)$/) || [])[1] || "";
    const f = new Date(r.fechaLimite + "T23:59:59" + offset);
    return isNaN(f) ? null : f;
  }

  function capitalizar(t) {
    return t ? t.charAt(0).toUpperCase() + t.slice(1) : t;
  }

  // ---------- Enlaces ----------
  function urlBase() {
    if (BODA.urlSitio) return BODA.urlSitio.replace(/[?#].*$/, "");
    // Abierta con doble clic (file://) la carpeta no abre index.html sola
    const u = new URL(window.location.protocol === "file:" ? "index.html" : "./", window.location.href);
    return u.href;
  }

  function enlaceInvitado(codigo) {
    return urlBase() + "?i=" + encodeURIComponent(codigo);
  }

  function consultaLugar(evento) {
    return [evento.lugar, evento.direccion].filter(Boolean).join(", ");
  }

  function enlaceMapa(evento) {
    if (evento.mapa) return evento.mapa;
    return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(consultaLugar(evento));
  }

  function enlaceWaze(evento) {
    return "https://waze.com/ul?q=" + encodeURIComponent(consultaLugar(evento)) + "&navigate=yes";
  }

  function enlaceMapaIncrustado(evento) {
    return "https://www.google.com/maps?q=" + encodeURIComponent(consultaLugar(evento)) + "&output=embed";
  }

  // "300 123 4567" -> "573001234567" (agrega el código de país de config.js)
  function telefonoWhatsApp(numero) {
    let limpio = String(numero || "").replace(/\D/g, "");
    const pais = String(BODA.codigoPais || "").replace(/\D/g, "");
    if (limpio && pais && limpio.length <= 10 && String(numero).trim().charAt(0) !== "+") {
      limpio = pais + limpio.replace(/^0+/, "");
    }
    return limpio;
  }

  function enlaceWhatsApp(numero, texto) {
    return "https://wa.me/" + telefonoWhatsApp(numero) + "?text=" + encodeURIComponent(texto);
  }

  // ---------- Calendario ----------
  function fechaUTC(f) {
    return f.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  }

  function datosCalendario() {
    const eventos = BODA.eventos || [];
    const lugar = eventos.length ? consultaLugar(eventos[eventos.length - 1]) : (BODA.ciudad || "");
    return {
      titulo: "Boda de " + nombresPareja(" y "),
      inicio: fechaBoda(),
      fin: fechaFinBoda(),
      lugar: lugar,
      detalle: "¡Te esperamos! Invitación: " + urlBase(),
    };
  }

  function enlaceGoogleCalendar() {
    const d = datosCalendario();
    if (!d.inicio) return "#";
    return "https://calendar.google.com/calendar/render?action=TEMPLATE" +
      "&text=" + encodeURIComponent(d.titulo) +
      "&dates=" + fechaUTC(d.inicio) + "/" + fechaUTC(d.fin) +
      "&details=" + encodeURIComponent(d.detalle) +
      "&location=" + encodeURIComponent(d.lugar);
  }

  function escICS(t) {
    return String(t).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
  }

  function descargarICS() {
    const d = datosCalendario();
    if (!d.inicio) return;
    const ics = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Invitacion de boda//ES", "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      "UID:boda-" + fechaUTC(d.inicio) + "@invitacion",
      "DTSTAMP:" + fechaUTC(new Date()),
      "DTSTART:" + fechaUTC(d.inicio),
      "DTEND:" + fechaUTC(d.fin),
      "SUMMARY:" + escICS(d.titulo),
      "DESCRIPTION:" + escICS(d.detalle),
      "LOCATION:" + escICS(d.lugar),
      "BEGIN:VALARM", "TRIGGER:-P1D", "ACTION:DISPLAY", "DESCRIPTION:" + escICS(d.titulo), "END:VALARM",
      "END:VEVENT", "END:VCALENDAR",
    ].join("\r\n");
    descargarArchivo("boda.ics", ics, "text/calendar;charset=utf-8");
  }

  function descargarArchivo(nombre, contenido, tipo) {
    const blob = contenido instanceof Blob ? contenido : new Blob([contenido], { type: tipo || "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = nombre;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
  }

  // ---------- Invitados ----------
  // Sin Google Sheets, los invitados agregados desde el panel se guardan en
  // este navegador (sirve para probar desde el mismo dispositivo).
  const CLAVE_INVITADOS_LOCALES = "boda-invitados";

  function invitadosLocales() {
    const lista = leer(CLAVE_INVITADOS_LOCALES, []);
    return Array.isArray(lista) ? lista : [];
  }

  // Lista del archivo js/invitados.js más los agregados en este navegador
  function todosLosInvitados() {
    const vistos = {};
    return INVITADOS.concat(invitadosLocales()).filter(function (i) {
      const c = String(i.codigo || "").toLowerCase();
      if (!c || vistos[c]) return false;
      vistos[c] = true;
      return true;
    });
  }

  function buscarInvitado(codigo) {
    if (!codigo) return null;
    const c = String(codigo).toLowerCase();
    return todosLosInvitados().find(function (i) { return String(i.codigo).toLowerCase() === c; }) || null;
  }

  function codigoParaInvitado(nombre, usados) {
    let codigo;
    do { codigo = (slug(nombre) || "invitado") + "-" + codigoAleatorio(4); } while (usados && usados[codigo]);
    return codigo;
  }

  function codigoDeLaUrl() {
    const p = new URLSearchParams(window.location.search);
    return p.get("i") || p.get("invitado") || "";
  }

  // ---------- Almacenamiento local (con protección si está bloqueado) ----------
  function leer(clave, porDefecto) {
    try {
      const v = window.localStorage.getItem(clave);
      return v == null ? porDefecto : JSON.parse(v);
    } catch (e) {
      return porDefecto;
    }
  }

  function guardar(clave, valor) {
    try {
      window.localStorage.setItem(clave, JSON.stringify(valor));
      return true;
    } catch (e) {
      return false;
    }
  }

  const CLAVE_DEMO = "boda-respuestas-demo";

  // ---------- Portapapeles y avisos ----------
  function copiarTexto(texto) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(texto).then(function () { return true; }, function () { return copiaManual(texto); });
    }
    return Promise.resolve(copiaManual(texto));
  }

  function copiaManual(texto) {
    const area = document.createElement("textarea");
    area.value = texto;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    let ok = false;
    try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
    area.remove();
    return ok;
  }

  let temporizadorAviso = null;
  function aviso(texto) {
    let el = document.getElementById("aviso");
    if (!el) {
      el = document.createElement("div");
      el.id = "aviso";
      el.className = "aviso";
      el.setAttribute("role", "status");
      el.setAttribute("aria-live", "polite");
      document.body.appendChild(el);
    }
    el.textContent = texto;
    el.classList.add("visible");
    clearTimeout(temporizadorAviso);
    temporizadorAviso = setTimeout(function () { el.classList.remove("visible"); }, 2600);
  }

  // ---------- Código QR ----------
  function qrSvg(texto) {
    if (typeof window.qrcode !== "function" || !texto) return "";
    window.qrcode.stringToBytes = window.qrcode.stringToBytesFuncs["UTF-8"];
    const qr = window.qrcode(0, "M");
    qr.addData(texto);
    qr.make();
    return qr.createSvgTag({ cellSize: 4, margin: 2, scalable: true, alt: "Código QR" });
  }

  function qrImagen(texto, tamanoCelda) {
    if (typeof window.qrcode !== "function" || !texto) return "";
    window.qrcode.stringToBytes = window.qrcode.stringToBytesFuncs["UTF-8"];
    const qr = window.qrcode(0, "M");
    qr.addData(texto);
    qr.make();
    return qr.createDataURL(tamanoCelda || 10, 4);
  }

  window.BodaUtil = {
    BODA: BODA,
    INVITADOS: INVITADOS,
    icono: icono,
    esc: esc,
    slug: slug,
    codigoAleatorio: codigoAleatorio,
    iniciales: iniciales,
    nombresPareja: nombresPareja,
    textoCupos: textoCupos,
    fechaBoda: fechaBoda,
    fechaLimiteRsvp: fechaLimiteRsvp,
    formatearFecha: formatearFecha,
    capitalizar: capitalizar,
    urlBase: urlBase,
    enlaceInvitado: enlaceInvitado,
    enlaceMapa: enlaceMapa,
    enlaceWaze: enlaceWaze,
    enlaceMapaIncrustado: enlaceMapaIncrustado,
    enlaceWhatsApp: enlaceWhatsApp,
    enlaceGoogleCalendar: enlaceGoogleCalendar,
    descargarICS: descargarICS,
    descargarArchivo: descargarArchivo,
    buscarInvitado: buscarInvitado,
    todosLosInvitados: todosLosInvitados,
    invitadosLocales: invitadosLocales,
    CLAVE_INVITADOS_LOCALES: CLAVE_INVITADOS_LOCALES,
    codigoParaInvitado: codigoParaInvitado,
    telefonoWhatsApp: telefonoWhatsApp,
    codigoDeLaUrl: codigoDeLaUrl,
    leer: leer,
    guardar: guardar,
    CLAVE_DEMO: CLAVE_DEMO,
    copiarTexto: copiarTexto,
    aviso: aviso,
    qrSvg: qrSvg,
    qrImagen: qrImagen,
  };
})();
