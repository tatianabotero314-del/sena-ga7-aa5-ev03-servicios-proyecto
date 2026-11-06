import { useState } from 'react';
import { ESTADOS } from '../services/validaciones.js';
import { api } from '../services/api.js';
import MensajeEstado from './MensajeEstado.jsx';
export default function EstadoPostulacion({ postulacion, puedeEditar, onActualizada }) {
  const [estado, setEstado] = useState(postulacion.estado);
  const [observacion, setObservacion] = useState('');
  const [error, setError] = useState('');
  const [pendiente, setPendiente] = useState(false);
  async function guardar(e) {
    e.preventDefault();
    if (!observacion.trim()) {
      setError('Explica el cambio de estado.');
      return;
    }
    setPendiente(true);
    setError('');
    try {
      await api.cambiarEstado(postulacion.id, estado, observacion.trim());
      setObservacion('');
      onActualizada();
    } catch (e) {
      setError(e.message);
    } finally {
      setPendiente(false);
    }
  }
  return (
    <>
      <span className={`estado estado-${postulacion.estado.replace(' ', '-').toLowerCase()}`}>
        {postulacion.estado}
      </span>
      {puedeEditar && (
        <form className="cambio-estado" onSubmit={guardar}>
          <MensajeEstado tipo="error">{error}</MensajeEstado>
          <label htmlFor={`estado-${postulacion.id}`}>Nuevo estado</label>
          <select
            id={`estado-${postulacion.id}`}
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
          >
            {ESTADOS.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
          <label htmlFor={`observacion-${postulacion.id}`}>Observación</label>
          <textarea
            id={`observacion-${postulacion.id}`}
            required
            maxLength={500}
            value={observacion}
            onChange={(e) => setObservacion(e.target.value)}
          />
          <button disabled={pendiente || estado === postulacion.estado}>
            {pendiente ? 'Guardando…' : 'Guardar estado'}
          </button>
        </form>
      )}
    </>
  );
}
