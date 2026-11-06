import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import ListaPostulaciones from '../components/ListaPostulaciones.jsx';
import FormularioPostulacion from '../components/FormularioPostulacion.jsx';
import HistorialEstado from '../components/HistorialEstado.jsx';
import MensajeEstado from '../components/MensajeEstado.jsx';
export default function DetalleCandidato() {
  const { id } = useParams();
  const ubicacion = useLocation();
  const { puedeEditar } = useAuth();
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  const [seleccion, setSeleccion] = useState(null);
  const [mensaje, setMensaje] = useState(ubicacion.state?.mensaje || '');
  const [pendiente, setPendiente] = useState(true);
  useEffect(() => {
    let activo = true;
    setError('');
    setPendiente(true);
    Promise.all([api.candidato(id), api.postulaciones(id), api.vacantes()])
      .then(([candidato, postulaciones, vacantes]) => {
        if (activo) setDatos({ candidato, postulaciones, vacantes });
      })
      .catch((e) => {
        if (activo) setError(e.message);
      })
      .finally(() => {
        if (activo) setPendiente(false);
      });
    return () => {
      activo = false;
    };
  }, [id, revision]);
  function actualizar() {
    setRevision((x) => x + 1);
    setMensaje('Operación guardada correctamente.');
  }
  return (
    <>
      <Link to="/candidatos">← Volver a candidatos</Link>
      <MensajeEstado tipo="error" onReintentar={() => setRevision((x) => x + 1)}>
        {error}
      </MensajeEstado>
      <MensajeEstado tipo="exito">{mensaje}</MensajeEstado>
      {pendiente && <MensajeEstado>Cargando detalle…</MensajeEstado>}
      {datos && !error && (
        <>
          <div className="titulo-fila">
            <h1>
              {datos.candidato.nombres} {datos.candidato.apellidos}
            </h1>
            {puedeEditar && (
              <Link className="enlace-boton" to={`/candidatos/${id}/editar`}>
                Editar candidato
              </Link>
            )}
          </div>
          <section className="tarjeta">
            <h2>Información del candidato</h2>
            <dl className="datos">
              <div>
                <dt>Documento</dt>
                <dd>
                  {datos.candidato.tipoDocumento} {datos.candidato.numeroDocumento}
                </dd>
              </div>
              <div>
                <dt>Correo</dt>
                <dd>{datos.candidato.correo}</dd>
              </div>
              <div>
                <dt>Teléfono</dt>
                <dd>{datos.candidato.telefono}</dd>
              </div>
            </dl>
          </section>
          <ListaPostulaciones
            postulaciones={datos.postulaciones}
            puedeEditar={puedeEditar && !pendiente}
            onActualizada={actualizar}
            onVerHistorial={setSeleccion}
          />
          {seleccion && (
            <HistorialEstado
              postulacion={seleccion}
              revision={revision}
              onCerrar={() => setSeleccion(null)}
            />
          )}
          {puedeEditar && (
            <FormularioPostulacion
              idCandidato={Number(id)}
              vacantes={datos.vacantes}
              onCreada={actualizar}
            />
          )}
        </>
      )}
    </>
  );
}
