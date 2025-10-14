const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Asegúrate que la ruta a tu config es correcta

const GrupoMateria = sequelize.define('GrupoMateria', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  grupo: {
    type: DataTypes.STRING(10),
    allowNull: false,
    // Se elimina 'unique: true' de aquí. El mismo nombre de grupo (ej. 'SA')
    // puede existir para diferentes materias.
    validate: {
      notEmpty: true,
      len: [1, 10]
    }
  },
  estado: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
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
  docenteId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'docente_id',
    references: {
      model: 'docentes',
      key: 'id'
    }
  },
  horarioId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'horario_id',
    references: {
      model: 'horarios',
      key: 'id'
    }
  },
  cupo: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
}, {
  tableName: 'grupos_materia',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  // Se agrega un índice único compuesto para asegurar que la combinación
  // de 'materia_id' y 'grupo' sea única.
  indexes: [
    {
      unique: true,
      fields: ['materia_id', 'grupo']
    }
  ]
});

module.exports = GrupoMateria;
