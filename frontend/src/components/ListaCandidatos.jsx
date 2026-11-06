import FilaCandidato from './FilaCandidato.jsx';
import MensajeEstado from './MensajeEstado.jsx';
export default function ListaCandidatos({ candidatos }) {
  if (!candidatos.length)
    return <MensajeEstado>No hay candidatos que coincidan con la búsqueda.</MensajeEstado>;
  return (
    <div className="tabla-scroll">
      <table>
        <caption className="solo-lector">Resultados de candidatos</caption>
        <thead>
          <tr>
            <th scope="col">Candidato</th>
            <th scope="col">Documento</th>
            <th scope="col">Teléfono</th>
            <th scope="col">Acción</th>
          </tr>
        </thead>
        <tbody>
          {candidatos.map((c) => (
            <FilaCandidato key={c.id} candidato={c} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
