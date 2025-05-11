import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop'; 
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Sobre from './pages/sobre/Sobre';
import Estrutura from './pages/estrutura/estrutura';
import Esportes from './pages/esportes/Esportes';
import Eventos from './pages/eventos/Eventos';
import Register from './pages/auth/Register';
import Reservas from './pages/reservas/Reservas';
import Tournaments from './pages/tournaments/Tournament'
import { GoogleOAuthProvider } from '@react-oauth/google';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <GoogleOAuthProvider clientId="607297815455-2fv5dq6t7ekuts0ls3gepkkdl65sts6k.apps.googleusercontent.com">
      <AuthProvider>
        <ScrollToTop /> 
        <div className="App">
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/reservas" element={<Reservas />} />
              <Route path="/sobre" element={<Sobre />} />
              <Route path="/estrutura" element={<Estrutura />} />
              <Route path="/esportes" element={<Esportes />} />
              <Route path='/eventos' element={<Eventos />} />
              <Route path="/tournaments" element={<Tournaments />} />
              {/* Adicione outras rotas conforme necessário */}
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
      </GoogleOAuthProvider>
    </BrowserRouter>
  );
}

export default App;