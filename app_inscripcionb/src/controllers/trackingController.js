const QueueService = require("../services/QueueService");


let queueServiceInstance = null;

const getQueueService = () => {
  if (!queueServiceInstance) {
    queueServiceInstance = new QueueService();
  }
  return queueServiceInstance;
};


const trackingController = {

  hardReset: async (req, res) => {
    console.log(' RECIBIDA SOLICITUD DE HARD RESET ');
    try {
      // Obtenemos la instancia única e inicializada del servicio

      
          const service = getQueueService();
      await service.initialize();

      if (!service) {
        return res.status(503).json({ 
          success: false, 
          message: 'El QueueService no está disponible o no ha sido inicializado.' 
        });
      }
      


      const result = await service.deleteAllQueuesAndWorkers();
      
      res.status(200).json({
        success: true,
        message: 'Sistema de Colas y Workers reseteado exitosamente en Redis.',
        details: result,
      });

    } catch (error) {
      console.error('Error durante el hard reset:', error);
      res.status(500).json({
        success: false,
        message: 'Error al resetear el sistema de colas.',
        error: error.message,
      });
    }
  }
};

module.exports = trackingController;