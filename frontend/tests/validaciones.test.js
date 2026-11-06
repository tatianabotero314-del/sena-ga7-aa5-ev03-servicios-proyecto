import { describe, it, expect } from 'vitest';
import { validarCandidato } from '../src/services/validaciones.js';
const valido = {
  tipoDocumento: 'CC',
  numeroDocumento: '00123',
  nombres: 'Ana',
  apellidos: 'Ejemplo',
  correo: 'ana@example.com',
  telefono: '+57 300 000 0000',
};
describe('reglas de candidatos', () => {
  it('acepta datos completos y conserva el documento como texto', () => {
    expect(validarCandidato(valido)).toEqual({});
    expect(valido.numeroDocumento).toBe('00123');
  });
  it('rechaza espacios, correo incorrecto y longitudes excesivas', () => {
    const e = validarCandidato({
      ...valido,
      nombres: '  ',
      correo: 'sin-arroba',
      telefono: '1'.repeat(26),
    });
    expect(Object.keys(e).sort()).toEqual(['correo', 'nombres', 'telefono']);
  });
  it('no impone que el documento sea un número JavaScript', () =>
    expect(validarCandidato({ ...valido, numeroDocumento: 'AB-001' })).toEqual({}));
});
