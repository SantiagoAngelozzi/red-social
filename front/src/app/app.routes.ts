import { Routes } from '@angular/router';
import { Shell } from './layout/shell/shell';
import { Cargando } from './pages/cargando/cargando';
import { Login } from './pages/login/login';
import { MiPerfil } from './pages/mi-perfil/mi-perfil';
import { Publicaciones } from './pages/publicaciones/publicaciones';
import { Registro } from './pages/registro/registro';
import { sesionGuard } from './guards/sesion.guard';
import { DetallePublicacion } from './pages/detalle-publicacion/detalle-publicacion';
import { Usuarios } from './pages/usuarios/usuarios';
import { adminGuard } from './guards/admin.guard';
import { Estadisticas } from './pages/estadisticas/estadisticas';

export const routes: Routes = [
  { path: '', pathMatch: 'full', component: Cargando, title: 'Rocket Social' },
  { path: 'login', component: Login, title: 'Iniciar sesión | Rocket Social' },
  { path: 'registro', component: Registro, title: 'Registro | Rocket Social' },
  {
    path: '',
    component: Shell,
    canActivate: [sesionGuard],
    children: [
      { path: 'publicaciones', component: Publicaciones, title: 'Publicaciones | Rocket Social' },
      { path: 'publicaciones/:id', component: DetallePublicacion, title: 'Publicación | Rocket Social' },
      { path: 'mi-perfil', component: MiPerfil, title: 'Mi perfil | Rocket Social' },
      { path: 'usuarios', component: Usuarios, canActivate: [adminGuard], title: 'Usuarios | Rocket Social' },
      { path: 'estadisticas', component: Estadisticas, canActivate: [adminGuard], title: 'Estadísticas | Rocket Social' },
    ],
  },
  { path: '**', redirectTo: '' },
];