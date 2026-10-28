# 03. Esquema de Base de Datos (Supabase / PostgreSQL)

## Tabla: `products`
Almacena el inventario de artículos disponibles traídos de EE. UU.

- `id`: UUID (Primary Key, default gen_random_uuid())
- `created_at`: Timestamp with time zone (default now())
- `title`: Text (Nombre del producto, ej. "Nike Air Force 1 '07")
- `description`: Text (Detalles del producto, talla, estado)
- `price_gtq`: Numeric (Precio de venta en Quetzales)
- `stock`: Integer (Cantidad disponible en inventario local)
- `category`: Text (Ej. Calzado, Ropa, Accesorios, Electrónica)
- `image_url`: Text (URL de la imagen almacenada en Supabase Storage)
- `is_available`: Boolean (Control rápido para mostrar/ocultar en la tienda)

## Configuración de Supabase Storage
- Crear un bucket público llamado `product-images` para almacenar las fotografías subidas desde el panel de administración.
- Políticas de seguridad (RLS): Lectura pública para cualquier usuario; escritura/modificación únicamente para administradores autenticados.