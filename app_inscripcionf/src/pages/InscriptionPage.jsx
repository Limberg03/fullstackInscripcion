import React, { useState, useEffect } from "react";
// ✅ Corregido: Usamos el nombre correcto de tu función de validación
import { validarChoqueConInscripciones } from '../utils/scheduleUtils'; 
import {
  getGruposMateria,
  getInscripcionesByEstudiante,
} from "../api/apiService";
import { useParams, Link } from 'react-router-dom';
import GrupoMateriaCard from "../components/GrupoMateriaCard";
// ✅ Importamos el hook useAuth actualizado
import { useAuth } from "../context/AuthContext"; 
import "./InscriptionPage.css"; // Tus estilos

const InscriptionPage = () => {
  const { materiaId } = useParams();
  const [grupos, setGrupos] = useState([]);
  const [loading, setLoading] = useState(true); // Estado de carga de los grupos
  const [error, setError] = useState(null);

  // ✅ Obtenemos el usuario y el estado de carga de la autenticación
  const { usuario, authLoading } = useAuth();
  
  // Derivamos el ID del estudiante SOLO si la autenticación ha cargado Y el usuario es estudiante
  const currentStudentId = !authLoading && usuario?.rol === 'estudiante' ? usuario.id : null;

  useEffect(() => {
    // ✅ Salir temprano si la autenticación aún está cargando O si no es un estudiante O si no hay materiaId
    if (authLoading || !currentStudentId || !materiaId) {
      setGrupos([]); 
      setLoading(false); 
      setError(null); 
      return; 
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null); 

      try {
        const pendingTasksJSON = localStorage.getItem('pendingInscriptions');
        const pendingTasks = pendingTasksJSON ? JSON.parse(pendingTasksJSON) : {};

        const [gruposData, inscripcionesData] = await Promise.all([
          getGruposMateria(materiaId),
          getInscripcionesByEstudiante(currentStudentId), // Usar el ID validado
        ]);

        const enrolledGroupIds = new Set(
          inscripcionesData.map((insc) => insc.grupoMateriaId)
        );

        // Mapear los datos de los grupos añadiendo el estado y la info de conflicto
        const gruposConEstado = gruposData.map(grupo => {
          const pendingTaskInfo = pendingTasks[grupo.id];
          const isEnrolled = enrolledGroupIds.has(grupo.id);
          let conflictResult = null; // Usaremos el resultado de tu función

          // Verificar choque solo si no está inscrito y el grupo tiene horario
          if (!isEnrolled && grupo.horario) {
             // ✅ Usamos tu función de validación 'validarChoqueConInscripciones'
             conflictResult = validarChoqueConInscripciones(grupo, inscripcionesData);
          }

          return {
            ...grupo,
            isEnrolled: isEnrolled,
            pendingTask: pendingTaskInfo || null,
            // Usamos el resultado de tu función para determinar 'hasConflict' y 'conflictInfo'
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
  // ✅ Dependencia añadida: authLoading. El efecto se re-ejecuta cuando la autenticación termina.
  }, [currentStudentId, materiaId, authLoading]); 

  // --- Renderizado ---

  // Mostrar estado de carga si la autenticación o los datos están cargando
  if (authLoading || loading) {
    return (
      <div className="page-container">
        <h2>Cargando...</h2>
      </div>
    );
  }
  
  // Mensaje si no es un estudiante
  if (!currentStudentId) {
      return (
          <div className="page-container">
              <header style={{ textAlign: 'center', marginBottom: '30px' }}>
                  <Link to="/" style={{ textDecoration: 'none', color: '#007bff' }}>
                      &larr; Volver a todas las materias
                  </Link>
                  <h1 style={{ marginTop: '10px' }}>Grupos Disponibles</h1>
                  <p>Inicie sesión como estudiante para ver los grupos.</p>
              </header>
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

  // El JSX principal para mostrar las tarjetas
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
                conflictInfo={grupo.conflictInfo} // Pasar la info detallada del conflicto
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