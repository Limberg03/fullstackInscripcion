// hooks/useInscripcion.js
import { useState, useEffect, useRef } from 'react';
import inscripcionService from '../services/inscripcionService';

export const useInscripcion = (estudianteId) => {
  const [inscripciones, setInscripciones] = useState([]);
  const [pendingTasks, setPendingTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const pollingInterval = useRef(null);

  // Solicitar inscripción
  const requestSeat = async (grupoMateriaId, gestion) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await inscripcionService.requestSeat(
        estudianteId,
        grupoMateriaId,
        gestion
      );

      // Si se rechazó inmediatamente
      if (result.status === 'rejected') {
        return result;
      }

      // Si se encoló correctamente
      const newTask = {
        taskId: result.taskId,
        queueName: result.queueName,
        grupoMateriaId,
        status: 'pending',
        timestamp: new Date().toISOString()
      };

      setPendingTasks(prev => [...prev, newTask]);
      return result;

    } catch (err) {
      setError(err.message || 'Error al solicitar inscripción');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Polling automático de tareas pendientes
  const startPolling = () => {
    if (pollingInterval.current) return;

    pollingInterval.current = setInterval(async () => {
      if (pendingTasks.length === 0) return;

      try {
        const results = await inscripcionService.pollTaskStatus(pendingTasks);
        
        const updatedTasks = pendingTasks.map((task, index) => {
          const result = results[index];
          
          if (result.error) {
            return { ...task, status: 'error', error: result.error };
          }

          const taskData = result.task;
          
          // Si la tarea completó o falló, actualizar estado
          if (taskData?.status === 'completed') {
            return {
              ...task,
              status: taskData.result?.status === 'confirmed' ? 'confirmed' : 'rejected',
              result: taskData.result
            };
          } else if (taskData?.status === 'failed' || taskData?.status === 'error') {
            return {
              ...task,
              status: 'rejected',
              error: taskData.error || 'Error al procesar'
            };
          }

          return task;
        });

        // Remover tareas completadas del polling
        const stillPending = updatedTasks.filter(t => t.status === 'pending');
        const completed = updatedTasks.filter(t => t.status !== 'pending');

        setPendingTasks(stillPending);

        // Agregar completadas a inscripciones
        if (completed.length > 0) {
          setInscripciones(prev => [...prev, ...completed]);
        }

      } catch (err) {
        console.error('Error en polling:', err);
      }
    }, 2000); // Cada 2 segundos
  };

  // Detener polling
  const stopPolling = () => {
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
      pollingInterval.current = null;
    }
  };

  // Cargar inscripciones existentes
  const loadInscripciones = async () => {
    setLoading(true);
    try {
      const result = await inscripcionService.getByEstudiante(estudianteId);
      setInscripciones(result.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Iniciar polling cuando hay tareas pendientes
  useEffect(() => {
    if (pendingTasks.length > 0) {
      startPolling();
    } else {
      stopPolling();
    }

    return () => stopPolling();
  }, [pendingTasks.length]);

  // Cargar inscripciones al montar
  useEffect(() => {
    if (estudianteId) {
      loadInscripciones();
    }
  }, [estudianteId]);

  return {
    inscripciones,
    pendingTasks,
    loading,
    error,
    requestSeat,
    loadInscripciones
  };
};