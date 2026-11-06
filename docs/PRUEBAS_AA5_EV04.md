# API del proyecto - AA5-EV04
Laura Tatiana Ciro Botero - SENA - 2026.

Importar postman/AA5_EV04.postman_collection.json en Postman. Iniciar el backend de AA5-EV03 en http://127.0.0.1:8081. Ejecutar toda la colección en orden, una iteración. Usa 60 solicitudes (38 casos y 22 intercambios CSRF), con 232 comprobaciones esperadas.

La colección administra cookies y obtiene un token antes de cada cambio. Inicia y cierra sesiones de práctica. Crea un candidato con documento único y una postulación. No borra registros existentes. Las cuentas son ficticias y preconfiguradas: analista@demo.local y coordinador@demo.local, contraseña Practica2026!.

## Cobertura
Las 13 operaciones REST se documentan en CONTRATO_API.md y openapi.json. Se prueban rutas de autenticación, candidatos (registro, edición, consulta, búsqueda), vacantes, postulaciones, cambios de estado e historial. Se comprueban errores 400,401,403,404,409 además de respuestas exitosas 200,201,204.

## Repetición automatizada
GitHub Actions inicia Spring Boot con H2 en memoria y ejecuta exactamente la misma colección con Newman 6.2.1. Exporta reportes JSON y JUnit. Los reportes JSON públicos omiten cookies y tokens; la evidencia de escritorio se conserva en capturas y video. La ejecución con Newman complementa la demostración realizada en Postman de escritorio.

Los tiempos varían con el equipo; no se interpreta esta ejecución funcional como prueba de carga o auditoría completa de seguridad. Perfil MySQL disponible pero no incluido en esta verificación.
