import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { RecanchaService } from '../../services/recancha.service';
import { VideollamadaComponent } from '../videollamada/videollamada.component';
import { EjercicioModalComponent } from '../deportista/ejercicio-modal.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, VideollamadaComponent, EjercicioModalComponent],
  template: `
    <div class="app-shell">
      <aside class="side-panel">
        <div class="brand-header">
          <div class="brand-logo-row">
            <div class="brand-icon-box">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path>
                <path d="M2 12h20"></path>
              </svg>
            </div>
            <h2>ReCancha</h2>
          </div>
          <span class="sub-brand">Instituto IDERT · Deporte de Rendimiento</span>
        </div>

        <nav class="nav-links">
          <ng-container *ngIf="service.usuarioActual().rol === 'deportista'">
            <a routerLink="inicio" routerLinkActive="current" class="item">
              <svg class="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              <span>Inicio</span>
            </a>
            <a routerLink="sesiones" routerLinkActive="current" class="item">
              <svg class="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
                <line x1="16" x2="16" y1="2" y2="6"></line>
                <line x1="8" x2="8" y1="2" y2="6"></line>
                <line x1="3" x2="21" y1="10" y2="10"></line>
              </svg>
              <span>Sesiones</span>
            </a>
            <a routerLink="biblioteca" routerLinkActive="current" class="item">
              <svg class="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"></path>
                <path d="M6 6h10"></path>
                <path d="M6 10h10"></path>
              </svg>
              <span>Biblioteca</span>
            </a>
            <a routerLink="seguimiento" routerLinkActive="current" class="item">
              <svg class="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 3v18h18"></path>
                <path d="m19 9-5 5-4-4-3 3"></path>
              </svg>
              <span>Mi seguimiento</span>
            </a>
          </ng-container>

          <ng-container *ngIf="service.usuarioActual().rol === 'psicologa'">
            <a routerLink="inicio-psicologa" routerLinkActive="current" class="item">
              <svg class="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              <span>Inicio</span>
            </a>
            <a routerLink="sesiones" routerLinkActive="current" class="item">
              <svg class="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
                <line x1="16" x2="16" y1="2" y2="6"></line>
                <line x1="8" x2="8" y1="2" y2="6"></line>
                <line x1="3" x2="21" y1="10" y2="10"></line>
              </svg>
              <span>Sesiones</span>
            </a>
            <a routerLink="deportistas" routerLinkActive="current" class="item">
              <svg class="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              <span>Deportistas</span>
            </a>
            <a routerLink="biblioteca" routerLinkActive="current" class="item">
              <svg class="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"></path>
                <path d="M6 6h10"></path>
                <path d="M6 10h10"></path>
              </svg>
              <span>Biblioteca</span>
            </a>
          </ng-container>

        </nav>

        <div class="side-footer">
          <button class="logout-link" (click)="salir()">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" x2="9" y1="12" y2="12"></line>
            </svg>
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      <div class="content-shell">
        <header class="navbar-top">
          <div class="platform-tag">
            <span class="live-dot"></span>
            <span class="view-tag">Plataforma de Psicología Deportiva · ReCancha</span>
          </div>

          <div class="profile-tag">
            <div class="info">
              <span class="name">{{ service.usuarioActual().nombre || 'Usuario' }}</span>
              <span class="role">{{ service.usuarioActual().rol === 'deportista' ? 'Deportista IDERT' : 'Psicólogo/a Especialista' }}</span>
            </div>
            <div class="avatar-badge">{{ service.usuarioActual().avatarIniciales || 'RC' }}</div>
          </div>
        </header>

        <main class="page-container">
          <router-outlet></router-outlet>
        </main>
      </div>

      <div class="toast-popup" *ngIf="service.toastMensaje()">{{ service.toastMensaje() }}</div>
      <app-videollamada *ngIf="service.llamadaActiva()"></app-videollamada>
      <app-ejercicio-modal *ngIf="service.ejercicioSeleccionado()"></app-ejercicio-modal>
    </div>
  `,
  styles: [`
    .app-shell { display: flex; height: 100vh; overflow: hidden; background: #f8fafc; }
    
    .side-panel { 
      width: 250px; 
      background: #0f172a; 
      color: #ffffff; 
      display: flex; 
      flex-direction: column; 
      padding: 24px 16px; 
      flex-shrink: 0; 
      border-right: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow: 4px 0 20px rgba(15, 23, 42, 0.15);
    }
    
    .brand-header { margin-bottom: 28px; padding-left: 6px; }
    .brand-logo-row { display: flex; align-items: center; gap: 10px; }
    .brand-icon-box {
      width: 34px;
      height: 34px;
      border-radius: 8px;
      background: linear-gradient(135deg, #2563eb 0%, #ec4899 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      box-shadow: 0 4px 10px rgba(236, 72, 153, 0.3);
    }
    .brand-header h2 { 
      font-size: 1.45rem; 
      font-weight: 800; 
      margin: 0; 
      letter-spacing: -0.02em;
      background: linear-gradient(135deg, #ffffff 40%, #f472b6 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .sub-brand { 
      font-size: 0.72rem; 
      color: #94a3b8; 
      margin-top: 4px; 
      display: block; 
      letter-spacing: 0.02em;
    }
    
    .nav-links { display: flex; flex-direction: column; gap: 6px; flex: 1; }
    
    .item { 
      display: flex; 
      align-items: center; 
      gap: 12px; 
      padding: 10px 14px; 
      color: #cbd5e1; 
      text-decoration: none; 
      border-radius: 8px; 
      font-size: 0.88rem; 
      font-weight: 500; 
      transition: all 0.18s ease-in-out; 
    }
    .nav-icon { flex-shrink: 0; opacity: 0.8; transition: opacity 0.15s ease; }
    
    .item:hover { 
      background: rgba(37, 99, 235, 0.15); 
      color: #ffffff; 
    }
    .item:hover .nav-icon { opacity: 1; stroke: #60a5fa; }
    
    .item.current { 
      background: linear-gradient(135deg, rgba(37, 99, 235, 0.3) 0%, rgba(236, 72, 153, 0.2) 100%); 
      font-weight: 600; 
      color: #ffffff; 
      border-left: 3px solid #ec4899; 
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15);
    }
    .item.current .nav-icon { opacity: 1; stroke: #f472b6; }
    
    
    .side-footer { border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 14px; }
    .logout-link { 
      background: none; 
      border: none; 
      color: #fca5a5; 
      font-size: 0.85rem; 
      font-weight: 500;
      cursor: pointer; 
      padding: 8px 12px; 
      width: 100%; 
      text-align: left; 
      display: flex; 
      align-items: center; 
      gap: 10px; 
      border-radius: 6px; 
      transition: all 0.15s; 
    }
    .logout-link:hover { background: rgba(239, 68, 68, 0.12); color: #f87171; }
    
    .content-shell { flex: 1; display: flex; flex-direction: column; overflow-y: auto; background: #f8fafc; }
    .navbar-top { 
      background: #ffffff; 
      padding: 14px 32px; 
      border-bottom: 1px solid var(--border-subtle); 
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
    }
    
    .platform-tag { display: flex; align-items: center; gap: 8px; }
    .live-dot { 
      width: 8px; 
      height: 8px; 
      border-radius: 50%; 
      background: #2563eb; 
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2); 
    }
    .view-tag { font-weight: 600; color: #0f172a; font-size: 0.9rem; }
    
    .profile-tag { display: flex; align-items: center; gap: 12px; }
    .info { text-align: right; }
    .name { display: block; font-size: 0.88rem; font-weight: 700; color: #0f172a; }
    .role { display: block; font-size: 0.74rem; color: #ec4899; font-weight: 600; }
    
    .avatar-badge { 
      width: 40px; 
      height: 40px; 
      border-radius: 12px; 
      background: linear-gradient(135deg, #2563eb 0%, #ec4899 100%); 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      font-weight: 700; 
      font-size: 0.85rem; 
      color: #ffffff; 
      box-shadow: 0 4px 10px rgba(37, 99, 235, 0.25);
    }
    
    .page-container { padding: 32px; max-width: 1200px; width: 100%; margin: 0 auto; box-sizing: border-box; }
    .toast-popup { 
      position: fixed; 
      bottom: 24px; 
      left: 50%; 
      transform: translateX(-50%); 
      background: #0f172a; 
      color: #fff; 
      padding: 10px 24px; 
      border-radius: 30px; 
      font-size: 0.85rem; 
      font-weight: 500;
      border: 1px solid rgba(236, 72, 153, 0.4);
      box-shadow: 0 10px 25px rgba(0,0,0,0.3);
      z-index: 3000; 
    }
  `]
})
export class LayoutComponent {
  service = inject(RecanchaService);
  router = inject(Router);

  salir() {
    this.service.cerrarSesion();
    this.router.navigate(['/login']);
  }
}
