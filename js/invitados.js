/*
 * =====================================================================
 *  LISTA DE INVITADOS (OPCIONAL)
 * =====================================================================
 *  Lo normal es agregar los invitados desde el panel de los novios
 *  (admin.html → Invitados → "Agregar invitado"). Con Google Sheets
 *  conectado se guardan en la pestaña "Invitados" de tu hoja.
 *
 *  Este archivo es solo para quien prefiera escribir la lista a mano.
 *  Los invitados que pongas aquí se suman a los del panel. Ejemplo:
 *
 *  window.INVITADOS = [
 *    { codigo: "familia-perez-k7m2", nombre: "Familia Pérez", cupos: 4, telefono: "" },
 *  ];
 *
 *  - codigo: identificador del enlace personal (tu-pagina/?i=codigo),
 *            sin espacios ni tildes.
 *  - cupos:  número máximo de personas que pueden asistir.
 * =====================================================================
 */
window.INVITADOS = [];
