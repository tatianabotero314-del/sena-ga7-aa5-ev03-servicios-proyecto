import { useState } from 'react';
import SelectorVacante from './SelectorVacante.jsx';
import { api } from '../services/api.js';
import MensajeEstado from './MensajeEstado.jsx';
export default function FormularioPostulacion({ idCandidato, vacantes, onCreada }) {
  const [vacante, setVacante] = useState('');
  const [error, setError] = useState('');
  const [pendiente, setPendiente] = useState(false);
  async function crear(e) {
    e.preventDefault();
    setPendiente(true);
    setError('');
    try {
      await api.postular(idCandidato, Number(vacante));
      setVacante('');
      onCreada();
    } catch (e) {
      setError(e.message);
    } finally {
      setPendiente(false);
    }
  }
  return (
    <form className="tarjeta" onSubmit={crear}>
      <h2>Nueva postulación</h2>
      <MensajeEstado tipo="error">{error}</MensajeEstado>
      <SelectorVacante vacantes={vacantes} valor={vacante} onChange={setVacante} />
      <button className="primario" disabled={pendiente || !vacante}>
        {pendiente ? 'Guardando…' : 'Crear postulación'}
      </button>
    </form>
  );
}
