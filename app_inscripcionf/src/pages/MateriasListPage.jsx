import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMaterias } from '../api/apiService';
import './MateriasListPage.css';

const MateriasListPage = () => {
  const [materias, setMaterias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMaterias = async () => {
      try {
        const data = await getMaterias();
        setMaterias(data);
      } catch (err) {
        setError('No se pudieron cargar las materias.');
      } finally {
        setLoading(false);
      }
    };
    fetchMaterias();
  }, []);

  if (loading) {
    return (
      <div className="container">
        <div className="loading-container">
          <div className="spinner"></div>
          <h2>Cargando materias...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error-container">
          <h2 className="error-text">{error}</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <header className="header">
        <div className="header-content">
          <div className="header-icon"></div>
          <div>
            <h1 className="header-title">Sistema de Inscripción Académica</h1>
            <p className="header-subtitle">Selecciona una materia para ver los grupos disponibles</p>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="materias-grid">
          {materias.map((materia) => (
            <Link to={`/materia/${materia.id}`} key={materia.id} className="card-link">
              <div className="materia-card">
                <div className="card-header">
                  <div className="card-icon">📖</div>
                  <div className="card-badge">{materia.sigla}</div>
                </div>
                
                <div className="card-body">
                  <h3 className="card-title">{materia.nombre}</h3>
                  <p className="card-level">{materia.nivel?.nombre || 'Nivel no definido'}</p>
                  
                  <div className="card-details">
                    <div className="detail-item">
                      <span className="detail-icon">🕐</span>
                      <span>{materia.creditos} créditos</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
};

export default MateriasListPage;