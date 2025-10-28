import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import Modal from './Modal'; // Asegúrate de que este import sea correcto

const StudentLoginModal = ({ isOpen, onClose }) => {
  // Estado para el ID (estudiante o docente)
  const [idInput, setIdInput] = useState('');
  // Estado para el Rol seleccionado
  const [rolInput, setRolInput] = useState('estudiante'); // Rol por defecto
  const { login } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Llamamos a login con el ID y el Rol
    if (login(idInput, rolInput)) {
      // Mensaje de éxito dinámico
      toast.success(`Sesión iniciada como: ${rolInput.charAt(0).toUpperCase() + rolInput.slice(1)} ID: ${idInput}`);
      onClose(); // Cierra el modal
    } else {
      toast.error('Por favor, introduce un ID numérico válido.');
    }
    setIdInput(''); // Limpiamos el input de ID
    // No reseteamos el rol, mantenemos la última selección
  };

  // Tus estilos existentes
  const inputStyle = {
    width: '100%',
    padding: '10px',
    fontSize: '1em',
    marginBottom: '15px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    boxSizing: 'border-box' // Añadido para mejor consistencia
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
    width: '100%', // Para que ocupe todo el ancho
    marginTop: '10px' // Espacio sobre el botón
  };

  const radioContainerStyle = {
    display: 'flex',
    gap: '15px', // Espacio entre opciones de radio
    marginBottom: '15px',
    alignItems: 'center'
  };

  const radioLabelStyle = {
    marginLeft: '5px',
    cursor: 'pointer'
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Simular Inicio de Sesión">
      <form onSubmit={handleSubmit}>

        {/* --- Selector de Rol --- */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Iniciar sesión como:</label>
          <div style={radioContainerStyle}>
            <input
              type="radio"
              id="rol_estudiante"
              name="rol"
              value="estudiante"
              checked={rolInput === 'estudiante'}
              onChange={(e) => setRolInput(e.target.value)}
            />
            <label htmlFor="rol_estudiante" style={radioLabelStyle}>Estudiante</label>

            <input
              type="radio"
              id="rol_docente"
              name="rol"
              value="docente"
              checked={rolInput === 'docente'}
              onChange={(e) => setRolInput(e.target.value)}
            />
            <label htmlFor="rol_docente" style={radioLabelStyle}>Docente</label>
          </div>
        </div>

        {/* --- Input de ID --- */}
        <div>
          {/* Label dinámico */}
          <label htmlFor="userInputId" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            ID del {rolInput.charAt(0).toUpperCase() + rolInput.slice(1)}:
          </label>
          <input
            type="number"
            id="userInputId"
            value={idInput}
            onChange={(e) => setIdInput(e.target.value)}
            placeholder={`Ej: 1, 2, 3...`}
            style={inputStyle}
            autoFocus
            required // Hacer el campo requerido
            min="1"    // ID debe ser positivo
          />
        </div>

        {/* Botón de envío */}
        <button type="submit" style={buttonStyle}>Cambiar Usuario</button>

      </form>
    </Modal>
  );
};

export default StudentLoginModal;