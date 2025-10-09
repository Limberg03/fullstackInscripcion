import './App.css'
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import InscriptionPage from './pages/InscriptionPage';

function App() {
  return (
    <Router>
      {/* El ToastContainer permite que las notificaciones aparezcan en cualquier lugar */}
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

      <Routes>
        <Route path="/" element={<InscriptionPage />} />
        {/* Aquí podrías añadir más rutas en el futuro */}
        {/* <Route path="/perfil" element={<ProfilePage />} /> */}
      </Routes>
    </Router>
  );
}

export default App;