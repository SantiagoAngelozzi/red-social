import { Routes } from '@angular/router';
import { Shell } from './layout/shell/shell';
import { Login } from './pages/login/login';
import { MiPerfil } from './pages/mi-perfil/mi-perfil';
import { Publicaciones } from './pages/publicaciones/publicaciones';
import { Registro } from './pages/registro/registro';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Pantallas sin barra lateral
  { path: 'login', component: Login, title: 'Iniciar sesión | Rocket Social' },
  { path: 'registro', component: Registro, title: 'Registro | Rocket Social' },

  // Pantallas con barra lateral (se muestran dentro del Shell)
  {
    path: '',
    component: Shell,
    children: [
      { path: 'publicaciones', component: Publicaciones, title: 'Publicaciones | Rocket Social' },
      { path: 'mi-perfil', component: MiPerfil, title: 'Mi perfil | Rocket Social' },
    ],
  },

  { path: '**', redirectTo: 'login' },
];
