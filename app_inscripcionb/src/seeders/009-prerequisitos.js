'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Función helper para obtener el ID de una materia por su sigla
    const getMateriaIdBySigla = async (sigla) => {
      const result = await queryInterface.sequelize.query(
        'SELECT id FROM materias WHERE sigla = ? LIMIT 1',
        { 
          replacements: [sigla],
          type: Sequelize.QueryTypes.SELECT 
        }
      );
      
      if (result.length === 0) {
        // Si no se encuentra, lanzamos un error claro.
        throw new Error(`Error de consistencia: No se encontró en la BD la materia con sigla: ${sigla}`);
      }
      
      return result[0].id;
    };

    // Estructura de prerrequisitos corregida y consistente con las 20 materias existentes.
    // Formato: [materia_que_requiere, materia_requerida]
    const prerequisitosMap = [
      // Prerrequisitos validados que existen en la BD
      ['MAT-102', 'MAT-101'], // CALCULO II -> CALCULO I
      ['MAT-103', 'INF-119'], // ALGEBRA LINEAL -> ESTRUCTURAS DISCRETAS
      ['MAT-207', 'MAT-102'], // ECUACIONES DIFERENCIALES -> CALCULO II
      ['INF-310', 'INF-220'], // ESTRUCTURAS DE DATOS II -> ESTRUCTURA DE DATOS I
      ['INF-322', 'INF-312'], // BASES DE DATOS II -> BASE DE DATOS I
      ['ADM-200', 'ADM-100'], // CONTABILIDAD -> ADMINISTRACION
      ['ECO-300', 'ADM-200'], // ECONOMIA PARA LA GESTION -> CONTABILIDAD
    ];

    const prerequisitosParaInsertar = [];

    // Usamos un bucle for...of para manejar correctamente las promesas con await
    for (const [materiaSigla, requiereSigla] of prerequisitosMap) {
      try {
        const materia_id = await getMateriaIdBySigla(materiaSigla);
        const requiere_id = await getMateriaIdBySigla(requiereSigla);
        
        prerequisitosParaInsertar.push({
          materia_id: materia_id,
          requiere_id: requiere_id,
          created_at: new Date(),
          updated_at: new Date()
        });
      } catch (error) {
        // Si ocurre un error, lo mostramos en consola para facilitar la depuración.
        console.error(`Error al procesar el prerrequisito [${materiaSigla} -> ${requiereSigla}]: ${error.message}. Omitiendo este registro.`);
      }
    }

    if (prerequisitosParaInsertar.length > 0) {
      await queryInterface.bulkInsert('prerequisitos', prerequisitosParaInsertar, {});
      console.log(`Se insertaron ${prerequisitosParaInsertar.length} prerrequisitos consistentes.`);
    } else {
      console.log('No se insertaron nuevos prerrequisitos.');
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('prerequisitos', null, {});
  }
};
