const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Prerequisito = sequelize.define('Prerequisito', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  materiaId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'materia_id',
    references: {
      model: 'materias',
      key: 'id'
    },
    comment: 'Materia que requiere el prerequisito'
  },
  requiereId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'requiere_id',
    references: {
      model: 'materias',
      key: 'id'
    },
    comment: 'Materia que es prerequisito (debe estar aprobada)'
  },
  notaMinima: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 51,
    field: 'nota_minima',
    validate: {
      min: 0,
      max: 100
    },
    comment: 'Nota mínima requerida para aprobar el prerequisito (por defecto 51)'
  },
  esObligatorio: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'es_obligatorio',
    comment: 'Si es falso, es un prerequisito sugerido pero no obligatorio'
  }
}, {
  tableName: 'prerequisitos',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['materia_id', 'requiere_id'],
      name: 'prerequisitos_unique_constraint'
    }
  ]
});

module.exports = Prerequisito;