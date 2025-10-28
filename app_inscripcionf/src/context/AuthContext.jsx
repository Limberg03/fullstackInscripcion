// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // ✅ Inicializamos 'usuario' con null temporalmente
  const [usuario, setUsuario] = useState(null);
  // ✅ Estado adicional para saber si ya cargamos desde localStorage
  const [authLoading, setAuthLoading] = useState(true);

  // Al cargar, intentamos leer el usuario guardado
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        setUsuario(JSON.parse(savedUser));
      } else {
        // Valor por defecto: Estudiante 3
        setUsuario({ id: 3, rol: 'estudiante', nombre: 'Estudiante 3 (Default)' });
      }
    } catch (error) {
      console.error("Error al cargar usuario desde localStorage:", error);
      // Fallback si hay error al parsear
      setUsuario({ id: 3, rol: 'estudiante', nombre: 'Estudiante 3 (Default)' });
    } finally {
      // ✅ Marcamos que la carga inicial ha terminado
      setAuthLoading(false);
    }
  }, []); // Se ejecuta solo una vez al montar

  // Función genérica de login
  const login = (id, rol) => {
    const numId = parseInt(id, 10);
    if (isNaN(numId) || numId <= 0) return false;

    const usuarioLogueado = {
      id: numId,
      rol: rol,
      nombre: `${rol.charAt(0).toUpperCase() + rol.slice(1)} ${numId}`
    };

    localStorage.setItem('currentUser', JSON.stringify(usuarioLogueado));
    setUsuario(usuarioLogueado);
    return true;
  };

  const logout = () => {
    localStorage.removeItem('currentUser');
    setUsuario(null); // Podrías redirigir o poner un estado 'invitado'
  };

  // ✅ Exponemos 'authLoading' para que los componentes sepan cuándo es seguro leer 'usuario'
  const value = {
    usuario,
    authLoading, // Estado de carga de la autenticación
    login,
    logout,
  };

  // ✅ No renderizamos los hijos hasta que la autenticación haya cargado
  if (authLoading) {
    return <div>Cargando sesión...</div>; // O un spinner global
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};