import { useState, useEffect, useRef } from 'react';
import { getTaskStatus } from '../api/apiService';

export const useTaskStatus = (queueName, taskId) => {
  const [status, setStatus] = useState('pending');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!queueName || !taskId) return;

    const pollStatus = async () => {
      try {
        const task = await getTaskStatus(queueName, taskId);
        
        // Si la tarea se completó, falló o tuvo un error, detenemos el polling.
        if (task.status === 'completed' || task.status === 'failed' || task.satus === 'error') {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          setStatus(task.status);

          if(task.status === 'completed') {
            setResult(task.result);
          } else {
            setError(task.error || task.result?.message || 'La inscripción fue rechazada.');
          }
        }
      } catch (err) {
        // Si la tarea ya no se encuentra, puede que haya sido procesada y purgada.
        console.error("Polling error:", err);
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        setStatus('error');
        setError('No se pudo verificar el estado de la inscripción.');
      }
    };

    // Iniciar polling inmediatamente y luego cada 2 segundos
    pollStatus();
    intervalRef.current = setInterval(pollStatus, 2000);

    // Limpieza al desmontar el componente
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [queueName, taskId]);

  return { status, result, error };
};