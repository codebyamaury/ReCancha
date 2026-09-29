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
      <!-- Backdrop para móvil cuando el menú lateral está abierto -->
      <div 
        class="drawer-backdrop" 
        [class.show]="sidebarAbierta" 
        (click)="cerrarSidebar()"
        aria-hidden="true"></div>

      <!-- Panel Lateral (Escritorio fijo / Móvil cajón deslizable) -->
      <aside class="side-panel" [class.drawer-open]="sidebarAbierta">
        <div class="brand-header">
          <div class="brand-logo-row">
            <div class="brand-icon-box">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path>
                <path d="M2 12h20"></path>
              </svg>
            </div>
            <h2>PsicoConecta</h2>
            <button type="button" class="btn-close-drawer" (click)="cerrarSidebar()" aria-label="Cerrar navegación">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <span class="sub-brand">Instituto IDERT · Deporte de Rendimiento</span>
        </div>

        <nav class="nav-links">
          <ng-container *ngIf="service.usuarioActual().rol === 'deportista'">
            <a routerLink="inicio" routerLinkActive="current" class="item" (click)="cerrarSidebar()">
              <svg class="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              <span>Inicio</span>
            </a>
            <a routerLink="sesiones" routerLinkActive="current" class="item" (click)="cerrarSidebar()">
              <svg class="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
                <line x1="16" y1="16" x2="16" y2="6"></line>
                <line x1="8" y1="8" x2="8" y2="6"></line>
                <line x1="3" x2="21" y1="10" y2="10"></line>
              </svg>
              <span>Sesiones</span>
            </a>
            <a routerLink="biblioteca" routerLinkActive="current" class="item" (click)="cerrarSidebar()">
              <svg class="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"></path>
                <path d="M6 6h10"></path>
                <path d="M6 10h10"></path>
              </svg>
              <span>Biblioteca</span>
            </a>
            <a routerLink="seguimiento" routerLinkActive="current" class="item" (click)="cerrarSidebar()">
              <svg class="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 3v18h18"></path>
                <path d="m19 9-5 5-4-4-3 3"></path>
              </svg>
              <span>Mi seguimiento</span>
            </a>
          </ng-container>

          <ng-container *ngIf="service.usuarioActual().rol === 'psicologa'">
            <a routerLink="inicio-psicologa" routerLinkActive="current" class="item" (click)="cerrarSidebar()">
              <svg class="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              <span>Inicio</span>
            </a>
            <a routerLink="sesiones" routerLinkActive="current" class="item" (click)="cerrarSidebar()">
              <svg class="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
                <line x1="16" y1="16" x2="16" y2="6"></line>
                <line x1="8" y1="8" x2="8" y2="6"></line>
                <line x1="3" x2="21" y1="10" y2="10"></line>
              </svg>
              <span>Sesiones</span>
            </a>
            <a routerLink="deportistas" routerLinkActive="current" class="item" (click)="cerrarSidebar()">
              <svg class="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              <span>Deportistas</span>
            </a>
            <a routerLink="biblioteca" routerLinkActive="current" class="item" (click)="cerrarSidebar()">
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

      <!-- Contenedor Principal de Contenido -->
      <div class="content-shell">
        <header class="navbar-top">
          <div class="navbar-left">
            <!-- Botón Hamburguesa para Móvil y Tablets -->
            <button 
              type="button" 
              class="btn-hamburger" 
              (click)="toggleSidebar()" 
              aria-label="Abrir menú de navegación">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>

            <!-- Mini Logo para pantallas móviles -->
            <div class="mobile-brand-pill">
              <div class="mini-brand-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path>
                  <path d="M2 12h20"></path>
                </svg>
              </div>
              <span class="mini-brand-title">PsicoConecta</span>
            </div>

            <!-- Etiqueta de plataforma (oculta en pantallas muy pequeñas) -->
            <div class="platform-tag">
              <span class="live-dot"></span>
              <span class="view-tag">IDERT · Psicología Deportiva</span>
            </div>
          </div>

          <div class="profile-tag">
            <div class="info">
              <span class="name">{{ service.usuarioActual().nombre || 'Usuario' }}</span>
              <span class="role">{{ service.usuarioActual().rol === 'deportista' ? 'Deportista IDERT' : 'Psicólogo/a Especialista' }}</span>
            </div>
            <div class="avatar-badge">{{ service.usuarioActual().avatarIniciales || 'PC' }}</div>
          </div>
        </header>

        <main class="page-container">
          <router-outlet></router-outlet>
        </main>

        <!-- Barra de Navegación Inferior Móvil (Bottom Navigation Bar) -->
        <nav class="bottom-nav-bar" *ngIf="service.usuarioActual().rol === 'deportista'">
          <a routerLink="inicio" routerLinkActive="active" class="bottom-nav-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            <span>Inicio</span>
          </a>
          <a routerLink="sesiones" routerLinkActive="active" class="bottom-nav-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
              <line x1="16" y1="16" x2="16" y2="6"></line>
              <line x1="8" y1="8" x2="8" y2="6"></line>
              <line x1="3" x2="21" y1="10" y2="10"></line>
            </svg>
            <span>Sesiones</span>
          </a>
          <a routerLink="biblioteca" routerLinkActive="active" class="bottom-nav-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"></path>
              <path d="M6 6h10"></path>
              <path d="M6 10h10"></path>
            </svg>
            <span>Biblioteca</span>
          </a>
          <a routerLink="seguimiento" routerLinkActive="active" class="bottom-nav-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 3v18h18"></path>
              <path d="m19 9-5 5-4-4-3 3"></path>
            </svg>
            <span>Seguimiento</span>
          </a>
        </nav>

        <nav class="bottom-nav-bar" *ngIf="service.usuarioActual().rol === 'psicologa'">
          <a routerLink="inicio-psicologa" routerLinkActive="active" class="bottom-nav-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            <span>Inicio</span>
          </a>
          <a routerLink="sesiones" routerLinkActive="active" class="bottom-nav-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
              <line x1="16" y1="16" x2="16" y2="6"></line>
              <line x1="8" y1="8" x2="8" y2="6"></line>
              <line x1="3" x2="21" y1="10" y2="10"></line>
            </svg>
            <span>Sesiones</span>
          </a>
          <a routerLink="deportistas" routerLinkActive="active" class="bottom-nav-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <span>Deportistas</span>
          </a>
          <a routerLink="biblioteca" routerLinkActive="active" class="bottom-nav-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"></path>
              <path d="M6 6h10"></path>
              <path d="M6 10h10"></path>
            </svg>
            <span>Biblioteca</span>
          </a>
        </nav>
      </div>

      <div class="toast-popup" *ngIf="service.toastMensaje()">{{ service.toastMensaje() }}</div>
      <app-videollamada *ngIf="service.llamadaActiva()"></app-videollamada>
      <app-ejercicio-modal *ngIf="service.ejercicioSeleccionado()"></app-ejercicio-modal>
    </div>
  `,
  styles: [`
    .app-shell { 
      display: flex; 
      height: 100vh; 
      height: 100dvh;
      overflow: hidden; 
      background: #f8fafc; 
      position: relative;
    }
    
    /* ================= SIDEBAR / PANEL LATERAL ================= */
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
      z-index: 100;
      transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .brand-header { margin-bottom: 24px; padding-left: 6px; }
    .brand-logo-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
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
      flex-shrink: 0;
    }
    .brand-header h2 { 
      font-size: 1.45rem; 
      font-weight: 800; 
      margin: 0; 
      flex: 1;
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

    .btn-close-drawer {
      display: none;
      background: rgba(255, 255, 255, 0.1);
      border: none;
      color: #cbd5e1;
      width: 32px;
      height: 32px;
      border-radius: 8px;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }
    
    .nav-links { display: flex; flex-direction: column; gap: 6px; flex: 1; overflow-y: auto; }
    
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
    
    /* ================= CONTENEDOR SHELL ================= */
    .content-shell { 
      flex: 1; 
      display: flex; 
      flex-direction: column; 
      overflow-y: auto; 
      background: #f8fafc; 
      position: relative;
      -webkit-overflow-scrolling: touch;
    }

    .navbar-top { 
      background: #ffffff; 
      padding: 12px clamp(16px, 3vw, 32px); 
      border-bottom: 1px solid var(--border-subtle); 
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
      position: sticky;
      top: 0;
      z-index: 50;
      min-height: 60px;
    }
    
    .navbar-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .btn-hamburger {
      display: none;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      width: 38px;
      height: 38px;
      border-radius: 10px;
      align-items: center;
      justify-content: center;
      color: #1e293b;
      cursor: pointer;
      transition: all 0.15s ease;
      flex-shrink: 0;
    }
    .btn-hamburger:hover {
      background: #eff6ff;
      border-color: #3b82f6;
      color: #2563eb;
    }

    .mobile-brand-pill {
      display: none;
      align-items: center;
      gap: 7px;
    }
    .mini-brand-icon {
      width: 28px;
      height: 28px;
      border-radius: 7px;
      background: linear-gradient(135deg, #2563eb 0%, #ec4899 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
    }
    .mini-brand-title {
      font-weight: 800;
      font-size: 1.1rem;
      background: linear-gradient(135deg, #1e3a8a 0%, #ec4899 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      letter-spacing: -0.02em;
    }

    .platform-tag { display: flex; align-items: center; gap: 8px; }
    .live-dot { 
      width: 8px; 
      height: 8px; 
      border-radius: 50%; 
      background: #2563eb; 
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2); 
    }
    .view-tag { font-weight: 600; color: #0f172a; font-size: 0.88rem; }
    
    .profile-tag { display: flex; align-items: center; gap: 10px; }
    .info { text-align: right; }
    .name { display: block; font-size: 0.86rem; font-weight: 700; color: #0f172a; }
    .role { display: block; font-size: 0.72rem; color: #ec4899; font-weight: 600; }
    
    .avatar-badge { 
      width: 38px; 
      height: 38px; 
      border-radius: 10px; 
      background: linear-gradient(135deg, #2563eb 0%, #ec4899 100%); 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      font-weight: 700; 
      font-size: 0.82rem; 
      color: #ffffff; 
      box-shadow: 0 4px 10px rgba(37, 99, 235, 0.25);
      flex-shrink: 0;
    }
    
    .page-container { 
      padding: clamp(16px, 3vw, 32px); 
      max-width: 1200px; 
      width: 100%; 
      margin: 0 auto; 
      box-sizing: border-box; 
      flex: 1;
    }

    /* ================= BARRA INFERIOR MÓVIL (BOTTOM NAV) ================= */
    .bottom-nav-bar {
      display: none;
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: rgba(255, 255, 255, 0.98);
      backdrop-filter: blur(12px);
      border-top: 1px solid #e2e8f0;
      padding: 6px 12px calc(6px + var(--sab)) 12px;
      z-index: 99;
      justify-content: space-around;
      align-items: center;
      box-shadow: 0 -4px 16px rgba(15, 23, 42, 0.06);
    }

    .bottom-nav-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 3px;
      color: #64748b;
      text-decoration: none;
      font-size: 0.7rem;
      font-weight: 600;
      padding: 6px 10px;
      border-radius: 8px;
      transition: all 0.15s ease;
      min-width: 60px;
    }

    .bottom-nav-item svg {
      transition: transform 0.15s ease;
    }

    .bottom-nav-item.active {
      color: #2563eb;
    }
    .bottom-nav-item.active svg {
      stroke: #ec4899;
      transform: translateY(-1px);
    }

    /* Backdrop para drawer */
    .drawer-backdrop {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(4px);
      z-index: 999;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.25s ease;
    }
    .drawer-backdrop.show {
      opacity: 1;
      pointer-events: auto;
    }

    /* Toast */
    .toast-popup { 
      position: fixed; 
      bottom: calc(24px + var(--sab)); 
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
      max-width: 90vw;
      text-align: center;
      white-space: normal;
    }

    /* ================= BREAKPOINTS RESPONSIVOS ================= */
    @media (max-width: 991px) {
      .side-panel {
        position: fixed;
        top: 0;
        bottom: 0;
        left: 0;
        width: min(280px, 80vw);
        z-index: 1000;
        transform: translateX(-100%);
        box-shadow: 10px 0 30px rgba(0, 0, 0, 0.4);
      }
      .side-panel.drawer-open {
        transform: translateX(0);
      }
      .btn-close-drawer {
        display: flex;
      }
      .btn-hamburger {
        display: flex;
      }
      .drawer-backdrop {
        display: block;
      }
    }

    @media (max-width: 768px) {
      .bottom-nav-bar {
        display: flex;
      }
      .page-container {
        padding-bottom: calc(76px + var(--sab));
      }
      .platform-tag {
        display: none;
      }
      .mobile-brand-pill {
        display: flex;
      }
      .profile-tag .info .role {
        display: none;
      }
    }

    @media (max-width: 480px) {
      .profile-tag .info {
        display: none;
      }
      .navbar-top {
        padding: 10px 14px;
      }
    }
  `]
})
export class LayoutComponent {
  service = inject(RecanchaService);
  router = inject(Router);
  sidebarAbierta = false;

  toggleSidebar() {
    this.sidebarAbierta = !this.sidebarAbierta;
  }

  cerrarSidebar() {
    this.sidebarAbierta = false;
  }

  salir() {
    this.cerrarSidebar();
    this.service.cerrarSesion();
    this.router.navigate(['/login']);
  }
}
