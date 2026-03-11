import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
import Campeonato from './pages/campeonato/Campeonato';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { PrivateRoute } from './components/PrivateRoute';

// Admin
import AdminLogin from './admin/AdminLogin';
import AdminDashboard from './admin/AdminDashboard';
import AdminChampionship from './pages/admin/AdminChampionship';
import { AdminRoute } from './admin/AdminRoute';

import './App.css';

function App() {
  return (
    <BrowserRouter>
      <GoogleOAuthProvider clientId="607297815455-2fv5dq6t7ekuts0ls3gepkkdl65sts6k.apps.googleusercontent.com">
        <AuthProvider>
          <ScrollToTop />
          <Routes>

            {/* ─── ROTAS PÚBLICAS (com Header e Footer) ─── */}
            <Route path="/*" element={
              <div className="App">
                <Header />
                <main>
                  <Routes>
                    <Route path="/"          element={<Home />} />
                    <Route path="/login"     element={<Login />} />
                    <Route path="/register"  element={<Register />} />
                    <Route path="/reservas"   element={<PrivateRoute><Reservas /></PrivateRoute>} />
                    <Route path="/sobre"      element={<Sobre />} />
                    <Route path="/estrutura"  element={<Estrutura />} />
                    <Route path="/esportes"   element={<Esportes />} />
                    <Route path="/eventos"    element={<Eventos />} />

                    <Route path="/campeonato" element={<PrivateRoute><Campeonato /></PrivateRoute>} />
                  </Routes>
                </main>
                <Footer />
              </div>
            } />

            {/* ─── ROTAS ADMIN (sem Header/Footer do site) ─── */}
            <Route path="/admin/login"       element={<AdminLogin />} />
            <Route path="/admin"             element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/dashboard"   element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/campeonato"  element={<AdminRoute><AdminChampionship /></AdminRoute>} />

          </Routes>
        </AuthProvider>
      </GoogleOAuthProvider>
    </BrowserRouter>
  );
}

export default App;
