# Seguridad - Permit Frontend

Este documento describe las medidas de seguridad implementadas en el frontend.

## 🔐 Arquitectura de Seguridad

### Flujo de Autenticación

```
┌─────────────┐
│   Cliente   │ (Browser)
└──────┬──────┘
       │ 1. Request a /api/permit/*
       ▼
┌─────────────────────┐
│  Next.js API Route  │
│  (/api/permit/*)    │
└──────┬──────────────┘
       │ 2. Verifica NextAuth
       │ 3. Agrega X-API-Key header
       ▼
┌─────────────────────┐
│  permit-backend      │
│  (Elysia.js)         │
└─────────────────────┘
       │ 4. Valida API Key
       │ 5. Procesa request
       ▼
┌─────────────────────┐
│  Respuesta          │
└─────────────────────┘
```

## 🛡️ Medidas de Seguridad

### 1. API Key Server-Side

- **Ubicación**: La API key vive solo en variables de entorno del servidor
- **Variable**: `PERMIT_API_KEY` (frontend) / `API_KEY` (backend)
- **Nunca se expone**: La API key nunca se envía al cliente
- **Validación**: El backend valida la API key en cada request (excepto rutas públicas)

### 2. Autenticación de Usuario

- **NextAuth**: Verifica que el usuario esté autenticado antes de permitir requests
- **Sesión**: Se verifica en cada ruta API de Next.js
- **Protección**: Todas las rutas del dashboard requieren autenticación

### 3. Rutas API como Proxy

- **Proxy Pattern**: El cliente nunca llama directamente al backend
- **Abstracción**: Las rutas `/api/permit/*` actúan como proxy seguro
- **Validación**: Cada ruta valida autenticación antes de proceder

### 4. Variables de Entorno

#### Frontend (`.env.local`)
```env
# Server-side only (nunca se expone al cliente)
PERMIT_API_URL=http://localhost:8000
PERMIT_API_KEY=tu-api-key-secreta

# NextAuth
AUTH_GITHUB_ID=...
AUTH_GITHUB_SECRET=...
NEXTAUTH_SECRET=...
```

#### Backend (`.env.local`)
```env
DATABASE_URL=...
API_KEY=tu-api-key-secreta  # Debe coincidir con PERMIT_API_KEY
```

## 🔒 Buenas Prácticas

### ✅ Hacer

1. **Usar variables de entorno** para secretos
2. **Validar autenticación** en cada ruta API
3. **Mantener API keys** solo en el servidor
4. **Usar HTTPS** en producción
5. **Rotar API keys** periódicamente

### ❌ No Hacer

1. **Nunca exponer** API keys en el código del cliente
2. **No hardcodear** secretos en el código
3. **No enviar** API keys en query params
4. **No loggear** API keys en consola
5. **No commitear** `.env.local` al repositorio

## 🚨 Seguridad Adicional Recomendada

### Para Producción

1. **Rate Limiting**: Implementar límites de requests por IP
2. **CORS**: Configurar CORS apropiadamente
3. **Helmet**: Agregar headers de seguridad
4. **Logging**: Registrar intentos de acceso no autorizados
5. **Monitoring**: Monitorear patrones sospechosos

### Validación de Input

- Todos los inputs se validan en el backend
- Usar Zod para validación de esquemas
- Sanitizar inputs antes de procesarlos

## 📝 Checklist de Seguridad

- [x] API key solo en servidor
- [x] Autenticación con NextAuth
- [x] Validación de API key en backend
- [x] Rutas API como proxy
- [ ] Rate limiting (pendiente)
- [ ] CORS configurado (pendiente)
- [ ] Logging de seguridad (pendiente)
- [ ] Monitoring (pendiente)

## 🔍 Testing de Seguridad

Para probar que la seguridad funciona:

1. **Sin autenticación**: Intentar acceder a `/api/permit/users` sin estar logueado → Debe retornar 401
2. **API key incorrecta**: Cambiar `PERMIT_API_KEY` en frontend → Requests deben fallar
3. **Sin API key**: Remover header `X-API-Key` → Backend debe rechazar

## 📚 Referencias

- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [NextAuth Security](https://authjs.dev/getting-started/security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

