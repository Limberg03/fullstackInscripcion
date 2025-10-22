import { useState, useEffect, useRef } from 'react';
import { getTaskStatus } from '../api/apiService';

export const useTaskStatus = (queueName, taskId, onSettled) => {
  const [status, setStatus] = useState('pending');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!queueName || !taskId) return;

    let cont = 0;
    const maxPolling = 10;

    const pollStatus = async () => {
      if (cont >= maxPolling) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        setStatus('error');
        setError('La operación está tardando más de lo esperado. Intenta de nuevo más tarde.');
        if (onSettled) {
          onSettled(taskId);
        }
        return; 
      }
      cont++; 

      try {
        const task = await getTaskStatus(queueName, taskId);
        
        // 🔍 DEBUG: Ver qué llega del backend
        console.log('🔍 [HOOK DEBUG] task completo:', task);
        console.log('🔍 [HOOK DEBUG] task.status:', task.status);
        console.log('🔍 [HOOK DEBUG] task.error:', task.error);
        console.log('🔍 [HOOK DEBUG] task.result:', task.result);
        console.log('🔍 [HOOK DEBUG] TODAS LAS PROPIEDADES:', Object.keys(task));
        console.log('🔍 [HOOK DEBUG] task stringificado:', JSON.stringify(task, null, 2));
        
        if (task.status === 'completed' || task.status === 'failed' || task.status === 'error') {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          setStatus(task.status);

          if(task.status === 'completed') {
            setResult(task.result);
          } else {
            // ✅ EXTRACCIÓN MEJORADA DEL ERROR
            let errorMessage = 'La inscripción fue rechazada.';
            
            // Intentar extraer el error de diferentes ubicaciones
            if (task.error) {
              if (typeof task.error === 'string') {
                errorMessage = task.error;
              } else if (typeof task.error === 'object' && task.error.message) {
                errorMessage = task.error.message;
              } else if (typeof task.error === 'object') {
                errorMessage = JSON.stringify(task.error);
              }
            } else if (task.result?.message) {
              errorMessage = task.result.message;
            } else if (task.result?.error) {
              if (typeof task.result.error === 'string') {
                errorMessage = task.result.error;
              } else if (typeof task.result.error === 'object' && task.result.error.message) {
                errorMessage = task.result.error.message;
              }
            }
            
            console.log('🔍 [HOOK DEBUG] errorMessage extraído:', errorMessage);
            setError(errorMessage);
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
    intervalRef.current = setInterval(pollStatus, 3000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [queueName, taskId, onSettled]);

  return { status, result, error };
};