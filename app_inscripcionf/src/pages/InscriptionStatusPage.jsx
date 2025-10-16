import React, { useState } from 'react';
// ✅ Importar 'useLocation' para leer el estado de la navegación
import { useParams, Link, useLocation } from 'react-router-dom';
import { useTaskStatus } from '../hooks/useTaskStatus';
import { getTaskStatus } from '../api/apiService';

const InscriptionStatusPage = () => {
  const { queueName, taskId } = useParams();
  // ✅ Usamos el hook para obtener la información de la navegación
  const location = useLocation();
  // Leemos el materiaId del estado, que pasamos desde la tarjeta
  const materiaId = location.state?.materiaId;

  const [hasStartedChecking, setHasStartedChecking] = useState(false);
  
  // La lógica del hook de sondeo y la consulta inicial
  const { status, error: currentError } = useTaskStatus(
    hasStartedChecking ? queueName : null,
    hasStartedChecking ? taskId : null
  );

  const [initialTaskData, setInitialTaskData] = useState(null);

  const handleCheckStatus = async () => {
    try {
      const task = await getTaskStatus(queueName, taskId);
      setInitialTaskData(task);
      setHasStartedChecking(true);
    } catch (err) {
      setInitialTaskData({ status: 'error', error: 'No se pudo encontrar la tarea.' });
      setHasStartedChecking(true);
    }
  };

  // ==========================================================
  // FUNCIÓN PARA EXTRAER EL MENSAJE DE ERROR (igual que en Flutter)
  // ==========================================================
  const extractErrorMessage = () => {
    const defaultMessage = 'No se pudo completar la inscripción: grupo sin cupos disponibles';
    
    // Determinamos de dónde viene el error
    let errorData;
    if (hasStartedChecking && currentError) {
      errorData = currentError;
    } else if (initialTaskData?.error) {
      errorData = initialTaskData.error;
    } else {
      return defaultMessage;
    }
    
    // Caso 1: Si 'error' es un String
    if (typeof errorData === 'string') {
      if (errorData.trim() === '') return defaultMessage;
      
      // Si el error es el mensaje genérico del backend, mostramos nuestro mensaje personalizado
      if (errorData === 'La inscripción fue rechazada.') {
        return defaultMessage;
      }
      
      // Intentamos decodificar como JSON
      try {
        const errorJson = JSON.parse(errorData);
        
        // Si tiene el campo 'message', lo usamos
        if (errorJson && errorJson.message) {
          return errorJson.message;
        }
        
        // Si es un objeto con otros campos, intentamos mostrar algo útil
        if (errorJson && typeof errorJson === 'object' && Object.keys(errorJson).length > 0) {
          return Object.values(errorJson)[0];
        }
        
        return errorData; // Si no pudimos extraer nada mejor, retornamos el string original
      } catch (e) {
        // No es JSON, retornamos el string directamente
        return errorData;
      }
    }
    
    // Caso 2: Si 'error' ya es un Object
    if (typeof errorData === 'object') {
      if (errorData.message) {
        return errorData.message;
      }
      if (Object.keys(errorData).length > 0) {
        return Object.values(errorData)[0];
      }
    }
    
    return defaultMessage;
  };

  // ==========================================================
  // AQUÍ ESTÁ LA FUNCIÓN COMPLETA QUE SOLICITASTE
  // ==========================================================
  const renderStatusContent = () => {
    // Determinamos el estado y error actual a mostrar
    const currentStatus = hasStartedChecking ? status : initialTaskData?.status;
    
    // ✅ Construimos la URL de "Volver" dinámicamente
    // Si tenemos un materiaId, volvemos a la lista de grupos. Si no, a la lista de materias.
    const backUrl = materiaId ? `/materia/${materiaId}` : '/';
    const backButtonTextCompleted = materiaId ? 'Volver a los Grupos' : 'Volver a las Materias';
    const backButtonTextError = materiaId ? 'Volver e Intentar de Nuevo' : 'Volver';

    switch (currentStatus) {
      case 'pending':
        return (
          <>
            <div className="spinner"></div>
            <h2 style={{ color: '#f0ad4e' }}>Procesando...</h2>
            <p className="subtitle">Tu solicitud está en la cola y será procesada en breve.</p>
          </>
        );
      case 'completed':
        return (
          <>
            <div className="icon success">✓</div>
            <h2 style={{ color: '#5cb85c' }}>Inscrito Exitosamente</h2>
            {/* ✅ Usamos la URL y el texto dinámicos */}
            <Link to={backUrl} className="button">{backButtonTextCompleted}</Link>
          </>
        );
      case 'failed':
      case 'error':
        // ✅ Construimos el objeto taskData correctamente
        let taskData;
        if (hasStartedChecking) {
          // Si ya empezó el checking, usamos currentError
          taskData = { error: currentError };
        } else {
          // Si no, usamos initialTaskData
          taskData = initialTaskData || {};
        }
        
        const errorMessage = extractErrorMessage(taskData);
        
        return (
          <>
            <div className="icon error">✗</div>
            <h2 style={{ color: '#d9534f' }}>Rechazado</h2>
            <p className="subtitle">{errorMessage}</p>
            {/* ✅ Usamos la URL y el texto dinámicos */}
            <Link to={backUrl} className="button">{backButtonTextError}</Link>
          </>
        );
      default:
        // Esta es la vista inicial
        return (
          <>
            <div className="icon initial">👆</div>
            <h2>Proceso de Inscripción Iniciado</h2>
            <p className="subtitle">Tu solicitud ha sido enviada al sistema.</p>
            <button className="button" onClick={handleCheckStatus}>
              Consulta tu estado de inscripción &rarr;
            </button>
          </>
        );
    }
  };

  return (
    <div style={pageStyle}>
      <div className="status-card">
        {renderStatusContent()}
      </div>
    </div>
  );
};

const pageStyle = { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', fontFamily: 'sans-serif' };

export default InscriptionStatusPage;