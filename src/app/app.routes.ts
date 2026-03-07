import { Routes } from '@angular/router';
import { authGuard, noAuthGuard, adminGuard } from './guards/app.guard';

export const routes: Routes = [
  // Ruta pública por defecto - Feedback anónimo
  { 
    path: 'feedback/:id', 
    loadComponent: () => import('./modules/feedback/pages/feedback/feedback').then(c => c.FeedbackComponent)
  },
  // Rutas de autenticación (solo si NO está logueado)
  { 
    path: 'login', 
    loadComponent: () => import('./modules/auth/pages/login/login').then(c => c.Login),
    canActivate: [noAuthGuard]
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./modules/auth/pages/forgot-password/forgot-password').then(c => c.ForgotPassword),
    canActivate: [noAuthGuard]
  },
  {
    path : 'user-setting',
    loadComponent: () => import('./modules/user/pages/user-setting/user-setting').then(c => c.UserSetting),
    canActivate: [authGuard]
  },
  {
    path: 'register-owner',
    loadComponent: () => import('./modules/user/pages/register-owner/register-owner').then(c => c.RegisterOwnerComponent),
    canActivate: [noAuthGuard]
  },
  {
    path: 'register-admin',
    loadComponent: () => import('./modules/user/pages/register-admin/register-admin').then(c => c.RegisterAdmin),
    canActivate: [adminGuard]
  },
  {
    path: 'admin-users-list',
    loadComponent: () => import('./modules/user/pages/admin-users-list/admin-users-list').then(c => c.AdminUsersList),
    canActivate: [adminGuard]
  },
  // Rutas protegidas (solo si está logueado)
  {
    path: 'dashboard',
    loadComponent: () => import('./modules/feedback/pages/dashboard/dashboard').then(c => c.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'admin-roles-list',
    loadComponent: () => import('./modules/role/pages/list-roles/list-roles').then(c => c.ListRoles),
    canActivate: [adminGuard]
  },
  {
    path: 'admin-privileges-list',
    loadComponent: () => import('./modules/privilege/pages/list-privileges/list-privileges').then(c => c.ListPrivileges),
    canActivate: [adminGuard]
  },
  {
    path : '',
    redirectTo : 'login',
    pathMatch : 'full'
  },
  // Comodín para rutas no encontradas - redirige a feedback público
  { 
    path: '**', 
    redirectTo: ''
  }
];
