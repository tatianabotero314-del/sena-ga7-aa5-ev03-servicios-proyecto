import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import BuscadorCandidatos from '../components/BuscadorCandidatos.jsx';
import ListaCandidatos from '../components/ListaCandidatos.jsx';
import MensajeEstado from '../components/MensajeEstado.jsx';
export default function PanelSeleccion() {
  const { puedeEditar } = useAuth();
  const [termino, setTermino] = useState('');
  const [datos, setDatos] = useState([]);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let activo = true;
    setCargando(true);
    setError('');
    const timer = setTimeout(
      () =>
        api
          .candidatos(termino)
          .then((d) => {
            if (activo) setDatos(d);
          })
          .catch((e) => {
            if (activo) setError(e.message);
          })
          .finally(() => {
            if (activo) setCargando(false);
          }),
      250,
    );
    return () => {
      activo = false;
      clearTimeout(timer);
    };
  }, [termino, revision]);
  return (
    <>
      <span className="etiqueta">PERSONAS Y OPORTUNIDADES</span>
      <div className="titulo-fila">
        <div>
          <h1>Candidatos</h1>
          <p>Encuentra personas y acompaña cada proceso de selección.</p>
        </div>
        {puedeEditar && (
          <Link className="primario enlace-boton" to="/candidatos/nuevo">
            Registrar candidato
          </Link>
        )}
      </div>
      <section className="tarjeta">
        <BuscadorCandidatos termino={termino} onBuscar={setTermino} />
        <MensajeEstado tipo="error" onReintentar={() => setRevision((x) => x + 1)}>
          {error}
        </MensajeEstado>
        {cargando ? (
          <MensajeEstado>Cargando candidatos…</MensajeEstado>
        ) : (
          !error && (
            <>
              <p className="nota">{datos.length} candidatos encontrados</p>
              <ListaCandidatos candidatos={datos} />
            </>
          )
        )}
      </section>
    </>
  );
}
