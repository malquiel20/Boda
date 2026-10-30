/*
 * =====================================================================
 *  LISTA DE INVITADOS
 * =====================================================================
 *  Cada invitado (persona, pareja o familia) recibe un enlace personal:
 *      https://tu-pagina/?i=CODIGO
 *  Al abrirlo, el sobre muestra su nombre y cuántos cupos tiene, y el
 *  formulario de confirmación no deja registrar más personas de las
 *  permitidas.
 *
 *  - codigo:   identificador único, sin espacios ni tildes.
 *  - nombre:   cómo aparecerá en el sobre ("Familia Pérez", "Ana y Luis").
 *  - cupos:    número máximo de personas que pueden asistir.
 *  - telefono: opcional, con código de país (ej: 573001234567). Sirve
 *              para enviar la invitación por WhatsApp desde admin.html.
 *
 *  TIP: en admin.html hay un generador. Pega tu lista desde Excel
 *  (nombre, cupos, teléfono) y te crea este archivo completo.
 * =====================================================================
 */
window.INVITADOS = [
  { codigo: "familia-perez-k7m2", nombre: "Familia Pérez", cupos: 4, telefono: "" },
  { codigo: "ana-y-luis-p3x9", nombre: "Ana y Luis", cupos: 2, telefono: "" },
  { codigo: "carolina-mejia-t5q1", nombre: "Carolina Mejía", cupos: 1, telefono: "" },
  { codigo: "tios-ramirez-h8d4", nombre: "Tíos Ramírez", cupos: 3, telefono: "" },
  { codigo: "juan-camilo-r2w6", nombre: "Juan Camilo Rojas", cupos: 2, telefono: "" },
];
