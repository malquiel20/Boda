/*
 * Panel de los novios (admin.html): resumen de confirmaciones, lista de
 * invitados con envío por WhatsApp, mensajes, descargas y generador.
 */
(function () {
  "use strict";

  const U = window.BodaUtil;
  const B = U.BODA;
  const R = B.rsvp || {};
  const esc = U.esc;
  const icono = U.icono;
  const $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  const $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  const CLAVE_SESION = "boda-admin-clave";
  const CLAVE_ENVIADAS = "boda-invitaciones-enviadas";
  const PESTANAS = ["inicio", "invitados", "mensajes", "herramientas"];
  const ETIQUETAS = { pendiente: "Sin responder", si: "Asistirá", no: "No asistirá" };
  const modoGoogle = !!R.urlGoogleScript;

  let respuestas = [];
  let invitadosServidor = [];
  let filtro = "todos";

  // Invitados: los del archivo js/invitados.js + los agregados desde el panel
  // (en Google Sheets o, en modo de prueba, en este navegador)
  function listaInvitados() {
    const extra = modoGoogle ? invitadosServidor : U.invitadosLocales();
    const vistos = {};
    return U.INVITADOS.concat(extra).filter(function (i) {
      const c = String(i.codigo || "").toLowerCase();
      if (!c || vistos[c]) return false;
      vistos[c] = true;
      return true;
    });
  }

  function editable(i) {
    return !!i.codigo && !U.INVITADOS.some(function (x) { return x.codigo === i.codigo; });
  }

  function claveGuardada() {
    try { return window.sessionStorage.getItem(CLAVE_SESION) || ""; } catch (e) { return ""; }
  }

  function plural(n, uno, varios) { return n + " " + (n === 1 ? uno : varios); }

  function claveDe(x) {
    return x.codigo ? "c:" + String(x.codigo).toLowerCase() : "n:" + String(x.invitado || x.nombre || "").trim().toLowerCase();
  }

  function estado(texto) { $("#admin-estado").textContent = texto; }

  // =================================================================
  //  NAVEGACIÓN POR PESTAÑAS
  // =================================================================
  function pestanaActual() {
    const h = window.location.hash.slice(1);
    return PESTANAS.indexOf(h) >= 0 ? h : "inicio";
  }

  function mostrarPestana() {
    const actual = pestanaActual();
    PESTANAS.forEach(function (p) { $("#p-" + p).hidden = p !== actual; });
    $$("[data-pestana]").forEach(function (a) {
      if (a.dataset.pestana === actual) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
  }

  function irA(pestana, nuevoFiltro) {
    if (nuevoFiltro) filtro = nuevoFiltro;
    if (pestanaActual() === pestana) {
      pintarTodo();
      mostrarPestana();
    } else {
      window.location.hash = pestana;
    }
    window.scrollTo(0, 0);
  }

  // =================================================================
  //  CARGA DE RESPUESTAS
  // =================================================================
  function cargarDemo() {
    respuestas = U.leer(U.CLAVE_DEMO, []);
    estado("");
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
        invitadosServidor = res.invitados || [];
        abrirPanel();
        estado("Actualizado a las " + new Date().toLocaleTimeString("es", { hour: "numeric", minute: "2-digit" }));
        pintarTodo();
      })
      .catch(function (err) {
        console.error(err);
        const texto = err.message === "Clave incorrecta"
          ? "La clave no es correcta. Revisa mayúsculas y espacios."
          : "No se pudieron cargar las respuestas (" + err.message + "). Revisa tu conexión o la URL del script en js/config.js.";
        estado("");
        if (!$("#admin-conexion").hidden) {
          $("#bloqueo-error").textContent = texto;
          $("#bloqueo-error").hidden = false;
        } else {
          estado(texto);
        }
      });
  }

  function recargar() {
    if (!modoGoogle) {
      cargarDemo();
      U.aviso("Respuestas actualizadas");
      return;
    }
    const clave = claveGuardada();
    if (clave) cargarGoogle(clave); else cerrarPanel();
  }

  function cerrarPanel() {
    try { window.sessionStorage.removeItem(CLAVE_SESION); } catch (e) { /* sin almacenamiento */ }
    document.body.classList.add("panel-cerrado");
    $("#admin-conexion").hidden = false;
    $("#admin-clave").value = "";
    $("#admin-clave").focus();
  }

  function abrirPanel() {
    document.body.classList.remove("panel-cerrado");
    $("#admin-conexion").hidden = true;
    $("#bloqueo-error").hidden = true;
  }

  // =================================================================
  //  DATOS
  // =================================================================
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
    const lista = listaInvitados().map(function (i) {
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

  function contar(lista) {
    const c = { invitaciones: 0, cupos: 0, si: 0, no: 0, pendientes: 0, cuposPendientes: 0, personas: 0, adultos: 0, ninos: 0, restricciones: {}, otras: [] };
    lista.forEach(function (f) {
      const cupos = Number(f.invitado.cupos) || 0;
      if (!f.invitado.fuera) { c.invitaciones++; c.cupos += cupos; }
      const e = estadoDe(f);
      if (e === "pendiente") { c.pendientes++; c.cuposPendientes += cupos; return; }
      if (e === "no") { c.no++; return; }
      c.si++;
      (f.respuesta.personas || []).forEach(function (p) {
        c.personas++;
        if (p.tipo === "Niño") c.ninos++; else c.adultos++;
        (p.restricciones || []).forEach(function (x) { (c.restricciones[x] = c.restricciones[x] || []).push(p.nombre); });
        if (p.otra) c.otras.push({ nombre: p.nombre, texto: p.otra });
      });
    });
    return c;
  }

  function enviadas() { return U.leer(CLAVE_ENVIADAS, {}); }

  function haceCuanto(iso) {
    const f = new Date(iso);
    if (isNaN(f)) return "";
    const s = (f.getTime() - Date.now()) / 1000;
    const abs = Math.abs(s);
    if (s > 60 || abs > 86400 * 30) return f.toLocaleDateString("es", { day: "numeric", month: "short" });
    if (abs < 60) return "hace un momento";
    const rtf = new Intl.RelativeTimeFormat("es", { numeric: "auto" });
    if (abs < 3600) return rtf.format(Math.round(s / 60), "minute");
    if (abs < 86400) return rtf.format(Math.round(s / 3600), "hour");
    return rtf.format(Math.round(s / 86400), "day");
  }

  function diasHasta(fecha) {
    return Math.ceil((fecha.getTime() - Date.now()) / 86400000);
  }

  function inicialesDe(nombre) {
    const palabras = String(nombre || "").split(/\s+/).filter(function (p) { return p && !/^(y|e|de|del|la|los|las)$/i.test(p); });
    return ((palabras[0] || "").charAt(0) + (palabras[1] || "").charAt(0)).toUpperCase() || "?";
  }

  function fechaLimiteTexto() {
    const l = U.fechaLimiteRsvp();
    return l ? U.formatearFecha(l, { day: "numeric", month: "long" }) : "";
  }

  function mensaje(plantilla, i) {
    return String(plantilla)
      .replace(/\{nombre\}/g, i.nombre)
      .replace(/\{enlace\}/g, U.enlaceInvitado(i.codigo))
      .replace(/\{cupos\}/g, U.textoCupos(i.cupos))
      .replace(/\{fechaLimite\}/g, fechaLimiteTexto() || "la fecha indicada");
  }

  function enlaceEnviar(i, recordatorio) {
    const plantilla = recordatorio
      ? B.mensajeRecordatorio || "¡Hola {nombre}! Te recordamos confirmar tu asistencia a nuestra boda: {enlace}"
      : B.mensajeInvitacion || "¡Hola {nombre}! Esta es tu invitación a nuestra boda: {enlace}";
    return U.enlaceWhatsApp(i.telefono, mensaje(plantilla, i));
  }

  // Atributos del enlace "Ver su invitación"
  function atributosVer(i) {
    return 'href="' + esc(U.enlaceInvitado(i.codigo)) + '" target="_blank" rel="noopener"';
  }

  // =================================================================
  //  INICIO
  // =================================================================
  function pintarInicio(lista, c) {
    // Cuenta regresiva
    const fecha = U.fechaBoda();
    let cuenta = "";
    if (fecha) {
      const dias = diasHasta(fecha);
      const titulo = dias > 1 ? "Faltan <strong>" + dias + " días</strong>" : dias === 1 ? "¡Mañana es la boda!" : dias === 0 ? "¡Hoy es el gran día!" : "¡Ya se casaron!";
      cuenta = '<p class="cuenta-titulo">' + titulo + '</p><p class="cuenta-fecha">' +
        esc(U.capitalizar(U.formatearFecha(fecha, { weekday: "long", day: "numeric", month: "long", year: "numeric" }))) + "</p>";
      const limite = U.fechaLimiteRsvp();
      if (limite) {
        const dl = diasHasta(limite);
        cuenta += '<p class="cuenta-limite">' + icono("reloj") + "<span>" + (dl >= 0
          ? "Fecha límite para confirmar: <strong>" + esc(fechaLimiteTexto()) + "</strong> (" + (dl === 0 ? "es hoy" : "faltan " + plural(dl, "día", "días")) + ")"
          : "La fecha límite para confirmar ya pasó (" + esc(fechaLimiteTexto()) + ")") + "</span></p>";
      }
    }
    $("#cuenta-boda").innerHTML = cuenta;
    $("#cuenta-boda").hidden = !cuenta;

    // Progreso de confirmaciones
    const total = c.invitaciones || 1;
    const respondieron = c.si + c.no;
    const pct = function (n) { return (n / total * 100).toFixed(1) + "%"; };
    $("#progreso").innerHTML =
      '<h3 class="tarjeta-titulo">Confirmaciones</h3>' +
      '<p class="progreso-texto"><strong>' + respondieron + "</strong> de " + plural(c.invitaciones, "invitación", "invitaciones") + " ya respondieron</p>" +
      '<div class="barra" role="img" aria-label="' + c.si + " asistirán, " + c.no + " no asistirán, " + c.pendientes + ' sin responder">' +
      '<span class="barra-si" style="width:' + pct(c.si) + '"></span><span class="barra-no" style="width:' + pct(c.no) + '"></span></div>' +
      '<ul class="leyenda">' +
      [["si", "Asistirán", c.si], ["no", "No asistirán", c.no], ["pendiente", "Sin responder", c.pendientes]].map(function (x) {
        return '<li><button type="button" class="leyenda-fila" data-ir-filtro="' + x[0] + '"><span class="punto est-' + x[0] + '"></span>' +
          "<span>" + x[1] + "</span><strong>" + x[2] + "</strong>" + icono("derecha", "leyenda-flecha") + "</button></li>";
      }).join("") + "</ul>" +
      '<div class="cifras">' +
      '<div class="cifra cifra-principal"><strong>' + c.personas + "</strong><span>" + (c.personas === 1 ? "persona asistirá" : "personas asistirán") + "</span></div>" +
      '<div class="cifra"><strong>' + c.adultos + "</strong><span>" + (c.adultos === 1 ? "adulto" : "adultos") + "</span></div>" +
      '<div class="cifra"><strong>' + c.ninos + "</strong><span>" + (c.ninos === 1 ? "niño" : "niños") + "</span></div>" +
      '<div class="cifra"><strong>' + c.cuposPendientes + "</strong><span>cupos sin confirmar</span></div>" +
      "</div>";

    // ¿Qué sigue?
    const tareas = [];
    const yaEnviadas = Object.keys(enviadas()).length;
    const hayInvitados = listaInvitados().length > 0;
    if (!hayInvitados) {
      tareas.push({ icono: "agregar", texto: "Agrega a tus invitados: el nombre de cada familia o persona y cuántos pueden ir.", boton: "Agregar invitados", ir: "invitados", accion: "agregar" });
    } else if (!yaEnviadas && c.pendientes) {
      tareas.push({ icono: "chat", texto: "Envía a cada invitado su invitación personal por WhatsApp.", boton: "Enviar invitaciones", ir: "invitados", filtro: "todos" });
    }
    if (c.pendientes && hayInvitados) {
      tareas.push({ icono: "campana", texto: plural(c.pendientes, "invitación sigue", "invitaciones siguen") + " sin responder. Puedes enviarles un recordatorio.", boton: "Ver pendientes", ir: "invitados", filtro: "pendiente" });
    }
    if (c.personas) {
      tareas.push({ icono: "tabla", texto: "Ya tienes la lista de asistentes y sus restricciones para el catering.", boton: "Descargar", ir: "herramientas" });
    }
    if (!modoGoogle) {
      tareas.push({ icono: "enlace", texto: "Estás en modo de prueba. Conecta Google Sheets para recibir las respuestas de tus invitados.", boton: "Ver cómo", ir: "herramientas" });
    }
    if (hayInvitados && !c.pendientes) {
      tareas.unshift({ icono: "check", texto: "¡Todas las invitaciones ya respondieron!" });
    }
    $("#que-sigue").innerHTML = '<h3 class="tarjeta-titulo">¿Qué sigue?</h3><ul class="tareas">' + tareas.map(function (t) {
      return '<li><span class="tarea-icono">' + icono(t.icono) + "</span><span class=\"tarea-texto\">" + esc(t.texto) + "</span>" +
        (t.boton ? '<button type="button" class="boton boton-claro boton-mini" data-ir="' + t.ir + '"' + (t.filtro ? ' data-filtro-ir="' + t.filtro + '"' : "") + (t.accion ? ' data-accion="' + t.accion + '"' : "") + ">" + esc(t.boton) + "</button>" : "") +
        "</li>";
    }).join("") + "</ul>";

    // Catering
    const tipos = Object.keys(c.restricciones);
    $("#catering").innerHTML = '<h3 class="tarjeta-titulo">Para el catering</h3>' +
      '<p class="texto-suave">' + plural(c.personas, "persona confirmada", "personas confirmadas") + ": " + plural(c.adultos, "adulto", "adultos") + " y " + plural(c.ninos, "niño", "niños") + ".</p>" +
      ((tipos.length || c.otras.length)
        ? '<ul class="restricciones-lista">' +
          tipos.map(function (t) {
            return "<li><span>" + esc(t) + "</span><strong>" + c.restricciones[t].length + '</strong><small>' + esc(c.restricciones[t].join(", ")) + "</small></li>";
          }).join("") +
          c.otras.map(function (o) { return "<li><span>" + esc(o.texto) + "</span><strong>1</strong><small>" + esc(o.nombre) + "</small></li>"; }).join("") +
          "</ul>"
        : '<p class="vacio">Nadie ha indicado restricciones alimentarias todavía.</p>');

    // Últimas respuestas
    const recientes = lista.filter(function (f) { return f.respuesta; })
      .sort(function (a, b) { return String(b.respuesta.fecha).localeCompare(String(a.respuesta.fecha)); })
      .slice(0, 5);
    $("#ultimas").innerHTML = '<h3 class="tarjeta-titulo">Últimas respuestas</h3>' +
      (recientes.length
        ? '<ul class="actividad">' + recientes.map(function (f) {
          const r = f.respuesta;
          const quien = r.respondidoPor || f.invitado.nombre;
          const texto = r.asistira ? esc(quien) + " confirmó " + esc(U.textoCupos(r.cantidad)) : esc(quien) + " avisó que no podrá asistir";
          return '<li><span class="avatar est-' + estadoDe(f) + '">' + esc(inicialesDe(f.invitado.nombre)) + "</span>" +
            '<span class="actividad-texto"><span>' + texto + "</span><small>" + esc(f.invitado.nombre) + " · " + esc(haceCuanto(r.fecha)) + "</small></span></li>";
        }).join("") + "</ul>" +
          '<button type="button" class="boton boton-claro boton-mini" data-ir="invitados" data-filtro-ir="todos">Ver todos los invitados</button>'
        : '<p class="vacio">Todavía no hay respuestas. Aquí verás las confirmaciones apenas lleguen.</p>');
  }

  // =================================================================
  //  INVITADOS
  // =================================================================
  function pintarFiltros(c) {
    const opciones = [["todos", "Todos", c.invitaciones], ["pendiente", "Sin responder", c.pendientes], ["si", "Asistirán", c.si], ["no", "No asistirán", c.no]];
    $("#filtros").innerHTML = opciones.map(function (o) {
      return '<button type="button" class="filtro" data-filtro="' + o[0] + '" aria-pressed="' + (filtro === o[0]) + '">' +
        esc(o[1]) + ' <span class="filtro-num">' + o[2] + "</span></button>";
    }).join("");
    const globo = $("#globo-pendientes");
    globo.textContent = c.pendientes;
    globo.hidden = !c.pendientes;
  }

  function detalleRespuesta(r) {
    if (!r) return '<p class="vacio">Todavía no responde.</p>';
    const personas = (r.personas || []).map(function (p) {
      const extra = (p.restricciones || []).concat(p.otra ? [p.otra] : []);
      return "<li>" + icono(p.tipo === "Niño" ? "nino" : "personas") + "<span><strong>" + esc(p.nombre) + "</strong> · " + esc(p.tipo) +
        (extra.length ? "<em>" + esc(extra.join(", ")) + "</em>" : "") + "</span></li>";
    }).join("");
    return '<p class="det-meta">Respondió <strong>' + esc(r.respondidoPor) + "</strong> · " + esc(haceCuanto(r.fecha)) + "</p>" +
      (personas ? '<ul class="det-personas">' + personas + "</ul>" : "") +
      (r.mensaje ? '<blockquote class="det-mensaje">' + esc(r.mensaje) + "</blockquote>" : "") +
      (r.cancion ? '<p class="det-linea">' + icono("musica") + "<span>" + esc(r.cancion) + "</span></p>" : "") +
      (r.telefono ? '<p class="det-linea">' + icono("chat") + "<span>" + esc(r.telefono) + "</span></p>" : "");
  }

  function pintarInvitados(lista) {
    const texto = $("#buscar").value.trim().toLowerCase();
    const registro = enviadas();
    const visibles = lista.filter(function (f) {
      if (filtro !== "todos" && estadoDe(f) !== filtro) return false;
      return !texto || String(f.invitado.nombre).toLowerCase().indexOf(texto) >= 0;
    });
    const abiertos = {};
    $$(".invitado-detalle:not([hidden])").forEach(function (d) { abiertos[d.dataset.clave] = true; });

    if (!visibles.length) {
      $("#lista-invitados").innerHTML = '<p class="vacio">' + (listaInvitados().length ? "No hay invitados en este grupo." : "Todavía no hay invitados. Toca <strong>Agregar invitado</strong> para empezar.") + "</p>";
      return;
    }

    $("#lista-invitados").innerHTML = visibles.map(function (f, n) {
      const i = f.invitado;
      const r = f.respuesta;
      const e = estadoDe(f);
      const k = claveDe({ codigo: i.codigo, invitado: i.nombre });
      const enviada = i.codigo && registro[i.codigo];
      const abierto = !!abiertos[k];
      const idDet = "det-" + n;
      const chip = '<span class="chip-estado est-' + e + '">' + ETIQUETAS[e] + (e === "si" ? " · " + r.cantidad : "") + "</span>";
      return '<article class="invitado">' +
        '<div class="invitado-fila">' +
        '<button type="button" class="invitado-cabeza" data-abrir="' + idDet + '" aria-expanded="' + abierto + '" aria-controls="' + idDet + '">' +
        '<span class="avatar est-' + e + '">' + esc(inicialesDe(i.nombre)) + "</span>" +
        '<span class="invitado-info"><strong>' + esc(i.nombre) + "</strong>" +
        '<span class="invitado-sub">' + chip + "<span>" + esc(U.textoCupos(i.cupos)) + "</span>" +
        (enviada ? '<span class="enviada">' + icono("check") + "Enviada</span>" : "") +
        (i.fuera ? '<span class="fuera">No está en la lista</span>' : "") + "</span></span>" +
        icono("abajo", "invitado-flecha") + "</button>" +
        (i.codigo ? '<a class="boton boton-mini boton-enviar' + (r ? " boton-claro" : "") + '" data-enviar="' + esc(i.codigo) + '" href="' + esc(enlaceEnviar(i, false)) +
          '" target="_blank" rel="noopener">' + icono("chat") + "<span>Enviar</span></a>" : "") +
        "</div>" +
        '<div class="invitado-detalle" id="' + idDet + '" data-clave="' + esc(k) + '"' + (abierto ? "" : " hidden") + ">" +
        detalleRespuesta(r) +
        (i.codigo ? '<div class="det-acciones">' +
          (e === "pendiente" ? '<a class="boton boton-mini" data-enviar="' + esc(i.codigo) + '" href="' + esc(enlaceEnviar(i, true)) + '" target="_blank" rel="noopener">' +
            icono("campana") + "<span>Enviar recordatorio</span></a>" : "") +
          '<button type="button" class="boton boton-claro boton-mini" data-copiar="' + esc(U.enlaceInvitado(i.codigo)) + '">' + icono("copiar") + "<span>Copiar enlace</span></button>" +
          '<a class="boton boton-claro boton-mini" ' + atributosVer(i) + ">" + icono("enlace") + "<span>Ver su invitación</span></a>" +
          (editable(i) ? '<button type="button" class="boton boton-claro boton-mini" data-editar="' + esc(i.codigo) + '">' + icono("ajustes") + "<span>Editar</span></button>" +
            '<button type="button" class="boton boton-claro boton-mini" data-eliminar="' + esc(i.codigo) + '">' + icono("basura") + "<span>Eliminar</span></button>" : "") +
          "</div>" +
          (enviada ? '<p class="det-nota">Invitación enviada desde este dispositivo el ' + esc(new Date(enviada).toLocaleDateString("es", { day: "numeric", month: "long" })) + ".</p>" : "")
          : "") +
        "</div></article>";
    }).join("");
  }

  // =================================================================
  //  MENSAJES Y CANCIONES
  // =================================================================
  function pintarMensajes() {
    const ordenadas = respuestas.slice().sort(function (a, b) { return String(b.fecha).localeCompare(String(a.fecha)); });
    const conMensaje = ordenadas.filter(function (r) { return r.mensaje; });
    $("#mensajes").innerHTML = conMensaje.length
      ? conMensaje.map(function (r) {
        return '<article class="tarjeta-panel mensaje"><blockquote>' + esc(r.mensaje) + "</blockquote>" +
          '<p class="mensaje-autor">' + esc(r.respondidoPor || r.invitado) + " · " + esc(r.invitado) + " · " + esc(haceCuanto(r.fecha)) + "</p></article>";
      }).join("")
      : '<article class="tarjeta-panel"><p class="vacio">Aquí aparecerán los mensajes que les dejen sus invitados.</p></article>';

    const canciones = ordenadas.filter(function (r) { return r.cancion; });
    $("#canciones").innerHTML = '<h3 class="tarjeta-titulo" data-icono="musica">Canciones sugeridas</h3>' +
      (canciones.length
        ? '<ol class="canciones">' + canciones.map(function (r) {
          return "<li><strong>" + esc(r.cancion) + "</strong><small>Sugerida por " + esc(r.respondidoPor || r.invitado) + "</small></li>";
        }).join("") + "</ol>" +
          '<button type="button" class="boton boton-claro boton-mini" data-copiar="' + esc(canciones.map(function (r) { return r.cancion; }).join("\n")) + '">' +
          icono("copiar") + "<span>Copiar lista para el DJ</span></button>"
        : '<p class="vacio">Cuando tus invitados sugieran canciones, las verás aquí.</p>');
    ponerIconosTitulos();
  }

  // =================================================================
  //  HERRAMIENTAS
  // =================================================================
  function csv(datos) {
    return "﻿" + datos.map(function (fila) {
      return fila.map(function (v) {
        const t = String(v == null ? "" : v);
        return /[";\n\r]/.test(t) ? '"' + t.replace(/"/g, '""') + '"' : t;
      }).join(";");
    }).join("\r\n");
  }

  function formatoFecha(iso) {
    const f = new Date(iso);
    return isNaN(f) ? "" : f.toLocaleString("es", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  }

  function exportarRespuestas() {
    const datos = [["Invitado", "Cupos", "Estado", "Personas", "Respondió", "Teléfono", "Canción", "Mensaje", "Fecha", "Código"]];
    filas().forEach(function (f) {
      const r = f.respuesta || {};
      datos.push([f.invitado.nombre, f.invitado.cupos || "", ETIQUETAS[estadoDe(f)], r.asistira ? r.cantidad : 0,
        r.respondidoPor || "", r.telefono || "", r.cancion || "", r.mensaje || "", r.fecha ? formatoFecha(r.fecha) : "", f.invitado.codigo || ""]);
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

  function pintarQR() {
    const items = [{ titulo: "Invitación general", texto: "Abre la invitación sin nombre de invitado", url: U.urlBase(), archivo: "qr-invitacion.gif" }];
    if (B.fotos && B.fotos.enlace) items.unshift({ titulo: "Subir fotos", texto: "Para que los invitados suban sus fotos del día", url: B.fotos.enlace, archivo: "qr-fotos.gif" });
    $("#qr-grid").innerHTML = items.map(function (q) {
      const img = U.qrImagen(q.url, 10);
      return '<div class="qr-item"><img src="' + img + '" alt="Código QR: ' + esc(q.titulo) + '" width="160" height="160">' +
        "<div><h4>" + esc(q.titulo) + "</h4><p>" + esc(q.texto) + "</p>" +
        '<a class="boton boton-claro boton-mini descarga" href="' + img + '" download="' + q.archivo + '">' + icono("descargar") + "<span>Descargar</span></a></div></div>";
    }).join("");
  }

  function pintarConexion() {
    const el = $("#h-conexion");
    if (modoGoogle) {
      el.innerHTML = '<h3 class="tarjeta-titulo" data-icono="check">Conectado a Google Sheets</h3>' +
        '<p class="texto-suave">Las respuestas de tus invitados se guardan en tu hoja de cálculo de Google. Puedes abrirla en cualquier momento desde Google Drive.</p>' +
        '<div class="admin-fila"><button type="button" class="boton boton-claro" id="cerrar-sesion">' + icono("candado") + "<span>Cerrar sesión en este dispositivo</span></button></div>";
      $("#cerrar-sesion").addEventListener("click", cerrarPanel);
    } else {
      el.innerHTML = '<h3 class="tarjeta-titulo" data-icono="enlace">Modo de prueba</h3>' +
        '<p class="texto-suave">Ahora las respuestas solo se guardan en el navegador de quien llena el formulario, así que aquí ves únicamente las que se hicieron desde este dispositivo.</p>' +
        '<p class="texto-suave">Para recibir las respuestas de todos tus invitados, conecta Google Sheets siguiendo el README (sección <em>"Guardar las respuestas en Google Sheets"</em>). Toma unos 10 minutos.</p>' +
        '<div class="admin-fila"><button type="button" class="boton boton-claro" id="borrar-demo">' + icono("basura") + "<span>Borrar respuestas de prueba</span></button></div>";
      const boton = $("#borrar-demo");
      let confirmar = false;
      boton.addEventListener("click", function () {
        if (!confirmar) {
          confirmar = true;
          $("span", boton).textContent = "Toca otra vez para borrar";
          boton.classList.add("peligro");
          setTimeout(function () {
            confirmar = false;
            $("span", boton).textContent = "Borrar respuestas de prueba";
            boton.classList.remove("peligro");
          }, 4000);
          return;
        }
        U.guardar(U.CLAVE_DEMO, []);
        try {
          Object.keys(window.localStorage).forEach(function (k) { if (k.indexOf("boda-respuesta-") === 0) window.localStorage.removeItem(k); });
        } catch (e) { /* sin almacenamiento */ }
        cargarDemo();
        pintarConexion();
        U.aviso("Respuestas de prueba borradas");
      });
    }
    ponerIconosTitulos();
  }

  // =================================================================
  //  AGREGAR, EDITAR Y ELIMINAR INVITADOS
  // =================================================================
  function enviarAlScript(datos) {
    return fetch(R.urlGoogleScript, { method: "POST", body: JSON.stringify(datos) })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (!res.ok) throw new Error(res.error || "Error desconocido");
        return res;
      });
  }

  // Crea o actualiza invitados (en Google Sheets o en este navegador)
  function guardarInvitados(nuevos) {
    if (modoGoogle) {
      return enviarAlScript({ accion: "guardarInvitados", clave: claveGuardada(), invitados: nuevos }).then(function (res) {
        res.invitados.forEach(function (g) {
          const n = invitadosServidor.findIndex(function (x) { return x.codigo === g.codigo; });
          if (n >= 0) invitadosServidor[n] = g; else invitadosServidor.push(g);
        });
        return res.invitados;
      });
    }
    const lista = U.invitadosLocales();
    const usados = {};
    listaInvitados().forEach(function (i) { usados[i.codigo] = true; });
    const guardados = nuevos.map(function (x) {
      const limpio = {
        codigo: x.codigo || "",
        nombre: String(x.nombre).trim(),
        cupos: Math.min(30, Math.max(1, Math.round(Number(x.cupos) || 1))),
        telefono: String(x.telefono || "").trim(),
      };
      const n = limpio.codigo ? lista.findIndex(function (y) { return y.codigo === limpio.codigo; }) : -1;
      if (n >= 0) {
        lista[n] = limpio;
      } else {
        limpio.codigo = U.codigoParaInvitado(limpio.nombre, usados);
        usados[limpio.codigo] = true;
        lista.push(limpio);
      }
      return limpio;
    });
    U.guardar(U.CLAVE_INVITADOS_LOCALES, lista);
    return Promise.resolve(guardados);
  }

  function borrarInvitado(codigo) {
    if (modoGoogle) {
      return enviarAlScript({ accion: "borrarInvitado", clave: claveGuardada(), codigo: codigo }).then(function () {
        invitadosServidor = invitadosServidor.filter(function (x) { return x.codigo !== codigo; });
      });
    }
    U.guardar(U.CLAVE_INVITADOS_LOCALES, U.invitadosLocales().filter(function (x) { return x.codigo !== codigo; }));
    return Promise.resolve();
  }

  function abrirFormulario(inv) {
    $("#form-invitado-titulo").textContent = inv ? "Editar invitado" : "Nuevo invitado";
    $("#inv-codigo").value = inv ? inv.codigo : "";
    $("#inv-nombre").value = inv ? inv.nombre : "";
    $("#inv-cupos").value = inv ? inv.cupos : 2;
    $("#inv-telefono").value = inv ? inv.telefono || "" : "";
    $("#inv-guardar").textContent = inv ? "Guardar cambios" : "Guardar invitado";
    $("#inv-error").hidden = true;
    $("#listo-invitado").hidden = true;
    $("#abrir-agregar").hidden = true;
    $("#form-invitado").hidden = false;
    $("#form-invitado").scrollIntoView({ block: "start" });
    $("#inv-nombre").focus({ preventScroll: true });
  }

  function cerrarFormulario() {
    $("#form-invitado").hidden = true;
    $("#abrir-agregar").hidden = false;
  }

  function cambiarCupos(paso) {
    const campo = $("#inv-cupos");
    campo.value = Math.min(30, Math.max(1, (parseInt(campo.value, 10) || 1) + paso));
  }

  function errorFormulario(texto, campo) {
    $("#inv-error").textContent = texto;
    $("#inv-error").hidden = false;
    if (campo) campo.focus();
  }

  function enviarFormularioInvitado(e) {
    e.preventDefault();
    const nombre = $("#inv-nombre").value.trim();
    const cupos = parseInt($("#inv-cupos").value, 10);
    const codigo = $("#inv-codigo").value;
    if (!nombre) return errorFormulario("Escribe el nombre de la invitación.", $("#inv-nombre"));
    if (!cupos || cupos < 1 || cupos > 30) return errorFormulario("Elige cuántas personas pueden ir (entre 1 y 30).", $("#inv-cupos"));
    const repetido = listaInvitados().some(function (x) { return x.codigo !== codigo && x.nombre.trim().toLowerCase() === nombre.toLowerCase(); });
    if (repetido) return errorFormulario("Ya tienes una invitación con ese nombre. Búscala en la lista para editarla.", $("#inv-nombre"));

    const boton = $("#inv-guardar");
    const textoBoton = boton.textContent;
    boton.disabled = true;
    boton.textContent = "Guardando…";
    guardarInvitados([{ codigo: codigo, nombre: nombre, cupos: cupos, telefono: $("#inv-telefono").value.trim() }])
      .then(function (guardados) {
        cerrarFormulario();
        pintarTodo();
        if (codigo) U.aviso("Cambios guardados"); else mostrarListo(guardados[0]);
      })
      .catch(function (err) { errorFormulario("No se pudo guardar (" + err.message + "). Inténtalo de nuevo."); })
      .then(function () {
        boton.disabled = false;
        boton.textContent = textoBoton;
      });
  }

  function mostrarListo(i) {
    const el = $("#listo-invitado");
    el.innerHTML = '<span class="listo-icono">' + icono("check") + "</span>" +
      "<h3>¡Listo! " + esc(i.nombre) + " ya está en la lista</h3>" +
      "<p>Pueden ir <strong>" + esc(U.textoCupos(i.cupos)) + "</strong>. Ahora envíale su invitación:</p>" +
      '<a class="boton boton-grande" data-enviar="' + esc(i.codigo) + '" href="' + esc(enlaceEnviar(i, false)) + '" target="_blank" rel="noopener">' +
      icono("chat") + "<span>Enviar invitación por WhatsApp</span></a>" +
      '<div class="admin-fila">' +
      '<button type="button" class="boton boton-claro boton-mini" data-copiar="' + esc(U.enlaceInvitado(i.codigo)) + '">' + icono("copiar") + "<span>Copiar enlace</span></button>" +
      '<button type="button" class="boton boton-claro boton-mini" data-accion="agregar">' + icono("agregar") + "<span>Agregar otro invitado</span></button>" +
      "</div>";
    el.hidden = false;
    el.scrollIntoView({ block: "start" });
  }

  // Pegar una lista completa (por ejemplo, copiada de Excel)
  function agregarVarios() {
    const lineas = $("#varios-entrada").value.split(/\r?\n/).map(function (l) { return l.trim(); }).filter(Boolean);
    const existentes = {};
    listaInvitados().forEach(function (i) { existentes[i.nombre.trim().toLowerCase()] = i; });
    const vistos = {};
    const nuevos = [];
    lineas.forEach(function (linea) {
      const sep = linea.indexOf("\t") >= 0 ? "\t" : linea.indexOf(";") >= 0 ? ";" : ",";
      const partes = linea.split(sep).map(function (p) { return p.trim(); });
      const nombre = partes[0];
      if (!nombre || vistos[nombre.toLowerCase()]) return;
      const cupos = parseInt(partes[1], 10);
      if (isNaN(cupos) && /nombre|invitado/i.test(nombre)) return; // encabezado de Excel
      const previo = existentes[nombre.toLowerCase()];
      if (previo && !editable(previo)) return;
      vistos[nombre.toLowerCase()] = true;
      nuevos.push({
        codigo: previo ? previo.codigo : "",
        nombre: nombre,
        cupos: isNaN(cupos) || cupos < 1 ? 1 : Math.min(30, cupos),
        telefono: partes[2] || (previo ? previo.telefono || "" : ""),
      });
    });
    if (!nuevos.length) {
      U.aviso("Escribe al menos un invitado");
      $("#varios-entrada").focus();
      return;
    }
    const boton = $("#varios-agregar");
    boton.disabled = true;
    boton.textContent = "Agregando…";
    guardarInvitados(nuevos)
      .then(function (g) {
        const total = g.reduce(function (s, i) { return s + i.cupos; }, 0);
        $("#varios-resultado").innerHTML = "Listo: se guardaron <strong>" + plural(g.length, "invitación", "invitaciones") + "</strong> (" + plural(total, "cupo", "cupos") + "). " +
          '<button type="button" class="enlace-boton" data-ir="invitados" data-filtro-ir="todos">Ir a Invitados para enviarlas</button>';
        $("#varios-resultado").hidden = false;
        $("#varios-entrada").value = "";
        pintarTodo();
      })
      .catch(function (err) { U.aviso("No se pudo guardar: " + err.message); })
      .then(function () {
        boton.disabled = false;
        boton.textContent = "Agregar a la lista";
      });
  }

  // =================================================================
  //  PINTAR TODO E INICIO
  // =================================================================
  function ponerIconosTitulos() {
    $$("[data-icono]").forEach(function (el) {
      if (el.querySelector(".icono")) return;
      el.insertAdjacentHTML("afterbegin", icono(el.dataset.icono));
    });
  }

  function pintarTodo() {
    const lista = filas();
    const c = contar(lista);
    pintarInicio(lista, c);
    pintarFiltros(c);
    pintarInvitados(lista);
    pintarMensajes();
  }

  function iniciar() {
    $("#admin-titulo").textContent = U.nombresPareja(" & ");
    document.title = "Panel · " + U.nombresPareja(" & ");
    $("#admin-recargar").innerHTML = icono("actualizar");
    $("#bloqueo-icono").innerHTML = icono("candado");
    ponerIconosTitulos();

    if (!modoGoogle) {
      const aviso = $("#aviso-modo");
      aviso.innerHTML = "<strong>Modo de prueba:</strong> aquí solo ves las respuestas hechas desde este dispositivo. " +
        '<button type="button" class="enlace-boton" data-ir="herramientas">¿Cómo recibir las de todos?</button>';
      aviso.hidden = false;
    }

    // Navegación
    window.addEventListener("hashchange", function () { pintarTodo(); mostrarPestana(); window.scrollTo(0, 0); });
    mostrarPestana();

    // Clics de toda la página
    document.addEventListener("click", function (e) {
      const copiar = e.target.closest("[data-copiar]");
      if (copiar) {
        U.copiarTexto(copiar.dataset.copiar).then(function (ok) { U.aviso(ok ? "¡Copiado!" : "No se pudo copiar"); });
        return;
      }
      const ir = e.target.closest("[data-ir]");
      if (ir) {
        irA(ir.dataset.ir, ir.dataset.filtroIr);
        if (ir.dataset.accion === "agregar") setTimeout(function () { abrirFormulario(null); }, 60);
        return;
      }
      const accion = e.target.closest("[data-accion]");
      if (accion && accion.dataset.accion === "agregar") { abrirFormulario(null); return; }
      const editar = e.target.closest("[data-editar]");
      if (editar) {
        const inv = listaInvitados().find(function (x) { return x.codigo === editar.dataset.editar; });
        if (inv) abrirFormulario(inv);
        return;
      }
      const eliminar = e.target.closest("[data-eliminar]");
      if (eliminar) {
        if (!eliminar.classList.contains("peligro")) {
          eliminar.classList.add("peligro");
          $("span", eliminar).textContent = "Toca otra vez para eliminar";
          setTimeout(function () {
            eliminar.classList.remove("peligro");
            $("span", eliminar).textContent = "Eliminar";
          }, 4000);
          return;
        }
        borrarInvitado(eliminar.dataset.eliminar)
          .then(function () { pintarTodo(); U.aviso("Invitado eliminado"); })
          .catch(function (err) { U.aviso("No se pudo eliminar: " + err.message); });
        return;
      }
      const paso = e.target.closest("[data-paso]");
      if (paso) { cambiarCupos(Number(paso.dataset.paso)); return; }
      const irFiltro = e.target.closest("[data-ir-filtro]");
      if (irFiltro) { irA("invitados", irFiltro.dataset.irFiltro); return; }
      const f = e.target.closest("[data-filtro]");
      if (f) { filtro = f.dataset.filtro; pintarTodo(); return; }
      const abrir = e.target.closest("[data-abrir]");
      if (abrir) {
        const det = document.getElementById(abrir.dataset.abrir);
        det.hidden = !det.hidden;
        abrir.setAttribute("aria-expanded", det.hidden ? "false" : "true");
        return;
      }
      const enviar = e.target.closest("[data-enviar]");
      if (enviar) {
        const registro = enviadas();
        registro[enviar.dataset.enviar] = new Date().toISOString();
        U.guardar(CLAVE_ENVIADAS, registro);
        setTimeout(pintarTodo, 300);
      }
    });

    $("#buscar").addEventListener("input", function () { pintarInvitados(filas()); });
    $("#admin-recargar").addEventListener("click", recargar);
    $("#exportar-respuestas").addEventListener("click", exportarRespuestas);
    $("#exportar-asistentes").addEventListener("click", exportarAsistentes);
    $("#abrir-agregar").addEventListener("click", function () { abrirFormulario(null); });
    $("#inv-cancelar").addEventListener("click", cerrarFormulario);
    $("#form-invitado").addEventListener("submit", enviarFormularioInvitado);
    $("#form-invitado").addEventListener("input", function () { $("#inv-error").hidden = true; });
    $("#varios-agregar").addEventListener("click", agregarVarios);
    pintarQR();
    pintarConexion();

    if (modoGoogle) {
      $("#admin-conexion").addEventListener("submit", function (e) {
        e.preventDefault();
        $("#bloqueo-error").hidden = true;
        cargarGoogle($("#admin-clave").value);
      });
      const guardada = claveGuardada();
      pintarTodo();
      if (guardada) cargarGoogle(guardada); else cerrarPanel();
    } else {
      cargarDemo();
    }
  }

  iniciar();
})();
