export default function CampoFormulario({ id, etiqueta, error, ...props }) {
  return (
    <div className="campo">
      <label htmlFor={id}>{etiqueta}</label>
      <input
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
      />
      {error && (
        <small id={`${id}-error`} className="error-campo">
          {error}
        </small>
      )}
    </div>
  );
}
