const sequelize = require('../config/database');

// Importar todos los modelos
const Estudiante = require('./Estudiante');
const Inscripcion = require('./Inscripcion');
const PlanEstudio = require('./PlanEstudio');
const Carrera = require('./Carrera');
const Nivel = require('./Nivel');
const Aula = require('./Aula');
const Materia = require('./Materia');
const Prerequisito = require('./Prerequisito');
const Docente = require('./Docente');
const GrupoMateria = require('./GrupoMateria');
const Horario = require('./Horario');
const Nota = require('./Nota');
const HistoricoAcademico = require('./HistoricoAcademico');

// Modelo Usuario
const Usuario = require('./Usuario')(sequelize, require('sequelize').DataTypes);

// ==========================================
// HOOKS PARA SINCRONIZAR NOTA → HISTÓRICO
// ==========================================

// Cuando se crea una nota, crear/actualizar histórico
Nota.addHook('afterCreate', async (nota, options) => {
  try {
    // Obtener datos necesarios
    const grupoMateria = await GrupoMateria.findByPk(nota.grupoMateriaId, {
      include: [
        { 
          model: Materia, 
          as: 'materia',
          include: [
            { model: Nivel, as: 'nivel' }
          ]
        }
      ]
    });

    const inscripcion = await Inscripcion.findOne({
      where: {
        estudianteId: nota.estudianteId,
        grupoMateriaId: nota.grupoMateriaId
      },
      include: [
        {
          model: Estudiante,
          as: 'estudiante',
          attributes: ['id']
        }
      ]
    });

    if (!grupoMateria || !inscripcion) {
      console.warn('⚠️ No se encontró grupo o inscripción para crear histórico');
      return;
    }

    // Obtener carrera del estudiante (asumiendo primera carrera)
    const carrera = await Carrera.findOne({
      where: { planEstudioId: grupoMateria.materia.planEstudioId }
    });

    const periodo = `${inscripcion.gestion % 2 === 0 ? '2' : '1'}-${inscripcion.gestion}`;
    const estado = nota.calificacion >= 51 ? 'APROBADO' : 'REPROBADO';

    // Crear o actualizar histórico
    const [historico, created] = await HistoricoAcademico.findOrCreate({
      where: {
        estudianteId: nota.estudianteId,
        materiaId: grupoMateria.materiaId,
        periodo: periodo
      },
      defaults: {
        carreraId: carrera?.id || 1,
        nota: nota.calificacion,
        creditos: grupoMateria.materia.creditos,
        gestion: inscripcion.gestion,
        nivel: grupoMateria.materia.nivel?.id || 1,
        estado: estado,
        esRepitencia: false,
        observaciones: nota.observacion
      },
      transaction: options.transaction
    });

    if (!created) {
      // Si ya existe, actualizar
      await historico.update({
        nota: nota.calificacion,
        estado: estado,
        observaciones: nota.observacion,
        esRepitencia: true
      }, { transaction: options.transaction });
    }

    console.log(`✅ Histórico ${created ? 'creado' : 'actualizado'} para estudiante ${nota.estudianteId}`);
  } catch (error) {
    console.error('❌ Error al crear histórico desde nota:', error.message);
  }
});

// Cuando se actualiza una nota, actualizar histórico
Nota.addHook('afterUpdate', async (nota, options) => {
  try {
    const inscripcion = await Inscripcion.findOne({
      where: {
        estudianteId: nota.estudianteId,
        grupoMateriaId: nota.grupoMateriaId
      }
    });

    if (!inscripcion) return;

    const periodo = `${inscripcion.gestion % 2 === 0 ? '2' : '1'}-${inscripcion.gestion}`;
    const estado = nota.calificacion >= 51 ? 'APROBADO' : 'REPROBADO';

    const grupoMateria = await GrupoMateria.findByPk(nota.grupoMateriaId);
    
    await HistoricoAcademico.update({
      nota: nota.calificacion,
      estado: estado,
      observaciones: nota.observacion
    }, {
      where: {
        estudianteId: nota.estudianteId,
        materiaId: grupoMateria.materiaId,
        periodo: periodo
      },
      transaction: options.transaction
    });

    console.log(`✅ Histórico actualizado para estudiante ${nota.estudianteId}`);
  } catch (error) {
    console.error('❌ Error al actualizar histórico:', error.message);
  }
});

// ==========================================
// RELACIONES EXISTENTES
// ==========================================

// Plan_Estudio -> Carrera (1:N)
PlanEstudio.hasMany(Carrera, { 
  foreignKey: 'planEstudioId', 
  as: 'carreras' 
});
Carrera.belongsTo(PlanEstudio, { 
  foreignKey: 'planEstudioId', 
  as: 'planEstudio' 
});

// Nivel -> Materia (1:N)
Nivel.hasMany(Materia, { 
  foreignKey: 'nivelId', 
  as: 'materias' 
});
Materia.belongsTo(Nivel, { 
  foreignKey: 'nivelId', 
  as: 'nivel' 
});

// PlanEstudio -> Materia (1:N)
PlanEstudio.hasMany(Materia, { 
  foreignKey: 'planEstudioId', 
  as: 'materias' 
});
Materia.belongsTo(PlanEstudio, { 
  foreignKey: 'planEstudioId', 
  as: 'planEstudio' 
});

// ==========================================
// RELACIONES DE PREREQUISITOS (MEJORADAS)
// ==========================================

// Materia -> Prerequisito (1:N)
// Una materia puede tener muchos prerequisitos
Materia.hasMany(Prerequisito, { 
  foreignKey: 'materiaId', 
  as: 'prerequisitos' 
});
Prerequisito.belongsTo(Materia, { 
  foreignKey: 'materiaId', 
  as: 'materia' 
});

// Una materia puede ser prerequisito de muchas otras
Materia.hasMany(Prerequisito, { 
  foreignKey: 'requiereId', 
  as: 'esPrerequisitoDe' 
});
Prerequisito.belongsTo(Materia, { 
  foreignKey: 'requiereId', 
  as: 'materiaRequerida' 
});

// ==========================================
// RELACIONES DE GRUPOS Y HORARIOS
// ==========================================

// Materia -> GrupoMateria (1:N)
Materia.hasMany(GrupoMateria, { 
  foreignKey: 'materiaId', 
  as: 'grupos' 
});
GrupoMateria.belongsTo(Materia, { 
  foreignKey: 'materiaId', 
  as: 'materia' 
});

// Docente -> GrupoMateria (1:N)
Docente.hasMany(GrupoMateria, { 
  foreignKey: 'docenteId', 
  as: 'grupos' 
});
GrupoMateria.belongsTo(Docente, { 
  foreignKey: 'docenteId', 
  as: 'docente' 
});

// Horario -> GrupoMateria (1:N)
Horario.hasMany(GrupoMateria, { 
  foreignKey: 'horarioId', 
  as: 'grupos' 
});
GrupoMateria.belongsTo(Horario, { 
  foreignKey: 'horarioId', 
  as: 'horario' 
});

// ==========================================
// RELACIONES DE INSCRIPCIONES
// ==========================================

// GrupoMateria -> Inscripcion (1:N)
GrupoMateria.hasMany(Inscripcion, { 
  foreignKey: 'grupoMateriaId', 
  as: 'inscripciones' 
});
Inscripcion.belongsTo(GrupoMateria, { 
  foreignKey: 'grupoMateriaId', 
  as: 'grupoMateria' 
});

// Estudiante -> Inscripcion (1:N)
Estudiante.hasMany(Inscripcion, { 
  foreignKey: 'estudianteId', 
  as: 'inscripciones' 
});
Inscripcion.belongsTo(Estudiante, { 
  foreignKey: 'estudianteId', 
  as: 'estudiante' 
});

// ==========================================
// RELACIONES DE NOTAS
// ==========================================

// GrupoMateria -> Nota (1:N)
GrupoMateria.hasMany(Nota, { 
  foreignKey: 'grupoMateriaId', 
  as: 'notas' 
});
Nota.belongsTo(GrupoMateria, { 
  foreignKey: 'grupoMateriaId', 
  as: 'grupoMateria' 
});

// Estudiante -> Nota (1:N)
Estudiante.hasMany(Nota, { 
  foreignKey: 'estudianteId', 
  as: 'notas' 
});
Nota.belongsTo(Estudiante, { 
  foreignKey: 'estudianteId', 
  as: 'estudiante' 
});

// ==========================================
// RELACIONES DE HISTÓRICO ACADÉMICO (NUEVAS)
// ==========================================

// Estudiante -> HistoricoAcademico (1:N)
Estudiante.hasMany(HistoricoAcademico, {
  foreignKey: 'estudianteId',
  as: 'historicoAcademico'
});
HistoricoAcademico.belongsTo(Estudiante, {
  foreignKey: 'estudianteId',
  as: 'estudiante'
});

// Materia -> HistoricoAcademico (1:N)
Materia.hasMany(HistoricoAcademico, {
  foreignKey: 'materiaId',
  as: 'historicos'
});
HistoricoAcademico.belongsTo(Materia, {
  foreignKey: 'materiaId',
  as: 'materia'
});

// Carrera -> HistoricoAcademico (1:N)
Carrera.hasMany(HistoricoAcademico, {
  foreignKey: 'carreraId',
  as: 'historicos'
});
HistoricoAcademico.belongsTo(Carrera, {
  foreignKey: 'carreraId',
  as: 'carrera'
});

module.exports = {
  sequelize,
  Usuario,
  Estudiante,
  Inscripcion,
  PlanEstudio,
  Carrera,
  Nivel,
  Aula,
  Materia,
  Prerequisito,
  Docente,
  GrupoMateria,
  Horario,
  Nota,
  HistoricoAcademico
};