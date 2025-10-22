/**
 * @param {Object} horario1 
 * @param {Object} horario2 
 * @returns {boolean} 
 */
export const tieneChoqueDeHorario = (horario1, horario2) => {
  if (!horario1 || !horario2) return false;

  const dias1 = horario1.dia.toLowerCase().split('-');
  const dias2 = horario2.dia.toLowerCase().split('-');
  const tienenDiaEnComun = dias1.some(dia => dias2.includes(dia));

  // comp
  if (!tienenDiaEnComun) return false;

  const inicio1 = parseHora(horario1.horaInicio);
  const fin1 = parseHora(horario1.horaFin);
  const inicio2 = parseHora(horario2.horaInicio);
  const fin2 = parseHora(horario2.horaFin);

  return inicio1 < fin2 && fin1 > inicio2;
};

/**
 * 
 * @param {string} horaStr
 * @returns {number} 
 */
const parseHora = (horaStr) => {
  const partes = horaStr.split(':');
  const horas = parseInt(partes[0], 10);
  const minutos = parseInt(partes[1], 10);
  return horas * 60 + minutos;
};

/**
 * @param {Object} grupoAInscribir
 * @param {Array} inscripcionesActuales 
 */
export const validarChoqueConInscripciones = (grupoAInscribir, inscripcionesActuales) => {
  if (!grupoAInscribir?.horario || !inscripcionesActuales?.length) {
    return null;
  }

  for (const inscripcion of inscripcionesActuales) {
    const grupoInscrito = inscripcion.grupoMateria;
    if (!grupoInscrito?.horario) continue;

    if (tieneChoqueDeHorario(grupoAInscribir.horario, grupoInscrito.horario)) {
      return {
        hasConflict: true,
        materiaConflicto: grupoInscrito.materia?.nombre || 'Materia inscrita',
        horarioConflicto: `${grupoInscrito.horario.dia} ${grupoInscrito.horario.horaInicio}-${grupoInscrito.horario.horaFin}`
      };
    }
  }

  return null;
};