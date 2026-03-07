import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'feedback/:id',
    renderMode: RenderMode.Server // También puedes usar RenderMode.Client si no necesitas SEO en esa vista
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
