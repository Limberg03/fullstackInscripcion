
import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

   const [currentStudentId, setCurrentStudentId] = useState(() => {
    const savedStudentId = localStorage.getItem('currentStudentId');
    return savedStudentId ? JSON.parse(savedStudentId) : 3;
  });


    useEffect(() => {
    localStorage.setItem('currentStudentId', JSON.stringify(currentStudentId));
  }, [currentStudentId]);

  const login = (studentId) => {
    const id = parseInt(studentId, 10);
    if (!isNaN(id) && id > 0) {
      setCurrentStudentId(id);
      return true;
    }
    return false;
  };

  const value = {
    currentStudentId,
    login,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};