import { Link } from 'react-router-dom';
export default function FilaCandidato({ candidato }) {
  return (
    <tr>
      <td>
        <strong>
          {candidato.nombres} {candidato.apellidos}
        </strong>
        <small>{candidato.correo}</small>
      </td>
      <td>
        {candidato.tipoDocumento} {candidato.numeroDocumento}
      </td>
      <td>{candidato.telefono}</td>
      <td>
        <Link className="enlace-boton" to={`/candidatos/${candidato.id}`}>
          Ver detalle<span className="solo-lector"> de {candidato.nombres}</span>
        </Link>
      </td>
    </tr>
  );
}
