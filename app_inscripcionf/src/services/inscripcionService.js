// services/inscripcionService.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const inscripcionService = {
  // Solicitar inscripción (encola la petición)
  requestSeat: async (estudianteId, grupoMateriaId, gestion) => {
    try {
      const response = await axios.post(`${API_URL}/inscripciones/request-seat`, {
        estudianteId,
        grupoMateriaId,
        gestion
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: error.message };
    }
  },

  // Obtener estado de una tarea
  getTaskStatus: async (queueName, taskId) => {
    try {
      const response = await axios.get(`${API_URL}/queue/${queueName}/tasks/${taskId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: error.message };
    }
  },

  // Obtener todas las inscripciones de un estudiante
  getByEstudiante: async (estudianteId) => {
    try {
      const response = await axios.get(`${API_URL}/inscripciones/estudiante/${estudianteId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: error.message };
    }
  },

  // Obtener grupos materia disponibles
  getGruposMateria: async () => {
    try {
      const response = await axios.get(`${API_URL}/grupos-materia`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: error.message };
    }
  },

  // Polling: Verificar estado de múltiples tareas
  pollTaskStatus: async (tasks) => {
    try {
      const promises = tasks.map(task => 
        inscripcionService.getTaskStatus(task.queueName, task.taskId)
          .catch(err => ({ taskId: task.taskId, error: err.message }))
      );
      return await Promise.all(promises);
    } catch (error) {
      throw error;
    }
  }
};

export default inscripcionService;