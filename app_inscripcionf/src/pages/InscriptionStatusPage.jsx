import React, { useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { useTaskStatus } from '../hooks/useTaskStatus';
import { getTaskStatus } from '../api/apiService';

const InscriptionStatusPage = () => {
  const { queueName, taskId } = useParams();
  const location = useLocation();
  const { materiaId, grupo, materiaNombre } = location.state || {};

  const [hasStartedChecking, setHasStartedChecking] = useState(false);
  
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
  // ✅ FUNCIÓN PARA EXTRAER MENSAJE DE ERROR (CON DEBUG)
  // ==========================================================
  const extractErrorMessage = (taskData, grupo) => {
    const defaultMessage = `No se pudo completar la inscripción: el grupo "${grupo || 'seleccionado'}" no tiene cupos disponibles.`;
    
    // Determinamos de dónde viene el error
    let errorData;
    if (hasStartedChecking && currentError) {
      errorData = currentError;
      console.log('🔍 [DEBUG] errorData viene de currentError:', errorData);
      console.log('🔍 [DEBUG] tipo:', typeof errorData);
    } else if (initialTaskData?.error) {
      errorData = initialTaskData.error;
      console.log('🔍 [DEBUG] errorData viene de initialTaskData.error:', errorData);
      console.log('🔍 [DEBUG] tipo:', typeof errorData);
    } else {
      console.log('🔍 [DEBUG] No hay errorData, retornando defaultMessage');
      return defaultMessage;
    }
    
    const isScheduleConflictText = (text) => {
      if (!text || typeof text !== 'string') return false;
      const lower = text.toLowerCase();
      const hasConflict = lower.includes('choque') && 
                         (lower.includes('horario') || lower.includes('inscrito') || lower.includes('detectado'));
      console.log(`🔍 [DEBUG] isScheduleConflictText("${text}"): ${hasConflict}`);
      return hasConflict;
    };
    
    if (typeof errorData === 'string') {
      console.log('🔍 [DEBUG] errorData es string:', errorData);
      
      if (errorData.trim() === '') {
        console.log('🔍 [DEBUG] errorData vacío, retornando defaultMessage');
        return defaultMessage;
      }
      
      if (isScheduleConflictText(errorData)) {
        console.log('🔍 [DEBUG] ¡Choque detectado en string! Retornando:', errorData);
        return errorData;
      }
      
      // Si el error es el mensaje genérico del backend
      if (errorData === 'La inscripción fue rechazada.') {
        console.log('🔍 [DEBUG] Mensaje genérico detectado, retornando defaultMessage');
        return defaultMessage;
      }
      
      // Intentar decodificar como JSON
      try {
        const errorJson = JSON.parse(errorData);
        console.log('🔍 [DEBUG] errorData parseado como JSON:', errorJson);
        
        if (errorJson && errorJson.message) {
          console.log('🔍 [DEBUG] errorJson.message:', errorJson.message);
          if (isScheduleConflictText(errorJson.message)) {
            console.log('🔍 [DEBUG] ¡Choque detectado en JSON.message!');
            return errorJson.message;
          }
          return errorJson.message;
        }
        
        if (errorJson && typeof errorJson === 'object' && Object.keys(errorJson).length > 0) {
          const firstValue = Object.values(errorJson)[0];
          console.log('🔍 [DEBUG] Primer valor del JSON:', firstValue);
          if (typeof firstValue === 'string' && isScheduleConflictText(firstValue)) {
            console.log('🔍 [DEBUG] ¡Choque detectado en primer valor JSON!');
            return firstValue;
          }
          return firstValue;
        }
        
        console.log('🔍 [DEBUG] JSON sin estructura reconocida, retornando string original');
        return errorData;
      } catch (e) {
        console.log('🔍 [DEBUG] No es JSON válido, retornando string original');
        return errorData;
      }
    }
    
    // Caso 2: Si 'error' ya es un Object
    if (typeof errorData === 'object' && errorData !== null) {
      console.log('🔍 [DEBUG] errorData es objeto:', errorData);
      
      if (errorData.message) {
        console.log('🔍 [DEBUG] errorData.message:', errorData.message);
        if (isScheduleConflictText(errorData.message)) {
          console.log('🔍 [DEBUG] ¡Choque detectado en object.message!');
          return errorData.message;
        }
        return errorData.message;
      }
      
      // Buscar en todas las propiedades
      const values = Object.values(errorData);
      console.log('🔍 [DEBUG] Valores del objeto:', values);
      for (const value of values) {
        if (typeof value === 'string' && isScheduleConflictText(value)) {
          console.log('🔍 [DEBUG] ¡Choque detectado en valores del objeto!');
          return value;
        }
      }
      
      if (values.length > 0) {
        console.log('🔍 [DEBUG] Retornando primer valor:', values[0]);
        return values[0];
      }
    }
    
    console.log('🔍 [DEBUG] Ningún caso coincidió, retornando defaultMessage');
    return defaultMessage;
  };

  // ==========================================================
  // RENDERIZADO DEL CONTENIDO SEGÚN EL ESTADO
  // ==========================================================
  const renderStatusContent = () => {
    const currentStatus = hasStartedChecking ? status : initialTaskData?.status;
    
    const backUrl = materiaId ? `/materia/${materiaId}` : '/';
    const backButtonTextCompleted = materiaId ? 'Volver a los Grupos' : 'Volver a las Materias';
    const backButtonTextError = materiaId ? 'Volver e Intentar de Nuevo' : 'Volver';

    switch (currentStatus) {
      case 'pending':
        return (
          <>
            <div className="spinner"></div>
            <h2 style={{ color: '#f0ad4e' }}>Procesando Inscripción...</h2>
            {materiaNombre && grupo && (
              <p className="subtitle">
                Solicitud para <strong>{materiaNombre}</strong> (Grupo: {grupo}) en cola.
              </p>
            )}
            {!materiaNombre && (
              <p className="subtitle">Tu solicitud está en la cola y será procesada en breve.</p>
            )}
          </>
        );
      
      case 'completed':
        return (
          <>
            <div className="icon success">✓</div>
            <h2 style={{ color: '#5cb85c' }}>Inscrito Exitosamente</h2>
            {materiaNombre && grupo && (
              <p className="subtitle">
                Te has inscrito correctamente en <strong>{materiaNombre}</strong> (Grupo: {grupo})
              </p>
            )}
            <Link to={backUrl} className="button">{backButtonTextCompleted}</Link>
          </>
        );
      
      case 'failed':
      case 'error':
        let taskData = hasStartedChecking ? { error: currentError } : (initialTaskData || {});
        const errorMessage = extractErrorMessage(taskData, grupo);
        
        console.log('🔍 [DEBUG] errorMessage FINAL:', errorMessage);
        
        // ✅ DETECTAR SI ES UN ERROR DE CHOQUE DE HORARIO
        const isScheduleConflict = errorMessage && (
          errorMessage.toLowerCase().includes('choque') ||
          (errorMessage.toLowerCase().includes('horario') && errorMessage.toLowerCase().includes('inscrito'))
        );
        
        console.log('🔍 [DEBUG] isScheduleConflict:', isScheduleConflict);
        
        return (
          <>
            <div className="icon error" style={{ 
              backgroundColor: isScheduleConflict ? '#ff9800' : '#d9534f' 
            }}>
              {isScheduleConflict ? '⚠' : '✗'}
            </div>
            <h2 style={{ color: isScheduleConflict ? '#ff9800' : '#d9534f' }}>
              {isScheduleConflict ? 'Choque de Horario' : 'Inscripción Rechazada'}
            </h2>
            <p className="subtitle" style={{ 
              color: isScheduleConflict ? '#e65100' : '#d9534f',
              fontWeight: '500',
              fontSize: '1.05em'
            }}>
              {errorMessage}
            </p>
            <Link to={backUrl} className="button">{backButtonTextError}</Link>
          </>
        );
      
      default:
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

const pageStyle = { 
  display: 'flex', 
  justifyContent: 'center', 
  alignItems: 'center', 
  minHeight: '80vh', 
  fontFamily: 'sans-serif' 
};

export default InscriptionStatusPage;