'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Obtener niveles
    const niveles = await queryInterface.sequelize.query(
      'SELECT id, nombre FROM niveles ORDER BY id',
      { type: Sequelize.QueryTypes.SELECT }
    );

    // Obtener planes de estudio
    const planesEstudio = await queryInterface.sequelize.query(
      'SELECT id, nombre FROM planes_estudio ORDER BY id LIMIT 1',
      { type: Sequelize.QueryTypes.SELECT }
    );

    // Verificar que existan niveles y planes
    if (niveles.length < 5) {
      throw new Error('No se encontraron suficientes niveles para crear las materias');
    }

    if (planesEstudio.length === 0) {
      throw new Error('No se encontraron planes de estudio');
    }

    const planEstudioId = planesEstudio[0].id; // Usar el primer plan de estudio

    // Seeder con 20 materias del PDF con docente asignado
    await queryInterface.bulkInsert('materias', [
      // Nivel 1
      {
        nombre: 'ADMINISTRACION',
        sigla: 'ADM100',
        creditos: 4,
        nivel_id: niveles[0].id,
        plan_estudio_id: planEstudioId,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nombre: 'ALGEBRA LINEAL',
        sigla: 'MAT103',
        creditos: 4,
        nivel_id: niveles[0].id,
        plan_estudio_id: planEstudioId,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nombre: 'CALCULO I',
        sigla: 'MAT101',
        creditos: 5,
        nivel_id: niveles[0].id,
        plan_estudio_id: planEstudioId,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nombre: 'ESTRUCTURAS DISCRETAS',
        sigla: 'INF119',
        creditos: 4,
        nivel_id: niveles[0].id,
        plan_estudio_id: planEstudioId,
        created_at: new Date(),
        updated_at: new Date()
      },
      // Nivel 2
      {
        nombre: 'ANALISIS DE CIRCUITOS',
        sigla: 'RDS210',
        creditos: 4,
        nivel_id: niveles[1].id,
        plan_estudio_id: planEstudioId,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nombre: 'ARQUITECTURA DE COMPUTADORAS',
        sigla: 'INF211',
        creditos: 5,
        nivel_id: niveles[1].id,
        plan_estudio_id: planEstudioId,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nombre: 'ESTRUCTURA DE DATOS I',
        sigla: 'INF220',
        creditos: 5,
        nivel_id: niveles[1].id,
        plan_estudio_id: planEstudioId,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nombre: 'CALCULO II',
        sigla: 'MAT102',
        creditos: 5,
        nivel_id: niveles[1].id,
        plan_estudio_id: planEstudioId,
        created_at: new Date(),
        updated_at: new Date()
      },
      // Nivel 3
      {
        nombre: 'BASE DE DATOS I',
        sigla: 'INF312',
        creditos: 4,
        nivel_id: niveles[2].id,
        plan_estudio_id: planEstudioId,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nombre: 'ESTRUCTURAS DE DATOS II',
        sigla: 'INF310',
        creditos: 5,
        nivel_id: niveles[2].id,
        plan_estudio_id: planEstudioId,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nombre: 'COMPILADORES',
        sigla: 'INF329',
        creditos: 4,
        nivel_id: niveles[2].id,
        plan_estudio_id: planEstudioId,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nombre: 'CONTABILIDAD',
        sigla: 'ADM200',
        creditos: 3,
        nivel_id: niveles[2].id,
        plan_estudio_id: planEstudioId,
        created_at: new Date(),
        updated_at: new Date()
      },
      // Nivel 4
      {
        nombre: 'BASES DE DATOS II',
        sigla: 'INF322',
        creditos: 4,
        nivel_id: niveles[3].id,
        plan_estudio_id: planEstudioId,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nombre: 'AUDITORIA INFORMATICA',
        sigla: 'INF462',
        creditos: 4,
        nivel_id: niveles[3].id,
        plan_estudio_id: planEstudioId,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nombre: 'ECONOMIA PARA LA GESTION',
        sigla: 'ECO300',
        creditos: 3,
        nivel_id: niveles[3].id,
        plan_estudio_id: planEstudioId,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nombre: 'REDES I',
        sigla: 'INF433',
        creditos: 4,
        nivel_id: niveles[3].id,
        plan_estudio_id: planEstudioId,
        created_at: new Date(),
        updated_at: new Date()
      },
      // Nivel 5
      {
        nombre: 'APLICACIONES CON MICROPROCESAD.',
        sigla: 'RDS410',
        creditos: 4,
        nivel_id: niveles[4].id,
        plan_estudio_id: planEstudioId,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nombre: 'ARQUITECTURA DEL SOFTWARE',
        sigla: 'INF552',
        creditos: 4,
        nivel_id: niveles[4].id,
        plan_estudio_id: planEstudioId,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nombre: 'CRIPTOGRAFIA Y SEGURIDAD',
        sigla: 'ELC107',
        creditos: 3,
        nivel_id: niveles[4].id,
        plan_estudio_id: planEstudioId,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nombre: 'ECUACIONES DIFERENCIALES',
        sigla: 'MAT207',
        creditos: 5,
        nivel_id: niveles[4].id,
        plan_estudio_id: planEstudioId,
        created_at: new Date(),
        updated_at: new Date()
      },
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('materias', null, {});
  }
};