import { useState, useEffect, useRef } from 'react';
import { getTaskStatus } from '../api/apiService';

export const useTaskStatus = (queueName, taskId, onSettled) => {
  const [status, setStatus] = useState('pending');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!queueName || !taskId) return;

    const pollStatus = async () => {
      try {
        const task = await getTaskStatus(queueName, taskId);
        
        if (task.status === 'completed' || task.status === 'failed' || task.status === 'error') {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          setStatus(task.status);

          if(task.status === 'completed') {
            setResult(task.result);
          } else {
            setError(task.error || task.result?.message || 'La inscripción fue rechazada.');
          }

           if (onSettled) {
            onSettled(taskId);
          }
        }
      } catch (err) {
        console.error("Polling error:", err);
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        setStatus('error');
        setError('No se pudo verificar el estado de la inscripción.');

          if (onSettled) {
          onSettled(taskId);
        }
      }
    };

    pollStatus();
    intervalRef.current = setInterval(pollStatus, 2000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [queueName, taskId, onSettled]);

  return { status, result, error };
};