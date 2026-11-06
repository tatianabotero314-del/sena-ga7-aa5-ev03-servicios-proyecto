export default function BuscadorCandidatos({ termino, onBuscar }) {
  return (
    <div className="buscador">
      <label htmlFor="busqueda">Buscar candidato</label>
      <input
        id="busqueda"
        type="search"
        placeholder="Nombre, apellido o documento"
        value={termino}
        onChange={(e) => onBuscar(e.target.value)}
      />
    </div>
  );
}
