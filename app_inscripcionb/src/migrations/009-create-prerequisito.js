'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('prerequisitos', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      materia_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'materias',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      requiere_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'materias',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      // ============ CAMPOS NUEVOS ============
      nota_minima: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 51,
        validate: {
          min: 0,
          max: 100
        }
      },
      es_obligatorio: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      // =======================================
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
    await queryInterface.addIndex('prerequisitos', ['materia_id']);
    await queryInterface.addIndex('prerequisitos', ['requiere_id']);
    await queryInterface.addIndex('prerequisitos', ['materia_id', 'requiere_id'], {
      unique: true,
      name: 'prerequisitos_unique_constraint'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('prerequisitos');
  }
};