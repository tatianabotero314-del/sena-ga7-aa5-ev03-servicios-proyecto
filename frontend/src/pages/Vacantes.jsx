import { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import MensajeEstado from '../components/MensajeEstado.jsx';
export default function Vacantes() {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    let activo = true;
    api
      .vacantes()
      .then((d) => {
        if (activo) setDatos(d);
      })
      .catch((e) => {
        if (activo) setError(e.message);
      });
    return () => {
      activo = false;
    };
  }, []);
  return (
    <>
      <span className="etiqueta">OPORTUNIDADES</span>
      <h1>Vacantes</h1>
      <p>Consulta las necesidades del equipo de servicios generales.</p>
      <MensajeEstado tipo="error">{error}</MensajeEstado>
      {!datos && !error && <MensajeEstado>Cargando vacantes…</MensajeEstado>}
      <div className="postulaciones">
        {datos?.map((v) => (
          <article className="tarjeta" key={v.id}>
            <span className="estado">{v.estado}</span>
            <h2>{v.cargo}</h2>
            <p>{v.descripcion}</p>
            <strong>{v.cupos} cupos</strong>
            <p className="nota">Apertura: {v.fechaApertura}</p>
          </article>
        ))}
      </div>
    </>
  );
}
