const baseUrl = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');
let csrfToken;
export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}
async function getCsrfToken() {
  if (!csrfToken) {
    const response = await fetch(`${baseUrl}/auth/csrf`, { credentials: 'include' });
    if (!response.ok) throw new ApiError('No se pudo preparar la sesión.', response.status);
    csrfToken = await response.json();
  }
  return csrfToken;
}
export async function request(path, { method = 'GET', body, form = false } = {}) {
  const headers = { Accept: 'application/json' };
  try {
    if (!['GET', 'HEAD'].includes(method)) {
      const csrf = await getCsrfToken();
      headers[csrf.headerName] = csrf.token;
      headers['Content-Type'] = form ? 'application/x-www-form-urlencoded' : 'application/json';
    }
    const response = await fetch(`${baseUrl}${path}`, {
      method,
      credentials: 'include',
      headers,
      ...(body !== undefined && { body: form ? new URLSearchParams(body) : JSON.stringify(body) }),
    });
    const data = response.status === 204 ? null : await response.json();
    if (!response.ok) {
      if (response.status === 401 && path !== '/auth/login')
        window.dispatchEvent(new Event('sesion-expirada'));
      throw new ApiError(data?.message || 'No se pudo completar la operación.', response.status);
    }
    return data;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      'No se pudo conectar con la API. Comprueba que Spring Boot esté iniciado.',
      0,
    );
  }
}
export const api = {
  // Spring Security renueva el token CSRF al autenticar y al cerrar sesión.
  async login(correo, password) {
    const user = await request('/auth/login', {
      method: 'POST',
      body: { correo, password },
      form: true,
    });
    csrfToken = undefined;
    return user;
  },
  async logout() {
    await request('/auth/logout', { method: 'POST' });
    csrfToken = undefined;
  },
  me: () => request('/auth/me'),
  candidatos: (busqueda = '') => request(`/candidatos?busqueda=${encodeURIComponent(busqueda)}`),
  candidato: (id) => request(`/candidatos/${id}`),
  guardarCandidato: (datos, id) =>
    request(id ? `/candidatos/${id}` : '/candidatos', { method: id ? 'PUT' : 'POST', body: datos }),
  vacantes: () => request('/vacantes'),
  postulaciones: (id) => request(`/candidatos/${id}/postulaciones`),
  postular: (idCandidato, idVacante) =>
    request('/postulaciones', { method: 'POST', body: { idCandidato, idVacante } }),
  cambiarEstado: (id, estado, observacion) =>
    request(`/postulaciones/${id}/estado`, { method: 'PATCH', body: { estado, observacion } }),
  historial: (id) => request(`/postulaciones/${id}/historial`),
};
