# Servicios del proyecto — GA7-220501096-AA5-EV03
Laura Tatiana Ciro Botero · SENA · Ficha 3235898 · Instructora Adriana Milena Rangel · 2026.

Sistema de selección de personal para una empresa de servicios generales.
Esta entrega continúa el proyecto React/Vite de AA4-EV03 y documenta/desarrolla sus servicios HTTP: candidatos, vacantes, postulaciones, estados e historial.

## Ejecutar
Java 17+, Maven 3.9+ y Node 22.12+.
1. En backend: `mvn spring-boot:run` (API en http://127.0.0.1:8081).
2. En frontend: `npm ci` y `npm run dev` (interfaz en http://127.0.0.1:5173).
3. Ingresar con analista@demo.local o coordinador@demo.local y la clave ficticia Practica2026!.
El analista registra, edita y actualiza procesos; el coordinador consulta. Usar solo datos ficticios.
La API del caso anterior puede seguir en 8080. No iniciar dos copias de esta API en 8081.

## Persistencia
H2 guarda la práctica en backend/data; reiniciar conserva los datos. El ZIP no incluye esa base.
El perfil mysql está configurado para una base nueva seleccion_personal_ev03, mediante DB_URL, DB_USER y DB_PASSWORD. Las pruebas de esta entrega se realizan con H2; no se afirma una ejecución en MySQL.
DEMO_ENABLED=false desactiva la carga inicial; DEMO_PASSWORD cambia la clave al crear una base nueva.

## Contrato y validación
Ver docs/CONTRATO_API.md y docs/openapi.json (OpenAPI 3.0.3).
Cookie de sesión HttpOnly y token CSRF en las mutaciones. Tras login, obtener un token nuevo en /api/auth/csrf.
JSON estricto, campos obligatorios, longitudes, correo, IDs positivos y estados definidos.
SQL parametrizado, claves foráneas, documento/postulación únicos y transacciones con historial.
Los cupos se muestran como información de vacante; no se automatiza contratación ni se limita el número de candidatos postulados por cupo.
La gestión administrativa de usuarios y vacantes queda fuera del módulo, como en AA4-EV03.

## Comprobar
Backend: `mvn -B verify` dentro de backend.
API real iniciada: `python3 scripts/verificar_api.py` desde la raíz; guarda resultados/http.json.
Frontend: `npm run lint`, `npm test`, `npm run build` en frontend.
Navegador: `npx playwright install chromium` y `npm run test:e2e` con API iniciada y base de práctica limpia.
GitHub Actions repite estas comprobaciones, conserva reportes, capturas y el JAR.

## Versionamiento
Derivado del proyecto AA4-EV03; en esta versión se agrega documentación individual de las 13 rutas, rechazo de campos desconocidos, validación de parámetros e integración HTTP reproducible.
Las clases usan PascalCase y los métodos/variables camelCase. Hay comentarios sobre decisiones de seguridad y transacciones.
Repositorio: https://github.com/tatianabotero314-del/sena-ga7-aa5-ev03-servicios-proyecto
