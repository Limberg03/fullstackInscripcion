import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getHistoricoEstudiante } from '../../api/apiService';

const HistoricoAcademico = () => {
  const { usuario } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (usuario && usuario.rol === 'estudiante') {
      getHistoricoEstudiante(usuario.id)
        .then(data => {
          setData(data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setError('No se pudo cargar el histórico académico.');
          setLoading(false);
        });
    }
  }, [usuario]);

  if (loading) {
    return (
      <div style={pageStyle}>
        <div style={loadingContainerStyle}>
          <div style={spinnerStyle}></div>
          <p>Cargando histórico académico...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={pageStyle}>
        <div style={errorContainerStyle}>
          <svg style={errorIconStyle} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>{error || 'No se pudo cargar el histórico académico.'}</p>
        </div>
      </div>
    );
  }

  const { historico, estadisticas } = data;

  return (
    <div style={pageStyle}>
      <div style={headerGradient}></div>
      
      <div style={containerStyle}>
        <div style={headerSectionStyle}>
          <h1 style={titleStyle}>Mi Histórico Académico</h1>
          <p style={subtitleStyle}>{usuario.nombre}</p>
        </div>

        {/* Tarjetas de Estadísticas */}
        <div style={statsGridStyle}>
          <div style={statCardStyle}>
            <div style={statIconContainerStyle}>
              <svg style={statIconStyle} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div style={statContentStyle}>
              <p style={statLabelStyle}>Total Materias</p>
              <p style={statValueStyle}>{estadisticas.totalMaterias}</p>
            </div>
          </div>

          <div style={statCardStyle}>
            <div style={{...statIconContainerStyle, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'}}>
              <svg style={statIconStyle} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div style={statContentStyle}>
              <p style={statLabelStyle}>Aprobadas</p>
              <p style={statValueStyle}>{estadisticas.aprobadas}</p>
            </div>
          </div>

          <div style={statCardStyle}>
            <div style={{...statIconContainerStyle, background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'}}>
              <svg style={statIconStyle} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div style={statContentStyle}>
              <p style={statLabelStyle}>Reprobadas</p>
              <p style={statValueStyle}>{estadisticas.reprobadas}</p>
            </div>
          </div>

          <div style={statCardPpacStyle}>
            <div style={{...statIconContainerStyle, background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'}}>
              <svg style={statIconStyle} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div style={statContentStyle}>
              <p style={statLabelStyle}>Promedio General (PPAC)</p>
              <p style={{...statValueStyle, fontSize: '36px', color: '#8b5cf6'}}>
                {estadisticas.ppac !== null && estadisticas.ppac !== undefined ? Number(estadisticas.ppac).toFixed(2) : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Tabla de Detalle */}
        <div style={tableSectionStyle}>
          <h3 style={tableTitleStyle}>Detalle de Materias</h3>
          
          {historico && historico.length > 0 ? (
            <div style={tableContainerStyle}>
              <table style={tableStyle}>
                <thead>
                  <tr style={theadRowStyle}>
                    <th style={thStyle}>Nivel</th>

                    <th style={thStyle}>Periodo</th>
                    <th style={thStyle}>Sigla</th>
                    <th style={{...thStyle, textAlign: 'left', width: '300px'}}>Materia</th>
                    <th style={thStyle}>Nota</th>
                    <th style={thStyle}>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {historico.map((h, index) => (
                    <tr 
                      key={h.id}
                      style={{
                        ...tbodyRowStyle,
                        backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f9ff'
                      }}
                    >
                      <td style={tdStyle}>{h.nivel}</td>

                      <td style={tdStyle}>{h.periodo}</td>
                      <td style={{...tdStyle, fontWeight: '600'}}>{h.materia.sigla}</td>
                      <td style={{...tdStyle, textAlign: 'left'}}>{h.materia.nombre}</td>
                      <td style={{...tdStyle, fontWeight: '700', fontSize: '16px'}}>
                        {h.nota !== null ? h.nota : '-'}
                      </td>
                      <td style={tdStyle}>
                        <span style={{
                          ...badgeStyle,
                          backgroundColor: h.estado === 'APROBADO' ? '#d1fae5' : '#fee2e2',
                          color: h.estado === 'APROBADO' ? '#065f46' : '#991b1b'
                        }}>
                          {h.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={emptyStateStyle}>
              <svg style={emptyIconStyle} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p>No hay registros en tu histórico académico.</p>
            </div>
          )}
        </div>
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

const headerGradient = {
  display: "none"
};

const containerStyle = {
  maxWidth: "1400px",
  margin: "0 auto",
  padding: "20px",
  position: "relative",
  zIndex: 1
};

const headerSectionStyle = {
  marginBottom: "40px",
  paddingTop: "20px"
};

const titleStyle = {
  color: "#667eea",
  fontSize: "36px",
  fontWeight: "600",
  marginBottom: "8px",
  textShadow: "0 2px 4px rgba(0,0,0,0.1)"
};

const subtitleStyle = {
  color: "#ffffff",
  fontSize: "18px",
  fontWeight: "400",
  opacity: 0.95
};

const statsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
  gap: "20px",
  marginBottom: "40px"
};

const statCardStyle = {
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  padding: "24px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
  display: "flex",
  alignItems: "center",
  gap: "20px",
  border: "1px solid #e8ebf0",
  transition: "transform 0.2s ease, box-shadow 0.2s ease"
};

const statIconContainerStyle = {
  width: "56px",
  height: "56px",
  borderRadius: "12px",
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0
};

const statIconStyle = {
  width: "28px",
  height: "28px",
  color: "#ffffff"
};

const statContentStyle = {
  flex: 1
};

const statLabelStyle = {
  fontSize: "13px",
  color: "#6c757d",
  marginBottom: "6px",
  fontWeight: "500",
  textTransform: "uppercase",
  letterSpacing: "0.5px"
};

const statValueStyle = {
  fontSize: "28px",
  fontWeight: "700",
  color: "#2c3e50"
};

const tableSectionStyle = {
  marginTop: "40px"
};

const tableTitleStyle = {
  fontSize: "24px",
  fontWeight: "600",
  color: "#2c3e50",
  marginBottom: "20px"
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
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
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

const badgeStyle = {
  display: "inline-block",
  padding: "6px 16px",
  borderRadius: "20px",
  fontSize: "12px",
  fontWeight: "600",
  textTransform: "uppercase",
  letterSpacing: "0.5px"
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

const errorIconStyle = {
  width: "64px",
  height: "64px",
  marginBottom: "20px"
};

const emptyStateStyle = {
  textAlign: "center",
  padding: "80px 20px",
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  color: "#6c757d"
};

const emptyIconStyle = {
  width: "64px",
  height: "64px",
  color: "#cbd5e0",
  margin: "0 auto 20px"
};

const statCardPpacStyle = {
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  padding: "24px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
  display: "flex",
  alignItems: "center",
  gap: "20px",
  border: "1px solid #e8ebf0",
  transition: "transform 0.2s ease, box-shadow 0.2s ease"
};

export default HistoricoAcademico;