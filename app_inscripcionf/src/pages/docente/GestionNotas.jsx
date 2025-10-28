import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getNotasPorGrupo, crearNota, actualizarNota } from '../../api/apiService';
import { toast } from 'react-toastify';

const GestionNotas = () => {
  const { grupoId } = useParams();
  const navigate = useNavigate();
  const [listaEstudiantesConNotas, setListaEstudiantesConNotas] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [calificaciones, setCalificaciones] = useState({});
  const [guardando, setGuardando] = useState({});
  const [actasCerradas, setActasCerradas] = useState({});
  const [grupoInfo, setGrupoInfo] = useState(null);

  useEffect(() => {
    cargarEstudiantesYNotas();
  }, [grupoId]);

  const cargarEstudiantesYNotas = () => {
  setLoading(true);
  setError(null);
  getNotasPorGrupo(grupoId)
    .then(data => {
      setListaEstudiantesConNotas(data);
      
      // Capturar información del grupo - MODIFICADO
      if (data.length > 0) {
        // Intenta acceder a diferentes estructuras posibles
        const primeraFila = data[0];
        if (primeraFila.grupoMateria) {
          setGrupoInfo(primeraFila.grupoMateria);
        } else if (primeraFila.grupo) {
          setGrupoInfo(primeraFila.grupo);
        }
      }
      
      const inputsIniciales = {};
      data.forEach(item => {
        inputsIniciales[item.estudiante.id] = { 
          notaId: item.id,
          calificacion: item.calificacion === null ? '' : String(item.calificacion), 
          observacion: item.observacion === null ? '' : item.observacion 
        };
      });
      setCalificaciones(inputsIniciales);
    })
    .catch(err => {
      console.error("Error al cargar estudiantes/notas:", err);
      setError("No se pudieron cargar los datos del grupo.");
    })
    .finally(() => {
       setLoading(false);
    });
};

  const handleInputChange = (estudianteId, field, value) => {
    setCalificaciones(prev => ({
      ...prev,
      [estudianteId]: { 
        ...(prev[estudianteId] || {}),
        [field]: value 
      }
    }));
  };

  const handleGuardarNota = async (estudianteId, cerrarActa = false) => {
    const datosNota = calificaciones[estudianteId];
    if (!datosNota) return;

    const { notaId, calificacion, observacion } = datosNota;
    
    const califNum = parseFloat(calificacion);
    if (isNaN(califNum) || califNum < 0 || califNum > 100) {
      toast.error('Ingrese una calificación válida (0-100).');
      return;
    }

    setGuardando(prev => ({ ...prev, [estudianteId]: true }));

    try {
      if (notaId) {
        await actualizarNota(notaId, califNum, observacion || null);
        toast.success(cerrarActa ? 'Nota guardada y acta cerrada' : 'Nota actualizada correctamente');
      } else {
        await crearNota({
          calificacion: califNum,
          observacion: observacion || null,
          grupoMateriaId: grupoId,
          estudianteId: estudianteId
        });
        toast.success(cerrarActa ? 'Nota creada y acta cerrada' : 'Nota creada correctamente');
      }
      
      if (cerrarActa) {
        setActasCerradas(prev => ({ ...prev, [estudianteId]: true }));
      }
      
      cargarEstudiantesYNotas(); 
    } catch (error) {
      toast.error(`Error al guardar: ${error.message}`);
    } finally {
      setGuardando(prev => ({ ...prev, [estudianteId]: false }));
    }
  };

  if (loading) {
    return (
      <div style={pageStyle}>
        <div style={loadingContainerStyle}>
          <div style={spinnerStyle}></div>
          <p>Cargando estudiantes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={pageStyle}>
        <div style={errorContainerStyle}>
          <p>{error}</p>
          <button style={btnSecondaryStyle} onClick={() => navigate('/docente')}>
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={headerGradientStyle}></div>
      
      <div style={containerStyle}>
        {/* Botón Volver visible */}
        <button 
          style={btnBackStyle}
          onClick={() => navigate('/docente')}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#5a67d8';
            e.currentTarget.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#ffffff';
            e.currentTarget.style.color = '#667eea';
          }}
        >
          <svg style={iconStyle} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver al Dashboard
        </button>

        <div style={headerSectionStyle}>
          <h1 style={titleStyle}>Gestión de Notas</h1>
          {grupoInfo && (
            <div style={infoContainerStyle}>
              <p style={subtitleStyle}>{grupoInfo.materia?.nombre || 'Materia'}</p>
              <div style={badgeContainerStyle}>
                <span style={badgeInfoStyle}>Grupo {grupoInfo.grupo}</span>
                <span style={badgeInfoStyle}>Nivel: {grupoInfo.materia?.nivel?.nombre || 'N/A'}</span>
              </div>
            </div>
          )}
        </div>

        {listaEstudiantesConNotas.length === 0 ? (
          <div style={emptyStateStyle}>
            <svg style={emptyIconStyle} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <p>No hay estudiantes inscritos en este grupo.</p>
          </div>
        ) : (
          <div style={tableContainerStyle}>
            <table style={tableStyle}>
              <thead>
                <tr style={theadRowStyle}>
                  <th style={thStyle}>ID</th>
                  <th style={{...thStyle, textAlign: 'left'}}>Nombre del Estudiante</th>
                  <th style={thStyle}>Calificación</th>
                  <th style={{...thStyle, width: '300px'}}>Observación</th>
                  <th style={{...thStyle, width: '280px'}}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {listaEstudiantesConNotas.map((item, index) => (
                  <tr 
                    key={item.estudiante.id} 
                    style={{
                      ...tbodyRowStyle,
                      backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f9ff'
                    }}
                  >
                    <td style={tdStyle}>{item.estudiante.id}</td>
                    <td style={{...tdStyle, fontWeight: '500', textAlign: 'left'}}>
                      {item.estudiante.nombre}
                    </td>
                    <td style={tdStyle}>
                      <input
                        style={inputCalificacionStyle}
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        placeholder="0-100"
                        value={calificaciones[item.estudiante.id]?.calificacion ?? ''} 
                        onChange={(e) => handleInputChange(item.estudiante.id, 'calificacion', e.target.value)}
                        disabled={actasCerradas[item.estudiante.id]}
                      />
                    </td>
                    <td style={tdStyle}>
                      <input
                        style={inputObservacionStyle}
                        type="text"
                        maxLength={255}
                        placeholder="Opcional"
                        value={calificaciones[item.estudiante.id]?.observacion ?? ''}
                        onChange={(e) => handleInputChange(item.estudiante.id, 'observacion', e.target.value)}
                        disabled={actasCerradas[item.estudiante.id]}
                      />
                    </td>
                    <td style={tdStyle}>
                      <div style={btnGroupStyle}>
                        {actasCerradas[item.estudiante.id] ? (
                          <button style={btnGuardadoStyle} disabled>
                            <svg style={btnIconStyle} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Guardado
                          </button>
                        ) : (
                          <>
                            <button 
                              style={btnGuardarStyle}
                              onClick={() => handleGuardarNota(item.estudiante.id, false)}
                              disabled={guardando[item.estudiante.id]}
                              onMouseEnter={(e) => {
                                if (!guardando[item.estudiante.id]) {
                                  e.currentTarget.style.background = '#5a67d8';
                                  e.currentTarget.style.transform = 'translateY(-1px)';
                                }
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = '#667eea';
                                e.currentTarget.style.transform = 'translateY(0)';
                              }}
                            >
                              {guardando[item.estudiante.id] ? 'Guardando...' : 'Guardar'}
                            </button>
                            <button 
                              style={btnCerrarActaStyle}
                              onClick={() => handleGuardarNota(item.estudiante.id, true)}
                              disabled={guardando[item.estudiante.id]}
                              onMouseEnter={(e) => {
                                if (!guardando[item.estudiante.id]) {
                                  e.currentTarget.style.background = '#059669';
                                  e.currentTarget.style.transform = 'translateY(-1px)';
                                }
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = '#10b981';
                                e.currentTarget.style.transform = 'translateY(0)';
                              }}
                            >
                              {guardando[item.estudiante.id] ? 'Guardando...' : 'Guardar y Cerrar Acta'}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// Estilos
const pageStyle = {
  minHeight: "100vh",
  backgroundColor: "#f5f7fa",
  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  position: "relative",
  paddingBottom: "40px"
};

const headerGradientStyle = {
  display: "none" 
};

const containerStyle = {
  maxWidth: "1400px",
  margin: "0 auto",
  padding: "20px",
  position: "relative",
  zIndex: 1
};

const btnBackStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  padding: "10px 20px",
  backgroundColor: "#ffffff",
  color: "#667eea",
  border: "2px solid #667eea",
  borderRadius: "8px",
  fontSize: "14px",
  fontWeight: "600",
  cursor: "pointer",
  transition: "all 0.3s ease",
  marginBottom: "20px",
  boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
};

const iconStyle = {
  width: "20px",
  height: "20px"
};

const headerSectionStyle = {
  marginBottom: "20px",
  paddingTop: "0px"  // Mover el contenido ABAJO del header azul
};

const titleStyle = {
  color: "#2c3e50",  // CAMBIAR de #ffffff a oscuro
  fontSize: "32px",
  fontWeight: "600",
  marginBottom: "12px",
  textShadow: "none"  // QUITAR sombra
};

const infoContainerStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "8px"
};

const subtitleStyle = {
  color: "#4a5568",  // CAMBIAR de #ffffff a oscuro
  fontSize: "20px",
  fontWeight: "500",
  opacity: 1  // CAMBIAR de 0.95 a 1
};

const badgeContainerStyle = {
  display: "flex",
  gap: "12px",
  flexWrap: "wrap"
};

const badgeInfoStyle = {
  backgroundColor: "#e0e7ff",  // CAMBIAR de transparente a sólido
  color: "#667eea",  // CAMBIAR de #ffffff a azul
  padding: "6px 14px",
  borderRadius: "20px",
  fontSize: "13px",
  fontWeight: "500",
  border: "1px solid #667eea"  // AGREGAR borde
};

const tableContainerStyle = {
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
  overflow: "hidden",
  border: "1px solid #e8ebf0"
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse"
};

const theadRowStyle = {
  background: "#667eea",
  borderBottom: "2px solid #5a67d8"
};

const thStyle = {
  padding: "16px",
  textAlign: "center",
  color: "#ffffff",
  fontSize: "13px",
  fontWeight: "600",
  textTransform: "uppercase",
  letterSpacing: "0.5px"
};

const tbodyRowStyle = {
  transition: "background-color 0.2s ease"
};

const tdStyle = {
  padding: "16px",
  textAlign: "center",
  fontSize: "14px",
  color: "#2c3e50",
  borderBottom: "1px solid #e8ebf0"
};

const inputCalificacionStyle = {
  width: "100px",
  padding: "8px 12px",
  border: "2px solid #e0e7ff",
  borderRadius: "6px",
  fontSize: "14px",
  textAlign: "center",
  transition: "all 0.2s ease",
  outline: "none"
};

const inputObservacionStyle = {
  width: "100%",
  padding: "8px 12px",
  border: "2px solid #e0e7ff",
  borderRadius: "6px",
  fontSize: "14px",
  transition: "all 0.2s ease",
  outline: "none"
};

const btnGroupStyle = {
  display: "flex",
  gap: "8px",
  justifyContent: "center",
  flexWrap: "wrap"
};

const btnGuardarStyle = {
  padding: "8px 16px",
  background: "#667eea",
  color: "#ffffff",
  border: "none",
  borderRadius: "6px",
  fontSize: "13px",
  fontWeight: "500",
  cursor: "pointer",
  transition: "all 0.2s ease",
  boxShadow: "0 2px 4px rgba(102, 126, 234, 0.2)"
};

const btnCerrarActaStyle = {
  padding: "8px 16px",
  background: "#10b981",
  color: "#ffffff",
  border: "none",
  borderRadius: "6px",
  fontSize: "13px",
  fontWeight: "500",
  cursor: "pointer",
  transition: "all 0.2s ease",
  boxShadow: "0 2px 4px rgba(16, 185, 129, 0.2)"
};

const btnGuardadoStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  padding: "8px 16px",
  background: "#94a3b8",
  color: "#ffffff",
  border: "none",
  borderRadius: "6px",
  fontSize: "13px",
  fontWeight: "500",
  cursor: "not-allowed",
  opacity: 0.7
};

const btnIconStyle = {
  width: "16px",
  height: "16px"
};

const loadingContainerStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "60vh",
  color: "#667eea",
  fontSize: "18px"
};

const spinnerStyle = {
  width: "50px",
  height: "50px",
  border: "4px solid #e0e7ff",
  borderTop: "4px solid #667eea",
  borderRadius: "50%",
  animation: "spin 1s linear infinite",
  marginBottom: "20px"
};

const errorContainerStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "60vh",
  color: "#e74c3c",
  fontSize: "16px"
};

const btnSecondaryStyle = {
  marginTop: "20px",
  padding: "10px 20px",
  background: "#667eea",
  color: "#ffffff",
  border: "none",
  borderRadius: "6px",
  fontSize: "14px",
  fontWeight: "500",
  cursor: "pointer"
};

const emptyStateStyle = {
  textAlign: "center",
  padding: "80px 20px",
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  color: "#6c757d"
};

const emptyIconStyle = {
  width: "64px",
  height: "64px",
  color: "#cbd5e0",
  marginBottom: "20px",
  margin: "0 auto 20px"
};



export default GestionNotas;