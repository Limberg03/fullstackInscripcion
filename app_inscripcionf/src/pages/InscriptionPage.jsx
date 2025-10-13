import React, { useState, useEffect } from "react";
import {
  getGruposMateria,
  getInscripcionesByEstudiante,
} from "../api/apiService";
import GrupoMateriaCard from "../components/GrupoMateriaCard";
import { useAuth } from "../context/AuthContext";
import "./InscriptionPage.css"; // Importa el CSS

const InscriptionPage = () => {
  const [grupos, setGrupos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { currentStudentId } = useAuth();

  useEffect(() => {
    if (!currentStudentId) {
      setGrupos([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const fetchData = async () => {
      try {
        const pendingTasksJSON = localStorage.getItem('pendingInscriptions');
        const pendingTasks = pendingTasksJSON ? JSON.parse(pendingTasksJSON) : {};
        const [gruposData, inscripcionesData] = await Promise.all([
          getGruposMateria(),
          getInscripcionesByEstudiante(currentStudentId),
        ]);

        const enrolledGroupIds = new Set(
          inscripcionesData.map((insc) => insc.grupoMateria.id)
        );

        const gruposConEstado = gruposData.map(grupo => {
          const pendingTaskInfo = pendingTasks[grupo.id];
          return {
            ...grupo,
            isEnrolled: enrolledGroupIds.has(grupo.id),
            pendingTask: pendingTaskInfo || null, 
          };
        });

        setGrupos(gruposConEstado);
      } catch (err) {
        setError("No se pudieron cargar los cursos. Intenta más tarde.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentStudentId]);

  if (loading)
    return (
      <div className="page-container">
        <h2>Cargando cursos disponibles...</h2>
      </div>
    );
  if (error)
    return (
      <div className="page-container">
        <h2 className="error-text">{error}</h2>
      </div>
    );

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Sistema de Inscripción Académica</h1>
        <p>Selecciona las materias en las que deseas inscribirte.</p>
      </header>
      <main>
        <div className="cards-container">
          {grupos.map((grupo) => (
            <GrupoMateriaCard
              key={`${currentStudentId}-${grupo.id}`}
              grupo={grupo}
              studentId={currentStudentId} 
              isEnrolled={grupo.isEnrolled}
              pendingTask={grupo.pendingTask}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default InscriptionPage;