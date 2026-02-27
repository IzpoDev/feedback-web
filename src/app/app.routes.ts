import { Routes } from '@angular/router';

export const routes: Routes = [
  { 
    path: 'login', 
    loadComponent: () => import('./auth/pages/login/login').then(c => c.Login)
  },
  { 
    path: '', 
    loadComponent: () => import('./feedback/pages/feedback/feedback').then(c => c.FeedbackComponent)
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./auth/pages/forgot-password/forgot-password').then(c => c.ForgotPassword)
  },
  {
    path: 'register-owner',
    loadComponent: () => import('./user/pages/register-owner/register-owner').then(c => c.RegisterOwnerComponent)

  },
  { 
    // Comodín para rutas no encontradas siempre al final para evitar incoherencias con rutas válidas
    path: '**', 
    redirectTo: '' 
  }
];