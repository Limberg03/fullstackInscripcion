import './App.css'
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import InscriptionPage from './pages/InscriptionPage';

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
        <Route path="/" element={<InscriptionPage />} />
        {/* <Route path="/perfil" element={<ProfilePage />} /> */}
      </Routes>
    </Router>
    </AuthProvider>
  );
}

export default App;


/*
/*

*/