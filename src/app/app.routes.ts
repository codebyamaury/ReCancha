import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { LayoutComponent } from './components/layout/layout.component';
import { InicioComponent } from './components/deportista/inicio.component';
import { SesionesComponent } from './components/deportista/sesiones.component';
import { BibliotecaComponent } from './components/deportista/biblioteca.component';
import { SeguimientoComponent } from './components/deportista/seguimiento.component';
import { InicioPsicologaComponent } from './components/psicologa/inicio-psicologa.component';
import { PanelDeportistasComponent } from './components/psicologa/panel-deportistas.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: 'app',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'inicio', pathMatch: 'full' },
      { path: 'inicio', component: InicioComponent },
      { path: 'sesiones', component: SesionesComponent },
      { path: 'biblioteca', component: BibliotecaComponent },
      { path: 'seguimiento', component: SeguimientoComponent },
      { path: 'inicio-psicologa', component: InicioPsicologaComponent },
      { path: 'deportistas', component: PanelDeportistasComponent }
    ]
  },
  { path: '**', redirectTo: 'login' }
];
