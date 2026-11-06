# Contrato de los servicios del proyecto

Base local: http://127.0.0.1:8081. Respuestas JSON salvo 204.

Los POST/PUT/PATCH necesitan la cookie y el token obtenido en GET /api/auth/csrf. El login recibe formulario; las demás escrituras reciben application/json.

Después de autenticar/cerrar sesión se obtiene otro token. Un GET sin sesión devuelve 401; una mutación sin CSRF puede responder 403 antes de comprobar la sesión.

Errores: {"message":"explicación"}. 400 datos/JSON/parámetros; 401 no autenticado o credenciales incorrectas; 403 permiso/CSRF; 404 registro inexistente; 409 documento/postulación repetidos, vacante cerrada o estado repetido.

## GET /api/auth/csrf — Obtener protección CSRF

Permiso: Público.

Entrada: Sin cuerpo. Conservar la cookie recibida.

Respuesta correcta: 200. token y headerName; solicitar otra vez después del login/logout.

## POST /api/auth/login — Iniciar sesión

Permiso: Público + CSRF.

Entrada: Formulario correo=analista@demo.local y password=Practica2026!.

Respuesta correcta: 200. id, nombre, correo y rol; establece una cookie de sesión HttpOnly.

## GET /api/auth/me — Consultar usuario actual

Permiso: Sesión.

Entrada: Sin cuerpo.

Respuesta correcta: 200. id, nombre, correo y rol, sin contraseña/hash.

## POST /api/auth/logout — Cerrar sesión

Permiso: Cookie de sesión y CSRF.

Entrada: Sin cuerpo.

Respuesta correcta: 204. Sin cuerpo; invalida la sesión.

## GET /api/candidatos — Listar y buscar candidatos

Permiso: Ambos roles.

Entrada: busqueda opcional, máximo 100 caracteres; nombre, apellido o documento.

Respuesta correcta: 200. Lista de candidatos; [] si no hay coincidencias.

## GET /api/candidatos/{id} — Consultar candidato

Permiso: Ambos roles.

Entrada: id entero positivo en la ruta.

Respuesta correcta: 200. Objeto candidato con id y los seis datos personales.

## POST /api/candidatos — Registrar candidato

Permiso: Analista + CSRF.

Entrada: JSON CandidatoInput.

Respuesta correcta: 201. Objeto candidato con el id generado; 409 si se repite tipo/número de documento.

## PUT /api/candidatos/{id} — Actualizar candidato

Permiso: Analista + CSRF.

Entrada: id entero positivo y JSON completo CandidatoInput.

Respuesta correcta: 200. Objeto candidato actualizado; no se cambia su identificador.

## GET /api/vacantes — Consultar vacantes disponibles

Permiso: Ambos roles.

Entrada: Sin cuerpo.

Respuesta correcta: 200. Lista con id, cargo, descripcion, cupos, estado y fechaApertura.

## GET /api/candidatos/{id}/postulaciones — Consultar procesos del candidato

Permiso: Ambos roles.

Entrada: id de candidato entero positivo.

Respuesta correcta: 200. Lista con id, idVacante, cargo, estado y fecha; [] si no tiene procesos.

## POST /api/postulaciones — Postular a una vacante

Permiso: Analista + CSRF.

Entrada: JSON con idCandidato e idVacante, enteros positivos.

Respuesta correcta: 201. Objeto {id}; crea estado En proceso e historial inicial en una transacción.

## PATCH /api/postulaciones/{id}/estado — Actualizar estado de una postulación

Permiso: Analista + CSRF.

Entrada: id positivo; JSON estado y observacion.

Respuesta correcta: 204. Sin cuerpo; actualiza estado e inserta historial en una transacción.

## GET /api/postulaciones/{id}/historial — Consultar trazabilidad

Permiso: Ambos roles.

Entrada: id de postulación entero positivo.

Respuesta correcta: 200. Lista ordenada con id, estado, responsable, observacion y fecha.

## CandidatoInput

Campos texto: tipoDocumento (1–10), numeroDocumento (1–30), nombres (1–80), apellidos (1–80), correo (formato email, máximo 150), telefono (1–25). Todos obligatorios; no se admiten solo espacios.

Ejemplo: {"tipoDocumento":"CC","numeroDocumento":"DEMO-100","nombres":"María","apellidos":"Prueba","correo":"maria@example.com","telefono":"3001234567"}.

## PostulacionInput

{"idCandidato":1,"idVacante":1}. Ambos deben ser enteros positivos, existir y corresponder a una vacante abierta. No se permite repetir la misma pareja.

## EstadoInput

{"estado":"Seleccionado","observacion":"Entrevista aprobada"}. Estados: En proceso, Seleccionado, Rechazado. Observación obligatoria, máximo 500 caracteres. Se permite pasar a cualquier estado distinto de esos tres; el responsable se toma de la sesión.

## Límites del módulo

No hay borrado de candidatos/historial ni administración de usuarios o vacantes. Las vacantes se precargan para la práctica. Los cupos no representan contrataciones y Seleccionado no significa Contratado.
