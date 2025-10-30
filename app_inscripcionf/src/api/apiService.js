import axios from 'axios';

// const API_URL = 'http://localhost:3000';

// const API_URL = 'http://inscripcion-db.cho4yig62nii.us-east-2.rds.amazonaws.com:3000';

const API_URL = import.meta.env.MODE === 'production' 
  ? '/api' 
  : (import.meta.env.VITE_API_URL || 'http://localhost:3000');

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

if (import.meta.env.DEV) {
  api.interceptors.request.use(request => {
    console.log('📤 Request:', request.method?.toUpperCase(), request.url);
    return request;
  });

  api.interceptors.response.use(
    response => {
      console.log('✅ Response:', response.status, response.config.url);
      return response;
    },
    error => {
      console.error('❌ Error:', error.message, error.config?.url);
      return Promise.reject(error);
    }
  );
}


export const getMaterias = async () => {
  try {
    const response = await api.get('/materias'); // Traemos hasta 100 materias
    return response.data.data;
  } catch (error) {
    console.error("Error fetching materias:", error);
    throw error.response?.data || { message: "Error de red" };
  }
};

// ✅ MODIFICAR getGruposMateria para que acepte un filtro
export const getGruposMateria = async (materiaId = null) => {
  try {
    // Si se provee un materiaId, se añade como parámetro a la URL
    const url = materiaId
      ? `/grupos-materia?materiaId=${materiaId}`
      : '/grupos-materia';
      
    const response = await api.get(url);
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


/**
 * Obtiene los grupos asignados a un docente específico.
 */
export const getGruposPorDocente = async (docenteId) => {
  try {
    const response = await api.get(`/grupos-materia/docente/${docenteId}`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching grupos por docente:", error);
    throw error.response?.data || { message: "Error de red" };
  }
};


/**
 * Obtiene la lista de estudiantes inscritos/notas de un grupo.
 */
export const getNotasPorGrupo = async (grupoMateriaId) => {
  try {
    const response = await api.get(`/notas/grupo-materia/${grupoMateriaId}`);
    return response.data.data; 
  } catch (error) {
    console.error("Error fetching notas por grupo:", error);
    throw error.response?.data || { message: "Error de red" };
  }
};

/**
 * Crea una nueva nota para un estudiante en un grupo.
 */
export const crearNota = async (data) => {
  // data = { calificacion, observacion, grupoMateriaId, estudianteId }
  try {
    const response = await api.post('/notas', data);
    return response.data.data;
  } catch (error) {
    console.error("Error al crear la nota:", error);
    throw error.response?.data || { message: "Error de red" };
  }
};

/**
 * Actualiza la calificación de una nota existente.
 */
export const actualizarNota = async (notaId, calificacion, observacion) => {
  try {
    const response = await api.patch(`/notas/${notaId}`, { calificacion, observacion });
    return response.data.data;
  } catch (error) {
    console.error("Error al actualizar la nota:", error);
    throw error.response?.data || { message: "Error de red" };
  }
};

// --- FUNCIONES PARA EL HISTÓRICO DEL ESTUDIANTE ---

/**
 * Obtiene el histórico académico completo de un estudiante.
 */
export const getHistoricoEstudiante = async (estudianteId) => {
  try {
    const response = await api.get(`/historico/estudiante/${estudianteId}`);
    return response.data.data; // El controlador devuelve { historico, estadisticas }
  } catch (error) {
    console.error("Error fetching histórico:", error);
    throw error.response?.data || { message: "Error de red" };
  }
};