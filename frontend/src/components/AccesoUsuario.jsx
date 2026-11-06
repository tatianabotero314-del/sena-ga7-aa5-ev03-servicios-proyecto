import { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import CampoFormulario from './CampoFormulario.jsx';
import MensajeEstado from './MensajeEstado.jsx';
export default function AccesoUsuario() {
  const { usuario, ingresar, error: errorSesion } = useAuth();
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [pendiente, setPendiente] = useState(false);
  if (usuario) return <Navigate to="/candidatos" replace />;
  async function handleSubmit(e) {
    e.preventDefault();
    setPendiente(true);
    setError('');
    try {
      await ingresar(correo, password);
    } catch (e) {
      setError(e.message);
    } finally {
      setPendiente(false);
    }
  }
  return (
    <main className="acceso">
      <div className="acceso-presentacion">
        <span className="etiqueta">RECURSOS HUMANOS</span>
        <h1>Selección de personal</h1>
        <p>Personas, oportunidades y procesos en un solo lugar.</p>
        <p className="subtle">Proyecto formativo · SENA · 2026</p>
      </div>
      <section className="tarjeta">
        <h2>Bienvenida a tu espacio</h2>
        <p>Ingresa con tu cuenta de Recursos Humanos.</p>
        <MensajeEstado tipo="error">{error || errorSesion}</MensajeEstado>
        <form onSubmit={handleSubmit}>
          <CampoFormulario
            id="correo"
            etiqueta="Correo electrónico"
            type="email"
            autoComplete="username"
            required
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
          />
          <CampoFormulario
            id="password"
            etiqueta="Contraseña"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="primario ancho" disabled={pendiente}>
            {pendiente ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>
        <Link to="/ayuda">Ayuda de acceso</Link>
        <p className="nota">Entorno académico. Usa únicamente datos ficticios.</p>
      </section>
    </main>
  );
}
