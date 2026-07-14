import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'albums', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./pages/login/login.component').then((m) => m.LoginComponent) },
  {
    path: 'albums',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/albums/albums.component').then((m) => m.AlbumsComponent),
  },
  {
    path: 'albums/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/album-detail/album-detail.component').then((m) => m.AlbumDetailComponent),
  },
  { path: '**', redirectTo: 'albums' },
];
