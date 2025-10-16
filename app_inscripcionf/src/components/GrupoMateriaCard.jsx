import { useNavigate } from 'react-router-dom';
import React, { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { requestSeat } from '../api/apiService';
import { useTaskStatus } from '../hooks/useTaskStatus';
import './GrupoMateriaCard.css';

const GrupoMateriaCard = ({ grupo, studentId, isEnrolled, pendingTask, materiaId  }) => {
    const navigate = useNavigate();
  const [taskInfo, setTaskInfo] = useState(
    pendingTask ? { queueName: pendingTask.queueName, taskId: pendingTask.taskId } : { queueName: null, taskId: null }
  );
  const [isSending, setIsSending] = useState(false);

  const handleTaskSettled = useCallback(() => {
    const pending = JSON.parse(localStorage.getItem('pendingInscriptions') || '{}');
    if (pending[grupo.id]) {
      delete pending[grupo.id];
      localStorage.setItem('pendingInscriptions', JSON.stringify(pending));
    }
  }, [grupo.id]);

  const { status: taskStatus, error: taskError } = useTaskStatus(
    taskInfo.queueName, taskInfo.taskId, handleTaskSettled 
  );
  
  let initialStatus;
  if (isEnrolled) {
    initialStatus = 'confirmed';
  } else if (grupo.cupo <= 0) {
    initialStatus = 'full'; 
  } else {
    initialStatus = 'idle'; 
  }

  let displayStatus = initialStatus;

  if (isSending) {
    displayStatus = 'sending';
  } else if (taskInfo.taskId) {
    if (taskStatus === 'completed') displayStatus = 'confirmed';
    else if (taskStatus === 'failed' || taskStatus === 'error') displayStatus = 'rejected';
    else displayStatus = 'pending';
  }

  const handleInscribir = async () => {
  setIsSending(true); // 1. Activa el estado de carga
  try {
    const result = await requestSeat({
      estudianteId: studentId, 
      grupoMateriaId: grupo.id,
      gestion: new Date().getFullYear(),
    });

    // 2. Guarda la tarea pendiente para la persistencia
    const pending = JSON.parse(localStorage.getItem('pendingInscriptions') || '{}');
    pending[grupo.id] = { taskId: result.taskId, queueName: result.queueName };
    localStorage.setItem('pendingInscriptions', JSON.stringify(pending));
    
    // 3. Actualiza el estado local de la tarjeta (útil si el usuario vuelve atrás)
    setTaskInfo({ queueName: result.queueName, taskId: result.taskId });

    // Muestra una notificación de éxito inicial
    toast.info('Solicitud en cola...', { autoClose: 2000 });

    navigate(`/status/${result.queueName}/${result.taskId}`, {
        state: { materiaId: materiaId } 
      });

  } catch (error) {
    // 5. Si algo falla, muestra una notificación de error
    toast.error(error.message || 'Ocurrió un error al inscribirte.', { autoClose: 5000 });
  
  } finally {
    // ✅ ESTE BLOQUE SE EJECUTA SIEMPRE, tanto en éxito como en error.
    // Asegura que el estado de carga se desactive, dejando el componente limpio.
    setIsSending(false); 
  } 
};

  const renderStatus = () => {
    switch (displayStatus) {
      case 'sending':
        return (
          <div className="status-loading">
            <div className="spinner" />
          </div>
        );
      case 'pending':
        return (
          <div className="status-badge status-pending">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            <span>Pendiente</span>
          </div>
        );
      case 'confirmed':
        return (
          <div className="status-badge status-confirmed">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <span>Inscrito</span>
          </div>
        );
      case 'rejected':
        return (
          <div className="status-rejected-wrapper">
            <div className="status-badge status-rejected">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              <span>Rechazado</span>
            </div>
            {taskError && <p className="error-message">{taskError}</p>}
          </div>
        );
      case 'idle':
      default:
        return (
          <button onClick={handleInscribir} className="btn-inscribir">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="16"/>
              <line x1="8" y1="12" x2="16" y2="12"/>
            </svg>
            Inscribirse
          </button>
        );
    }
  };

  return (
    <div className="grupo-card">
      <div className="card-content">
        {/* Header */}
        <div className="card-header">
          <div className="icon-container">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
          </div>
          <div className="header-text">
            <h3 className="card-title">{grupo.materia.nombre}</h3>
            <p className="card-subtitle">{grupo.materia.sigla} • Grupo {grupo.grupo}</p>
          </div>
        </div>

        {/* Divider */}
        <div className="divider"></div>

        {/* Info */}
        <div className="card-info">
          <div className="info-row">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <span>{grupo.docente.nombre}</span>
          </div>
          
          <div className="info-row">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <span>{grupo.horario.dia}</span>
          </div>
          
          <div className="info-row">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            <span>{grupo.horario.horaInicio} - {grupo.horario.horaFin}</span>
          </div>
          
          <div className="info-row">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <span>Cupos: <strong className={grupo.cupo > 0 ? 'text-success' : 'text-danger'}>{grupo.cupo}</strong></span>
          </div>
        </div>

        {/* Action */}
        {renderStatus()}
      </div>
    </div>
  );
};

export default GrupoMateriaCard;