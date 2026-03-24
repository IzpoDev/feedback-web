# 📋 Feedbackweb v1.2

> **Sistema de Gestión de Feedback Anónimo** — Aplicación web moderna construida con **Angular 21**

[![Angular](https://img.shields.io/badge/Angular-21.1.0-DD0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1.12-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Firebase](https://img.shields.io/badge/Firebase_Hosting-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com)
[![RxJS](https://img.shields.io/badge/RxJS-7.8.0-B7178C?style=for-the-badge&logo=reactivex&logoColor=white)](https://rxjs.dev)

---

## ✨ Descripción

**Feedbackweb** permite a usuarios enviar comentarios anónimos y a administradores gestionar usuarios, roles, privilegios y dashboards de análisis en tiempo real.

🌐 **Demo en Producción:** [https://feedback-web-d776c.web.app](https://feedback-web-d776c.web.app)

---

## 🛠️ Stack Tecnológico

### Core Framework

| Tecnología | Versión | Rol |
|:---:|:---:|---|
| ![Angular](https://img.shields.io/badge/-Angular-DD0031?logo=angular&logoColor=white) | **^21.1.0** | Framework principal con componentes standalone |
| ![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?logo=typescript&logoColor=white) | **~5.9.2** | Tipado estático y desarrollo robusto |
| ![RxJS](https://img.shields.io/badge/-RxJS-B7178C?logo=reactivex&logoColor=white) | **~7.8.0** | Programación reactiva con Observables |

### Estilos y UI

| Tecnología | Versión | Rol |
|:---:|:---:|---|
| ![Tailwind](https://img.shields.io/badge/-Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white) | **^4.1.12** | Framework de utilidades CSS |
| ![PostCSS](https://img.shields.io/badge/-PostCSS-DD3A0A?logo=postcss&logoColor=white) | **^8.5.3** | Procesamiento avanzado de CSS |

### Renderizado y Server

| Tecnología | Versión | Rol |
|:---:|:---:|---|
| ![Angular SSR](https://img.shields.io/badge/-Angular_SSR-DD0031?logo=angular&logoColor=white) | **^21.1.2** | Server-Side Rendering |
| ![Express](https://img.shields.io/badge/-Express-000000?logo=express&logoColor=white) | **^5.1.0** | Servidor Node.js para SSR |

### Testing y Desarrollo

| Tecnología | Versión | Rol |
|:---:|:---:|---|
| ![Vitest](https://img.shields.io/badge/-Vitest-6E9F18?logo=vitest&logoColor=white) | **^4.0.8** | Testing unitario ultrarrápido |
| ![Angular CLI](https://img.shields.io/badge/-Angular_CLI-DD0031?logo=angular&logoColor=white) | **^21.1.2** | Herramientas de desarrollo |

### Deployment

| Tecnología | Rol |
|:---:|---|
| ![Firebase](https://img.shields.io/badge/-Firebase_Hosting-FFCA28?logo=firebase&logoColor=black) | Hosting con CDN global |
| ![GitHub Actions](https://img.shields.io/badge/-GitHub_Actions-2088FF?logo=githubactions&logoColor=white) | CI/CD automático |

---

## 🏗️ Arquitectura del Proyecto

### Estructura Modular

Organización en **módulos funcionales independientes** siguiendo las mejores prácticas de Angular 21:

```
src/app/
├── modules/
│   ├── auth/                    # 🔐 Autenticación
│   │   ├── interfaces/          # LoginInterface, ForgotPasswordInterface
│   │   ├── pages/
│   │   │   ├── login/           # Inicio de sesión
│   │   │   └── forgot-password/ # Recuperación de contraseña
│   │   └── services/            # AuthService
│   │
│   ├── feedback/                # 💬 Sistema de Feedback
│   │   ├── interfaces/          # FeedbackInterface
│   │   ├── pages/
│   │   │   ├── feedback/        # Formulario público con rutas dinámicas /:id
│   │   │   └── dashboard/       # Analytics (protegido)
│   │   └── services/            # FeedbackService
│   │
│   ├── user/                    # 👥 Gestión de Usuarios
│   │   ├── interfaces/          # UserInterface
│   │   ├── pages/
│   │   │   ├── admin-users-list/    # Listado (solo admin)
│   │   │   ├── register-admin/      # Registro de admins
│   │   │   ├── register-owner/      # Registro de owners
│   │   │   └── user-setting/        # Configuración personal
│   │   └── services/            # UserService
│   │
│   ├── role/                    # 🎭 Gestión de Roles
│   │   ├── interfaces/          # RoleInterface
│   │   ├── pages/
│   │   │   ├── list-roles/      # Listado de roles
│   │   │   └── register-role/   # CRUD de roles
│   │   └── services/            # RoleService
│   │
│   └── privilege/               # 🔑 Gestión de Privilegios
│       ├── interfaces/          # PrivilegeInterface
│       ├── pages/
│       │   ├── list-privileges/         # Listado
│       │   ├── register-privilege/      # CRUD
│       │   └── matching-privilege-role/ # Asignación rol-privilegio
│       └── services/            # PrivilegeService
│
├── guards/                      # 🛡️ Route Guards
│   └── app.guard.ts             # authGuard, noAuthGuard, adminGuard
│
├── interceptor/                 # 🔗 HTTP Interceptors
│   └── auth.interceptor.ts      # JWT y manejo de errores
│
├── env/                         # ⚙️ Configuración
│   └── env.ts                   # Variables de entorno
│
└── app.routes.ts                # 🗺️ Definición de rutas
```

---

## ✅ Características v1.2

| Característica | Descripción |
|---|---|
| **Componentes Standalone** | Arquitectura moderna sin NgModules |
| **Lazy Loading** | Carga de módulos bajo demanda |
| **Route Guards** | Control de acceso: `authGuard`, `noAuthGuard`, `adminGuard` |
| **HTTP Interceptor** | Manejo centralizado de JWT y errores |
| **Rutas Dinámicas SSR** | Soporte para `/feedback/:id` con Server-Side Rendering |
| **Formularios Reactivos** | Validación robusta con Angular Forms |
| **Gestión RBAC** | Control granular de roles y privilegios |
| **CI/CD Automático** | Deploy automático con GitHub Actions |

---

## 🔐 Sistema de Autenticación

| Guard | Protege | Comportamiento |
|:---:|---|---|
| `authGuard` | Dashboard, Settings | Redirige a `/login` si no autenticado |
| `noAuthGuard` | Login, Register | Redirige a `/dashboard` si ya autenticado |
| `adminGuard` | Admin panels | Verifica rol `ADMIN` en localStorage |

---

## 🚀 Guía de Desarrollo

### Instalación

```bash
# Clonar repositorio
git clone https://github.com/IzpoDev/feedback-web.git

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm start
```

Abre `http://localhost:4200/` en tu navegador.

### Comandos Disponibles

```bash
npm start          # Servidor de desarrollo (puerto 4200)
npm run build      # Build de producción
npm run watch      # Build en modo watch
npm test           # Ejecutar tests con Vitest
npm run serve:ssr:feedbackweb  # Servidor SSR
```

### Generación de Código

```bash
ng generate component nombre-componente --standalone
ng generate service modules/modulo/services/nombre-servicio
ng generate interface modules/modulo/interfaces/nombre
```

---

## 📦 Build y Producción

```bash
# Compilar para producción
npm run build
```

Artefactos generados en `dist/feedbackweb/browser/` con:
- ✅ Minificación automática
- ✅ Tree-shaking
- ✅ Code splitting
- ✅ Prerender de rutas estáticas

---

## 🔧 Deploy en Firebase

### Despliegue Automático (CI/CD)

Push a `main` → GitHub Actions → Firebase Hosting

```bash
git add .
git commit -m "feat: nueva funcionalidad"
git push origin main
# ✅ Deploy automático en ~2 minutos
```

### Despliegue Manual

```bash
npm install -g firebase-tools
firebase login
npm run build
firebase deploy
```

---

## 📊 Performance

- **Lazy Loading** — Módulos cargados bajo demanda
- **Tree-shaking** — Eliminación de código no utilizado
- **Code Splitting** — Chunks optimizados automáticamente
- **CDN Global** — Firebase Hosting con edge caching
- **Gzip** — Compresión automática

---

## 📚 Recursos

- [Angular 21 Documentation](https://angular.dev)
- [Firebase Hosting](https://firebase.google.com/docs/hosting)
- [RxJS](https://rxjs.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Vitest](https://vitest.dev)

---

## 📝 Información del Proyecto

| | |
|---|---|
| **Versión** | 1.2 |
| **Framework** | Angular 21.1.0 |
| **Lenguaje** | TypeScript 5.9.2 |
| **Estilos** | Tailwind CSS 4.1.12 |
| **Testing** | Vitest 4.0.8 |
| **Hosting** | Firebase Hosting |
| **CI/CD** | GitHub Actions |
| **Estado** | ✅ En Producción |
| **Última actualización** | Marzo 2026 |

---

<div align="center">

**Desarrollado con 💻 por [@IzpoDev](https://github.com/IzpoDev)**

[![GitHub](https://img.shields.io/badge/GitHub-IzpoDev%2Ffeedback--web-181717?style=flat-square&logo=github)](https://github.com/IzpoDev/feedback-web)

</div>
