'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('historicos_academicos', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      estudiante_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'estudiantes',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      materia_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'materias',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      carrera_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'carreras',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      nota: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        validate: {
          min: 0,
          max: 100
        }
      },
      creditos: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      periodo: {
        type: Sequelize.STRING(10),
        allowNull: false
      },
      gestion: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          min: 2000,
          max: 2100
        }
      },
      nivel: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 10
        }
      },
      estado: {
        type: Sequelize.ENUM('APROBADO', 'REPROBADO', 'ABANDONO', 'CURSANDO'),
        allowNull: false,
        defaultValue: 'CURSANDO'
      },
      es_repitencia: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      observaciones: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    // Crear índices
    await queryInterface.addIndex('historicos_academicos', ['estudiante_id']);
    await queryInterface.addIndex('historicos_academicos', ['materia_id']);
    await queryInterface.addIndex('historicos_academicos', ['carrera_id']);
    await queryInterface.addIndex('historicos_academicos', ['periodo']);
    await queryInterface.addIndex('historicos_academicos', ['estado']);
    
    // Índice único para evitar duplicados
    await queryInterface.addIndex('historicos_academicos', 
      ['estudiante_id', 'materia_id', 'periodo'],
      {
        unique: true,
        name: 'historico_estudiante_materia_periodo_unique'
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('historicos_academicos');
  }
};