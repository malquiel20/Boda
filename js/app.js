/*
 * Lógica de la invitación. Todos los textos salen de js/config.js,
 * así que normalmente no necesitas editar este archivo.
 */
(function () {
  "use strict";

  const U = window.BodaUtil;
  const B = U.BODA;
  const esc = U.esc;
  const icono = U.icono;
  const $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  const $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  const reducirMovimiento = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let invitado = null; // se busca al cargar (ver resolverInvitado al final)
  const fecha = U.fechaBoda();
  // El sobre se muestra una vez por visita y por invitado
  const claveSobre = function () { return "boda-sobre-abierto-" + (invitado ? invitado.codigo : "general"); };

  function divisor() {
    return '<img class="divisor" src="assets/img/divisor.svg" alt="" aria-hidden="true">';
  }

  function tituloSeccion(eyebrow, titulo, subtitulo) {
    return '<div class="titulo-seccion revelar">' +
      (eyebrow ? '<p class="eyebrow">' + esc(eyebrow) + "</p>" : "") +
      (titulo ? "<h2>" + esc(titulo) + "</h2>" : "") +
      divisor() +
      (subtitulo ? '<p class="subtitulo">' + esc(subtitulo) + "</p>" : "") +
      "</div>";
  }

  function mostrarSeccion(id, html) {
    const el = document.getElementById(id);
    if (!el) return null;
    el.innerHTML = html;
    el.hidden = false;
    return el;
  }

  function fechaCorta(f) {
    if (!f) return "";
    const partes = U.formatearFecha(f, { day: "2-digit", month: "2-digit", year: "numeric" });
    return partes.replace(/\//g, " · ");
  }

  function fechaLarga(f) {
    if (!f) return "";
    return U.capitalizar(U.formatearFecha(f, { weekday: "long" })) + " · " +
      U.formatearFecha(f, { day: "numeric", month: "long" }) + " · " +
      U.formatearFecha(f, { year: "numeric" });
  }

  // =================================================================
  //  SOBRE DE BIENVENIDA
  // =================================================================
  function prepararSobre() {
    const pantalla = $("#sobre");
    const opciones = B.sobre || {};

    $("#carta-nombres").textContent = U.nombresPareja(" & ");
    $("#carta-fecha").textContent = fechaCorta(fecha);
    $("#sello-iniciales").textContent = U.iniciales();
    if (opciones.textoAyuda) $("#sobre-ayuda").textContent = opciones.textoAyuda;

    if (invitado) {
      $("#sobre-invitado").textContent = invitado.nombre;
      const cupos = $("#sobre-cupos");
      cupos.textContent = "Invitación válida para " + U.textoCupos(invitado.cupos);
      cupos.hidden = false;
    } else {
      $("#sobre-invitado").textContent = opciones.saludoGeneral || "Querido invitado";
    }

    let yaAbierto = false;
    try { yaAbierto = window.sessionStorage.getItem(claveSobre()) === "1"; } catch (e) { yaAbierto = false; }

    if (opciones.mostrar === false || yaAbierto) {
      pantalla.hidden = true;
      abrirInvitacion(false);
      return;
    }

    const boton = $("#abrir-sobre");
    boton.addEventListener("click", abrirSobre, { once: true });
    $("#sobre-grafico").addEventListener("click", function (e) {
      if (e.target !== boton && !boton.contains(e.target)) boton.click();
    });
    pantalla.setAttribute("tabindex", "-1");
    setTimeout(function () { pantalla.focus({ preventScroll: true }); }, 50);
  }

  function abrirSobre() {
    const pantalla = $("#sobre");
    iniciarMusica();
    pantalla.classList.add("abriendo");
    $("#sobre-grafico").classList.add("abierto");
    try { window.sessionStorage.setItem(claveSobre(), "1"); } catch (e) { /* sin almacenamiento */ }

    const espera = reducirMovimiento ? 150 : 1700;
    setTimeout(function () {
      pantalla.classList.add("saliendo");
      lanzarPetalos();
      abrirInvitacion(true);
    }, espera);
    setTimeout(function () { pantalla.hidden = true; }, espera + 800);
  }

  function abrirInvitacion(conFoco) {
    document.body.classList.remove("bloqueado");
    document.body.classList.add("abierta");
    if (musicaDisponible) $("#disco").hidden = false;
    if (conFoco) $("#portada-nombres").focus({ preventScroll: true });
  }

  function lanzarPetalos() {
    if (reducirMovimiento) return;
    const capa = $("#petalos");
    const colores = ["#ffffff", "#f3e6d3", "#e9d8bd", "#c9d0b0"];
    for (let i = 0; i < 26; i++) {
      const p = document.createElement("span");
      p.className = "petalo";
      const tam = 8 + Math.random() * 10;
      p.style.left = Math.random() * 100 + "vw";
      p.style.width = tam + "px";
      p.style.height = tam * 0.75 + "px";
      p.style.background = colores[i % colores.length];
      p.style.animationDuration = 4 + Math.random() * 3 + "s";
      p.style.animationDelay = Math.random() * 1.2 + "s";
      p.style.setProperty("--deriva", (Math.random() * 120 - 60) + "px");
      p.style.setProperty("--giro", (Math.random() * 540 - 270) + "deg");
      capa.appendChild(p);
    }
    setTimeout(function () { capa.innerHTML = ""; }, 9000);
  }

  // =================================================================
  //  MÚSICA
  // =================================================================
  let musicaDisponible = false;
  let sonabaAntesDeOcultar = false;

  function prepararMusica() {
    const m = B.musica;
    const audio = $("#musica");
    const disco = $("#disco");
    if (!m || !m.archivo) return;
    musicaDisponible = true;
    audio.src = m.archivo;
    audio.volume = 0.6;
    disco.title = m.titulo || "Música";

    audio.addEventListener("error", function () {
      musicaDisponible = false;
      disco.hidden = true;
      console.warn("No se encontró la música en: " + m.archivo);
    });
    audio.addEventListener("play", function () { estadoDisco(true); });
    audio.addEventListener("pause", function () { estadoDisco(false); });

    disco.addEventListener("click", function () {
      if (audio.paused) iniciarMusica(); else audio.pause();
    });

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        sonabaAntesDeOcultar = !audio.paused;
        audio.pause();
      } else if (sonabaAntesDeOcultar) {
        iniciarMusica();
      }
    });
  }

  function iniciarMusica() {
    if (!musicaDisponible) return;
    const p = $("#musica").play();
    if (p && p.catch) p.catch(function () { estadoDisco(false); });
  }

  function estadoDisco(sonando) {
    const disco = $("#disco");
    disco.classList.toggle("sonando", sonando);
    disco.setAttribute("aria-pressed", sonando ? "true" : "false");
    disco.setAttribute("aria-label", sonando ? "Pausar música" : "Reproducir música");
  }

  // =================================================================
  //  PORTADA, FRASE Y CUENTA REGRESIVA
  // =================================================================
  function prepararPortada() {
    const p = B.pareja || {};
    const portada = B.portada || {};
    document.title = U.nombresPareja(" & ") + " · Nuestra boda";

    if (portada.titulo) $("#portada-titulo").textContent = portada.titulo;
    if (portada.foto) {
      const foto = $("#portada-foto");
      foto.src = portada.foto;
      foto.alt = portada.textoFoto || "Foto de los novios";
    }
    $("#portada-nombres").innerHTML =
      '<span class="nombre">' + esc(p.nombre1) + '</span><span class="y">&amp;</span><span class="nombre">' + esc(p.nombre2) + "</span>";
    $("#portada-fecha").textContent = fechaLarga(fecha);
    $("#portada-ciudad").textContent = B.ciudad || "";

    if (invitado) {
      const para = $("#portada-para");
      para.innerHTML = "Invitación especial para <strong>" + esc(invitado.nombre) + "</strong>";
      para.hidden = false;
    }

    const frase = B.frase;
    if (frase && frase.texto) {
      $("#frase").innerHTML = "<p>" + esc(frase.texto) + "</p>" + (frase.autor ? "<cite>" + esc(frase.autor) + "</cite>" : "");
    } else {
      $("#frase").remove();
    }

    $("#cal-google").href = U.enlaceGoogleCalendar();
    $("#cal-google").innerHTML = icono("calendario") + "<span>Google Calendar</span>";
    $("#cal-ics").innerHTML = icono("descargar") + "<span>iPhone / Outlook</span>";
    $("#cal-ics").addEventListener("click", U.descargarICS);
  }

  function iniciarContador() {
    const contenedor = $("#contador");
    const mensaje = $("#contador-mensaje");
    if (!fecha) {
      contenedor.hidden = true;
      return;
    }
    const fin = new Date(B.fechaFin || fecha.getTime() + 6 * 3600 * 1000);
    const nums = {};
    $$(".contador-num", contenedor).forEach(function (n) { nums[n.dataset.unidad] = n; });
    const dos = function (n) { return String(n).padStart(2, "0"); };
    let intervalo = null;

    function tic() {
      const ahora = Date.now();
      const resta = fecha.getTime() - ahora;
      if (resta <= 0) {
        contenedor.hidden = true;
        const etiqueta = contenedor.previousElementSibling;
        if (etiqueta && etiqueta.classList.contains("titulo-seccion")) etiqueta.hidden = true;
        mensaje.textContent = ahora < fin.getTime() ? "¡Hoy es el gran día!" : "¡Gracias por acompañarnos en este día tan especial!";
        mensaje.hidden = false;
        if (intervalo) clearInterval(intervalo);
        return;
      }
      const s = Math.floor(resta / 1000);
      nums.dias.textContent = Math.floor(s / 86400);
      nums.horas.textContent = dos(Math.floor((s % 86400) / 3600));
      nums.minutos.textContent = dos(Math.floor((s % 3600) / 60));
      nums.segundos.textContent = dos(s % 60);
    }
    tic();
    intervalo = setInterval(tic, 1000);
  }

  // =================================================================
  //  SECCIONES
  // =================================================================
  function seccionFamilia() {
    const f = B.familia;
    if (!f || !f.grupos || !f.grupos.length) return;
    const grupos = f.grupos.map(function (g) {
      return '<div class="familia-grupo revelar"><p class="eyebrow">' + esc(g.titulo) + '</p><p class="familia-nombres">' +
        (g.nombres || []).map(esc).join("<br>") + "</p></div>";
    }).join("");
    mostrarSeccion("familia", tituloSeccion("Nuestra familia", f.titulo) + '<div class="familia-grid">' + grupos + "</div>");
  }

  function seccionEventos() {
    const eventos = B.eventos || [];
    if (!eventos.length) return;
    const titulo = eventos.length > 1 ? "Ceremonia & Recepción" : eventos[0].titulo;
    const tarjetas = eventos.map(function (ev, i) {
      return '<article class="tarjeta evento revelar">' +
        '<span class="evento-icono">' + icono(ev.icono || "anillos") + "</span>" +
        "<h3>" + esc(ev.titulo) + "</h3>" +
        (ev.hora ? '<p class="evento-hora">' + icono("reloj") + esc(ev.hora) + "</p>" : "") +
        '<p class="evento-lugar">' + esc(ev.lugar) + "</p>" +
        (ev.direccion ? '<p class="evento-direccion">' + esc(ev.direccion) + "</p>" : "") +
        '<div class="botones">' +
        '<a class="boton" href="' + esc(U.enlaceMapa(ev)) + '" target="_blank" rel="noopener">' + icono("ubicacion") + "<span>Ver ubicación</span></a>" +
        '<a class="boton boton-claro" href="' + esc(U.enlaceWaze(ev)) + '" target="_blank" rel="noopener">' + icono("navegar") + "<span>Waze</span></a>" +
        "</div>" +
        '<button type="button" class="enlace-texto" data-mapa="' + i + '" aria-expanded="false">' + icono("mapa") + "<span>Mostrar mapa aquí</span></button>" +
        '<div class="evento-mapa" id="mapa-' + i + '" hidden></div>' +
        "</article>";
    }).join("");
    const el = mostrarSeccion("eventos", tituloSeccion(U.capitalizar(U.formatearFecha(fecha, { weekday: "long", day: "numeric", month: "long" })), titulo) +
      '<div class="eventos-grid' + (eventos.length === 1 ? " uno" : "") + '">' + tarjetas + "</div>");

    $$("[data-mapa]", el).forEach(function (boton) {
      boton.addEventListener("click", function () {
        const i = Number(boton.dataset.mapa);
        const caja = document.getElementById("mapa-" + i);
        const abrir = caja.hidden;
        if (abrir && !caja.firstChild) {
          caja.innerHTML = '<iframe title="Mapa de ' + esc(eventos[i].lugar) + '" src="' + esc(U.enlaceMapaIncrustado(eventos[i])) +
            '" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>';
        }
        caja.hidden = !abrir;
        boton.setAttribute("aria-expanded", abrir ? "true" : "false");
        $("span", boton).textContent = abrir ? "Ocultar mapa" : "Mostrar mapa aquí";
      });
    });
  }

  function seccionPrograma() {
    const programa = B.programa || [];
    if (!programa.length) return;
    const items = programa.map(function (m) {
      return '<li class="momento revelar"><span class="momento-icono">' + icono(m.icono || "corazon") + "</span>" +
        '<div class="momento-texto"><span class="momento-hora">' + esc(m.hora) + '</span><span class="momento-actividad">' + esc(m.actividad) + "</span></div></li>";
    }).join("");
    mostrarSeccion("programa", tituloSeccion("Itinerario", "Programa del día") + '<ol class="linea-tiempo">' + items + "</ol>");
  }

  // ---------- Galería y visor ----------
  let fotosGaleria = [];
  let fotoActual = 0;

  function seccionGaleria() {
    const g = B.galeria;
    if (!g || !g.fotos || !g.fotos.length) return;
    fotosGaleria = g.fotos;
    const items = g.fotos.map(function (f, i) {
      return '<button type="button" class="galeria-item revelar" data-foto="' + i + '" aria-label="Ampliar foto ' + (i + 1) + '">' +
        '<img src="' + esc(f.src) + '" alt="' + esc(f.alt || "") + '" loading="lazy" width="600" height="800"></button>';
    }).join("");
    const el = mostrarSeccion("galeria", tituloSeccion("Galería", g.titulo, g.texto) + '<div class="galeria-grid">' + items + "</div>");
    $$("[data-foto]", el).forEach(function (b) {
      b.addEventListener("click", function () { abrirVisor(Number(b.dataset.foto), b); });
    });
    prepararVisor();
  }

  let origenVisor = null;
  function prepararVisor() {
    const visor = $("#visor");
    $("#visor-cerrar").innerHTML = icono("cerrar");
    $("#visor-anterior").innerHTML = icono("izquierda");
    $("#visor-siguiente").innerHTML = icono("derecha");
    $("#visor-cerrar").addEventListener("click", cerrarVisor);
    $("#visor-anterior").addEventListener("click", function () { moverVisor(-1); });
    $("#visor-siguiente").addEventListener("click", function () { moverVisor(1); });
    visor.addEventListener("click", function (e) { if (e.target === visor) cerrarVisor(); });
    document.addEventListener("keydown", function (e) {
      if (visor.hidden) return;
      if (e.key === "Escape") cerrarVisor();
      if (e.key === "ArrowLeft") moverVisor(-1);
      if (e.key === "ArrowRight") moverVisor(1);
    });
    let inicioX = null;
    visor.addEventListener("touchstart", function (e) { inicioX = e.touches[0].clientX; }, { passive: true });
    visor.addEventListener("touchend", function (e) {
      if (inicioX == null) return;
      const dx = e.changedTouches[0].clientX - inicioX;
      if (Math.abs(dx) > 45) moverVisor(dx < 0 ? 1 : -1);
      inicioX = null;
    });
  }

  function abrirVisor(i, origen) {
    origenVisor = origen || null;
    fotoActual = i;
    pintarVisor();
    $("#visor").hidden = false;
    document.body.classList.add("sin-scroll");
    $("#visor-cerrar").focus();
  }

  function cerrarVisor() {
    $("#visor").hidden = true;
    document.body.classList.remove("sin-scroll");
    if (origenVisor) origenVisor.focus();
  }

  function moverVisor(paso) {
    fotoActual = (fotoActual + paso + fotosGaleria.length) % fotosGaleria.length;
    pintarVisor();
  }

  function pintarVisor() {
    const f = fotosGaleria[fotoActual];
    const img = $("#visor-imagen");
    img.src = f.src;
    img.alt = f.alt || "";
    $("#visor-contador").textContent = (fotoActual + 1) + " / " + fotosGaleria.length;
    const varias = fotosGaleria.length > 1;
    $("#visor-anterior").hidden = !varias;
    $("#visor-siguiente").hidden = !varias;
  }

  // ---------- Vestimenta ----------
  function colorValido(c) {
    return typeof c === "string" && window.CSS && CSS.supports && CSS.supports("color", c);
  }

  function seccionVestimenta() {
    const v = B.vestimenta;
    if (!v) return;
    const prendas = [
      v.ellos ? '<div class="tarjeta prenda revelar"><span class="prenda-icono">' + icono("traje") + '</span><p class="eyebrow">Ellos</p><p>' + esc(v.ellos) + "</p></div>" : "",
      v.ellas ? '<div class="tarjeta prenda revelar"><span class="prenda-icono">' + icono("vestido") + '</span><p class="eyebrow">Ellas</p><p>' + esc(v.ellas) + "</p></div>" : "",
    ].join("");
    const colores = (v.coloresReservados || []).filter(function (c) { return colorValido(c.color); });
    const htmlColores = colores.length
      ? '<div class="colores revelar"><p>' + esc(v.textoColores || "Nos reservamos estos colores:") + '</p><ul>' +
        colores.map(function (c) {
          return '<li><span class="muestra" style="background:' + esc(c.color) + '"></span><span>' + esc(c.nombre) + "</span></li>";
        }).join("") + "</ul></div>"
      : "";
    mostrarSeccion("vestimenta", tituloSeccion("Código de vestimenta", v.titulo) + '<div class="prendas">' + prendas + "</div>" + htmlColores);
  }

  // ---------- Regalos ----------
  function seccionRegalos() {
    const r = B.regalos;
    // Una opción que tiene "enlace" pero vacío no se muestra (ej: mesa de regalos sin configurar)
    const opciones = ((r && r.opciones) || []).filter(function (o) { return !("enlace" in o) || o.enlace; });
    if (!opciones.length) return;
    const tarjetas = opciones.map(function (o) {
      const datos = (o.datos || []).length
        ? '<dl class="datos">' + o.datos.map(function (d) {
          return "<div><dt>" + esc(d.etiqueta) + "</dt><dd><span>" + esc(d.valor) + '</span><button type="button" class="copiar-mini" data-copiar="' +
            esc(d.valor) + '" aria-label="Copiar ' + esc(d.etiqueta) + '">' + icono("copiar") + "</button></dd></div>";
        }).join("") + "</dl>"
        : "";
      const enlace = o.enlace
        ? '<a class="boton" href="' + esc(o.enlace) + '" target="_blank" rel="noopener">' + icono("regalo") + "<span>" + esc(o.textoBoton || "Ver") + "</span></a>"
        : "";
      return '<article class="tarjeta regalo revelar"><span class="evento-icono">' + icono(o.icono || "regalo") + "</span><h3>" + esc(o.titulo) + "</h3>" +
        (o.texto ? "<p>" + esc(o.texto) + "</p>" : "") + datos + enlace + "</article>";
    }).join("");
    mostrarSeccion("regalos", tituloSeccion("Regalos", "Con amor", r.texto) + '<div class="regalos-grid">' + tarjetas + "</div>");
  }

  // ---------- Fotos con QR ----------
  function seccionFotos() {
    const f = B.fotos;
    if (!f || (!f.enlace && !f.hashtag)) return;
    const qr = f.enlace ? U.qrSvg(f.enlace) : "";
    const html = tituloSeccion("Comparte tus fotos", f.titulo, f.texto) +
      '<div class="tarjeta fotos-tarjeta revelar">' +
      (qr ? '<div class="qr">' + qr + "</div>" : "") +
      (f.enlace ? '<a class="boton" href="' + esc(f.enlace) + '" target="_blank" rel="noopener">' + icono("subir") + "<span>" + esc(f.textoBoton || "Subir fotos") + "</span></a>" : "") +
      (f.hashtag ? '<p class="hashtag"><span>' + esc(f.hashtag) + '</span><button type="button" class="copiar-mini" data-copiar="' + esc(f.hashtag) +
        '" aria-label="Copiar hashtag">' + icono("copiar") + "</button></p>" : "") +
      "</div>";
    mostrarSeccion("fotos", html);
  }

  // ---------- Recomendaciones y cierre ----------
  function seccionRecomendaciones() {
    const r = B.recomendaciones || [];
    if (!r.length) return;
    const items = r.map(function (x) {
      return '<div class="recomendacion revelar"><span class="evento-icono">' + icono(x.icono || "corazon") + "</span><h3>" + esc(x.titulo) + "</h3><p>" + esc(x.texto) + "</p></div>";
    }).join("");
    mostrarSeccion("recomendaciones", tituloSeccion("Para tener en cuenta", "Recomendaciones") + '<div class="recomendaciones-grid">' + items + "</div>");
  }

  function seccionCierre() {
    const c = B.cierre || {};
    if (c.titulo) $("#cierre-titulo").textContent = c.titulo;
    $("#cierre-texto").textContent = c.texto || "";
    $("#cierre-nombres").textContent = U.nombresPareja(" & ");
    $("#cierre-fecha").textContent = fechaCorta(fecha);
    $("#pie-texto").textContent = U.nombresPareja(" & ") + " · " + (fecha ? U.formatearFecha(fecha, { year: "numeric" }) : "") + " · Hecho con amor";
  }

  // Botones "copiar" de toda la página
  function prepararCopiar() {
    document.addEventListener("click", function (e) {
      const b = e.target.closest("[data-copiar]");
      if (!b) return;
      U.copiarTexto(b.dataset.copiar).then(function (ok) {
        U.aviso(ok ? "¡Copiado!" : "No se pudo copiar");
      });
    });
  }

  // =================================================================
  //  CONFIRMACIÓN DE ASISTENCIA (RSVP)
  // =================================================================
  const R = B.rsvp || {};
  const contenedorRsvp = function () { return $("#rsvp"); };
  const claveRespuesta = function (codigo) { return "boda-respuesta-" + (codigo || "general"); };

  function prepararRsvp() {
    const limite = U.fechaLimiteRsvp();
    if (limite) {
      $("#rsvp-limite").textContent = "Por favor confírmanos antes del " + U.formatearFecha(limite, { day: "numeric", month: "long", year: "numeric" });
    }
    if (limite && Date.now() > limite.getTime()) return pintarPlazoVencido(limite);
    if (!invitado && R.permitirSinEnlace === false) return pintarSinEnlace();

    listaSelect = U.todosLosInvitados().slice();
    const previa = U.leer(claveRespuesta(invitado && invitado.codigo), null);
    if (previa) {
      if (!invitado && !buscarEnLista(previa)) listaSelect.push({ codigo: previa.codigo, nombre: previa.invitado, cupos: previa.cupos });
      return pintarGracias(previa, previa._modo || "demo");
    }
    if (!invitado && R.urlGoogleScript) {
      // Sin enlace personal: la lista de nombres viene de Google Sheets
      contenedorRsvp().innerHTML = '<p class="cargando-rsvp">Cargando la lista de invitados…</p>';
      consultarScript("accion=lista")
        .then(function (res) {
          ((res && res.ok && res.invitados) || []).forEach(function (x) {
            if (!buscarEnLista({ invitado: x.nombre })) listaSelect.push({ codigo: "", nombre: String(x.nombre), cupos: x.cupos });
          });
        })
        .catch(function (err) { console.warn("No se pudo cargar la lista de invitados", err); })
        .then(function () { pintarFormulario(null); });
      return;
    }
    pintarFormulario(null);
  }

  // Busca una respuesta o invitado en la lista del formulario (por código o nombre)
  function buscarEnLista(d) {
    const nombre = String(d.invitado || d.nombre || "").trim().toLowerCase();
    for (let i = 0; i < listaSelect.length; i++) {
      const x = listaSelect[i];
      if ((d.codigo && x.codigo === d.codigo) || (!d.codigo && x.nombre.trim().toLowerCase() === nombre)) return i + 1;
    }
    return 0;
  }

  function botonWhatsApp(texto, etiqueta) {
    if (!R.whatsapp) return "";
    return '<a class="boton boton-claro" href="' + esc(U.enlaceWhatsApp(R.whatsapp, texto)) + '" target="_blank" rel="noopener">' +
      icono("chat") + "<span>" + esc(etiqueta || "Escríbenos por WhatsApp") + "</span></a>";
  }

  function pintarPlazoVencido(limite) {
    contenedorRsvp().innerHTML = '<div class="aviso-rsvp"><span class="evento-icono">' + icono("reloj") + "</span>" +
      "<h3>El plazo para confirmar terminó</h3><p>La fecha límite fue el " + esc(U.formatearFecha(limite, { day: "numeric", month: "long" })) +
      ". Si tienes alguna novedad, comunícate directamente con nosotros.</p>" +
      '<div class="botones">' + botonWhatsApp("¡Hola! Te escribo por la confirmación de la boda.") + "</div></div>";
  }

  function pintarSinEnlace() {
    contenedorRsvp().innerHTML = '<div class="aviso-rsvp"><span class="evento-icono">' + icono("enlace") + "</span>" +
      "<h3>Usa tu enlace personal</h3><p>Para confirmar, abre el enlace que te enviamos por mensaje. Así sabremos quién eres y cuántos cupos tienes.</p>" +
      '<div class="botones">' + botonWhatsApp("¡Hola! No encuentro mi enlace para confirmar la asistencia a la boda.") + "</div></div>";
  }

  let listaSelect = [];

  function pintarFormulario(previa) {
    listaSelect.sort(function (a, b) { return a.nombre.localeCompare(b.nombre, "es"); });
    const hayLista = listaSelect.length > 0;
    let campoInvitado;
    if (invitado) {
      campoInvitado = '<div class="campo"><span class="etiqueta">Invitación para</span><p class="campo-fijo">' + icono("sobre") +
        "<span><strong>" + esc(invitado.nombre) + "</strong> · " + esc(U.textoCupos(invitado.cupos)) + "</span></p></div>";
    } else if (hayLista) {
      campoInvitado = '<div class="campo"><label for="rsvp-invitado">Tu nombre en la lista de invitados</label>' +
        '<select id="rsvp-invitado" required><option value="">Selecciona tu nombre…</option>' +
        listaSelect.map(function (i, n) { return '<option value="' + n + '">' + esc(i.nombre) + "</option>"; }).join("") +
        "</select></div>";
    } else {
      campoInvitado = '<div class="campo"><label for="rsvp-invitado-texto">Tu nombre o el de tu familia</label>' +
        '<input id="rsvp-invitado-texto" required autocomplete="name"></div>';
    }

    contenedorRsvp().innerHTML =
      '<form id="form-rsvp" class="formulario" novalidate>' +
      campoInvitado +
      '<div class="campo"><label for="rsvp-responde">¿Quién responde este formulario?</label>' +
      '<input id="rsvp-responde" required autocomplete="name" placeholder="Tu nombre y apellido"></div>' +
      '<fieldset class="campo"><legend class="etiqueta">¿Nos acompañas?</legend><div class="opciones-asistencia">' +
      '<label class="opcion"><input type="radio" name="asistira" value="si">' + icono("check") + "<span>Sí, asistiré</span></label>" +
      '<label class="opcion"><input type="radio" name="asistira" value="no">' + icono("cerrar") + "<span>No podré asistir</span></label>" +
      "</div></fieldset>" +
      '<div id="rsvp-si" hidden>' +
      '<div class="campo"><label for="rsvp-cantidad">¿Cuántas personas asistirán?</label><select id="rsvp-cantidad"></select>' +
      '<p class="ayuda" id="rsvp-cupos-ayuda"></p></div>' +
      '<div id="rsvp-personas"></div>' +
      (R.preguntarCancion !== false ? '<div class="campo"><label for="rsvp-cancion">Una canción que no puede faltar <span class="opcional">(opcional)</span></label>' +
        '<input id="rsvp-cancion" placeholder="Canción y artista"></div>' : "") +
      "</div>" +
      '<div class="campo"><label for="rsvp-telefono">Teléfono <span class="opcional">(opcional)</span></label>' +
      '<input id="rsvp-telefono" type="tel" inputmode="tel" autocomplete="tel"></div>' +
      '<div class="campo"><label for="rsvp-mensaje">Mensaje para los novios <span class="opcional">(opcional)</span></label>' +
      '<textarea id="rsvp-mensaje" rows="3"></textarea></div>' +
      '<p class="error-form" id="rsvp-error" role="alert" hidden></p>' +
      '<button type="submit" class="boton boton-grande" id="rsvp-enviar">' + icono("corazon") + "<span>Enviar respuesta</span></button>" +
      (!R.urlGoogleScript ? '<p class="nota-demo">Modo demostración: las respuestas se guardan solo en este dispositivo. ' +
        "Para recibirlas en Google Sheets sigue las instrucciones del README.</p>" : "") +
      "</form>";

    const form = $("#form-rsvp");
    const selInvitado = $("#rsvp-invitado");
    const responde = $("#rsvp-responde");

    $$('input[name="asistira"]', form).forEach(function (r) {
      r.addEventListener("change", actualizarAsistencia);
    });
    if (selInvitado) selInvitado.addEventListener("change", actualizarCupos);
    $("#rsvp-cantidad").addEventListener("change", pintarPersonas);
    responde.addEventListener("change", function () {
      const primero = $("#p0-nombre");
      if (primero && !primero.value.trim()) primero.value = responde.value.trim();
    });
    form.addEventListener("submit", enviarFormulario);
    form.addEventListener("input", function () { $("#rsvp-error").hidden = true; });

    actualizarCupos();
    if (previa) rellenarFormulario(previa);
  }

  function invitadoElegido() {
    if (invitado) return invitado;
    const sel = $("#rsvp-invitado");
    if (sel) return sel.value === "" ? null : listaSelect[Number(sel.value)] || null;
    const texto = $("#rsvp-invitado-texto");
    return texto && texto.value.trim() ? { codigo: "", nombre: texto.value.trim(), cupos: 10 } : null;
  }

  function cuposMaximos() {
    const i = invitadoElegido();
    return Math.max(1, Number(i && i.cupos) || (listaSelect.length ? 1 : 10));
  }

  function actualizarCupos() {
    const max = cuposMaximos();
    const sel = $("#rsvp-cantidad");
    const anterior = Number(sel.value) || max;
    let opciones = "";
    for (let n = 1; n <= max; n++) opciones += '<option value="' + n + '">' + U.textoCupos(n) + "</option>";
    sel.innerHTML = opciones;
    sel.value = String(Math.min(anterior, max));
    const i = invitadoElegido();
    $("#rsvp-cupos-ayuda").textContent = i && i.codigo ? "Tu invitación es válida para " + U.textoCupos(max) + "." : "";
    pintarPersonas();
  }

  function actualizarAsistencia() {
    const si = valorAsistencia() === "si";
    $("#rsvp-si").hidden = !si;
    $$(".opcion", $("#form-rsvp")).forEach(function (o) {
      o.classList.toggle("elegida", $("input", o).checked);
    });
  }

  function valorAsistencia() {
    const r = $('input[name="asistira"]:checked');
    return r ? r.value : "";
  }

  function leerPersonas() {
    return $$(".persona", $("#rsvp-personas")).map(function (p, i) {
      return {
        nombre: $("#p" + i + "-nombre").value.trim(),
        tipo: ($('input[name="p' + i + '-tipo"]:checked') || {}).value || "Adulto",
        restricciones: $$('input[data-restriccion]:checked', p).map(function (c) { return c.value; }),
        otra: $("#p" + i + "-otra").value.trim(),
      };
    });
  }

  function pintarPersonas() {
    const cont = $("#rsvp-personas");
    const actuales = leerPersonas();
    const n = Number($("#rsvp-cantidad").value) || 1;
    const restricciones = R.restricciones || [];
    let html = "";
    for (let i = 0; i < n; i++) {
      html += '<fieldset class="persona"><legend>' + icono("personas") + "Invitado " + (i + 1) + "</legend>" +
        '<div class="campo"><label for="p' + i + '-nombre">Nombre completo</label><input id="p' + i + '-nombre" required autocomplete="off"></div>' +
        '<div class="chips" role="radiogroup" aria-label="Edad del invitado ' + (i + 1) + '">' +
        '<label class="chip"><input type="radio" name="p' + i + '-tipo" value="Adulto" checked><span>Adulto</span></label>' +
        '<label class="chip"><input type="radio" name="p' + i + '-tipo" value="Niño"><span>Niño(a)</span></label></div>' +
        (restricciones.length ? '<p class="mini-titulo">¿Alguna restricción alimentaria?</p><div class="chips">' +
          restricciones.map(function (r) {
            return '<label class="chip"><input type="checkbox" data-restriccion value="' + esc(r) + '"><span>' + esc(r) + "</span></label>";
          }).join("") + "</div>" : "") +
        '<input id="p' + i + '-otra" class="otra" placeholder="Otra restricción (opcional)" aria-label="Otra restricción del invitado ' + (i + 1) + '">' +
        "</fieldset>";
    }
    cont.innerHTML = html;
    actuales.slice(0, n).forEach(function (p, i) { ponerPersona(i, p); });
    if (!actuales.length && n > 0) {
      const responde = $("#rsvp-responde");
      if (responde && responde.value.trim()) $("#p0-nombre").value = responde.value.trim();
    }
  }

  function ponerPersona(i, p) {
    const nombre = $("#p" + i + "-nombre");
    if (!nombre) return;
    nombre.value = p.nombre || "";
    const tipo = $('input[name="p' + i + '-tipo"][value="' + (p.tipo === "Niño" ? "Niño" : "Adulto") + '"]');
    if (tipo) tipo.checked = true;
    const fs = nombre.closest(".persona");
    $$("input[data-restriccion]", fs).forEach(function (c) { c.checked = (p.restricciones || []).indexOf(c.value) >= 0; });
    $("#p" + i + "-otra").value = p.otra || "";
  }

  function rellenarFormulario(d) {
    const sel = $("#rsvp-invitado");
    const posicion = sel ? buscarEnLista(d) : 0;
    if (posicion) { sel.value = String(posicion - 1); actualizarCupos(); }
    const texto = $("#rsvp-invitado-texto");
    if (texto) texto.value = d.invitado || "";
    $("#rsvp-responde").value = d.respondidoPor || "";
    const radio = $('input[name="asistira"][value="' + (d.asistira ? "si" : "no") + '"]');
    if (radio) radio.checked = true;
    actualizarAsistencia();
    if (d.asistira) {
      $("#rsvp-cantidad").value = String(Math.min(d.cantidad || 1, cuposMaximos()));
      pintarPersonas();
      (d.personas || []).forEach(function (p, i) { ponerPersona(i, p); });
    }
    const cancion = $("#rsvp-cancion");
    if (cancion) cancion.value = d.cancion || "";
    $("#rsvp-telefono").value = d.telefono || "";
    $("#rsvp-mensaje").value = d.mensaje || "";
  }

  function marcarError(campo, texto) {
    const error = $("#rsvp-error");
    error.textContent = texto;
    error.hidden = false;
    if (campo) {
      campo.setAttribute("aria-invalid", "true");
      campo.focus();
      campo.addEventListener("input", function () { campo.removeAttribute("aria-invalid"); }, { once: true });
      campo.addEventListener("change", function () { campo.removeAttribute("aria-invalid"); }, { once: true });
    }
    return false;
  }

  function validar() {
    $("#rsvp-error").hidden = true;
    const elegido = invitadoElegido();
    if (!elegido) return marcarError($("#rsvp-invitado") || $("#rsvp-invitado-texto"), "Selecciona tu nombre en la lista de invitados.");
    const responde = $("#rsvp-responde");
    if (!responde.value.trim()) return marcarError(responde, "Escribe el nombre de quien responde.");
    if (!valorAsistencia()) return marcarError($('input[name="asistira"]'), "Cuéntanos si podrás acompañarnos.");
    if (valorAsistencia() === "si") {
      const personas = leerPersonas();
      for (let i = 0; i < personas.length; i++) {
        if (!personas[i].nombre) return marcarError($("#p" + i + "-nombre"), "Escribe el nombre del invitado " + (i + 1) + ".");
      }
      if (personas.length > cuposMaximos()) return marcarError($("#rsvp-cantidad"), "Superaste el número de cupos de tu invitación.");
    }
    return true;
  }

  function armarDatos() {
    const elegido = invitadoElegido();
    const si = valorAsistencia() === "si";
    const personas = si ? leerPersonas() : [];
    const cancion = $("#rsvp-cancion");
    return {
      codigo: elegido.codigo || "",
      invitado: elegido.nombre,
      cupos: Number(elegido.cupos) || personas.length,
      respondidoPor: $("#rsvp-responde").value.trim(),
      asistira: si,
      cantidad: personas.length,
      personas: personas,
      telefono: $("#rsvp-telefono").value.trim(),
      cancion: si && cancion ? cancion.value.trim() : "",
      mensaje: $("#rsvp-mensaje").value.trim(),
      fecha: new Date().toISOString(),
    };
  }

  function textoResumen(d) {
    let t = "Confirmación boda " + U.nombresPareja(" y ") + "\n" +
      "Invitado: " + d.invitado + "\nResponde: " + d.respondidoPor + "\n" +
      (d.asistira ? "Asistirá: Sí (" + U.textoCupos(d.cantidad) + ")\n" : "Asistirá: No\n");
    d.personas.forEach(function (p, i) {
      const extra = p.restricciones.concat(p.otra ? [p.otra] : []);
      t += (i + 1) + ". " + p.nombre + " (" + p.tipo + ")" + (extra.length ? " - " + extra.join(", ") : "") + "\n";
    });
    if (d.cancion) t += "Canción: " + d.cancion + "\n";
    if (d.mensaje) t += "Mensaje: " + d.mensaje + "\n";
    return t;
  }

  function guardarDemo(d) {
    const lista = U.leer(U.CLAVE_DEMO, []);
    const clave = d.codigo || d.invitado;
    const filtrada = lista.filter(function (x) { return (x.codigo || x.invitado) !== clave; });
    filtrada.push(d);
    U.guardar(U.CLAVE_DEMO, filtrada);
  }

  function enviarFormulario(e) {
    e.preventDefault();
    if (!validar()) return;
    const datos = armarDatos();
    const boton = $("#rsvp-enviar");

    if (!R.urlGoogleScript) {
      guardarDemo(datos);
      datos._modo = "demo";
      U.guardar(claveRespuesta(invitado && invitado.codigo), datos);
      if (R.whatsapp) window.open(U.enlaceWhatsApp(R.whatsapp, textoResumen(datos)), "_blank", "noopener");
      pintarGracias(datos, "demo");
      return;
    }

    boton.disabled = true;
    $("span", boton).textContent = "Enviando…";
    fetch(R.urlGoogleScript, { method: "POST", body: JSON.stringify(datos) })
      .then(function (r) { return r.json().catch(function () { return { ok: r.ok }; }); })
      .then(function (res) {
        if (!res || !res.ok) throw new Error((res && res.error) || "Respuesta inválida");
        datos._modo = "google";
        U.guardar(claveRespuesta(invitado && invitado.codigo), datos);
        pintarGracias(datos, "google");
      })
      .catch(function (err) {
        console.error(err);
        boton.disabled = false;
        $("span", boton).textContent = "Enviar respuesta";
        marcarError(null, "No pudimos enviar tu respuesta. Revisa tu conexión e inténtalo de nuevo." +
          (R.whatsapp ? " También puedes confirmarnos por WhatsApp." : ""));
      });
  }

  function pintarGracias(d, modo) {
    const nombre = (d.respondidoPor || d.invitado || "").split(" ")[0];
    const lista = (d.personas || []).map(function (p) {
      const extra = (p.restricciones || []).concat(p.otra ? [p.otra] : []);
      return "<li>" + icono(p.tipo === "Niño" ? "nino" : "personas") + "<span><strong>" + esc(p.nombre) + "</strong> · " + esc(p.tipo) +
        (extra.length ? '<em class="restricciones">' + esc(extra.join(", ")) + "</em>" : "") + "</span></li>";
    }).join("");

    contenedorRsvp().innerHTML = '<div class="gracias">' +
      '<span class="gracias-icono">' + icono(d.asistira ? "corazon" : "sobre") + "</span>" +
      "<h3>¡Gracias, " + esc(nombre) + "!</h3>" +
      (d.asistira
        ? "<p>Nos hace muy felices que nos acompañes. Registramos <strong>" + esc(U.textoCupos(d.cantidad)) + "</strong> a nombre de " + esc(d.invitado) + ".</p>" +
          (lista ? '<ul class="resumen">' + lista + "</ul>" : "")
        : "<p>Lamentamos que no puedas acompañarnos. ¡Gracias por avisarnos y por tu cariño!</p>") +
      '<div class="botones">' +
      (d.asistira ? '<a class="boton" href="' + esc(U.enlaceGoogleCalendar()) + '" target="_blank" rel="noopener">' + icono("calendario") + "<span>Agendar la fecha</span></a>" : "") +
      (modo === "google" ? botonWhatsApp(textoResumen(d), "Avisar por WhatsApp") : "") +
      '<button type="button" class="boton boton-claro" id="rsvp-modificar">' + icono("enlace") + "<span>Modificar respuesta</span></button>" +
      "</div>" +
      (modo === "demo" ? '<p class="nota-demo">Modo demostración: esta respuesta se guardó solo en este dispositivo. ' +
        "Puedes verla en admin.html desde este mismo navegador.</p>" : "") +
      "</div>";

    $("#rsvp-modificar").addEventListener("click", function () {
      pintarFormulario(d);
      $("#rsvp-responde").focus();
    });
    actualizarFlotante();
  }

  // =================================================================
  //  BOTÓN FLOTANTE, ANIMACIONES DE ENTRADA
  // =================================================================
  let portadaVisible = true;
  let rsvpVisible = false;

  function actualizarFlotante() {
    const boton = $("#flotante-confirmar");
    const respondido = !!$("#rsvp .gracias");
    boton.hidden = portadaVisible || rsvpVisible || respondido || !$("#form-rsvp");
  }

  function prepararObservadores() {
    const elementos = $$(".revelar");
    if (!("IntersectionObserver" in window) || reducirMovimiento) {
      elementos.forEach(function (el) { el.classList.add("visible"); });
    } else {
      const obs = new IntersectionObserver(function (entradas) {
        entradas.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add("visible");
            obs.unobserve(en.target);
          }
        });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
      elementos.forEach(function (el) { obs.observe(el); });
    }

    if (!("IntersectionObserver" in window)) return;
    new IntersectionObserver(function (en) {
      portadaVisible = en[0].isIntersecting;
      actualizarFlotante();
    }, { threshold: 0.15 }).observe($("#portada"));
    new IntersectionObserver(function (en) {
      rsvpVisible = en[0].isIntersecting;
      actualizarFlotante();
    }, { threshold: 0.05 }).observe($("#confirmar"));
  }

  // =================================================================
  //  INICIO
  // =================================================================
  function iniciar() {
    prepararMusica();
    prepararPortada();
    iniciarContador();
    seccionFamilia();
    seccionEventos();
    seccionPrograma();
    seccionGaleria();
    seccionVestimenta();
    seccionRegalos();
    seccionFotos();
    prepararRsvp();
    seccionRecomendaciones();
    seccionCierre();
    prepararCopiar();
    prepararObservadores();
    prepararSobre();
  }

  // Consulta al Google Apps Script (con límite de espera)
  function consultarScript(parametros) {
    const base = (B.rsvp || {}).urlGoogleScript;
    const url = base + (base.indexOf("?") >= 0 ? "&" : "?") + parametros;
    const control = window.AbortController ? new AbortController() : null;
    const espera = control ? setTimeout(function () { control.abort(); }, 8000) : null;
    return fetch(url, control ? { signal: control.signal } : {})
      .then(function (r) { return r.json(); })
      .finally(function () { clearTimeout(espera); });
  }

  // El invitado del enlace personal puede estar en js/invitados.js, en este
  // navegador (modo de prueba) o en la pestaña "Invitados" de Google Sheets.
  function resolverInvitado() {
    const codigo = U.codigoDeLaUrl();
    const local = U.buscarInvitado(codigo);
    if (!codigo || local || !(B.rsvp || {}).urlGoogleScript) return Promise.resolve(local);
    $("#sobre-invitado").textContent = "Cargando tu invitación…";
    return consultarScript("accion=invitado&codigo=" + encodeURIComponent(codigo))
      .then(function (res) { return res && res.ok && res.invitado ? res.invitado : null; })
      .catch(function (err) {
        console.warn("No se pudo buscar el invitado", err);
        return null;
      });
  }

  resolverInvitado().then(function (i) {
    invitado = i;
    iniciar();
  });
})();
