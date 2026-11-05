# Instrucciones para la Base de Datos TecnoClick (PostgreSQL / pgAdmin 4)

El archivo `schema_completo.sql` contiene toda la estructura de la base de datos necesaria para el proyecto, incluyendo:
- Roles y 22 permisos del sistema
- Tabla de usuarios con soporte de roles y contraseñas hasheadas en bcrypt
- Catálogo de categorías y productos con nombres e imágenes reales del frontend
- Auditoría inmutable con función y trigger
- Manejo seguro de pedidos, detalles de pedido, pagos en efectivo y con tarjeta
- Registro de ingresos y reseñas de productos
- Sesiones JWT y Refresh Tokens (`auth_sessions` y `auth_refresh_tokens`)
- Tokens de recuperación de contraseña por correo

---

## Pasos para ejecutar en pgAdmin 4:

1. **Abre pgAdmin 4** en tu computadora.
2. En el panel izquierdo, despliega tu servidor:  
   `Servers` > `PostgreSQL 17` (o `18`).
3. Si la base de datos **`TecnoClick`** no existe:
   - Clic derecho en **Databases** > **Create** > **Database...**
   - Nombre: `TecnoClick`
   - Clic en **Save**.
4. Haz clic derecho sobre la base de datos **`TecnoClick`** y selecciona **Query Tool** (Herramienta de consultas).
5. Abre el archivo `database/schema_completo.sql`, copia todo su contenido y pégalo en la ventana de Query Tool.
6. Presiona la tecla **`F5`** (o haz clic en el botón de **Play / Ejecutar** en la barra superior).
7. Verás el mensaje:
   `Query returned successfully`

---

## Cuentas de prueba ya creadas:

El script inserta automáticamente 2 usuarios listos para iniciar sesión:

1. **Administrador**:
   - **Correo:** `admin@tecnoclick.com`
   - **Contraseña:** `admin123`
   - **Rol:** Administrador (Acceso total al panel de administración, productos, categorías, auditoría y pedidos).

2. **Cliente**:
   - **Correo:** `cliente@tecnoclick.com`
   - **Contraseña:** `123456`
   - **Rol:** Cliente (Compra de productos, reseñas, pagos y pedidos).

