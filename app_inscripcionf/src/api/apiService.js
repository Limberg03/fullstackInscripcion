import axios from 'axios';

const API_URL = 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getGruposMateria = async () => {
  try {
    const response = await api.get('/grupos-materia'); 
    return response.data.data; 
  } catch (error) {
    console.error("Error fetching grupos de materia:", error);
    throw error.response?.data || { message: "Error de red" };
  }
};

/**
 * Envía una solicitud de inscripción para un estudiante.
 * @param {object} data - { estudianteId, grupoMateriaId, gestion }
 */
export const requestSeat = async (data) => {
  try {
    // La API espera un 202 (Accepted) si la tarea se encola
    const response = await api.post('/inscripciones/request', data);
    return response.data;
  } catch (error) {
    console.error("Error requesting seat:", error);
    throw error.response?.data || { message: "Error de red" };
  }
};

/**
 * Consulta el estado de una tarea en la cola.
 * @param {string} queueName - El nombre de la cola
 * @param {string} taskId - El ID de la tarea
 */
export const getTaskStatus = async (queueName, taskId) => {
  try {

// router.get('/:queueName/tasks/:taskId',

    const response = await api.get(`/queue/${queueName}/tasks/${taskId}`);
    return response.data.task; // Devuelve el objeto de la tarea
  } catch (error) {
    console.error("Error fetching task status:", error);
    throw error.response?.data || { message: "Error de red" };
  }
};


/**
 * Obtiene todas las inscripciones de un estudiante específico.
 * @param {number} estudianteId - El ID del estudiante
 */
export const getInscripcionesByEstudiante = async (estudianteId) => {
  if (!estudianteId) return []; 
  try {
    const response = await api.get(`/inscripciones/estudiante/${estudianteId}`);
    
    return response.data.data; 
  } catch (error) {
    console.error("Error fetching inscripciones:", error);
    return [];
  }
};