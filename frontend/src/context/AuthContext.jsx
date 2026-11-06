import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api.js';
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    let activo = true;
    api
      .me()
      .then((user) => {
        if (activo) setUsuario(user);
      })
      .catch((e) => {
        if (activo && e.status !== 401) setError(e.message);
      })
      .finally(() => {
        if (activo) setCargando(false);
      });
    const expirar = () => {
      setUsuario(null);
      setError('La sesión terminó. Vuelve a ingresar.');
    };
    window.addEventListener('sesion-expirada', expirar);
    return () => {
      activo = false;
      window.removeEventListener('sesion-expirada', expirar);
    };
  }, []);
  async function ingresar(correo, password) {
    setUsuario(await api.login(correo, password));
    setError('');
  }
  async function salir() {
    await api.logout();
    setUsuario(null);
  }
  return (
    <AuthContext.Provider
      value={{
        usuario,
        cargando,
        error,
        ingresar,
        salir,
        puedeEditar: usuario?.rol === 'Analista',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  return useContext(AuthContext);
}
