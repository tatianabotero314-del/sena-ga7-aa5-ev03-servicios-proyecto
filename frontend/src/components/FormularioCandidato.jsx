import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CampoFormulario from './CampoFormulario.jsx';
import MensajeEstado from './MensajeEstado.jsx';
import { CAMPOS, validarCandidato } from '../services/validaciones.js';
import { api } from '../services/api.js';
export default function FormularioCandidato({ candidatoInicial = {} }) {
  const navegar = useNavigate();
  const [datos, setDatos] = useState(() =>
    Object.fromEntries(CAMPOS.map(([k]) => [k, candidatoInicial[k] || ''])),
  );
  const [errores, setErrores] = useState({});
  const [error, setError] = useState('');
  const [pendiente, setPendiente] = useState(false);
  async function guardar(e) {
    e.preventDefault();
    const fallos = validarCandidato(datos);
    setErrores(fallos);
    if (Object.keys(fallos).length) return;
    setPendiente(true);
    setError('');
    try {
      const limpio = Object.fromEntries(Object.entries(datos).map(([k, v]) => [k, v.trim()]));
      const candidato = await api.guardarCandidato(limpio, candidatoInicial.id);
      // Solo se navega después de que el servidor confirme la persistencia.
      navegar(`/candidatos/${candidato.id}`, {
        state: { mensaje: 'Datos del candidato guardados correctamente.' },
      });
    } catch (e) {
      setError(e.message);
    } finally {
      setPendiente(false);
    }
  }
  return (
    <form className="tarjeta" noValidate onSubmit={guardar}>
      <MensajeEstado tipo="error">{error}</MensajeEstado>
      <div className="rejilla-formulario">
        {CAMPOS.map(([campo, etiqueta, max]) => (
          <CampoFormulario
            key={campo}
            id={campo}
            etiqueta={etiqueta}
            maxLength={max}
            required
            type={campo === 'correo' ? 'email' : 'text'}
            value={datos[campo]}
            error={errores[campo]}
            onChange={(e) => setDatos({ ...datos, [campo]: e.target.value })}
          />
        ))}
      </div>
      <div className="acciones">
        <button className="primario" disabled={pendiente}>
          {pendiente ? 'Guardando…' : 'Guardar candidato'}
        </button>
        <button
          type="button"
          disabled={pendiente}
          onClick={() =>
            navegar(candidatoInicial.id ? `/candidatos/${candidatoInicial.id}` : '/candidatos')
          }
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
