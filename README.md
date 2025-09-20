📦 Sistema de Control de Inventario y Ventas

Este proyecto es un sistema de gestión para tiendas desarrollado con Laravel 12 (API backend) y React + Inertia.js (frontend). Su objetivo es centralizar y simplificar la administración de inventario, compras, ventas, sucursales, usuarios y reportes.

🚀 Tecnologías utilizadas

Backend: Laravel 12, Inertia.js, Spatie Laravel Permission (roles y permisos).

Frontend: React, Bootstrap y componentes personalizados.

Base de datos: MySQL/MariaDB.

Otras librerías:

Maatwebsite/Excel → generación de reportes en formato Excel.

Leaflet → integración de mapas interactivos para ubicar sucursales.

⚙️ Funcionalidades principales

Gestión de productos: creación, edición, categorías, stock y precios.

Gestión de usuarios: creación desde modal, asignación de roles y permisos.

Sucursales: administración con ubicación en mapa (latitud/longitud).

Compras y ventas:

Registro de operaciones con detalle.

Control de pagos y estados.

Listado con filtros y búsquedas.

Reportes:

Exportación a Excel de compras y ventas (detalle + información general).

Filtros por rango de fechas.

Seguridad: control de accesos por roles y permisos en el panel de administración.

📊 Reportes disponibles

Ventas: detalle de productos vendidos, cliente, estado y totales.

Compras: detalle de insumos adquiridos, proveedor, estado y totales.

🗂️ Estructura

app/Http/Controllers → controladores de Laravel.

app/Exports → clases para exportar datos en Excel.

resources/js/Pages → vistas con React + Inertia.

routes/web.php → definición de rutas principales.

🌐 Uso

Clonar el repositorio.

Instalar dependencias con composer install y npm install.

Configurar el archivo .env con base de datos y entorno.

Ejecutar migraciones con php artisan migrate.

Levantar el servidor con php artisan serve y npm run dev.
