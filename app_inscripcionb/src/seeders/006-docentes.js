'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('docentes', [
      { nombre: 'FLORES FLORES MARCOS OSCAR', telefono: '70000001', created_at: new Date(), updated_at: new Date() },
      { nombre: 'CABELLO MERIDA JUAN RUBEN', telefono: '70000002', created_at: new Date(), updated_at: new Date() },
      { nombre: 'CORTEZ UZEDA JULIO MARTIN', telefono: '70000003', created_at: new Date(), updated_at: new Date() },
      { nombre: 'GUTIERREZ BRUNO KATIME ESTHER', telefono: '70000004', created_at: new Date(), updated_at: new Date() },
      { nombre: 'GIANELLA PEREDO EDUARDO', telefono: '70000005', created_at: new Date(), updated_at: new Date() },
      { nombre: 'AVENDALO GONZALES EUDAL', telefono: '70000006', created_at: new Date(), updated_at: new Date() },
      { nombre: 'CALIZAYA AJHUACHO MAGNO EDWI', telefono: '70000007', created_at: new Date(), updated_at: new Date() },
      { nombre: 'MIRANDA CARRASCO CARLOS', telefono: '70000008', created_at: new Date(), updated_at: new Date() },
      { nombre: 'VARGAS CASTILLO CIRO EDGAR', telefono: '70000009', created_at: new Date(), updated_at: new Date() },
      { nombre: 'MONRROY DIPP VICTOR FERNANDO', telefono: '70000011', created_at: new Date(), updated_at: new Date() },
      { nombre: 'HINOJOSA SAAVEDRA JOSE SAID', telefono: '70000012', created_at: new Date(), updated_at: new Date() },
      { nombre: 'PEINADO PEREIRA JUAN CARLOS', telefono: '70000013', created_at: new Date(), updated_at: new Date() },
      { nombre: 'LOPEZ WINNIPEG MARIO MILTON', telefono: '70000014', created_at: new Date(), updated_at: new Date() },
      { nombre: 'LAZO ARTEAGA CARLOS ROBERTO', telefono: '70000021', created_at: new Date(), updated_at: new Date() },
      { nombre: 'MORALES MENDEZ MAGALY', telefono: '70000022', created_at: new Date(), updated_at: new Date() },
      { nombre: 'VEIZAGA GONZALES JOSUE OBED', telefono: '70000015', created_at: new Date(), updated_at: new Date() },
      { nombre: 'VACA PINTO CESPEDES ROBERTO C', telefono: '70000023', created_at: new Date(), updated_at: new Date() },
      { nombre: 'BARROSO VIRUEZ GINO', telefono: '70000016', created_at: new Date(), updated_at: new Date() },
      { nombre: 'OROSCO GOMEZ RUBEN', telefono: '70000024', created_at: new Date(), updated_at: new Date() },
      { nombre: 'PEREZ FERREIRA UBALDO', telefono: '70000017', created_at: new Date(), updated_at: new Date() },
      { nombre: 'VARGAS PELA LEONARDO', telefono: '70000018', created_at: new Date(), updated_at: new Date() },
      { nombre: 'TERRAZAS SOTO RICARDO', telefono: '70000019', created_at: new Date(), updated_at: new Date() },
      { nombre: 'VILLAGOMEZ MELGAR JOSE JUNIOR', telefono: '70000025', created_at: new Date(), updated_at: new Date() },
      { nombre: 'CARVAJAL CORDERO MARCIO', telefono: '70000020', created_at: new Date(), updated_at: new Date() },
      { nombre: 'PEREZ DELGADILLO SHIRLEY EULAL', telefono: '70000026', created_at: new Date(), updated_at: new Date() },
      { nombre: 'GRAGEDA ESCUDERO MARIO WILSO', telefono: '70000027', created_at: new Date(), updated_at: new Date() },
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('docentes', null, {});
  }
};