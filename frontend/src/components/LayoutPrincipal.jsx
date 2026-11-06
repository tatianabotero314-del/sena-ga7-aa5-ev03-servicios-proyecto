import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import MensajeEstado from './MensajeEstado.jsx';
export default function LayoutPrincipal() {
  const { usuario, salir } = useAuth();
  const [error, setError] = useState('');
  async function cerrar() {
    try {
      await salir();
    } catch (e) {
      setError(e.message);
    }
  }
  return (
    <>
      <a className="saltar" href="#contenido">
        Saltar al contenido
      </a>
      <header className="cabecera">
        <div>
          <strong>Selección de personal</strong>
          <small>Gestión de talento · Servicios generales</small>
        </div>
        <div className="sesion">
          <span>
            {usuario.nombre}
            <small>{usuario.rol}</small>
          </span>
          <button onClick={cerrar}>Cerrar sesión</button>
        </div>
      </header>
      <div className="estructura">
        <nav aria-label="Navegación principal">
          <NavLink to="/inicio">Inicio</NavLink>
          <NavLink to="/candidatos">Candidatos</NavLink>
          <NavLink to="/vacantes">Vacantes</NavLink>
          <NavLink to="/perfil">Mi perfil</NavLink>
          <NavLink to="/ayuda">Ayuda</NavLink>
        </nav>
        <main id="contenido">
          <MensajeEstado tipo="error">{error}</MensajeEstado>
          <Outlet />
        </main>
      </div>
      <footer>Proyecto formativo SENA · Laura Tatiana Ciro Botero · 2026</footer>
    </>
  );
}
