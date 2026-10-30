/**
 * =====================================================================
 *  GUARDAR CONFIRMACIONES EN GOOGLE SHEETS
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
 *  Las respuestas se guardan en dos pestañas que se crean solas:
 *    - "Respuestas": una fila por invitación.
 *    - "Asistentes": una fila por persona (útil para mesas y menú).
 *  Si un invitado modifica su respuesta, se reemplaza la anterior.
 * =====================================================================
 */

var CLAVE_ADMIN = "cambia-esta-clave";

var HOJA_RESPUESTAS = "Respuestas";
var HOJA_ASISTENTES = "Asistentes";
var COLUMNAS_RESPUESTAS = ["Fecha", "Código", "Invitado", "Cupos", "Respondido por", "Asiste", "Personas",
  "Adultos", "Niños", "Teléfono", "Canción", "Mensaje", "Detalle (no editar)"];
var COLUMNAS_ASISTENTES = ["Código", "Invitación", "Nombre", "Tipo", "Restricciones", "Otra restricción"];

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    var datos = JSON.parse(e.postData.contents);
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
  if (p.accion === "respuestas") {
    if (CLAVE_ADMIN === "cambia-esta-clave") return json({ ok: false, error: "Primero cambia la CLAVE_ADMIN en el script" });
    if (p.clave !== CLAVE_ADMIN) return json({ ok: false, error: "Clave incorrecta" });
    return json({ ok: true, respuestas: leerRespuestas() });
  }
  return json({ ok: true, mensaje: "El script de la invitación está funcionando." });
}

// ---------------------------------------------------------------------

function validar(d) {
  if (!d || typeof d !== "object") throw new Error("Datos vacíos");
  if (!texto(d.invitado)) throw new Error("Falta el nombre del invitado");
  if (!texto(d.respondidoPor)) throw new Error("Falta quién responde");
  if (!Array.isArray(d.personas)) d.personas = [];
  if (d.personas.length > 30) throw new Error("Demasiadas personas");
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
  var adultos = personas.filter(function (p) { return p.tipo === "Adulto"; }).length;
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
  var clave = claveDe(registro.codigo, registro.invitado);

  var hr = hoja(HOJA_RESPUESTAS, COLUMNAS_RESPUESTAS);
  var ha = hoja(HOJA_ASISTENTES, COLUMNAS_ASISTENTES);
  borrarFilasDe(hr, 1, 2, clave);
  borrarFilasDe(ha, 0, 1, clave);

  hr.appendRow([new Date(), registro.codigo, registro.invitado, registro.cupos, registro.respondidoPor,
    asiste ? "Sí" : "No", registro.cantidad, asiste ? adultos : 0, asiste ? personas.length - adultos : 0,
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
