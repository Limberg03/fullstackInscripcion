import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'; // Importar Navigate y Outlet
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './context/AuthContext'; // Importar useAuth también
import Header from './components/Header';
// Importar todas las páginas
import MateriasListPage from './pages/MateriasListPage';
import InscriptionPage from './pages/InscriptionPage';
import InscriptionStatusPage from './pages/InscriptionStatusPage';
import DocenteDashboard from './pages/docente/DocenteDashboard';
import GestionNotas from './pages/docente/GestionNotas';
import HistoricoAcademico from './pages/estudiante/HistoricoAcademico';

// Componente Wrapper que maneja la lógica de carga y redirección inicial
const AppWrapper = () => {
  const { usuario, authLoading } = useAuth();

  // 1. Mostrar "Cargando" mientras el AuthProvider lee localStorage
  if (authLoading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}><h2>Cargando sesión...</h2></div>;
  }

  // 2. Una vez cargado, definimos las rutas principales
  return (
    <>
      <Header />
      <Routes>
        {/* Rutas Públicas/Comunes */}
        <Route path="/status/:queueName/:taskId" element={<InscriptionStatusPage />} />

        {/* --- Rutas Protegidas para Estudiante --- */}
        <Route 
          path="/" 
          element={usuario?.rol === 'estudiante' ? <Outlet /> : <Navigate to="/docente" replace />}
        >
          <Route index element={<Navigate to="/materias" replace />} /> {/* Redirige / a /materias */}
          <Route path="materias" element={<MateriasListPage />} />
          <Route path="materia/:materiaId" element={<InscriptionPage />} />
          <Route path="mi-historico" element={<HistoricoAcademico />} />
        </Route>

        {/* --- Rutas Protegidas para Docente --- */}
        <Route 
          path="/docente" 
          element={usuario?.rol === 'docente' ? <Outlet /> : <Navigate to="/materias" replace />}
        >
          <Route index element={<DocenteDashboard />} /> {/* /docente muestra el dashboard */}
          <Route path="grupo/:grupoId" element={<GestionNotas />} /> 
        </Route>

        {/* Fallback para rutas no encontradas */}
        <Route path="*" element={<Navigate to="/" replace />} /> 
      </Routes>
    </>
  );
};


function App() {
  return (
    // AuthProvider envuelve todo para que AppWrapper pueda usar useAuth
    <AuthProvider>
       <ToastContainer 
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      {/* AppWrapper ahora contiene Header y Routes */}
      <AppWrapper /> 
    </AuthProvider>
  );
}

export default App;