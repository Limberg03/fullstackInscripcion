import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getGruposPorDocente } from '../../api/apiService';
import { Link } from 'react-router-dom';

const DocenteDashboard = () => {
  const { usuario } = useAuth();
  const [grupos, setGrupos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (usuario && usuario.rol === 'docente') {
      setLoading(true);
      setError(null);
      getGruposPorDocente(usuario.id)
        .then(data => {
          setGrupos(data);
        })
        .catch(err => {
          console.error("Error cargando grupos del docente:", err);
          setError('No se pudieron cargar los grupos asignados.');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setGrupos([]);
      setLoading(false);
    }
  }, [usuario]);

  if (!usuario || usuario.rol !== 'docente') {
    return (
      <div style={pageStyle}>
        <div style={containerStyle}>
          <p>Por favor, inicie sesión como docente para ver esta página.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={pageStyle}>
        <div style={containerStyle}>
          <div style={loadingStyle}>Cargando grupos asignados...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={pageStyle}>
        <div style={containerStyle}>
          <p style={{ color: '#e74c3c' }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={headerGradient}></div>
      <div style={containerStyle}>
        <div style={welcomeSection}>
          {/* <h1 style={titleStyle}>Bienvenido, {usuario.nombre}</h1> */}
          <h1 style={titleStyle}>Mis Grupos Asignados</h1>
        </div>

        {grupos.length > 0 ? (
          <div style={gridStyle}>
            {grupos.map(grupo => (
              <Link 
                to={`/docente/grupo/${grupo.id}`} 
                key={grupo.id} 
                style={{ textDecoration: 'none' }}
              >
                <div style={cardStyle}>
                  <div style={cardHeaderStyle}>
                    {grupo.materia.nombre}
                  </div>
                  <div style={cardBodyStyle}>
                    <div style={infoRowStyle}>
                      <span style={labelStyle}>Grupo:</span>
                      <span style={valueStyle}>{grupo.grupo}</span>
                    </div>
                    <div style={infoRowStyle}>
                      <span style={labelStyle}>Nivel:</span>
                      <span style={valueStyle}>{grupo.materia.nivel?.nombre || 'N/A'}</span>
                    </div>
                    
                    {grupo.horario && (
                      <div style={scheduleStyle}>
                        <span>{grupo.horario.dia}</span>
                        <span style={timeStyle}>
                          ({grupo.horario.horaInicio?.substring(0,5)} - {grupo.horario.horaFin?.substring(0,5)})
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div style={emptyStateStyle}>
            <p>No tienes grupos asignados actualmente.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const pageStyle = {
  minHeight: "100vh",
  backgroundColor: "#f5f7fa",
  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  position: "relative"
};

const headerGradient = {
  display: "none"
};

const containerStyle = {
  maxWidth: "1200px",
  margin: "0 auto",
  padding: "20px",
  position: "relative",
  zIndex: 1
};

const welcomeSection = {
  marginBottom: "40px",
  paddingTop: "20px"
};

const titleStyle = {
  color: "#667eea",
  fontSize: "32px",
  fontWeight: "600",
  marginBottom: "10px",
  textShadow: "0 2px 4px rgba(0,0,0,0.1)"
};

const subtitleStyle = {
  color: "#667eea",
  fontSize: "20px",
  fontWeight: "400",
  opacity: 0.95
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
  gap: "24px",
  marginTop: "30px"
};

const cardStyle = {
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
  overflow: "hidden",
  transition: "all 0.3s ease",
  cursor: "pointer",
  border: "1px solid #e8ebf0"
};

const cardHeaderStyle = {
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  color: "#ffffff",
  padding: "18px 20px",
  fontSize: "18px",
  fontWeight: "600",
  textAlign: "left"
};

const cardBodyStyle = {
  padding: "20px"
};

const infoRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "12px",
  paddingBottom: "10px",
  borderBottom: "1px solid #f0f2f5"
};

const labelStyle = {
  color: "#6c757d",
  fontSize: "14px",
  fontWeight: "500"
};

const valueStyle = {
  color: "#2c3e50",
  fontSize: "14px",
  fontWeight: "600"
};

const scheduleStyle = {
  marginTop: "15px",
  padding: "12px",
  backgroundColor: "#f8f9ff",
  borderRadius: "8px",
  borderLeft: "3px solid #667eea",
  fontSize: "14px",
  color: "#4a5568",
  display: "flex",
  flexDirection: "column",
  gap: "4px"
};

const timeStyle = {
  color: "#667eea",
  fontWeight: "600",
  fontSize: "13px"
};

const loadingStyle = {
  textAlign: "center",
  padding: "60px 20px",
  fontSize: "18px",
  color: "#667eea"
};

const emptyStateStyle = {
  textAlign: "center",
  padding: "60px 20px",
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  marginTop: "30px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
};

export default DocenteDashboard;