'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Primero obtenemos los IDs de las materias
    const materias = await queryInterface.sequelize.query(
      `SELECT id, sigla FROM materias;`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    // Crear un mapa para búsqueda rápida
    const materiaMap = {};
    materias.forEach(m => {
      materiaMap[m.sigla] = m.id;
    });

    // Definir prerequisitos basados en la malla curricular
    const prerequisitos = [
      // ============ SEMESTRE 2 ============
      { materia: 'MAT102', requiere: 'MAT101', notaMinima: 51 }, // Cálculo II requiere Cálculo I
      { materia: 'MAT103', requiere: 'MAT101', notaMinima: 51 }, // Álgebra Lineal requiere Cálculo I
      { materia: 'FIS102', requiere: 'FIS100', notaMinima: 51 }, // Física II requiere Física I
      { materia: 'FIS102', requiere: 'MAT101', notaMinima: 51 }, // Física II requiere Cálculo I
      { materia: 'LIN101', requiere: 'LIN100', notaMinima: 51 }, // Inglés Técnico II requiere I
      
      // ============ SEMESTRE 3 ============
      { materia: 'MAT207', requiere: 'MAT102', notaMinima: 51 }, // Ecuaciones Dif. requiere Cálculo II
      { materia: 'FIS200', requiere: 'FIS102', notaMinima: 51 }, // Física III requiere Física II
      { materia: 'FIS200', requiere: 'MAT102', notaMinima: 51 }, // Física III requiere Cálculo II
      { materia: 'INF210', requiere: 'INF120', notaMinima: 51 }, // Programación II requiere Prog. I
      { materia: 'INF211', requiere: 'INF110', notaMinima: 51 }, // Arquitectura requiere Intro Inf.
      
      // ============ SEMESTRE 4 ============
      { materia: 'MAT202', requiere: 'MAT102', notaMinima: 51 }, // Prob. y Estadística I requiere Cálculo II
      { materia: 'MAT205', requiere: 'MAT102', notaMinima: 51 }, // Métodos Numéricos requiere Cálculo II
      { materia: 'MAT205', requiere: 'INF210', notaMinima: 51 }, // Métodos Numéricos requiere Prog. II
      { materia: 'INF220', requiere: 'INF210', notaMinima: 51 }, // Estr. Datos I requiere Prog. II
      { materia: 'INF221', requiere: 'INF211', notaMinima: 51 }, // Ensamblador requiere Arquitectura
      { materia: 'ADM200', requiere: 'ADM100', notaMinima: 51 }, // Contabilidad requiere Administración
      
      // ============ SEMESTRE 5 ============
      { materia: 'MAT302', requiere: 'MAT202', notaMinima: 51 }, // Prob. y Estad. II requiere I
      { materia: 'INF310', requiere: 'INF220', notaMinima: 51 }, // Estr. Datos II requiere Estr. Datos I
      { materia: 'INF312', requiere: 'INF220', notaMinima: 51 }, // Base de Datos I requiere Estr. Datos I
      { materia: 'INF318', requiere: 'INF210', notaMinima: 51 }, // Prog. Lógica y Func. requiere Prog. II
      
      // ============ SEMESTRE 6 ============
      { materia: 'MAT329', requiere: 'MAT302', notaMinima: 51 }, // Investigación Operativa I
      { materia: 'INF322', requiere: 'INF312', notaMinima: 51 }, // Base de Datos II requiere BD I
      { materia: 'INF323', requiere: 'INF310', notaMinima: 51 }, // Sist. Operativos I requiere Estr. Datos II
      { materia: 'INF329', requiere: 'INF318', notaMinima: 51 }, // Compiladores requiere Prog. Lógica
      { materia: 'INF342', requiere: 'INF310', notaMinima: 51 }, // Sist. Información I requiere Estr. Datos II
      
      // ============ SEMESTRE 7 ============
      { materia: 'MAT419', requiere: 'MAT329', notaMinima: 51 }, // Inv. Operativa II requiere I
      { materia: 'INF412', requiere: 'INF342', notaMinima: 51 }, // Sist. Información II requiere I
      { materia: 'INF413', requiere: 'INF323', notaMinima: 51 }, // Sist. Operativos II requiere I
      { materia: 'INF418', requiere: 'MAT302', notaMinima: 51 }, // Inteligencia Artificial requiere Prob. y Est. II
      { materia: 'INF433', requiere: 'INF323', notaMinima: 51 }, // Redes I requiere Sist. Operativos I
      
      // ============ SEMESTRE 8 ============
      { materia: 'INF422', requiere: 'INF412', notaMinima: 51 }, // Ing. Software I requiere Sist. Inf. II
      { materia: 'INF423', requiere: 'INF433', notaMinima: 51 }, // Redes II requiere Redes I
      { materia: 'INF428', requiere: 'INF418', notaMinima: 51 }, // Sistemas Expertos requiere IA
      { materia: 'INF442', requiere: 'INF342', notaMinima: 51 }, // Sist. Información Geográfica
      { materia: 'ECO449', requiere: 'ADM200', notaMinima: 51 }, // Prep. Eval. Proyectos requiere Contabilidad
      
      // ============ SEMESTRE 9 ============
      { materia: 'INF511', requiere: 'INF422', notaMinima: 51 }, // Taller de Grado I (requiere aprobar hasta semestre 8)
      { materia: 'INF512', requiere: 'INF422', notaMinima: 51 }, // Ing. Software II requiere Ing. Software I
      { materia: 'INF513', requiere: 'INF442', notaMinima: 51 }, // Tecnología Web requiere Sist. Inf. Geog.
      { materia: 'INF552', requiere: 'INF423', notaMinima: 51 }, // Arquitectura de Software requiere Redes II
      
      // ============ SEMESTRE 10 ============
      { materia: 'GRL001', requiere: 'INF511', notaMinima: 51 }, // Modalidad Titulación requiere Taller Grado I
    ];

    // Convertir a formato de base de datos
    const prerequisitosData = prerequisitos
      .filter(p => materiaMap[p.materia] && materiaMap[p.requiere]) // Solo si ambas materias existen
      .map(p => ({
        materia_id: materiaMap[p.materia],
        requiere_id: materiaMap[p.requiere],
        nota_minima: p.notaMinima || 51,
        es_obligatorio: true,
        created_at: new Date(),
        updated_at: new Date()
      }));

    if (prerequisitosData.length > 0) {
      await queryInterface.bulkInsert('prerequisitos', prerequisitosData, {});
      console.log(`✅ Insertados ${prerequisitosData.length} prerequisitos`);
    } else {
      console.log('⚠️  No se encontraron materias coincidentes para prerequisitos');
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('prerequisitos', null, {});
  }
};