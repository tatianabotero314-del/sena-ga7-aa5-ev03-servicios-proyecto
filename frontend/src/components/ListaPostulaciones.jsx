import EstadoPostulacion from './EstadoPostulacion.jsx';
import MensajeEstado from './MensajeEstado.jsx';
export default function ListaPostulaciones({
  postulaciones,
  puedeEditar,
  onActualizada,
  onVerHistorial,
}) {
  return (
    <section>
      <h2>Postulaciones</h2>
      {!postulaciones.length && (
        <MensajeEstado>Este candidato todavía no tiene postulaciones.</MensajeEstado>
      )}
      <div className="postulaciones">
        {postulaciones.map((p) => (
          <article className="tarjeta" key={`${p.id}-${p.estado}`}>
            <h3>{p.cargo}</h3>
            <p className="nota">
              Postulación #{p.id} · {p.fecha.slice(0, 10)}
            </p>
            <EstadoPostulacion
              postulacion={p}
              puedeEditar={puedeEditar}
              onActualizada={onActualizada}
            />
            <button className="historial-boton" onClick={() => onVerHistorial(p)}>
              Ver historial<span className="solo-lector"> de {p.cargo}</span>
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
