import React, { useState, useEffect } from "react";
import {
  getGruposMateria,
  getInscripcionesByEstudiante,
} from "../api/apiService";
import { useParams, Link } from 'react-router-dom';
import GrupoMateriaCard from "../components/GrupoMateriaCard";
import { useAuth } from "../context/AuthContext";
import "./InscriptionPage.css"; // Importa el CSS

const InscriptionPage = () => {
const { materiaId } = useParams();

  const [grupos, setGrupos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { currentStudentId } = useAuth();

  useEffect(() => {
    // if (!currentStudentId) {
    //   setGrupos([]);
    //   setLoading(false);
    //   return;
    // }
if (!currentStudentId || !materiaId) return;

    const fetchData = async () => {
    setLoading(true);

      try {
        const pendingTasksJSON = localStorage.getItem('pendingInscriptions');
        const pendingTasks = pendingTasksJSON ? JSON.parse(pendingTasksJSON) : {};
        const [gruposData, inscripcionesData] = await Promise.all([
             getGruposMateria(materiaId),
          // getGruposMateria(),
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
  }, [currentStudentId, materiaId]);

  if (loading)
    return (
      <div className="page-container">
        <h2>Cargando grupos...</h2>
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
      <header style={{ textAlign: 'center', marginBottom: '30px' }}>
        {/* ✅ Añadimos un enlace para volver a la lista principal */}
        <Link to="/" style={{ textDecoration: 'none', color: '#007bff' }}>&larr; Volver a todas las materias</Link>
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
              />
            ))
          ) : (
            <p>No hay grupos disponibles para esta materia.</p>)}
        </div>
      </main>
    </div>
  );
};

const pageStyle = { fontFamily: 'sans-serif', padding: '20px' };
const gridStyle = { display: 'flex', flexWrap: 'wrap', justifyContent: 'center' };


export default InscriptionPage;