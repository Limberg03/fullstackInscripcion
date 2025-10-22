import React, { useState, useEffect } from "react";
import { validarChoqueConInscripciones } from '../utils/scheduleUtils';
import {
  getGruposMateria,
  getInscripcionesByEstudiante,
} from "../api/apiService";
import { useParams, Link } from 'react-router-dom';
import GrupoMateriaCard from "../components/GrupoMateriaCard";
import { useAuth } from "../context/AuthContext";
import "./InscriptionPage.css";

const InscriptionPage = () => {
  const { materiaId } = useParams();

  const [grupos, setGrupos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { currentStudentId } = useAuth();

  useEffect(() => {
    if (!currentStudentId || !materiaId) return;

    const fetchData = async () => {
      setLoading(true);

      try {
        // Obtener tareas pendientes del localStorage
        const pendingTasksJSON = localStorage.getItem('pendingInscriptions');
        const pendingTasks = pendingTasksJSON ? JSON.parse(pendingTasksJSON) : {};

        // ✅ Obtener grupos e inscripciones en paralelo
        const [gruposData, inscripcionesData] = await Promise.all([
          getGruposMateria(materiaId),
          getInscripcionesByEstudiante(currentStudentId),
        ]);

        const enrolledGroupIds = new Set(
          inscripcionesData.map((insc) => insc.grupoMateriaId)
        );

        const gruposConEstado = gruposData.map(grupo => {
          const pendingTaskInfo = pendingTasks[grupo.id];
          const isEnrolled = enrolledGroupIds.has(grupo.id);
          
          let conflictResult = null;
          if (!isEnrolled) {
            conflictResult = validarChoqueConInscripciones(grupo, inscripcionesData);
          }

          return {
            ...grupo,
            isEnrolled: isEnrolled,
            pendingTask: pendingTaskInfo || null,
            hasConflict: conflictResult?.hasConflict || false,
            conflictInfo: conflictResult, 
          };
        });

        setGrupos(gruposConEstado);
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError("No se pudieron cargar los grupos. Intenta más tarde.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentStudentId, materiaId]);

  if (loading) {
    return (
      <div className="page-container">
        <h2>Cargando grupos...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <h2 className="error-text">{error}</h2>
      </div>
    );
  }

  return (
    <div className="page-container">
      <header style={{ textAlign: 'center', marginBottom: '30px' }}>
        <Link to="/" style={{ textDecoration: 'none', color: '#007bff' }}>
          &larr; Volver a todas las materias
        </Link>
        <h1 style={{ marginTop: '10px' }}>Grupos Disponibles</h1>
      </header>
      <main>
        <div className="cards-container">
          {grupos.length > 0 ? (
            grupos.map((grupo) => (
              <GrupoMateriaCard 
                key={`${currentStudentId}-${grupo.id}`}
                grupo={grupo} 
                studentId={currentStudentId}
                isEnrolled={grupo.isEnrolled} 
                pendingTask={grupo.pendingTask}
                materiaId={materiaId}
                hasConflict={grupo.hasConflict}
                conflictInfo={grupo.conflictInfo} 
              />
            ))
          ) : (
            <p>No hay grupos disponibles para esta materia.</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default InscriptionPage;