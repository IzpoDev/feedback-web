import { Routes } from '@angular/router';
import { authGuard, noAuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  // Ruta pública por defecto - Feedback anónimo
  { 
    path: '', 
    loadComponent: () => import('./feedback/pages/feedback/feedback').then(c => c.FeedbackComponent)
  },
  // Rutas de autenticación (solo si NO está logueado)
  { 
    path: 'login', 
    loadComponent: () => import('./auth/pages/login/login').then(c => c.Login),
    canActivate: [noAuthGuard]
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./auth/pages/forgot-password/forgot-password').then(c => c.ForgotPassword),
    canActivate: [noAuthGuard]
  },
  {
    path: 'register-owner',
    loadComponent: () => import('./user/pages/register-owner/register-owner').then(c => c.RegisterOwnerComponent),
    canActivate: [noAuthGuard]
  },
  // Rutas protegidas (solo si está logueado)
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/pages/dashboard/dashboard').then(c => c.DashboardComponent),
    canActivate: [authGuard]
  },
  // Comodín para rutas no encontradas - redirige a feedback público
  { 
    path: '**', 
    redirectTo: ''
  }
];
