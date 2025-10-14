import './App.css'
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import InscriptionPage from './pages/InscriptionPage';
import MateriasListPage from './pages/MateriasListPage';

function App() {
  return (
    <AuthProvider>
    <Router>
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
        <Header />
       <Routes>
          {/* ✅ La ruta raíz ahora muestra la lista de materias */}
          <Route path="/" element={<MateriasListPage />} />
          {/* ✅ La página de inscripción ahora es una ruta de detalle */}
          <Route path="/materia/:materiaId" element={<InscriptionPage />} />
        </Routes>
    </Router>
    </AuthProvider>
  );
}

export default App;


/*
/*

*/