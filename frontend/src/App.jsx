import { HashRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import AccesoUsuario from './components/AccesoUsuario.jsx';
import LayoutPrincipal from './components/LayoutPrincipal.jsx';
import MensajeEstado from './components/MensajeEstado.jsx';
import FormularioCandidato from './components/FormularioCandidato.jsx';
import PanelSeleccion from './pages/PanelSeleccion.jsx';
import DetalleCandidato from './pages/DetalleCandidato.jsx';
import EditarCandidato from './pages/EditarCandidato.jsx';
import Vacantes from './pages/Vacantes.jsx';
function Protegido() {
  const { usuario, cargando } = useAuth();
  if (cargando) return <MensajeEstado>Comprobando sesión…</MensajeEstado>;
  return usuario ? <LayoutPrincipal /> : <Navigate to="/acceso" replace />;
}
function SoloAnalista({ children }) {
  const { puedeEditar } = useAuth();
  return puedeEditar ? children : <Navigate to="/candidatos" replace />;
}
function Inicio() {
  return (
    <>
      <span className="etiqueta">TU ESPACIO DE TRABAJO</span>
      <h1>Un proceso claro, de principio a fin.</h1>
      <p>Organiza candidatos, consulta vacantes y acompaña cada postulación.</p>
      <div className="postulaciones">
        <Link className="tarjeta acceso-directo" to="/candidatos">
          <h2>Candidatos</h2>
          <p>Registra, busca y consulta personas.</p>
        </Link>
        <Link className="tarjeta acceso-directo" to="/vacantes">
          <h2>Vacantes</h2>
          <p>Revisa cargos y cupos disponibles.</p>
        </Link>
      </div>
    </>
  );
}
function Perfil() {
  const { usuario } = useAuth();
  return (
    <section className="tarjeta">
      <h1>Mi perfil</h1>
      <p>{usuario.nombre}</p>
      <p>{usuario.correo}</p>
      <p>Rol: {usuario.rol}</p>
      <p>Los permisos son verificados por el servidor en cada operación.</p>
    </section>
  );
}
function Ayuda() {
  const { usuario } = useAuth();
  return (
    <main className="ayuda tarjeta">
      <h1>Ayuda de acceso y uso</h1>
      <p>
        En el entorno académico puedes ingresar con analista@demo.local o coordinador@demo.local.
        Contraseña de práctica: Practica2026!
      </p>
      <p>
        Si no puedes ingresar, consulta al administrador del entorno. No se envían correos de
        recuperación desde esta demostración.
      </p>
      <ol>
        <li>Abre Candidatos para buscar o registrar.</li>
        <li>En Ver detalle consulta o crea postulaciones.</li>
        <li>El analista puede cambiar el estado y dejar una observación.</li>
        <li>Ver historial muestra cambios y responsables.</li>
      </ol>
      <Link to={usuario ? '/inicio' : '/acceso'}>Volver</Link>
    </main>
  );
}
function Rutas() {
  return (
    <Routes>
      <Route path="/acceso" element={<AccesoUsuario />} />
      <Route path="/ayuda" element={<Ayuda />} />
      <Route element={<Protegido />}>
        <Route path="/inicio" element={<Inicio />} />
        <Route path="/candidatos" element={<PanelSeleccion />} />
        <Route
          path="/candidatos/nuevo"
          element={
            <SoloAnalista>
              <>
                <h1>Registrar candidato</h1>
                <FormularioCandidato />
              </>
            </SoloAnalista>
          }
        />
        <Route path="/candidatos/:id" element={<DetalleCandidato />} />
        <Route
          path="/candidatos/:id/editar"
          element={
            <SoloAnalista>
              <EditarCandidato />
            </SoloAnalista>
          }
        />
        <Route path="/vacantes" element={<Vacantes />} />
        <Route path="/perfil" element={<Perfil />} />
      </Route>
      <Route path="/" element={<Navigate to="/inicio" replace />} />
      <Route
        path="*"
        element={
          <main className="ayuda tarjeta">
            <h1>Página no encontrada</h1>
            <Link to="/inicio">Volver al inicio</Link>
          </main>
        }
      />
    </Routes>
  );
}
// HashRouter permite recargar una ruta sin exigir reglas de reescritura al servidor.
export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <Rutas />
      </AuthProvider>
    </HashRouter>
  );
}
