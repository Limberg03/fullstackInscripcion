// components/common/StatusBadge.jsx
import React from 'react';

const StatusBadge = ({ status, reason }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-800',
          border: 'border-yellow-300',
          icon: '⏳',
          label: 'Pendiente'
        };
      case 'confirmed':
        return {
          bg: 'bg-green-100',
          text: 'text-green-800',
          border: 'border-green-300',
          icon: '✅',
          label: 'Confirmada'
        };
      case 'rejected':
        return {
          bg: 'bg-red-100',
          text: 'text-red-800',
          border: 'border-red-300',
          icon: '❌',
          label: 'Rechazada'
        };
      case 'error':
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          border: 'border-gray-300',
          icon: '⚠️',
          label: 'Error'
        };
      default:
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-800',
          border: 'border-blue-300',
          icon: 'ℹ️',
          label: 'Desconocido'
        };
    }
  };

  const getReason = () => {
    if (!reason) return null;
    
    const reasons = {
      'no_seats_available': 'Sin cupos disponibles',
      'already_enrolled': 'Ya inscrito',
      'group_not_found': 'Grupo no encontrado',
      'group_inactive': 'Grupo inactivo',
      'processing_error': 'Error de procesamiento'
    };

    return reasons[reason] || reason;
  };

  const config = getStatusConfig();

  return (
    <div className="inline-flex items-center gap-2">
      <span 
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${config.bg} ${config.text} ${config.border}`}
      >
        <span>{config.icon}</span>
        <span>{config.label}</span>
      </span>
      {reason && (
        <span className="text-xs text-gray-600">
          ({getReason()})
        </span>
      )}
    </div>
  );
};

export default StatusBadge;