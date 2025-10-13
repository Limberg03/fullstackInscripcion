
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import Modal from './Modal';

const StudentLoginModal = ({ isOpen, onClose }) => {
  const [studentIdInput, setStudentIdInput] = useState('');
  const { login } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (login(studentIdInput)) {
      toast.success(`Sesión iniciada como Estudiante ID: ${studentIdInput}`);
      onClose(); 
    } else {
      toast.error('Por favor, introduce un ID de estudiante válido.');
    }
    setStudentIdInput('');
  };

  const inputStyle = {
    width: '100%',
    padding: '10px',
    fontSize: '1em',
    marginBottom: '15px',
    borderRadius: '4px',
    border: '1px solid #ccc',
  };

 const buttonStyle = {
  backgroundColor: '#4F46E5',   
  color: 'white',
  padding: '10px 20px',
  border: 'none',
  borderRadius: '8px',
  fontSize: '16px',
  fontWeight: 'bold',
  cursor: 'pointer',
  transition: 'background-color 0.3s ease, transform 0.2s ease',
};

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Simular Inicio de Sesión">
      <form onSubmit={handleSubmit}>
        <label htmlFor="studentId">ID del Estudiante:</label>
        <input
          type="number"
          id="studentId"
          value={studentIdInput}
          onChange={(e) => setStudentIdInput(e.target.value)}
          placeholder="Ej: 1, 2, 3..."
          style={inputStyle}
          autoFocus
        />
        <button type="submit" style={buttonStyle}>Cambiar Estudiante</button>
        
      </form>
    </Modal>
  );
};

export default StudentLoginModal;