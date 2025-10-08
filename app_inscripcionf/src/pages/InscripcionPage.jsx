import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:3000';

const StatusBadge = ({ status, reason }) => {
  const configs = {
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: '⏳', label: 'Pendiente' },
    confirmed: { bg: 'bg-green-100', text: 'text-green-800', icon: '✅', label: 'Confirmada' },
    rejected: { bg: 'bg-red-100', text: 'text-red-800', icon: '❌', label: 'Rechazada' },
    error: { bg: 'bg-gray-100', text: 'text-gray-800', icon: '⚠️', label: 'Error' }
  };

  const config = configs[status] || configs.error;
  
  const reasons = {
    'no_seats_available': 'Sin cupos',
    'already_enrolled': 'Ya inscrito',
    'group_not_found': 'Grupo no encontrado',
    'group_inactive': 'Grupo inactivo'
  };

  return (
    <div className="inline-flex items-center gap-2">
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        <span>{config.icon}</span>
        <span>{config.label}</span>
      </span>
      {reason && (
        <span className="text-xs text-gray-600">({reasons[reason] || reason})</span>
      )}
    </div>
  );
};

const InscripcionPage = () => {
  const [estudianteId, setEstudianteId] = useState(1);
  const [gestion, setGestion] = useState(2025);
  const [gruposMateria, setGruposMateria] = useState([]);
  const [selectedGrupo, setSelectedGrupo] = useState('');
  const [pendingTasks, setPendingTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/grupos-materia`)
      .then(res => res.json())
      .then(data => setGruposMateria(data.data || []))
      .catch(err => console.error('Error cargando grupos:', err));
  }, []);

  useEffect(() => {
    if (pendingTasks.length === 0) return;

    const interval = setInterval(async () => {
      try {
        const updates = await Promise.all(
          pendingTasks.map(async (task) => {
            try {
              const response = await fetch(
                `${API_URL}/queue/${task.queueName}/tasks/${task.taskId}`
              );
              const data = await response.json();
              return { ...task, taskData: data.task };
            } catch (error) {
              return { ...task, error: true };
            }
          })
        );

        const stillPending = [];
        const nowCompleted = [];

        updates.forEach(task => {
          const taskStatus = task.taskData?.status;
          
          if (taskStatus === 'completed') {
            const result = task.taskData.result;
            nowCompleted.push({
              ...task,
              status: result?.status || 'confirmed',
              result: result,
              completedAt: new Date().toISOString()
            });
          } else if (taskStatus === 'failed' || taskStatus === 'error') {
            nowCompleted.push({
              ...task,
              status: 'rejected',
              error: task.taskData.error,
              completedAt: new Date().toISOString()
            });
          } else {
            stillPending.push(task);
          }
        });

        setPendingTasks(stillPending);
        
        if (nowCompleted.length > 0) {
          setCompletedTasks(prev => [...nowCompleted, ...prev]);
          
          nowCompleted.forEach(task => {
            if (task.status === 'confirmed') {
              showNotification('Inscripción confirmada', 'success');
            } else {
              showNotification('Inscripción rechazada: ' + (task.result?.reason || 'error'), 'error');
            }
          });
        }
      } catch (error) {
        console.error('Error en polling:', error);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [pendingTasks]);

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleRequestSeat = async (e) => {
    e.preventDefault();
    
    if (!selectedGrupo) {
      showNotification('Selecciona un grupo', 'error');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/inscripciones/request-seat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estudianteId: parseInt(estudianteId),
          grupoMateriaId: parseInt(selectedGrupo),
          gestion: parseInt(gestion)
        })
      });

      const data = await response.json();

      if (data.status === 'rejected') {
        showNotification(`Rechazada: ${data.message}`, 'error');
        setCompletedTasks(prev => [{
          grupoMateriaId: selectedGrupo,
          status: 'rejected',
          reason: data.reason,
          message: data.message,
          completedAt: new Date().toISOString()
        }, ...prev]);
      } else {
        setPendingTasks(prev => [...prev, {
          taskId: data.taskId,
          queueName: data.queueName,
          grupoMateriaId: selectedGrupo,
          status: 'pending',
          timestamp: new Date().toISOString()
        }]);
        showNotification('Solicitud encolada', 'success');
      }
    } catch (error) {
      showNotification(`Error: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const getGrupoInfo = (grupoId) => {
    return gruposMateria.find(g => g.id === parseInt(grupoId));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {notification && (
          <div className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg ${
            notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          } text-white z-50`}>
            {notification.message}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🎓 Sistema de Inscripciones
          </h1>
          <p className="text-gray-600">
            Inscríbete a tus materias y observa el estado en tiempo real
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Nueva Inscripción</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estudiante ID
                </label>
                <input
                  type="number"
                  value={estudianteId}
                  onChange={(e) => setEstudianteId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Grupo Materia
                </label>
                <select
                  value={selectedGrupo}
                  onChange={(e) => setSelectedGrupo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Selecciona un grupo</option>
                  {gruposMateria.map(grupo => (
                    <option key={grupo.id} value={grupo.id}>
                      {grupo.grupo} - {grupo.Materia?.nombre || 'Sin nombre'} (Cupos: {grupo.cupo})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gestión
                </label>
                <input
                  type="number"
                  value={gestion}
                  onChange={(e) => setGestion(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <button
                onClick={handleRequestSeat}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Procesando...' : 'Solicitar Inscripción'}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Estado de Solicitudes</h2>
            
            {pendingTasks.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Pendientes</h3>
                <div className="space-y-2">
                  {pendingTasks.map((task, index) => {
                    const grupo = getGrupoInfo(task.grupoMateriaId);
                    return (
                      <div key={index} className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            {grupo?.grupo || `Grupo ${task.grupoMateriaId}`}
                          </span>
                          <StatusBadge status="pending" />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Cola: {task.queueName}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {completedTasks.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Historial</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {completedTasks.map((task, index) => {
                    const grupo = getGrupoInfo(task.grupoMateriaId);
                    return (
                      <div key={index} className={`p-3 border rounded-md ${
                        task.status === 'confirmed' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                      }`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">
                            {grupo?.grupo || `Grupo ${task.grupoMateriaId}`}
                          </span>
                          <StatusBadge status={task.status} reason={task.result?.reason || task.reason} />
                        </div>
                        {task.result?.cuposRestantes !== undefined && (
                          <p className="text-xs text-gray-600">
                            Cupos restantes: {task.result.cuposRestantes}
                          </p>
                        )}
                        <p className="text-xs text-gray-500">
                          {new Date(task.completedAt).toLocaleString()}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {pendingTasks.length === 0 && completedTasks.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>No hay solicitudes activas</p>
                <p className="text-sm mt-2">Solicita una inscripción para comenzar</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">Estadísticas</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-3xl font-bold text-yellow-600">{pendingTasks.length}</p>
              <p className="text-sm text-gray-600">Pendientes</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-3xl font-bold text-green-600">
                {completedTasks.filter(t => t.status === 'confirmed').length}
              </p>
              <p className="text-sm text-gray-600">Confirmadas</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-3xl font-bold text-red-600">
                {completedTasks.filter(t => t.status === 'rejected').length}
              </p>
              <p className="text-sm text-gray-600">Rechazadas</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InscripcionPage;