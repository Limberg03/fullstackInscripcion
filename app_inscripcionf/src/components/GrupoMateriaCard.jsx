import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { requestSeat } from '../api/apiService';
import { useTaskStatus } from '../hooks/useTaskStatus';
import InscriptionStatus from './InscriptionStatus';

const cardStyle = {
  border: '1px solid #ccc',
  borderRadius: '8px',
  padding: '16px',
  margin: '10px',
  width: '300px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
};



const buttonStates = {
  idle: { text: 'Inscribirse', disabled: false },
  sending: { text: 'Enviando...', disabled: true },
  pending: { text: 'Procesando...', disabled: true },
  confirmed: { text: 'Inscrito', disabled: true },
  rejected: { text: 'Rechazado', disabled: true },
};

const GrupoMateriaCard = ({ grupo, estudianteId, isEnrolled  }) => {
  const [taskInfo, setTaskInfo] = useState({ queueName: null, taskId: null });
  const [isSending, setIsSending] = useState(false);

  // El hook se activa solo cuando taskInfo tiene datos
  const { status: taskStatus, error: taskError } = useTaskStatus(taskInfo.queueName, taskInfo.taskId);
  
  
  // let displayStatus = 'idle';
let displayStatus = isEnrolled ? 'confirmed' : 'idle'; 

  if (isSending) displayStatus = 'sending';
  else if (taskInfo.taskId) {
     if (taskStatus === 'completed') displayStatus = 'confirmed';
     else if (taskStatus === 'failed' || taskStatus === 'error') displayStatus = 'rejected';
     else displayStatus = 'pending';
  }


  const handleInscribir = async () => {
    setIsSending(true);
    try {
      const result = await requestSeat({
        estudianteId: estudianteId, // Este ID debería venir de un contexto de autenticación
        grupoMateriaId: grupo.id,
        gestion: new Date().getFullYear(),
      });
      
      toast.info('Tu solicitud de inscripción está siendo procesada.');
      setTaskInfo({ queueName: result.queueName, taskId: result.taskId });

    } catch (error) {
      toast.error(error.message || 'Ocurrió un error al inscribirte.');
    } finally {
      setIsSending(false);
    }
  };

  const currentButtonState = buttonStates[displayStatus] || buttonStates.idle;
  
   return (
     <div style={cardStyle}>
      <div>
        <h3>{grupo.materia.nombre}</h3>
        <p><strong>Sigla:</strong> {grupo.materia.sigla} | <strong>Grupo:</strong> {grupo.grupo}</p>
        <p><strong>Docente:</strong> {grupo.docente.nombre}</p>
        <p><strong>Cupos disponibles:</strong> {grupo.cupo}</p>
      </div>
      <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <InscriptionStatus status={displayStatus} />
        <button 
          onClick={handleInscribir} 
          disabled={currentButtonState.disabled}
          style={{ 
            padding: '8px 12px', 
            cursor: currentButtonState.disabled ? 'not-allowed' : 'pointer',
            opacity: currentButtonState.disabled ? 0.6 : 1,
          }}
        >
          {currentButtonState.text}
        </button>
      </div>
      {displayStatus === 'rejected' && <p style={{color: 'red', marginTop: '8px'}}>{taskError}</p>}
    </div>
  );
};

export default GrupoMateriaCard;