'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      const materias = await queryInterface.sequelize.query('SELECT id, nombre FROM materias ORDER BY id', { type: Sequelize.QueryTypes.SELECT });
      const docentes = await queryInterface.sequelize.query('SELECT id, nombre FROM docentes ORDER BY id', { type: Sequelize.QueryTypes.SELECT });
      const horarios = await queryInterface.sequelize.query('SELECT id FROM horarios ORDER BY id', { type: Sequelize.QueryTypes.SELECT });

      if (materias.length < 20 || docentes.length < 26 || horarios.length < 19) {
        throw new Error('Asegúrese de que los seeders de materias, docentes y horarios se hayan ejecutado correctamente y contengan todos los datos necesarios.');
      }
      
      const getHorario = (index) => horarios[index].id;

      await queryInterface.bulkInsert('grupos_materia', [
        // DATOS CORREGIDOS SEGÚN EL PDF "MAESTRO DE OFERTA"
        
        // Materia 0: ADMINISTRACION
        { grupo: 'SA', estado: true, materia_id: materias[0].id, docente_id: docentes[0].id, horario_id: getHorario(0), cupo: 30, created_at: new Date(), updated_at: new Date() },
        { grupo: 'SC', estado: true, materia_id: materias[0].id, docente_id: docentes[1].id, horario_id: getHorario(1), cupo: 30, created_at: new Date(), updated_at: new Date() },
        
        // Materia 1: ALGEBRA LINEAL
        { grupo: 'SA', estado: true, materia_id: materias[1].id, docente_id: docentes[2].id, horario_id: getHorario(2), cupo: 2, created_at: new Date(), updated_at: new Date() },
        { grupo: 'SE', estado: true, materia_id: materias[1].id, docente_id: docentes[3].id, horario_id: getHorario(3), cupo: 25, created_at: new Date(), updated_at: new Date() },
        { grupo: 'SF', estado: true, materia_id: materias[1].id, docente_id: docentes[4].id, horario_id: getHorario(4), cupo: 25, created_at: new Date(), updated_at: new Date() },
        
        // Materia 2: CALCULO I
        { grupo: 'F1', estado: true, materia_id: materias[2].id, docente_id: docentes[5].id, horario_id: getHorario(5), cupo: 40, created_at: new Date(), updated_at: new Date() },
        { grupo: 'SG', estado: true, materia_id: materias[2].id, docente_id: docentes[6].id, horario_id: getHorario(6), cupo: 40, created_at: new Date(), updated_at: new Date() },
        
        // Materia 3: ESTRUCTURAS DISCRETAS
        { grupo: 'SE', estado: true, materia_id: materias[3].id, docente_id: docentes[8].id, horario_id: getHorario(5), cupo: 35, created_at: new Date(), updated_at: new Date() },
        { grupo: 'SH', estado: true, materia_id: materias[3].id, docente_id: docentes[7].id, horario_id: getHorario(7), cupo: 35, created_at: new Date(), updated_at: new Date() },
        
        // Materia 4: ANALISIS DE CIRCUITOS
        { grupo: 'SA', estado: true, materia_id: materias[4].id, docente_id: docentes[9].id, horario_id: getHorario(7), cupo: 20, created_at: new Date(), updated_at: new Date() },
        { grupo: 'SB', estado: true, materia_id: materias[4].id, docente_id: docentes[9].id, horario_id: getHorario(1), cupo: 20, created_at: new Date(), updated_at: new Date() },
        
        // Materia 5: ARQUITECTURA DE COMPUTADORAS
        { grupo: 'SA', estado: true, materia_id: materias[5].id, docente_id: docentes[10].id, horario_id: getHorario(1), cupo: 35, created_at: new Date(), updated_at: new Date() },
        { grupo: 'SB', estado: true, materia_id: materias[5].id, docente_id: docentes[10].id, horario_id: getHorario(5), cupo: 35, created_at: new Date(), updated_at: new Date() },
        
        // Materia 6: ESTRUCTURA DE DATOS I
        { grupo: 'SA', estado: true, materia_id: materias[6].id, docente_id: docentes[12].id, horario_id: getHorario(7), cupo: 30, created_at: new Date(), updated_at: new Date() },
        { grupo: '12', estado: true, materia_id: materias[6].id, docente_id: docentes[11].id, horario_id: getHorario(8), cupo: 30, created_at: new Date(), updated_at: new Date() },
        
        // Materia 7: CALCULO II
        { grupo: 'SB', estado: true, materia_id: materias[7].id, docente_id: docentes[13].id, horario_id: getHorario(9), cupo: 25, created_at: new Date(), updated_at: new Date() },
        { grupo: 'C1', estado: true, materia_id: materias[7].id, docente_id: docentes[14].id, horario_id: getHorario(10), cupo: 25, created_at: new Date(), updated_at: new Date() },
        
        // Materia 8: BASE DE DATOS I
        { grupo: 'SA', estado: true, materia_id: materias[8].id, docente_id: docentes[15].id, horario_id: getHorario(2), cupo: 30, created_at: new Date(), updated_at: new Date() },
        { grupo: 'SC', estado: true, materia_id: materias[8].id, docente_id: docentes[15].id, horario_id: getHorario(7), cupo: 30, created_at: new Date(), updated_at: new Date() },
        
        // Materia 9: ESTRUCTURAS DE DATOS II
        { grupo: 'SA', estado: true, materia_id: materias[9].id, docente_id: docentes[11].id, horario_id: getHorario(7), cupo: 28, created_at: new Date(), updated_at: new Date() },
        { grupo: 'SB', estado: true, materia_id: materias[9].id, docente_id: docentes[16].id, horario_id: getHorario(6), cupo: 28, created_at: new Date(), updated_at: new Date() },
        
        // Materia 10: COMPILADORES
        { grupo: 'SA', estado: true, materia_id: materias[10].id, docente_id: docentes[17].id, horario_id: getHorario(11), cupo: 20, created_at: new Date(), updated_at: new Date() },
        
        // Materia 11: CONTABILIDAD
        { grupo: 'SA', estado: true, materia_id: materias[11].id, docente_id: docentes[0].id, horario_id: getHorario(2), cupo: 40, created_at: new Date(), updated_at: new Date() },
        { grupo: 'SB', estado: true, materia_id: materias[11].id, docente_id: docentes[18].id, horario_id: getHorario(12), cupo: 40, created_at: new Date(), updated_at: new Date() },
        
        // Materia 12: BASES DE DATOS II
        { grupo: 'SD', estado: true, materia_id: materias[12].id, docente_id: docentes[19].id, horario_id: getHorario(5), cupo: 33, created_at: new Date(), updated_at: new Date() },
        { grupo: 'SB', estado: true, materia_id: materias[12].id, docente_id: docentes[19].id, horario_id: getHorario(13), cupo: 33, created_at: new Date(), updated_at: new Date() },
        
        // Materia 13: AUDITORIA INFORMATICA
        { grupo: 'SA', estado: true, materia_id: materias[13].id, docente_id: docentes[20].id, horario_id: getHorario(14), cupo: 15, created_at: new Date(), updated_at: new Date() },
        
        // Materia 14: ECONOMIA PARA LA GESTION
        { grupo: 'SA', estado: true, materia_id: materias[14].id, docente_id: docentes[21].id, horario_id: getHorario(14), cupo: 25, created_at: new Date(), updated_at: new Date() },
        { grupo: 'SB', estado: true, materia_id: materias[14].id, docente_id: docentes[21].id, horario_id: getHorario(11), cupo: 25, created_at: new Date(), updated_at: new Date() },
        
        // Materia 15: REDES I
        { grupo: 'SB', estado: true, materia_id: materias[15].id, docente_id: docentes[9].id, horario_id: getHorario(15), cupo: 30, created_at: new Date(), updated_at: new Date() },
        { grupo: 'SC', estado: true, materia_id: materias[15].id, docente_id: docentes[22].id, horario_id: getHorario(16), cupo: 30, created_at: new Date(), updated_at: new Date() },
        
        // Materia 16: APLICACIONES CON MICROPROCESAD.
        { grupo: 'SA', estado: true, materia_id: materias[16].id, docente_id: docentes[23].id, horario_id: getHorario(6), cupo: 22, created_at: new Date(), updated_at: new Date() },
        
        // Materia 17: ARQUITECTURA DEL SOFTWARE
        { grupo: 'SA', estado: true, materia_id: materias[17].id, docente_id: docentes[15].id, horario_id: getHorario(1), cupo: 20, created_at: new Date(), updated_at: new Date() },
        
        // Materia 18: CRIPTOGRAFIA Y SEGURIDAD
        { grupo: 'SA', estado: true, materia_id: materias[18].id, docente_id: docentes[24].id, horario_id: getHorario(17), cupo: 18, created_at: new Date(), updated_at: new Date() },
        
        // Materia 19: ECUACIONES DIFERENCIALES
        { grupo: 'NW', estado: true, materia_id: materias[19].id, docente_id: docentes[7].id, horario_id: getHorario(15), cupo: 25, created_at: new Date(), updated_at: new Date() },
        { grupo: 'SC', estado: true, materia_id: materias[19].id, docente_id: docentes[5].id, horario_id: getHorario(18), cupo: 25, created_at: new Date(), updated_at: new Date() },
      ], {});

      console.log('✓ Grupos de materia insertados correctamente');

    } catch (error) {
      console.error('❌ Error al insertar grupos de materia:', error.message);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('grupos_materia', null, {});
  }
};