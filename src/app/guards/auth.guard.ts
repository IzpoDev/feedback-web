import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // Solo verificar en el navegador (SSR no tiene localStorage)
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');

  if (token && user) {
    return true;
  }

  // No autenticado, redirigir al login
  router.navigate(['/login']);
  return false;
};

// Guard inverso: si ya está logueado, no puede ver login/register
export const noAuthGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  const token = localStorage.getItem('token');

  if (token) {
    // Ya está logueado, redirigir al dashboard
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
};
