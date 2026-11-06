import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api.js';
import FormularioCandidato from '../components/FormularioCandidato.jsx';
import MensajeEstado from '../components/MensajeEstado.jsx';
export default function EditarCandidato() {
  const { id } = useParams();
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    let activo = true;
    api
      .candidato(id)
      .then((d) => {
        if (activo) setDatos(d);
      })
      .catch((e) => {
        if (activo) setError(e.message);
      });
    return () => {
      activo = false;
    };
  }, [id]);
  return (
    <>
      <Link to={`/candidatos/${id}`}>← Volver al detalle</Link>
      <h1>Editar candidato</h1>
      <MensajeEstado tipo="error">{error}</MensajeEstado>
      {datos ? (
        <FormularioCandidato candidatoInicial={datos} />
      ) : (
        !error && <MensajeEstado>Cargando candidato…</MensajeEstado>
      )}
    </>
  );
}
