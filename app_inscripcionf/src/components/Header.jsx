import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import StudentLoginModal from './StudentLoginModal';
import { Link, useNavigate } from 'react-router-dom'; // Asegúrate de importar Link y useNavigate

const Header = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const headerStyle = {
    backgroundColor: '#f8f9fa',
    padding: '10px 20px',
    borderBottom: '1px solid #dee2e6',
    display: 'flex',
    justifyContent: 'space-between', // Para distribuir elementos
    alignItems: 'center',
    gap: '15px',
  };

  const handleLogout = () => {
    logout();
    navigate('/'); // Redirige a la página principal
  };

  // const getDashboardLink = () => {
  //   if (!usuario) return '/';
  //   return usuario.rol === 'docente' ? '/docente' : '/';
  // };

  const getDashboardLink = () => {
    if (!usuario) return '/';
    // ✅ Redirige a /docente o /materias
    return usuario.rol === 'docente' ? '/docente' : '/materias';
  };

  return (
    <>
      <header style={headerStyle}>
        {/* Información del usuario */}
        <div>
          <span>
            Sesión actual: <strong>{usuario ? `${usuario.nombre} (${usuario.rol})` : 'No autenticado'}</strong>
          </span>
        </div>

        {/* Botones y enlaces */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}> {/* Contenedor para alinear botones */}
          {/* Enlace al Dashboard */}
          <Link to={getDashboardLink()} className="button">Mi Dashboard</Link>

          {/* Enlace al Histórico (solo para estudiantes) */}
          {usuario && usuario.rol === 'estudiante' && (
            <Link to="/mi-historico" className="button">Mi Histórico</Link>
          )}

          {/* Botón para abrir el modal de login */}
          <button
            className="button button-primary"
            // ✅ CORRECCIÓN: Se eliminó el '()=>' extra
            onClick={() => setIsModalOpen(true)}
          >
            Simular Login
          </button>

          {/* Botón para cerrar sesión */}
          <button className="button" onClick={handleLogout}>
            Salir
          </button>
        </div>
      </header>

      {/* El modal para simular el login */}
      <StudentLoginModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default Header;