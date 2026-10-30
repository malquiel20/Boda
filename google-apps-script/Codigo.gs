/**
 * =====================================================================
 *  GUARDAR INVITADOS Y CONFIRMACIONES EN GOOGLE SHEETS
 * =====================================================================
 *  1. Crea una hoja de cálculo nueva en Google Sheets.
 *  2. Menú Extensiones > Apps Script. Borra lo que aparece y pega
 *     todo este archivo.
 *  3. Cambia la CLAVE_ADMIN de abajo por una clave tuya.
 *  4. Implementar > Nueva implementación > Tipo: Aplicación web.
 *       - Ejecutar como: Yo
 *       - Quién tiene acceso: Cualquier usuario
 *  5. Copia la URL que termina en /exec y pégala en js/config.js,
 *     en rsvp.urlGoogleScript.
 *
 *  Se crean tres pestañas solas:
 *    - "Invitados": tu lista (nombre y cupos). La llenas desde el panel
 *      de los novios (admin.html) o escribiendo directo en la hoja.
 *    - "Respuestas": una fila por invitación.
 *    - "Asistentes": una fila por persona (útil para mesas y menú).
 *  Si un invitado modifica su respuesta, se reemplaza la anterior.
 * =====================================================================
 */

var CLAVE_ADMIN = "cambia-esta-clave";

var HOJA_INVITADOS = "Invitados";
var HOJA_RESPUESTAS = "Respuestas";
var HOJA_ASISTENTES = "Asistentes";
var COLUMNAS_INVITADOS = ["Código (no editar)", "Nombre", "Cupos", "Teléfono", "Agregado"];
var COLUMNAS_RESPUESTAS = ["Fecha", "Código", "Invitado", "Cupos", "Respondido por", "Asiste", "Personas",
  "Adultos", "Niños", "Teléfono", "Canción", "Mensaje", "Detalle (no editar)"];
var COLUMNAS_ASISTENTES = ["Código", "Invitación", "Nombre", "Tipo", "Restricciones", "Otra restricción"];

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    var datos = JSON.parse(e.postData.contents);
    if (datos.accion === "guardarInvitados") {
      verificarClave(datos.clave);
      return json({ ok: true, invitados: guardarInvitados(datos.invitados || []) });
    }
    if (datos.accion === "borrarInvitado") {
      verificarClave(datos.clave);
      borrarInvitado(datos.codigo);
      return json({ ok: true });
    }
    validar(datos);
    guardarRespuesta(datos);
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err.message || err) });
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  var p = (e && e.parameter) || {};
  try {
    if (p.accion === "invitado") {
      // Datos de un invitado para su enlace personal (sin datos privados)
      var i = buscarInvitado(p.codigo);
      return json({ ok: true, invitado: i ? { codigo: i.codigo, nombre: i.nombre, cupos: i.cupos } : null });
    }
    if (p.accion === "lista") {
      // Nombres y cupos para quien entra sin enlace personal (sin códigos)
      return json({ ok: true, invitados: leerInvitados(false).map(function (x) { return { nombre: x.nombre, cupos: x.cupos }; }) });
    }
    if (p.accion === "respuestas") {
      verificarClave(p.clave);
      return json({ ok: true, respuestas: leerRespuestas(), invitados: leerInvitados(true) });
    }
  } catch (err) {
    return json({ ok: false, error: String(err.message || err) });
  }
  return json({ ok: true, mensaje: "El script de la invitación está funcionando." });
}

// ---------------------------------------------------------------------
//  Utilidades
// ---------------------------------------------------------------------

function verificarClave(clave) {
  if (CLAVE_ADMIN === "cambia-esta-clave") throw new Error("Primero cambia la CLAVE_ADMIN en el script");
  if (clave !== CLAVE_ADMIN) throw new Error("Clave incorrecta");
}

function texto(v) {
  return String(v == null ? "" : v).trim().slice(0, 1000);
}

function hoja(nombre, columnas) {
  var libro = SpreadsheetApp.getActiveSpreadsheet();
  var h = libro.getSheetByName(nombre);
  if (!h) {
    h = libro.insertSheet(nombre);
    h.appendRow(columnas);
    h.setFrozenRows(1);
    h.getRange(1, 1, 1, columnas.length).setFontWeight("bold").setBackground("#e6ecd9");
  }
  return h;
}

function claveDe(codigo, invitado) {
  return codigo ? "c:" + String(codigo).toLowerCase() : "n:" + String(invitado).trim().toLowerCase();
}

function slug(t) {
  return String(t || "").normalize("NFD").replace(/[̀-ͯ]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);
}

function codigoNuevo(nombre, usados) {
  var letras = "abcdefghjkmnpqrstuvwxyz23456789";
  var codigo;
  do {
    var fin = "";
    for (var i = 0; i < 4; i++) fin += letras.charAt(Math.floor(Math.random() * letras.length));
    codigo = (slug(nombre) || "invitado") + "-" + fin;
  } while (usados[codigo]);
  usados[codigo] = true;
  return codigo;
}

// ---------------------------------------------------------------------
//  Invitados
// ---------------------------------------------------------------------

// Lee la pestaña Invitados. Con completarCodigos=true, crea el código de
// las filas que se escribieron a mano en la hoja.
function leerInvitados(completarCodigos) {
  var h = hoja(HOJA_INVITADOS, COLUMNAS_INVITADOS);
  var ultima = h.getLastRow();
  if (ultima < 2) return [];
  var filas = h.getRange(2, 1, ultima - 1, 4).getValues();
  var usados = {};
  filas.forEach(function (f) { if (f[0]) usados[String(f[0]).trim()] = true; });
  var lista = [];
  filas.forEach(function (f, n) {
    var nombre = texto(f[1]);
    if (!nombre) return;
    var codigo = texto(f[0]);
    if (!codigo && completarCodigos) {
      codigo = codigoNuevo(nombre, usados);
      h.getRange(n + 2, 1).setValue(codigo);
    }
    lista.push({ codigo: codigo, nombre: nombre, cupos: Math.max(1, Math.round(Number(f[2]) || 1)), telefono: texto(f[3]) });
  });
  return lista;
}

function buscarInvitado(codigo) {
  if (!codigo) return null;
  var c = String(codigo).toLowerCase();
  var lista = leerInvitados(false);
  for (var i = 0; i < lista.length; i++) if (lista[i].codigo.toLowerCase() === c) return lista[i];
  return null;
}

function buscarInvitadoPorNombre(nombre) {
  var n = String(nombre || "").trim().toLowerCase();
  var lista = leerInvitados(false);
  for (var i = 0; i < lista.length; i++) if (lista[i].nombre.toLowerCase() === n) return lista[i];
  return null;
}

function guardarInvitados(nuevos) {
  var h = hoja(HOJA_INVITADOS, COLUMNAS_INVITADOS);
  var ultima = h.getLastRow();
  var filas = ultima >= 2 ? h.getRange(2, 1, ultima - 1, 1).getValues() : [];
  var posicion = {};
  var usados = {};
  filas.forEach(function (f, n) {
    var c = String(f[0]).trim();
    if (c) { posicion[c.toLowerCase()] = n + 2; usados[c] = true; }
  });
  return nuevos.slice(0, 500).map(function (x) {
    var nombre = texto(x.nombre);
    if (!nombre) throw new Error("Falta el nombre del invitado");
    var cupos = Math.min(30, Math.max(1, Math.round(Number(x.cupos) || 1)));
    var telefono = texto(x.telefono).replace(/[^\d+]/g, "");
    var codigo = texto(x.codigo);
    var fila = codigo ? posicion[codigo.toLowerCase()] : null;
    if (fila) {
      h.getRange(fila, 2, 1, 3).setValues([[nombre, cupos, telefono]]);
    } else {
      codigo = codigoNuevo(nombre, usados);
      h.appendRow([codigo, nombre, cupos, telefono, new Date()]);
      posicion[codigo.toLowerCase()] = h.getLastRow();
    }
    return { codigo: codigo, nombre: nombre, cupos: cupos, telefono: telefono };
  });
}

function borrarInvitado(codigo) {
  var h = hoja(HOJA_INVITADOS, COLUMNAS_INVITADOS);
  var ultima = h.getLastRow();
  if (ultima < 2 || !codigo) return;
  var filas = h.getRange(2, 1, ultima - 1, 1).getValues();
  for (var i = filas.length - 1; i >= 0; i--) {
    if (String(filas[i][0]).trim().toLowerCase() === String(codigo).toLowerCase()) h.deleteRow(i + 2);
  }
}

// ---------------------------------------------------------------------
//  Respuestas
// ---------------------------------------------------------------------

function validar(d) {
  if (!d || typeof d !== "object") throw new Error("Datos vacíos");
  if (!texto(d.invitado)) throw new Error("Falta el nombre del invitado");
  if (!texto(d.respondidoPor)) throw new Error("Falta quién responde");
  if (!Array.isArray(d.personas)) d.personas = [];
  if (d.personas.length > 30) throw new Error("Demasiadas personas");
}

function borrarFilasDe(h, columnaCodigo, columnaNombre, clave) {
  var ultima = h.getLastRow();
  if (ultima < 2) return;
  var valores = h.getRange(2, 1, ultima - 1, h.getLastColumn()).getValues();
  for (var i = valores.length - 1; i >= 0; i--) {
    if (claveDe(valores[i][columnaCodigo], valores[i][columnaNombre]) === clave) h.deleteRow(i + 2);
  }
}

function guardarRespuesta(d) {
  var personas = d.personas.map(function (p) {
    return {
      nombre: texto(p.nombre),
      tipo: p.tipo === "Niño" ? "Niño" : "Adulto",
      restricciones: Array.isArray(p.restricciones) ? p.restricciones.map(texto) : [],
      otra: texto(p.otra),
    };
  });
  var asiste = d.asistira === true;
  var registro = {
    codigo: texto(d.codigo),
    invitado: texto(d.invitado),
    cupos: Number(d.cupos) || 0,
    respondidoPor: texto(d.respondidoPor),
    asistira: asiste,
    cantidad: asiste ? personas.length : 0,
    personas: asiste ? personas : [],
    telefono: texto(d.telefono),
    cancion: texto(d.cancion),
    mensaje: texto(d.mensaje),
    fecha: new Date().toISOString(),
  };

  // Si el invitado está en la pestaña Invitados, se usan su nombre y sus cupos
  var inv = registro.codigo ? buscarInvitado(registro.codigo) : buscarInvitadoPorNombre(registro.invitado);
  if (inv) {
    registro.codigo = inv.codigo;
    registro.invitado = inv.nombre;
    registro.cupos = inv.cupos;
    if (registro.cantidad > inv.cupos) throw new Error("Superaste el número de cupos de tu invitación");
  }
  var adultos = registro.personas.filter(function (p) { return p.tipo === "Adulto"; }).length;
  var clave = claveDe(registro.codigo, registro.invitado);

  var hr = hoja(HOJA_RESPUESTAS, COLUMNAS_RESPUESTAS);
  var ha = hoja(HOJA_ASISTENTES, COLUMNAS_ASISTENTES);
  borrarFilasDe(hr, 1, 2, clave);
  borrarFilasDe(ha, 0, 1, clave);

  hr.appendRow([new Date(), registro.codigo, registro.invitado, registro.cupos, registro.respondidoPor,
    asiste ? "Sí" : "No", registro.cantidad, adultos, registro.cantidad - adultos,
    registro.telefono, registro.cancion, registro.mensaje, JSON.stringify(registro)]);

  registro.personas.forEach(function (p) {
    ha.appendRow([registro.codigo, registro.invitado, p.nombre, p.tipo, p.restricciones.join(", "), p.otra]);
  });
}

function leerRespuestas() {
  var h = hoja(HOJA_RESPUESTAS, COLUMNAS_RESPUESTAS);
  var ultima = h.getLastRow();
  if (ultima < 2) return [];
  var col = COLUMNAS_RESPUESTAS.length;
  return h.getRange(2, 1, ultima - 1, col).getValues().map(function (fila) {
    try {
      return JSON.parse(fila[col - 1]);
    } catch (err) {
      return {
        codigo: fila[1], invitado: fila[2], cupos: fila[3], respondidoPor: fila[4],
        asistira: fila[5] === "Sí", cantidad: Number(fila[6]) || 0, personas: [],
        telefono: fila[9], cancion: fila[10], mensaje: fila[11],
        fecha: fila[0] instanceof Date ? fila[0].toISOString() : String(fila[0]),
      };
    }
  });
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
