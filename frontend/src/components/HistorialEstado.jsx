import { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import MensajeEstado from './MensajeEstado.jsx';
export default function HistorialEstado({ postulacion, onCerrar, revision }) {
  const [cambios, setCambios] = useState([]);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);
  useEffect(() => {
    let activo = true;
    setCargando(true);
    setError('');
    api
      .historial(postulacion.id)
      .then((d) => {
        if (activo) setCambios(d);
      })
      .catch((e) => {
        if (activo) setError(e.message);
      })
      .finally(() => {
        if (activo) setCargando(false);
      });
    return () => {
      activo = false;
    };
  }, [postulacion.id, revision]);
  return (
    <section className="tarjeta historial" aria-label="Historial de la postulación">
      <div className="titulo-fila">
        <h2>Historial · {postulacion.cargo}</h2>
        <button onClick={onCerrar}>Cerrar historial</button>
      </div>
      <MensajeEstado tipo="error">{error}</MensajeEstado>
      {cargando ? (
        <MensajeEstado>Cargando historial…</MensajeEstado>
      ) : (
        <ol>
          {cambios.map((c) => (
            <li key={c.id}>
              <strong>{c.estado}</strong>
              <p>{c.observacion}</p>
              <small>
                {new Date(c.fecha).toLocaleString('es-CO')} · {c.responsable}
              </small>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
