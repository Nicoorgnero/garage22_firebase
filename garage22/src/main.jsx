import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import './styles/globals.css';

import { AuthProvider }    from './context/AuthContext';
import { ProtectedRoute }  from './components/ProtectedRoute';
import { PublicLayout }    from './components/PublicLayout';

import { Home }   from './pages/Home';
import { Fechas } from './pages/Fechas';
import { Login }  from './pages/Login';
import { Admin }  from './pages/Admin';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rutas públicas — con Navbar + Footer */}
          <Route element={<PublicLayout />}>
            <Route path="/"       element={<Home />} />
            <Route path="/fechas" element={<Fechas />} />
          </Route>

          {/* Login — layout independiente (sin Navbar pública) */}
          <Route path="/login" element={<Login />} />

          {/* Admin — protegido; redirige a /login si no hay sesión */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
);
