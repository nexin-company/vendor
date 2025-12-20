# Definición Funcional - Vendor System

## 1. Propósito del Sistema

**Vendor** es un sistema de gestión de productos y ventas diseñado para administrar un catálogo de productos, gestionar clientes, procesar órdenes y administrar usuarios del sistema.

## 2. Funcionalidades Principales

### 2.1. Gestión de Productos (Products)

**Propósito:** Administrar el catálogo de productos disponibles para venta.

**Funcionalidades:**
- **Listado de productos** con paginación
- **Búsqueda de productos** por nombre
- **Filtrado por estado:**
  - Activos (active)
  - Inactivos (inactive)
  - Archivados (archived)
- **Visualización de información:**
  - Imagen del producto
  - Nombre
  - Estado
  - Precio
  - Stock disponible
  - Fecha de disponibilidad
- **Acciones:**
  - Crear nuevo producto
  - Editar producto existente
  - Eliminar producto
  - Exportar lista de productos

**Campos del Producto:**
- `id`: Identificador único
- `imageUrl`: URL de la imagen del producto
- `name`: Nombre del producto
- `status`: Estado (active, inactive, archived)
- `price`: Precio (formato numérico con 2 decimales)
- `stock`: Cantidad en inventario
- `availableAt`: Fecha desde la cual está disponible

### 2.2. Gestión de Clientes (Customers)

**Propósito:** Administrar la base de datos de clientes que realizan compras.

**Funcionalidades (Planeadas):**
- Listado de clientes
- Búsqueda de clientes
- Visualización de información del cliente
- Ver historial de órdenes por cliente
- Crear nuevo cliente
- Editar información del cliente
- Eliminar cliente

**Campos del Cliente:**
- `id`: Identificador único
- `name`: Nombre completo
- `email`: Correo electrónico
- `phone`: Teléfono (opcional)
- `address`: Dirección (opcional)
- `createdAt`: Fecha de registro

### 2.3. Gestión de Órdenes (Orders)

**Propósito:** Administrar las órdenes de compra realizadas por los clientes.

**Funcionalidades (Planeadas):**
- Listado de órdenes
- Visualización de detalles de orden
- Ver productos incluidos en cada orden
- Cambiar estado de la orden:
  - Pendiente (pending)
  - En proceso (processing)
  - Enviada (shipped)
  - Entregada (delivered)
  - Cancelada (cancelled)
- Crear nueva orden
- Editar orden
- Cancelar orden

**Campos de la Orden:**
- `id`: Identificador único
- `customerId`: ID del cliente
- `customerName`: Nombre del cliente (derivado)
- `status`: Estado de la orden
- `total`: Monto total de la orden
- `createdAt`: Fecha de creación
- `updatedAt`: Fecha de última actualización

### 2.4. Gestión de Usuarios del Sistema (Users)

**Propósito:** Administrar los usuarios que tienen acceso al sistema de administración.

**Funcionalidades:**
- Listado de usuarios
- Búsqueda de usuarios
- Visualización de información del usuario
- Crear nuevo usuario
- Editar usuario
- Eliminar usuario

**Campos del Usuario:**
- `id`: Identificador único
- `name`: Nombre completo
- `email`: Correo electrónico
- `username`: Nombre de usuario (opcional)
- `createdAt`: Fecha de registro

## 3. Autenticación

**Método:** OAuth con GitHub

**Funcionalidades:**
- Inicio de sesión con GitHub
- Cierre de sesión
- Protección de rutas (requiere autenticación)
- Redirección automática si no está autenticado

## 4. Características Técnicas

### 4.1. Stack Tecnológico
- **Framework:** Next.js 15 (App Router)
- **Runtime:** Bun
- **Lenguaje:** TypeScript
- **Base de datos:** PostgreSQL
- **Autenticación:** NextAuth.js (Auth.js)
- **UI:** Shadcn UI + Tailwind CSS
- **Deployment:** Vercel

### 4.2. Arquitectura
- **Frontend:** Next.js con Server Components y Client Components
- **Backend:** API separada en Bun/Elysia
- **Comunicación:** API REST a través de rutas API de Next.js que actúan como proxy

## 5. Funcionalidades NO Incluidas

El sistema **Vendor** NO incluye las siguientes funcionalidades que pertenecen a otros sistemas:

- ❌ **Gestión de Permisos (RBAC)** - Sistema de control de acceso basado en roles
- ❌ **Gestión de Recursos** - Administración de recursos del sistema
- ❌ **Gestión de Roles** - Creación y administración de roles
- ❌ **Asignaciones** - Asignación de roles y permisos a usuarios
- ❌ **Organigrama** - Estructura organizacional
- ❌ **Ausentismos** - Gestión de solicitudes de ausencia
- ❌ **Performance** - Evaluaciones de desempeño
- ❌ **Notificaciones** - Sistema de notificaciones
- ❌ **Auditoría** - Registro de auditoría de acciones

Estas funcionalidades pertenecen al sistema **Permit** (sistema de gestión de permisos y recursos humanos) y no deben estar en Vendor.

## 6. Flujo de Trabajo Principal

1. **Usuario inicia sesión** con GitHub
2. **Accede al dashboard** principal
3. **Gestiona productos:**
   - Ve lista de productos
   - Busca productos
   - Filtra por estado
   - Crea/edita/elimina productos
4. **Gestiona clientes:**
   - Ve lista de clientes
   - Crea/edita clientes
   - Ve historial de órdenes por cliente
5. **Gestiona órdenes:**
   - Ve lista de órdenes
   - Crea nuevas órdenes
   - Actualiza estado de órdenes
6. **Administra usuarios:**
   - Gestiona usuarios del sistema

## 7. Casos de Uso Principales

### 7.1. Administrador de Productos
- Necesita agregar nuevos productos al catálogo
- Requiere actualizar precios y stock
- Debe archivar productos que ya no se venden
- Necesita exportar listas de productos

### 7.2. Vendedor/Operador
- Necesita ver productos disponibles
- Debe crear órdenes para clientes
- Requiere actualizar estado de órdenes
- Necesita buscar información de clientes

### 7.3. Administrador del Sistema
- Gestiona usuarios con acceso al sistema
- Administra información de clientes
- Supervisa todas las órdenes

## 8. Requisitos de Seguridad

- Autenticación obligatoria para todas las rutas
- Las rutas API actúan como proxy y validan autenticación
- API key para comunicación con backend
- Rate limiting en endpoints

## 9. Próximas Funcionalidades (Roadmap)

- [ ] Formulario completo de creación/edición de productos
- [ ] Gestión completa de clientes con CRUD
- [ ] Gestión completa de órdenes con detalles de productos
- [ ] Dashboard con estadísticas de ventas
- [ ] Exportación de datos (CSV, Excel)
- [ ] Búsqueda avanzada con múltiples filtros
- [ ] Historial de cambios en productos/órdenes

