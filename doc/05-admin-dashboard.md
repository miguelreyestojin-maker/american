# 05. Panel de Administración y Gestión de Stock

## Requisitos de Autenticación
- Acceso restringido protegido por Supabase Auth (solo el administrador autorizado puede ingresar).
-que no este disponible la direccion para ingresar como administrador ni halla ningun boton disponible para ir a como admin

## Funcionalidades del Panel (CRUD de Productos)
1. **Vista de Inventario (Tabla o Cards de Control):**
   - Listado rápido de todos los productos con su imagen miniatura, título, precio en GTQ y stock actual.
   - Indicadores visuales de stock bajo.
2. **Formulario de Subida / Edición de Productos:**
   - Campos de texto para **Título**, **Descripción**, **Precio (GTQ)**, **Stock (Cantidad)** y **Categoría**.
   - Selector de archivo o zona de arrastre para **Subir Imagen** (que se suba automáticamente a Supabase Storage y guarde la URL).
   - Botón para alternar disponibilidad (`is_available`).
3. **Acciones Rápidas:**
   - Botones directos para editar cantidades de stock en 1 clic o eliminar/desactivar productos agotados.