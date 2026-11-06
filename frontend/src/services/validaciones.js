export const ESTADOS = ['En proceso', 'Seleccionado', 'Rechazado'];
export const CAMPOS = [
  ['tipoDocumento', 'Tipo de documento', 10],
  ['numeroDocumento', 'Número de documento', 30],
  ['nombres', 'Nombres', 80],
  ['apellidos', 'Apellidos', 80],
  ['correo', 'Correo electrónico', 150],
  ['telefono', 'Teléfono', 25],
];
export function validarCandidato(datos) {
  const errores = {};
  for (const [campo, etiqueta, max] of CAMPOS) {
    const valor = String(datos[campo] || '').trim();
    if (!valor) errores[campo] = `${etiqueta}: este campo es obligatorio.`;
    else if (valor.length > max) errores[campo] = `Máximo ${max} caracteres.`;
  }
  if (datos.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.correo.trim()))
    errores.correo = 'Escribe un correo válido.';
  return errores;
}
