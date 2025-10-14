'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const allHorarios = [
      { dia: 'Lun-Mie-Vie', hora_inicio: '18:15:00', hora_fin: '19:45:00' },
      { dia: 'Lun-Mie-Vie', hora_inicio: '07:00:00', hora_fin: '08:30:00' },
      { dia: 'Lun-Mie-Vie', hora_inicio: '08:30:00', hora_fin: '10:00:00' },
      { dia: 'Lun-Mie-Vie', hora_inicio: '10:00:00', hora_fin: '11:30:00' },
      { dia: 'Lun-Mie', hora_inicio: '07:00:00', hora_fin: '09:15:00' },
      { dia: 'Mar-Jue', hora_inicio: '18:15:00', hora_fin: '20:30:00' },
      { dia: 'Mar-Jue', hora_inicio: '16:00:00', hora_fin: '18:15:00' },
      { dia: 'Mar-Jue', hora_inicio: '07:00:00', hora_fin: '09:15:00' },
      { dia: 'Mar-Jue', hora_inicio: '15:15:00', hora_fin: '17:30:00' },
      { dia: 'Lun-Mie-Vie', hora_inicio: '20:30:00', hora_fin: '22:00:00' },
      { dia: 'Mie-Vie', hora_inicio: '07:00:00', hora_fin: '09:15:00' },
      { dia: 'Lun-Mie-Vie', hora_inicio: '11:30:00', hora_fin: '13:00:00' },
      { dia: 'Lun-Mie-Vie', hora_inicio: '16:00:00', hora_fin: '17:30:00' },
      { dia: 'Mie-Vie', hora_inicio: '10:45:00', hora_fin: '13:00:00' },
      { dia: 'Lun-Mie-Vie', hora_inicio: '16:45:00', hora_fin: '18:15:00' },
      { dia: 'Mar-Jue', hora_inicio: '09:15:00', hora_fin: '11:30:00' },
      { dia: 'Mar-Jue', hora_inicio: '19:00:00', hora_fin: '21:15:00' },
      { dia: 'Mar-Jue', hora_inicio: '16:00:00', hora_fin: '17:30:00' },
      { dia: 'Mar-Jue', hora_inicio: '20:30:00', hora_fin: '22:45:00' },
    ];
    
    const uniqueHorarios = [...new Map(allHorarios.map(item => [`${item.dia}|${item.hora_inicio}|${item.hora_fin}`, item])).values()];
    
    const horariosParaInsertar = uniqueHorarios.map(h => ({
      ...h,
      created_at: new Date(),
      updated_at: new Date()
    }));

    await queryInterface.bulkInsert('horarios', horariosParaInsertar, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('horarios', null, {});
  }
};