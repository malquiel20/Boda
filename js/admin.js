/*
 * Panel de los novios (admin.html): resumen de confirmaciones, enlaces
 * personales, envío por WhatsApp, exportación y generador de invitados.
 */
(function () {
  "use strict";

  const U = window.BodaUtil;
  const B = U.BODA;
  const R = B.rsvp || {};
  const esc = U.esc;
  const icono = U.icono;
  const $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  const CLAVE_SESION = "boda-admin-clave";

  let respuestas = [];

  function claveDe(x) {
    return x.codigo ? "c:" + String(x.codigo).toLowerCase() : "n:" + String(x.invitado || x.nombre || "").trim().toLowerCase();
  }

  // ---------- Carga de respuestas ----------
  function cargarDemo() {
    respuestas = U.leer(U.CLAVE_DEMO, []);
    estado(respuestas.length
      ? "Mostrando " + respuestas.length + " respuesta(s) de prueba guardadas en este navegador."
      : "Aún no hay respuestas de prueba en este navegador. Llena el formulario de la invitación para verlas aquí.");
    pintarTodo();
  }

  function cargarGoogle(clave) {
    estado("Cargando respuestas…");
    const url = R.urlGoogleScript + (R.urlGoogleScript.indexOf("?") >= 0 ? "&" : "?") +
      "accion=respuestas&clave=" + encodeURIComponent(clave);
    fetch(url)
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (!res.ok) throw new Error(res.error || "Error desconocido");
        try { window.sessionStorage.setItem(CLAVE_SESION, clave); } catch (e) { /* sin almacenamiento */ }
        respuestas = res.respuestas || [];
        estado(respuestas.length + " respuesta(s) cargadas desde Google Sheets · " +
          new Date().toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" }));
        pintarTodo();
      })
      .catch(function (err) {
        console.error(err);
        estado(err.message === "Clave incorrecta"
          ? "La clave no es correcta."
          : "No se pudieron cargar las respuestas (" + err.message + "). Revisa la URL del script en js/config.js.");
      });
  }

  function estado(texto) { $("#admin-estado").textContent = texto; }

  function plural(n, uno, varios) { return n + " " + (n === 1 ? uno : varios); }

  // ---------- Estado por invitado ----------
  function mapaRespuestas() {
    const m = {};
    respuestas.forEach(function (r) {
      const k = claveDe(r);
      if (!m[k] || String(r.fecha) > String(m[k].fecha)) m[k] = r;
    });
    return m;
  }

  function filas() {
    const m = mapaRespuestas();
    const usadas = {};
    const lista = U.INVITADOS.map(function (i) {
      const k = claveDe({ codigo: i.codigo });
      let r = m[k];
      if (!r) {
        const porNombre = claveDe({ invitado: i.nombre });
        r = m[porNombre];
        if (r) usadas[porNombre] = true;
      }
      if (r) usadas[k] = true;
      return { invitado: i, respuesta: r || null };
    });
    Object.keys(m).forEach(function (k) {
      if (!usadas[k]) lista.push({ invitado: { codigo: m[k].codigo, nombre: m[k].invitado, cupos: m[k].cupos, fuera: true }, respuesta: m[k] });
    });
    return lista;
  }

  function estadoDe(f) {
    if (!f.respuesta) return "pendiente";
    return f.respuesta.asistira ? "si" : "no";
  }

  // ---------- Resumen ----------
  function pintarResumen(lista) {
    let cupos = 0, personas = 0, adultos = 0, ninos = 0, noAsisten = 0, pendientes = 0, cuposPendientes = 0;
    const restricciones = {};
    const otras = [];
    lista.forEach(function (f) {
      const c = Number(f.invitado.cupos) || 0;
      if (!f.invitado.fuera) cupos += c;
      const e = estadoDe(f);
      if (e === "pendiente") { pendientes++; cuposPendientes += c; return; }
      if (e === "no") { noAsisten++; return; }
      (f.respuesta.personas || []).forEach(function (p) {
        personas++;
        if (p.tipo === "Niño") ninos++; else adultos++;
        (p.restricciones || []).forEach(function (x) { restricciones[x] = (restricciones[x] || 0) + 1; });
        if (p.otra) otras.push(p.nombre + ": " + p.otra);
      });
    });

    const tarjetas = [
      { n: U.INVITADOS.length, t: "Invitaciones", d: cupos + " cupos en total" },
      { n: personas, t: "Personas confirmadas", d: plural(adultos, "adulto", "adultos") + " · " + plural(ninos, "niño", "niños"), destacado: true },
      { n: noAsisten, t: "No asistirán", d: "invitaciones" },
      { n: pendientes, t: "Sin responder", d: cuposPendientes + " cupos pendientes" },
    ];
    $("#resumen").innerHTML = tarjetas.map(function (x) {
      return '<div class="resumen-tarjeta' + (x.destacado ? " destacado" : "") + '"><span class="resumen-num">' + x.n + '</span><span class="resumen-titulo">' +
        esc(x.t) + '</span><span class="resumen-detalle">' + esc(x.d) + "</span></div>";
    }).join("");

    const claves = Object.keys(restricciones);
    $("#restricciones").innerHTML = (claves.length || otras.length)
      ? '<h3 class="admin-subtitulo">Restricciones alimentarias</h3><ul class="etiquetas">' +
        claves.map(function (k) { return "<li>" + esc(k) + " <strong>" + restricciones[k] + "</strong></li>"; }).join("") + "</ul>" +
        (otras.length ? '<ul class="admin-lista">' + otras.map(function (o) { return "<li>" + esc(o) + "</li>"; }).join("") + "</ul>" : "")
      : "";
  }

  // ---------- Lista de invitados ----------
  function mensajeInvitacion(i) {
    return String(B.mensajeInvitacion || "¡Hola {nombre}! Esta es tu invitación a nuestra boda: {enlace}")
      .replace(/\{nombre\}/g, i.nombre)
      .replace(/\{enlace\}/g, U.enlaceInvitado(i.codigo))
      .replace(/\{cupos\}/g, U.textoCupos(i.cupos));
  }

  const ETIQUETAS = { pendiente: "Pendiente", si: "Asistirá", no: "No asistirá" };

  function pintarInvitados(lista) {
    const texto = $("#buscar").value.trim().toLowerCase();
    const filtro = $("#filtro").value;
    const visibles = lista.filter(function (f) {
      if (filtro !== "todos" && estadoDe(f) !== filtro) return false;
      return !texto || String(f.invitado.nombre).toLowerCase().indexOf(texto) >= 0;
    });

    if (!visibles.length) {
      $("#lista-invitados").innerHTML = '<p class="admin-vacio">No hay invitados que coincidan.</p>';
      return;
    }

    $("#lista-invitados").innerHTML = visibles.map(function (f) {
      const i = f.invitado;
      const r = f.respuesta;
      const e = estadoDe(f);
      const enlace = i.codigo ? U.enlaceInvitado(i.codigo) : "";
      const detalle = r
        ? '<details class="detalle"><summary>Ver respuesta</summary><p>Respondió: <strong>' + esc(r.respondidoPor) + "</strong>" +
          (r.telefono ? " · Tel. " + esc(r.telefono) : "") + " · " + esc(formatoFecha(r.fecha)) + "</p>" +
          ((r.personas || []).length ? "<ul>" + r.personas.map(function (p) {
            const extra = (p.restricciones || []).concat(p.otra ? [p.otra] : []);
            return "<li>" + esc(p.nombre) + " · " + esc(p.tipo) + (extra.length ? " · <em>" + esc(extra.join(", ")) + "</em>" : "") + "</li>";
          }).join("") + "</ul>" : "") +
          (r.mensaje ? "<blockquote>" + esc(r.mensaje) + "</blockquote>" : "") + "</details>"
        : "";
      return '<article class="fila-invitado">' +
        '<div class="fila-info"><h3>' + esc(i.nombre) + (i.fuera ? ' <span class="fuera">fuera de la lista</span>' : "") + "</h3>" +
        '<p class="fila-meta">' + esc(U.textoCupos(i.cupos)) + (i.codigo ? " · <code>" + esc(i.codigo) + "</code>" : "") + "</p></div>" +
        '<span class="estado estado-' + e + '">' + ETIQUETAS[e] + (e === "si" ? " (" + r.cantidad + ")" : "") + "</span>" +
        (enlace ? '<div class="fila-acciones">' +
          '<button type="button" class="boton boton-claro boton-mini" data-copiar="' + esc(enlace) + '">' + icono("copiar") + "<span>Copiar enlace</span></button>" +
          '<a class="boton boton-mini" href="' + esc(U.enlaceWhatsApp(i.telefono, mensajeInvitacion(i))) + '" target="_blank" rel="noopener">' + icono("chat") + "<span>WhatsApp</span></a>" +
          '<a class="boton boton-claro boton-mini" href="' + esc(enlace) + '" target="_blank" rel="noopener">' + icono("enlace") + "<span>Abrir</span></a>" +
          "</div>" : "") +
        detalle + "</article>";
    }).join("");
  }

  function formatoFecha(iso) {
    const f = new Date(iso);
    if (isNaN(f)) return "";
    return f.toLocaleString("es", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  }

  // ---------- Mensajes ----------
  function pintarMensajes() {
    const conMensaje = respuestas.filter(function (r) { return r.mensaje || r.cancion; });
    if (!conMensaje.length) {
      $("#mensajes").innerHTML = '<p class="admin-vacio">Aquí aparecerán los mensajes y canciones que te dejen tus invitados.</p>';
      return;
    }
    $("#mensajes").innerHTML = conMensaje.map(function (r) {
      return '<div class="mensaje"><p class="mensaje-autor">' + esc(r.respondidoPor || r.invitado) + " · " + esc(r.invitado) + "</p>" +
        (r.mensaje ? "<blockquote>" + esc(r.mensaje) + "</blockquote>" : "") +
        (r.cancion ? '<p class="mensaje-cancion">' + icono("musica") + esc(r.cancion) + "</p>" : "") + "</div>";
    }).join("");
  }

  function pintarTodo() {
    const lista = filas();
    pintarResumen(lista);
    pintarInvitados(lista);
    pintarMensajes();
  }

  // ---------- Exportar CSV ----------
  function csv(filas) {
    return "﻿" + filas.map(function (fila) {
      return fila.map(function (v) {
        const t = String(v == null ? "" : v);
        return /[";\n\r]/.test(t) ? '"' + t.replace(/"/g, '""') + '"' : t;
      }).join(";");
    }).join("\r\n");
  }

  function exportarRespuestas() {
    const datos = [["Invitado", "Código", "Cupos", "Estado", "Personas", "Respondió", "Teléfono", "Canción", "Mensaje", "Fecha"]];
    filas().forEach(function (f) {
      const r = f.respuesta || {};
      datos.push([f.invitado.nombre, f.invitado.codigo || "", f.invitado.cupos || "", ETIQUETAS[estadoDe(f)],
        r.asistira ? r.cantidad : 0, r.respondidoPor || "", r.telefono || "", r.cancion || "", r.mensaje || "", r.fecha ? formatoFecha(r.fecha) : ""]);
    });
    U.descargarArchivo("respuestas-boda.csv", csv(datos), "text/csv;charset=utf-8");
  }

  function exportarAsistentes() {
    const datos = [["Nombre", "Tipo", "Restricciones", "Otra restricción", "Invitación"]];
    respuestas.filter(function (r) { return r.asistira; }).forEach(function (r) {
      (r.personas || []).forEach(function (p) {
        datos.push([p.nombre, p.tipo, (p.restricciones || []).join(", "), p.otra || "", r.invitado]);
      });
    });
    U.descargarArchivo("asistentes-boda.csv", csv(datos), "text/csv;charset=utf-8");
  }

  // ---------- QR para imprimir ----------
  function pintarQR() {
    const items = [{ titulo: "Invitación general", texto: "Enlace sin nombre de invitado", url: U.urlBase(), archivo: "qr-invitacion.gif" }];
    if (B.fotos && B.fotos.enlace) items.unshift({ titulo: B.fotos.titulo || "Comparte tus fotos", texto: "Para subir fotos del día", url: B.fotos.enlace, archivo: "qr-fotos.gif" });
    $("#qr-grid").innerHTML = items.map(function (q) {
      const img = U.qrImagen(q.url, 10);
      return '<div class="qr-item"><img src="' + img + '" alt="Código QR: ' + esc(q.titulo) + '" width="220" height="220">' +
        "<h3>" + esc(q.titulo) + "</h3><p>" + esc(q.texto) + "</p>" +
        '<a class="boton boton-claro boton-mini" href="' + img + '" download="' + q.archivo + '">' + icono("descargar") + "<span>Descargar</span></a></div>";
    }).join("");
  }

  // ---------- Generador de invitados ----------
  function generar() {
    const lineas = $("#gen-entrada").value.split(/\r?\n/).map(function (l) { return l.trim(); }).filter(Boolean);
    const existentes = {};
    U.INVITADOS.forEach(function (i) { existentes[String(i.nombre).trim().toLowerCase()] = i.codigo; });
    const usados = {};
    const resultado = [];

    lineas.forEach(function (linea) {
      const sep = linea.indexOf("\t") >= 0 ? "\t" : linea.indexOf(";") >= 0 ? ";" : ",";
      const partes = linea.split(sep).map(function (p) { return p.trim(); });
      const nombre = partes[0];
      if (!nombre) return;
      const cupos = parseInt(partes[1], 10);
      if (isNaN(cupos) && /nombre|invitado/i.test(nombre)) return; // encabezado de Excel
      let codigo = existentes[nombre.toLowerCase()];
      if (!codigo || usados[codigo]) {
        do { codigo = (U.slug(nombre) || "invitado") + "-" + U.codigoAleatorio(4); } while (usados[codigo]);
      }
      usados[codigo] = true;
      resultado.push({ codigo: codigo, nombre: nombre, cupos: isNaN(cupos) || cupos < 1 ? 1 : cupos, telefono: (partes[2] || "").replace(/\D/g, "") });
    });

    if (!resultado.length) {
      U.aviso("Escribe al menos un invitado");
      return;
    }
    const total = resultado.reduce(function (s, i) { return s + i.cupos; }, 0);
    const texto = "/*\n * LISTA DE INVITADOS (generada desde admin.html)\n * " + resultado.length + " invitaciones · " + total + " cupos.\n" +
      " * Enlace personal de cada invitado: tu-pagina/?i=CODIGO\n */\nwindow.INVITADOS = [\n" +
      resultado.map(function (i) {
        return "  { codigo: " + JSON.stringify(i.codigo) + ", nombre: " + JSON.stringify(i.nombre) + ", cupos: " + i.cupos +
          ", telefono: " + JSON.stringify(i.telefono) + " },";
      }).join("\n") + "\n];\n";
    $("#gen-salida").value = texto;
    $("#gen-resultado").hidden = false;
    U.aviso(resultado.length + " invitaciones generadas");
  }

  // ---------- Inicio ----------
  function iniciar() {
    $("#admin-titulo").textContent = U.nombresPareja(" & ");
    document.title = "Panel · " + U.nombresPareja(" & ");

    if (R.urlGoogleScript) {
      $("#admin-modo").textContent = "Conectado a Google Sheets";
      $("#admin-conexion").hidden = false;
      $("#admin-conexion").addEventListener("submit", function (e) {
        e.preventDefault();
        cargarGoogle($("#admin-clave").value);
      });
      let guardada = "";
      try { guardada = window.sessionStorage.getItem(CLAVE_SESION) || ""; } catch (e) { guardada = ""; }
      if (guardada) {
        $("#admin-clave").value = guardada;
        cargarGoogle(guardada);
      } else {
        estado("Escribe la clave para ver las respuestas.");
        pintarTodo();
      }
    } else {
      $("#admin-modo").textContent = "Modo demostración: configura Google Sheets para recibir respuestas reales (ver README).";
      $("#admin-acciones-demo").hidden = false;
      $("#admin-recargar").addEventListener("click", cargarDemo);
      $("#admin-borrar-demo").addEventListener("click", function () {
        if (!window.confirm("¿Borrar las respuestas de prueba guardadas en este navegador?")) return;
        U.guardar(U.CLAVE_DEMO, []);
        try {
          Object.keys(window.localStorage).forEach(function (k) { if (k.indexOf("boda-respuesta-") === 0) window.localStorage.removeItem(k); });
        } catch (e) { /* sin almacenamiento */ }
        cargarDemo();
      });
      cargarDemo();
    }

    $("#buscar").addEventListener("input", function () { pintarInvitados(filas()); });
    $("#filtro").addEventListener("change", function () { pintarInvitados(filas()); });
    $("#exportar-respuestas").addEventListener("click", exportarRespuestas);
    $("#exportar-asistentes").addEventListener("click", exportarAsistentes);
    $("#gen-crear").addEventListener("click", generar);
    $("#gen-copiar").addEventListener("click", function () {
      U.copiarTexto($("#gen-salida").value).then(function (ok) { U.aviso(ok ? "¡Copiado!" : "No se pudo copiar"); });
    });
    $("#gen-descargar").addEventListener("click", function () {
      U.descargarArchivo("invitados.js", $("#gen-salida").value, "text/javascript;charset=utf-8");
    });
    document.addEventListener("click", function (e) {
      const b = e.target.closest("[data-copiar]");
      if (!b) return;
      U.copiarTexto(b.dataset.copiar).then(function (ok) { U.aviso(ok ? "¡Enlace copiado!" : "No se pudo copiar"); });
    });
    pintarQR();
  }

  iniciar();
})();
