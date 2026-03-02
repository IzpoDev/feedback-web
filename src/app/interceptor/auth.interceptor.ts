import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

const isPublicRoute = (url: string, method : string): boolean => {
    if ( method == 'POST' && url.includes('/users') && !url.includes('/users/admin')) {
      return true;
    } 
    if (url.includes('/auth')) {
      return true;
    }
    if (method == 'POST' && url.includes('/feedbacks')){
      return true;
    }
    if ( url.includes('/forgot-password')){
      return true;
    }
    return false;
    };

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);

  // Solo agregar token en el navegador
  if (!isPlatformBrowser(platformId)) {
    return next(req);
  }

  const token = localStorage.getItem('token');

  // Si hay token, clonar la request y agregar el header
  if (token && !isPublicRoute(req.url, req.method)) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(authReq);
  }

  return next(req);
};
