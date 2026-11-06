import { test, expect } from '@playwright/test';
async function ingresar(page, correo = 'analista@demo.local') {
  await page.goto('/#/acceso');
  await page.getByLabel('Correo electrónico', { exact: true }).fill(correo);
  await page.getByLabel('Contraseña', { exact: true }).fill('Practica2026!');
  await page.getByRole('button', { name: 'Ingresar', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Candidatos', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Ver detalle de Ana', exact: true })).toBeVisible();
}
test('registro, búsqueda, postulación, estado e historial con Spring Boot', async ({ page }) => {
  await ingresar(page);
  await page.screenshot({ path: 'test-results/01-candidatos.png', fullPage: true });
  await page.getByRole('link', { name: 'Registrar candidato', exact: true }).click();
  for (const [label, value] of Object.entries({
    'Tipo de documento': 'CC',
    'Número de documento': 'EV03-001',
    Nombres: 'Lucía',
    Apellidos: 'Prueba',
    'Correo electrónico': 'lucia@example.com',
    Teléfono: '3001234567',
  }))
    await page.getByLabel(label, { exact: true }).fill(value);
  await page.getByRole('button', { name: 'Guardar candidato' }).click();
  await expect(page.getByRole('heading', { name: 'Lucía Prueba' })).toBeVisible();
  await page
    .getByLabel('Vacante abierta')
    .selectOption({ label: 'Operario de limpieza · 5 cupos' });
  await page.getByRole('button', { name: 'Crear postulación' }).click();
  await expect(
    page.getByRole('heading', { name: 'Operario de limpieza', exact: true }),
  ).toBeVisible();
  await page.getByLabel('Nuevo estado').selectOption('Seleccionado');
  await page.getByLabel('Observación').fill('Cumple los requisitos de la vacante.');
  await page.getByRole('button', { name: 'Guardar estado' }).click();
  await expect(page.locator('.estado-seleccionado')).toHaveText('Seleccionado');
  await page.getByRole('button', { name: /Ver historial/ }).click();
  await expect(
    page.getByText('Cumple los requisitos de la vacante.', { exact: true }),
  ).toBeVisible();
  await page.screenshot({ path: 'test-results/02-postulacion-historial.png', fullPage: true });
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Lucía Prueba' })).toBeVisible();
  await expect(page.locator('.estado-seleccionado')).toHaveText('Seleccionado');
  await page.getByRole('link', { name: 'Editar candidato' }).click();
  await page.getByLabel('Teléfono', { exact: true }).fill('3007654321');
  await page.getByRole('button', { name: 'Guardar candidato' }).click();
  await expect(page.getByText('3007654321', { exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Candidatos', exact: true }).click();
  await page.getByLabel('Buscar candidato').fill('Lucía');
  await expect(page.getByRole('link', { name: 'Ver detalle de Lucía' })).toBeVisible();
  await page.getByLabel('Buscar candidato').fill('NO-EXISTE-999');
  await expect(page.getByText('No hay candidatos que coincidan con la búsqueda.')).toBeVisible();
});
test('permisos de coordinador, navegación y vista móvil', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await ingresar(page, 'coordinador@demo.local');
  await expect(page.getByRole('link', { name: 'Registrar candidato' })).toHaveCount(0);
  for (const [link, heading] of [
    ['Inicio', 'Un proceso claro, de principio a fin.'],
    ['Vacantes', 'Vacantes'],
    ['Mi perfil', 'Mi perfil'],
  ]) {
    await page.getByRole('link', { name: link, exact: true }).click();
    await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible();
  }
  await page.getByRole('link', { name: 'Candidatos', exact: true }).click();
  await expect(page.getByRole('link', { name: 'Ver detalle de Ana', exact: true })).toBeVisible();
  await page.screenshot({ path: 'test-results/03-movil-coordinador.png', fullPage: true });
  await page.goto('/#/candidatos/nuevo');
  await expect(page.getByRole('heading', { name: 'Candidatos', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Cerrar sesión' }).click();
  await expect(page.getByRole('button', { name: 'Ingresar', exact: true })).toBeVisible();
});
test('validaciones y errores de conexión visibles', async ({ page }) => {
  await ingresar(page);
  await page.getByRole('link', { name: 'Registrar candidato', exact: true }).click();
  await page.getByRole('button', { name: 'Guardar candidato' }).click();
  await expect(
    page.getByText('Nombres: este campo es obligatorio.', { exact: true }),
  ).toBeVisible();
  await page.route('**/api/candidatos?**', (route) => route.abort());
  await page.getByRole('button', { name: 'Cancelar', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('No se pudo conectar');
  await page.screenshot({ path: 'test-results/04-error-conexion.png', fullPage: true });
});
