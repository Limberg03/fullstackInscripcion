
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import StudentLoginModal from './StudentLoginModal';

const Header = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { currentStudentId } = useAuth();

  const headerStyle = {
    backgroundColor: '#f8f9fa',
    padding: '10px 20px',
    borderBottom: '1px solid #dee2e6',
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: '15px',
  };

  const buttonStyle = {
    padding: '8px 15px',
    cursor: 'pointer',
  };

  return (
    <>
      <header style={headerStyle}>
        <span>
          Sesión actual: <strong>Estudiante ID {currentStudentId}</strong>
        </span>
        <button  className="button button-primary"  onClick={() => setIsModalOpen(true)}>
          Cambiar Estudiante
        </button>
      </header>
      <StudentLoginModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default Header;