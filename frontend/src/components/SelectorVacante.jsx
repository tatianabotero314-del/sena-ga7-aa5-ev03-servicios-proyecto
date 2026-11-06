export default function SelectorVacante({ vacantes, valor, onChange }) {
  return (
    <div className="campo">
      <label htmlFor="vacante">Vacante abierta</label>
      <select id="vacante" required value={valor} onChange={(e) => onChange(e.target.value)}>
        <option value="">Selecciona una vacante</option>
        {vacantes
          .filter((v) => v.estado === 'Abierta')
          .map((v) => (
            <option key={v.id} value={v.id}>
              {v.cargo} · {v.cupos} cupos
            </option>
          ))}
      </select>
    </div>
  );
}
