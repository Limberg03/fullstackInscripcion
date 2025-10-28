const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const HistoricoAcademico = sequelize.define('HistoricoAcademico', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  estudianteId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'estudiante_id',
    references: {
      model: 'estudiantes',
      key: 'id'
    }
  },
  materiaId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'materia_id',
    references: {
      model: 'materias',
      key: 'id'
    }
  },
  carreraId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'carrera_id',
    references: {
      model: 'carreras',
      key: 'id'
    }
  },
  nota: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    validate: {
      min: 0,
      max: 100
    },
    comment: 'Nota final de la materia'
  },
  creditos: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Créditos de la materia (se guarda por histórico)'
  },
  periodo: {
    type: DataTypes.STRING(10),
    allowNull: false,
    validate: {
      is: /^[1-5]-\d{4}$/,
      notEmpty: true
    },
  },
  gestion: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 2000,
      max: 2100
    },
    comment: 'Año académico'
  },
  nivel: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 10
    },
    comment: 'Nivel/Semestre cuando cursó la materia'
  },
  estado: {
    type: DataTypes.ENUM('APROBADO', 'REPROBADO', 'ABANDONO', 'CURSANDO'),
    allowNull: false,
    defaultValue: 'CURSANDO',
    comment: 'Estado final de la materia'
  },
  esRepitencia: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'es_repitencia',
    comment: 'Indica si es segunda vez (o más) cursando la materia'
  },
  observaciones: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Observaciones adicionales (convalidaciones, etc.)'
  }
}, {
  tableName: 'historicos_academicos',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['estudiante_id']
    },
    {
      fields: ['materia_id']
    },
    {
      fields: ['carrera_id']
    },
    {
      fields: ['periodo']
    },
    {
      fields: ['estado']
    },
    {
      unique: true,
      fields: ['estudiante_id', 'materia_id', 'periodo'],
      name: 'historico_estudiante_materia_periodo_unique'
    }
  ]
});

module.exports = HistoricoAcademico;
