import React from 'react';

const statusStyles = {
  pending: { backgroundColor: '#f0ad4e', color: 'white' },
  confirmed: { backgroundColor: '#5cb85c', color: 'white' },
  rejected: { backgroundColor: '#d9534f', color: 'white' },
  idle: { backgroundColor: '#777', color: 'white' },
  sending: { backgroundColor: '#337ab7', color: 'white' },
};

const statusLabels = {
  pending: 'Pendiente...',
  confirmed: 'Inscrito ✔️',
  rejected: 'Rechazado ❌',
  idle: 'Disponible',
  sending: 'Enviando...',
};

const InscriptionStatus = ({ status }) => {
  const style = {
    padding: '4px 10px',
    borderRadius: '12px',
    fontWeight: 'bold',
    fontSize: '0.9em',
    ...statusStyles[status]
  };

  return <span style={style}>{statusLabels[status] || 'Desconocido'}</span>;
};

export default InscriptionStatus;