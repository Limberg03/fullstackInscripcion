'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Obtener datos necesarios
    const estudiantes = await queryInterface.sequelize.query(
    //   `SELECT id, registro FROM estudiantes WHERE registro = '221045392';`,
      `SELECT id, registro FROM estudiantes;`,

      { type: Sequelize.QueryTypes.SELECT }
    );

    const materias = await queryInterface.sequelize.query(
      `SELECT id, sigla, creditos FROM materias;`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const carreras = await queryInterface.sequelize.query(
      `SELECT id, codigo FROM carreras WHERE codigo = '187-3';`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (estudiantes.length === 0) {
      console.log('⚠️  Estudiante con registro 221045392 no encontrado');
      return;
    }

    if (carreras.length === 0) {
      console.log('⚠️  Carrera 187-3 (Ingeniería Informática) no encontrada');
      return;
    }

    const estudianteId = estudiantes[0].id;
    const carreraId = carreras[0].id;

    // Crear mapas
    const materiaMap = {};
    materias.forEach(m => {
      materiaMap[m.sigla] = { id: m.id, creditos: m.creditos };
    });

    // Histórico académico del estudiante LIMBERG PECHO GARNICA (según PDF)
    const historico = [
      // ============ SEMESTRE 1-2021 (NIVEL 1) ============
      { sigla: 'MAT101', nota: 79, periodo: '1-2021', nivel: 1 },
      { sigla: 'INF119', nota: 62, periodo: '1-2021', nivel: 1 },
      { sigla: 'FIS100', nota: 88, periodo: '1-2021', nivel: 1 },
      { sigla: 'LIN100', nota: 88, periodo: '1-2021', nivel: 1 },
      { sigla: 'INF110', nota: 51, periodo: '1-2021', nivel: 1 },
      
      // ============ SEMESTRE 2-2021 (NIVEL 2) ============
      { sigla: 'MAT103', nota: 66, periodo: '2-2021', nivel: 2 },
      { sigla: 'MAT102', nota: 93, periodo: '2-2021', nivel: 2 },
      { sigla: 'FIS102', nota: 78, periodo: '2-2021', nivel: 2 },
      { sigla: 'LIN101', nota: 69, periodo: '2-2021', nivel: 2 },
      
      // ============ SEMESTRE 1-2022 (NIVEL 3) ============
      { sigla: 'INF211', nota: 58, periodo: '1-2022', nivel: 3 },
      { sigla: 'MAT207', nota: 80, periodo: '1-2022', nivel: 3 },
      { sigla: 'FIS200', nota: 75, periodo: '1-2022', nivel: 3 },
      { sigla: 'INF120', nota: 78, periodo: '1-2022', nivel: 2 }, // Nota: cursó en nivel 3
      { sigla: 'INF210', nota: 30, periodo: '1-2022', nivel: 3 }, // REPROBÓ
      
      // ============ SEMESTRE 2-2022 (NIVEL 3-4) ============
      { sigla: 'ADM100', nota: 63, periodo: '2-2022', nivel: 3 },
      { sigla: 'INF221', nota: 60, periodo: '2-2022', nivel: 4 },
      { sigla: 'INF210', nota: 54, periodo: '2-2022', nivel: 3, esRepitencia: true }, // SEGUNDA VEZ (aprobó)
      
      // ============ SEMESTRE 1-2023 (NIVEL 4) ============
      { sigla: 'ADM200', nota: 70, periodo: '1-2023', nivel: 4 },
      { sigla: 'INF220', nota: 75, periodo: '1-2023', nivel: 4 },
      { sigla: 'MAT205', nota: 91, periodo: '1-2023', nivel: 4 },
      { sigla: 'MAT202', nota: 61, periodo: '1-2023', nivel: 4 },
      
      // ============ SEMESTRE 2-2023 (NIVEL 5) ============
      { sigla: 'INF312', nota: 51, periodo: '2-2023', nivel: 5 },
      { sigla: 'INF310', nota: 80, periodo: '2-2023', nivel: 5 },
      { sigla: 'MAT302', nota: 64, periodo: '2-2023', nivel: 5 },
      { sigla: 'INF318', nota: 25, periodo: '2-2023', nivel: 5 }, // REPROBÓ
    ];

    // Convertir a formato de base de datos
    const historicoData = historico
      .filter(h => materiaMap[h.sigla]) // Solo materias existentes
      .map(h => {
        const materia = materiaMap[h.sigla];
        const gestion = parseInt(h.periodo.split('-')[1]);
        const estado = h.nota >= 51 ? 'APROBADO' : 'REPROBADO';
        
        return {
          estudiante_id: estudianteId,
          materia_id: materia.id,
          carrera_id: carreraId,
          nota: h.nota,
          creditos: materia.creditos,
          periodo: h.periodo,
          gestion: gestion,
          nivel: h.nivel,
          estado: estado,
          es_repitencia: h.esRepitencia || false,
          observaciones: h.nota < 51 ? 'Materia reprobada' : null,
          created_at: new Date(),
          updated_at: new Date()
        };
      });

    if (historicoData.length > 0) {
      await queryInterface.bulkInsert('historicos_academicos', historicoData, {});
      console.log(`✅ Insertados ${historicoData.length} registros en histórico académico`);
      
      // Calcular y mostrar estadísticas
      const aprobadas = historicoData.filter(h => h.estado === 'APROBADO').length;
      const reprobadas = historicoData.filter(h => h.estado === 'REPROBADO').length;
      const totalCreditos = historicoData
        .filter(h => h.estado === 'APROBADO')
        .reduce((sum, h) => sum + h.creditos, 0);
      
      console.log(`📊 Estadísticas:`);
      console.log(`   - Materias aprobadas: ${aprobadas}`);
      console.log(`   - Materias reprobadas: ${reprobadas}`);
      console.log(`   - Total créditos aprobados: ${totalCreditos}`);
    } else {
      console.log('⚠️  No se pudieron crear registros de histórico');
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('historicos_academicos', null, {});
  }
};