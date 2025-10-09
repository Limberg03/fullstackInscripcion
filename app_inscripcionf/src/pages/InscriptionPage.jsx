import React, { useState, useEffect } from 'react';
import { getGruposMateria,getInscripcionesByEstudiante  } from '../api/apiService';
import GrupoMateriaCard from '../components/GrupoMateriaCard';

const pageStyle = {
  fontFamily: 'sans-serif',
  padding: '20px',
};

const gridStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
};

const InscriptionPage = () => {
  const [grupos, setGrupos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // SIMULACIÓN: En una app real, este ID vendría del estado de autenticación (Context, Redux, etc.)
  const ESTUDIANTE_ID_LOGUEADO = 3;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Ejecutamos ambas peticiones en paralelo para mayor eficiencia
        const [gruposData, inscripcionesData] = await Promise.all([
          getGruposMateria(),
          getInscripcionesByEstudiante(ESTUDIANTE_ID_LOGUEADO)
        ]);

        // Creamos un Set con los IDs de los grupos en los que el estudiante ya está inscrito
        // Un Set es mucho más rápido para búsquedas que un array.
        const enrolledGroupIds = new Set(
          inscripcionesData.map(insc => insc.grupoMateria.id)
        );

        // Combinamos la información: añadimos una propiedad 'isEnrolled' a cada grupo
        const gruposConEstado = gruposData.map(grupo => ({
          ...grupo,
          isEnrolled: enrolledGroupIds.has(grupo.id),
        }));

        setGrupos(gruposConEstado);
      } catch (err) {
        setError('No se pudieron cargar los cursos. Intenta más tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div style={pageStyle}><h2>Cargando cursos disponibles...</h2></div>;
  if (error) return <div style={pageStyle}><h2 style={{ color: 'red' }}>{error}</h2></div>;

  return (
    <div style={pageStyle}>
      <header style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1>Sistema de Inscripción Académica</h1>
        <p>Selecciona las materias en las que deseas inscribirte.</p>
      </header>
      <main>
        <div style={gridStyle}>
          {grupos.map((grupo) => (
             <GrupoMateriaCard 
              key={grupo.id} 
              grupo={grupo} 
              estudianteId={ESTUDIANTE_ID_LOGUEADO}
              isEnrolled={grupo.isEnrolled} 
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default InscriptionPage;