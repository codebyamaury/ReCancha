import { Component, inject, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RecanchaService, calcularIniciales, extraerNombreLegible } from '../../services/recancha.service';
import { FirebaseService } from '../../services/firebase.service';
import { RolUsuario } from '../../models/recancha.models';

interface SeparatedParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  z: number;
  baseRadius: number;
  colorType: 'white' | 'pink' | 'sky' | 'blue';
  colorHex: string;
  glowRgba: string;
  alpha: number;
  pulsePhase: number;
  pulseSpeed: number;
  hoverScale: number;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-viewport" (mousemove)="onMouseMove($event)" (mouseleave)="onMouseLeave()">
      <!-- Canvas de Partículas Separadas e Interactivas con Hover 3D (60 FPS) -->
      <canvas #particleCanvas class="particles-canvas"></canvas>

      <!-- Tarjeta Principal con Stacking Context Alto y Clicks 100% Seguros -->
      <div class="card-container">
        <div class="card-login">
          <!-- Cabecera Institucional -->
          <header class="card-header">
            <div class="brand-badge-pill">
              <span class="badge-dot"></span>
              <span>IDERT · TELEPSICOLOGÍA DEPORTIVA</span>
            </div>

            <h1 class="logo-title">
              <span class="title-main">PsicoConecta</span>
              <span class="title-dot">.</span>
            </h1>
            <p class="logo-subtitle">
              Plataforma de acompañamiento psicológico y rehabilitación emocional para deportistas lesionados.
            </p>
          </header>

          <!-- Selector de Rol (Deportista / Psicólogo/a) -->
          <div class="role-selector-container">
            <div class="pill-group">
              <button 
                type="button" 
                class="pill-btn"
                [class.active]="rolSeleccionado === 'deportista'" 
                (click)="setRol('deportista')"
                id="tab-deportista">
                <svg class="tab-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="5" r="3"></circle>
                  <path d="m19 20-4-6-3 3v7"></path>
                  <path d="M5 20l4-7 4 2 2-4"></path>
                  <path d="m9 10 3-3 4 2"></path>
                </svg>
                <span>Deportista</span>
              </button>

              <button 
                type="button" 
                class="pill-btn"
                [class.active]="rolSeleccionado === 'psicologa'" 
                (click)="setRol('psicologa')"
                id="tab-psicologa">
                <svg class="tab-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.47 3 5.74V17a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 0 0-7-7Z"></path>
                  <path d="M9 21h6"></path>
                </svg>
                <span>Psicólogo/a</span>
              </button>
            </div>
          </div>

          <!-- Alerta de Error Descriptiva -->
          <div class="alert-box" *ngIf="mensajeError">
            <div class="alert-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </div>
            <div class="alert-msg">{{ mensajeError }}</div>
            <button type="button" class="alert-close-btn" (click)="mensajeError = null" aria-label="Cerrar alerta">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <!-- ================= SECCIÓN DEPORTISTA: GOOGLE AUTH ================= -->
          <div class="auth-section" *ngIf="rolSeleccionado === 'deportista'">
            <div class="feature-info-card">
              <div class="info-svg-chip">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
              </div>
              <div class="info-body">
                <strong>Acceso con Google:</strong> Ingresa con tu cuenta personal o institucional para consultar citas, test anímico y biblioteca.
              </div>
            </div>

            <div class="consent-check-wrapper">
              <input type="checkbox" id="ley1581-dep" [(ngModel)]="consentimiento" class="custom-checkbox">
              <label for="ley1581-dep" class="consent-label">
                Acepto el consentimiento informado y el tratamiento de datos confidenciales de salud mental (<span class="legal-cite">Ley 1581 de 2012</span>).
              </label>
            </div>

            <!-- Botón Oficial de Google -->
            <button 
              type="button" 
              class="btn-google-auth" 
              (click)="ingresarConGoogle()" 
              [disabled]="cargando"
              id="btn-google-sign-in">
              <div class="google-logo-wrapper">
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
              </div>
              <span *ngIf="!cargando" class="btn-text">Continuar con Google</span>
              <span *ngIf="cargando" class="btn-text-loading">
                <span class="spinner-ring blue"></span> Conectando cuenta Google...
              </span>
            </button>
          </div>

          <!-- ================= SECCIÓN PSICÓLOGO/A: FIREBASE AUTH ================= -->
          <div class="auth-section" *ngIf="rolSeleccionado === 'psicologa'">
            <div class="feature-info-card card-psi-tone">
              <div class="info-svg-chip psi-chip">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
              <div class="info-body">
                <strong>Acceso Clínico Autorizado:</strong> Ingresa con tu correo y contraseña registrados en <strong>Firebase Authentication</strong>.
              </div>
            </div>

            <!-- Campo Correo (Sin valores quemados) -->
            <div class="input-field-group">
              <label class="field-label" for="psi-email">Correo Electrónico</label>
              <div class="field-input-box">
                <span class="field-prefix-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                  </svg>
                </span>
                <input 
                  id="psi-email"
                  type="email" 
                  class="custom-input" 
                  [(ngModel)]="email" 
                  placeholder="ejemplo@idert.edu.co" 
                  autocomplete="email"
                  (keydown.enter)="ingresarConFirebase()">
              </div>
            </div>

            <!-- Campo Contraseña (Sin valores quemados) -->
            <div class="input-field-group">
              <label class="field-label" for="psi-password">Contraseña</label>
              <div class="field-input-box">
                <span class="field-prefix-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </span>
                <input 
                  id="psi-password"
                  [type]="mostrarPassword ? 'text' : 'password'" 
                  class="custom-input has-action" 
                  [(ngModel)]="password" 
                  placeholder="Tu contraseña de acceso" 
                  autocomplete="current-password"
                  (keydown.enter)="ingresarConFirebase()">
                
                <button 
                  type="button" 
                  class="btn-eye-toggle" 
                  (click)="mostrarPassword = !mostrarPassword"
                  [attr.aria-label]="mostrarPassword ? 'Ocultar contraseña' : 'Ver contraseña'">
                  <svg *ngIf="!mostrarPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                  <svg *ngIf="mostrarPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
                    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
                    <line x1="2" y1="2" x2="22" y2="22"></line>
                  </svg>
                </button>
              </div>
            </div>

            <div class="consent-check-wrapper">
              <input type="checkbox" id="ley1581-psi" [(ngModel)]="consentimiento" class="custom-checkbox">
              <label for="ley1581-psi" class="consent-label">
                Acepto el consentimiento informado y el tratamiento de datos personales (<span class="legal-cite">Ley 1581 de 2012</span>).
              </label>
            </div>

            <!-- Botón Principal Psicólogo con Degradado Azul-Rosado -->
            <button 
              type="button" 
              class="btn-gradient-submit" 
              (click)="ingresarConFirebase()" 
              [disabled]="cargando"
              id="btn-submit-psicologa">
              <span *ngIf="!cargando" class="btn-text">
                <span>Ingresar al Panel Clínico</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </span>
              <span *ngIf="cargando" class="btn-text-loading">
                <span class="spinner-ring white"></span> Validando en Firebase...
              </span>
            </button>

            <div class="divider-or">
              <span>o también ingresa con</span>
            </div>

            <!-- Botón Oficial de Google para Especialista -->
            <button 
              type="button" 
              class="btn-google-auth" 
              (click)="ingresarConGoogle()" 
              [disabled]="cargando"
              id="btn-google-sign-in-psi">
              <div class="google-logo-wrapper">
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
              </div>
              <span *ngIf="!cargando" class="btn-text">Continuar con Google</span>
              <span *ngIf="cargando" class="btn-text-loading">
                <span class="spinner-ring blue"></span> Conectando cuenta Google...
              </span>
            </button>
          </div>

          <!-- Pie de Tarjeta Institucional -->
          <footer class="card-footer">
            <div class="institution-badges">
              <span class="badge-item">Instituto IDERT</span>
              <span class="badge-sep">·</span>
              <span class="badge-item">Universidad del Sinú</span>
            </div>
            <p class="footer-copy">GIPSINÚ · Telepsicología e Intervención TCC · Cartagena de Indias</p>
          </footer>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* ================= CONTENEDOR PRINCIPAL ULTRA OPTIMIZADO ================= */
    .login-viewport {
      position: relative;
      min-height: 100vh;
      min-height: 100dvh;
      width: 100%;
      /* Gradientes CSS de fondo estáticos con tonos profundos para contraste de malla 3D */
      background: 
        radial-gradient(circle at 18% 20%, rgba(37, 99, 235, 0.28) 0%, transparent 45%),
        radial-gradient(circle at 82% 80%, rgba(236, 72, 153, 0.25) 0%, transparent 45%),
        radial-gradient(circle at 50% 50%, #0c1838 0%, #050b1a 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: clamp(16px, 4vw, 36px) clamp(12px, 3vw, 24px);
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
      box-sizing: border-box;
    }

    /* Canvas de Malla 3D Geométrica (Plexus/Wireframe) */
    .particles-canvas {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none !important;
      z-index: 1;
    }

    /* ================= CONTENEDOR DE LA TARJETA (RESPONSIVO Y LIGERO) ================= */
    .card-container {
      position: relative;
      z-index: 100 !important;
      pointer-events: auto !important;
      width: 100%;
      max-width: 460px;
      margin: auto;
    }

    .card-login {
      position: relative;
      z-index: 101 !important;
      pointer-events: auto !important;
      background: rgba(255, 255, 255, 0.98);
      border-radius: clamp(16px, 4vw, 22px);
      padding: clamp(24px, 5vw, 36px) clamp(18px, 4.5vw, 32px);
      border: 1px solid rgba(255, 255, 255, 0.85);
      box-shadow: 
        0 15px 35px -5px rgba(5, 11, 26, 0.6),
        0 10px 25px -5px rgba(236, 72, 153, 0.18),
        0 8px 20px -5px rgba(37, 99, 235, 0.22);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .card-login:hover {
      transform: translateY(-2px);
      box-shadow: 
        0 20px 45px -5px rgba(5, 11, 26, 0.7),
        0 12px 30px -5px rgba(236, 72, 153, 0.25),
        0 10px 25px -5px rgba(37, 99, 235, 0.28);
    }

    /* ================= HEADER ================= */
    .card-header {
      margin-bottom: 20px;
      text-align: left;
    }

    .brand-badge-pill {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      font-size: 0.68rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: #2563eb;
      background: #eff6ff;
      border: 1px solid #dbeafe;
      padding: 4px 10px;
      border-radius: 20px;
      margin-bottom: 12px;
    }

    .badge-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #ec4899;
      box-shadow: 0 0 6px #ec4899;
    }

    .logo-title {
      font-size: clamp(1.65rem, 5vw, 2.1rem);
      font-weight: 900;
      letter-spacing: -0.03em;
      line-height: 1.15;
      color: #0f172a;
      display: flex;
      align-items: baseline;
    }

    .title-main {
      background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #db2777 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .title-dot {
      color: #ec4899;
      -webkit-text-fill-color: #ec4899;
    }

    .logo-subtitle {
      color: #64748b;
      font-size: clamp(0.78rem, 2.2vw, 0.85rem);
      line-height: 1.45;
      margin-top: 6px;
    }

    /* ================= SELECTOR DE ROL ================= */
    .role-selector-container {
      margin-bottom: 20px;
      position: relative;
      z-index: 105 !important;
    }

    .pill-group {
      display: grid;
      grid-template-columns: 1fr 1fr;
      background: #f1f5f9;
      padding: 4px;
      border-radius: 12px;
      gap: 6px;
      border: 1px solid #e2e8f0;
    }

    .pill-btn {
      position: relative;
      z-index: 106 !important;
      pointer-events: auto !important;
      border: none;
      background: transparent;
      padding: 10px 14px;
      font-size: 0.86rem;
      font-weight: 600;
      color: #64748b;
      border-radius: 9px;
      cursor: pointer !important;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.15s ease;
      user-select: none;
    }

    .pill-btn:hover {
      color: #0f172a;
      background: rgba(255, 255, 255, 0.6);
    }

    .pill-btn:active {
      transform: scale(0.98);
    }

    .pill-btn.active {
      background: #ffffff;
      color: #1e3a8a;
      box-shadow: 0 4px 10px rgba(15, 23, 42, 0.08);
      font-weight: 700;
    }

    .pill-btn.active .tab-svg {
      stroke: #2563eb;
    }

    .pill-btn:last-child.active .tab-svg {
      stroke: #ec4899;
    }

    /* ================= ALERTA DE ERROR ================= */
    .alert-box {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      background: #fff1f2;
      border: 1px solid #fecdd3;
      color: #9f1239;
      padding: 12px 14px;
      border-radius: 10px;
      font-size: 0.82rem;
      line-height: 1.4;
      margin-bottom: 20px;
    }

    .alert-icon {
      flex-shrink: 0;
      color: #e11d48;
      margin-top: 1px;
    }

    .alert-msg {
      flex: 1;
    }

    .alert-close-btn {
      background: none;
      border: none;
      color: #be123c;
      cursor: pointer;
      padding: 0;
      opacity: 0.6;
    }
    .alert-close-btn:hover { opacity: 1; }

    /* ================= FEATURE CARDS ================= */
    .auth-section {
      display: flex;
      flex-direction: column;
      position: relative;
      z-index: 105 !important;
    }

    .feature-info-card {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      background: linear-gradient(135deg, #eff6ff 0%, #fdf2f8 100%);
      border: 1px solid #dbeafe;
      border-radius: 12px;
      padding: 13px 15px;
      font-size: 0.82rem;
      color: #1e3a8a;
      line-height: 1.45;
      margin-bottom: 18px;
    }

    .card-psi-tone {
      background: linear-gradient(135deg, #fdf2f8 0%, #eff6ff 100%);
      border-color: #fbcfe8;
      color: #831843;
    }

    .info-svg-chip {
      color: #2563eb;
      background: #ffffff;
      padding: 6px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(37, 99, 235, 0.12);
      flex-shrink: 0;
    }

    .psi-chip {
      color: #ec4899;
      box-shadow: 0 2px 4px rgba(236, 72, 153, 0.15);
    }

    .info-body {
      flex: 1;
    }

    /* ================= CAMPOS DE ENTRADA ================= */
    .input-field-group {
      margin-bottom: 15px;
    }

    .field-label {
      display: block;
      font-size: 0.82rem;
      font-weight: 700;
      color: #334155;
      margin-bottom: 6px;
    }

    .field-input-box {
      position: relative;
      display: flex;
      align-items: center;
    }

    .field-prefix-icon {
      position: absolute;
      left: 14px;
      color: #94a3b8;
      pointer-events: none;
      display: flex;
      align-items: center;
    }

    .custom-input {
      width: 100%;
      padding: 12px 14px 12px 42px;
      background: #f8fafc;
      border: 1.5px solid #e2e8f0;
      border-radius: 10px;
      font-size: 0.88rem;
      color: #0f172a;
      transition: all 0.15s ease;
      pointer-events: auto !important;
    }

    .custom-input.has-action {
      padding-right: 44px;
    }

    .custom-input:focus {
      outline: none;
      background: #ffffff;
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
    }

    .custom-input:focus + .btn-eye-toggle {
      color: #2563eb;
    }

    .field-input-box:focus-within .field-prefix-icon {
      color: #2563eb;
    }

    .btn-eye-toggle {
      position: absolute;
      right: 12px;
      background: none;
      border: none;
      cursor: pointer !important;
      color: #94a3b8;
      padding: 6px;
      display: flex;
      align-items: center;
      border-radius: 6px;
      transition: color 0.15s ease;
      pointer-events: auto !important;
    }

    .btn-eye-toggle:hover {
      color: #0f172a;
    }

    /* ================= CHECKBOX DE CONSENTIMIENTO ================= */
    .consent-check-wrapper {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      margin: 8px 0 20px 0;
      line-height: 1.4;
      pointer-events: auto !important;
    }

    .custom-checkbox {
      margin-top: 3px;
      width: 16px;
      height: 16px;
      accent-color: #ec4899;
      cursor: pointer !important;
      flex-shrink: 0;
      pointer-events: auto !important;
    }

    .consent-label {
      font-size: 0.77rem;
      color: #475569;
      cursor: pointer !important;
      user-select: none;
      pointer-events: auto !important;
    }

    .legal-cite {
      color: #2563eb;
      font-weight: 600;
    }

    /* ================= BOTONES DE ACCIÓN (CLICKS GARANTIZADOS) ================= */
    .btn-google-auth {
      position: relative;
      z-index: 108 !important;
      pointer-events: auto !important;
      width: 100%;
      background: #ffffff;
      color: #1e293b;
      border: 1.5px solid #cbd5e1;
      padding: 13px 18px;
      border-radius: 12px;
      font-weight: 600;
      font-size: 0.94rem;
      cursor: pointer !important;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      box-shadow: 0 2px 6px rgba(15, 23, 42, 0.06);
      transition: all 0.18s ease;
      user-select: none;
    }

    .btn-google-auth:hover:not(:disabled) {
      background: #f8fafc;
      border-color: #94a3b8;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15);
      transform: translateY(-1px);
    }

    .btn-google-auth:active:not(:disabled) {
      transform: translateY(0);
      background: #f1f5f9;
    }

    .btn-google-auth:disabled {
      opacity: 0.65;
      cursor: not-allowed !important;
    }

    .google-logo-wrapper {
      display: flex;
      align-items: center;
      flex-shrink: 0;
      pointer-events: none;
    }

    .btn-gradient-submit {
      position: relative;
      z-index: 108 !important;
      pointer-events: auto !important;
      width: 100%;
      background: linear-gradient(135deg, #2563eb 0%, #db2777 100%);
      color: #ffffff;
      border: none;
      padding: 13px 20px;
      border-radius: 12px;
      font-weight: 700;
      font-size: 0.94rem;
      cursor: pointer !important;
      box-shadow: 0 4px 16px rgba(37, 99, 235, 0.35);
      transition: all 0.18s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      user-select: none;
    }

    .btn-gradient-submit:hover:not(:disabled) {
      background: linear-gradient(135deg, #1d4ed8 0%, #be185d 100%);
      box-shadow: 0 6px 20px rgba(219, 39, 119, 0.45);
      transform: translateY(-1px);
    }

    .btn-gradient-submit:active:not(:disabled) {
      transform: translateY(0);
    }

    .btn-gradient-submit:disabled {
      opacity: 0.65;
      cursor: not-allowed !important;
    }

    .btn-text {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      pointer-events: none;
    }

    .btn-text-loading {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      pointer-events: none;
    }

    /* Spinner Animado */
    .spinner-ring {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      border: 2px solid rgba(0, 0, 0, 0.1);
      animation: spin 0.8s linear infinite;
    }

    .spinner-ring.blue {
      border-color: #cbd5e1;
      border-top-color: #2563eb;
    }

    .spinner-ring.white {
      border-color: rgba(255, 255, 255, 0.35);
      border-top-color: #ffffff;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* ================= FOOTER INSTITUCIONAL ================= */
    .card-footer {
      margin-top: 24px;
      padding-top: 18px;
      border-top: 1px solid #f1f5f9;
      text-align: center;
    }

    .institution-badges {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      font-size: 0.76rem;
      font-weight: 700;
      color: #475569;
      margin-bottom: 4px;
      flex-wrap: wrap;
    }

    .badge-sep {
      color: #ec4899;
    }

    .footer-copy {
      font-size: 0.7rem;
      color: #94a3b8;
      line-height: 1.4;
    }

    /* ================= BREAKPOINTS RESPONSIVOS LOGIN ================= */
    @media (max-width: 480px) {
      .card-login {
        padding: 24px 18px;
        border-radius: 16px;
      }
      .brand-badge-pill {
        font-size: 0.62rem;
        padding: 3px 8px;
        letter-spacing: 0.05em;
      }
      .pill-btn {
        padding: 8px 10px;
        font-size: 0.8rem;
      }
      .feature-info-card {
        padding: 11px 12px;
        font-size: 0.78rem;
        gap: 9px;
      }
      .btn-gradient-submit {
        padding: 12px 14px;
        font-size: 0.9rem;
      }
    }

    @media (max-width: 360px) {
      .card-login {
        padding: 20px 14px;
      }
      .tab-svg {
        display: none;
      }
    }
  `]
})
export class LoginComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('particleCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  service = inject(RecanchaService);
  fb = inject(FirebaseService);
  router = inject(Router);

  rolSeleccionado: RolUsuario = 'deportista';
  
  email = '';
  password = '';
  mostrarPassword = false;
  consentimiento = true;
  cargando = false;
  mensajeError: string | null = null;

  // Variables para la animación interactiva de partículas separadas 3D
  private animationFrameId: number | null = null;
  private mouseX = -1000;
  private mouseY = -1000;
  private mouseActive = false;
  private lastMouseMoveTime = 0;
  private reinitParticlesFn: (() => void) | null = null;

  ngOnInit() {
    if (this.service.estaAutenticado()) {
      const rol = this.service.usuarioActual().rol;
      this.router.navigate([rol === 'psicologa' ? '/app/inicio-psicologa' : '/app/inicio']);
    }
  }

  ngAfterViewInit() {
    this.iniciarParticulasSeparadasInteractivas();
  }

  ngOnDestroy() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  setRol(rol: RolUsuario) {
    this.rolSeleccionado = rol;
    this.mensajeError = null;
    this.email = '';
    this.password = '';
  }

  onMouseMove(event: MouseEvent) {
    this.mouseX = event.clientX;
    this.mouseY = event.clientY;
    this.mouseActive = true;
    this.lastMouseMoveTime = Date.now();
  }

  onMouseLeave() {
    this.mouseActive = false;
  }

  @HostListener('window:resize')
  onResize() {
    this.ajustarCanvas();
    if (this.reinitParticlesFn) {
      this.reinitParticlesFn();
    }
  }

  private ajustarCanvas() {
    if (!this.canvasRef?.nativeElement) return;
    const canvas = this.canvasRef.nativeElement;
    // Escalado de píxeles controlado para máximo rendimiento en todas las pantallas
    const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    const ctx = canvas.getContext('2d');
    if (ctx && dpr !== 1) {
      ctx.scale(dpr, dpr);
    }
  }

  /* ================= MOTOR DE PARTÍCULAS SEPARADAS E INTERACTIVAS (BLANCO, ROSADO Y AZUL) ================= */
  private iniciarParticulasSeparadasInteractivas() {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    this.ajustarCanvas();

    const particles: SeparatedParticle[] = [];

    const initParticles = () => {
      particles.length = 0;
      const w = window.innerWidth;
      const h = window.innerHeight;

      // Celdas jittered espaciadas: garantizan separación perfecta y uniforme en toda la pantalla
      const cols = w < 768 ? 7 : w < 1200 ? 9 : 11;
      const rows = w < 768 ? 6 : w < 1200 ? 7 : 8;
      const cellW = w / cols;
      const cellH = h / rows;

      const palette = [
        { type: 'white', hex: '#ffffff', glow: 'rgba(255, 255, 255,' },
        { type: 'pink', hex: '#ec4899', glow: 'rgba(236, 72, 153,' },
        { type: 'sky', hex: '#38bdf8', glow: 'rgba(56, 189, 248,' },
        { type: 'blue', hex: '#3b82f6', glow: 'rgba(59, 130, 246,' }
      ] as const;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          // Posición dentro de la celda con margen seguro para que jamás se amontonen
          const x = (c + 0.15 + Math.random() * 0.7) * cellW;
          const y = (r + 0.15 + Math.random() * 0.7) * cellH;

          const colItem = palette[(c + r * 3) % palette.length];
          const z = 0.5 + Math.random() * 0.9;

          particles.push({
            x,
            y,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4,
            z,
            baseRadius: 1.5 + z * 1.3,
            colorType: colItem.type,
            colorHex: colItem.hex,
            glowRgba: colItem.glow,
            alpha: 0.45 + Math.random() * 0.4,
            pulsePhase: Math.random() * Math.PI * 2,
            pulseSpeed: 0.018 + Math.random() * 0.02,
            hoverScale: 1.0
          });
        }
      }
    };

    initParticles();
    this.reinitParticlesFn = initParticles;

    const hoverRadius = 150;
    const hoverRadiusSq = hoverRadius * hoverRadius;
    const connectMaxDist = 115;
    const connectMaxDistSq = connectMaxDist * connectMaxDist;

    const render = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      ctx.clearRect(0, 0, width, height);

      // Desactivar interacción si el mouse se detiene por más de 3 segundos
      if (this.mouseActive && Date.now() - this.lastMouseMoveTime > 3000) {
        this.mouseActive = false;
      }

      // 1. Aura radial suave siguiendo el cursor (efecto halo elegante)
      if (this.mouseActive) {
        const mouseGlow = ctx.createRadialGradient(
          this.mouseX, this.mouseY, 0,
          this.mouseX, this.mouseY, hoverRadius * 1.15
        );
        mouseGlow.addColorStop(0, 'rgba(56, 189, 248, 0.09)');
        mouseGlow.addColorStop(0.5, 'rgba(236, 72, 153, 0.04)');
        mouseGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = mouseGlow;
        ctx.beginPath();
        ctx.arc(this.mouseX, this.mouseY, hoverRadius * 1.15, 0, Math.PI * 2);
        ctx.fill();
      }

      const pLen = particles.length;

      // 2. Actualización de posiciones y efecto interactivo del mouse
      for (let i = 0; i < pLen; i++) {
        const p = particles[i];

        // Pulso suave
        p.pulsePhase += p.pulseSpeed;

        // Movimiento flotante natural
        p.x += p.vx * p.z;
        p.y += p.vy * p.z;

        // Rebotar/envolver suavemente en los bordes de la pantalla
        if (p.x < -30) p.x = width + 30;
        else if (p.x > width + 30) p.x = -30;
        if (p.y < -30) p.y = height + 30;
        else if (p.y > height + 30) p.y = -30;

        // EFECTO AL PASAR EL MOUSE POR ENCIMA
        if (this.mouseActive) {
          const dx = p.x - this.mouseX;
          const dy = p.y - this.mouseY;
          const distSq = dx * dx + dy * dy;

          if (distSq < hoverRadiusSq && distSq > 0.01) {
            const dist = Math.sqrt(distSq);
            const norm = 1 - dist / hoverRadius; // 1 en el centro del cursor, 0 en el borde

            // A) Repulsión elástica suave (se apartan con elegancia al paso del cursor)
            const push = norm * 3.2 * p.z;
            p.x += (dx / dist) * push;
            p.y += (dy / dist) * push;

            // B) Agrandamiento y brillo al hacer hover
            const targetScale = 1.0 + norm * 1.6;
            p.hoverScale += (targetScale - p.hoverScale) * 0.22;

            // C) Conexión láser luminosa hacia el cursor
            ctx.strokeStyle = p.glowRgba + `${norm * 0.45})`;
            ctx.lineWidth = 0.8 + norm * 0.8;
            ctx.beginPath();
            ctx.moveTo(this.mouseX, this.mouseY);
            ctx.lineTo(p.x, p.y);
            ctx.stroke();
          } else {
            p.hoverScale += (1.0 - p.hoverScale) * 0.08;
          }
        } else {
          p.hoverScale += (1.0 - p.hoverScale) * 0.08;
        }
      }

      // 3. Conexiones tenues estilo constelación (solo entre partículas que pasen cerca)
      ctx.lineWidth = 0.55;
      for (let i = 0; i < pLen; i++) {
        const p1 = particles[i];
        for (let j = i + 1; j < pLen; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dSq = dx * dx + dy * dy;

          if (dSq < connectMaxDistSq) {
            const dist = Math.sqrt(dSq);
            const lineAlpha = (1 - dist / connectMaxDist) * 0.2;
            ctx.strokeStyle = p1.colorType === 'pink' || p2.colorType === 'pink'
              ? `rgba(236, 72, 153, ${lineAlpha})`
              : `rgba(56, 189, 248, ${lineAlpha})`;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      // 4. Dibujar partículas (núcleo definido + halo resplandeciente)
      for (let i = 0; i < pLen; i++) {
        const p = particles[i];
        const pulse = 1.0 + Math.sin(p.pulsePhase) * 0.12;
        const r = p.baseRadius * p.hoverScale * pulse;

        // Halo exterior translúcido
        const haloAlpha = p.alpha * 0.35 + (p.hoverScale - 1) * 0.45;
        ctx.fillStyle = p.glowRgba + `${Math.min(haloAlpha, 0.85)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r * 2.6, 0, Math.PI * 2);
        ctx.fill();

        // Núcleo central nítido
        ctx.fillStyle = p.colorHex;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      this.animationFrameId = requestAnimationFrame(render);
    };

    render();
  }

  /* ================= LÓGICA DE AUTENTICACIÓN ================= */

  async ingresarConGoogle() {
    this.mensajeError = null;

    if (!this.consentimiento) {
      this.mensajeError = 'Debes aceptar el consentimiento informado y el tratamiento de datos para continuar.';
      return;
    }

    this.cargando = true;

    try {
      const res = await this.fb.loginWithGoogle();
      const user = res.user;

      const nombre = extraerNombreLegible(user.displayName, user.email);
      const email = user.email || '';
      const fotoUrl = user.photoURL || '';

      this.service.establecerUsuario({
        uid: user.uid,
        email: email,
        nombre: nombre,
        rol: this.rolSeleccionado,
        consentimientoLey1581: this.consentimiento,
        avatarIniciales: calcularIniciales(nombre, email),
        fotoUrl: fotoUrl
      });

      this.service.mostrarToast(`¡Bienvenido(a), ${nombre}!`);
      this.router.navigate([this.rolSeleccionado === 'psicologa' ? '/app/inicio-psicologa' : '/app/inicio']);
    } catch (err: any) {
      console.error('Error al ingresar con Google:', err);
      this.mensajeError = this.traducirErrorFirebase(err);
    } finally {
      this.cargando = false;
    }
  }

  async ingresarConFirebase() {
    this.mensajeError = null;

    if (!this.consentimiento) {
      this.mensajeError = 'Debes aceptar el consentimiento informado y el tratamiento de datos para continuar.';
      return;
    }

    if (!this.email.trim() || !this.password) {
      this.mensajeError = 'Por favor ingresa tu correo electrónico institucional y tu contraseña.';
      return;
    }

    this.cargando = true;

    try {
      const res = await this.fb.loginWithEmail(this.email.trim(), this.password);
      const user = res.user;

      const nombre = extraerNombreLegible(user.displayName, user.email || this.email.trim());
      const email = user.email || this.email.trim();
      const fotoUrl = user.photoURL || '';

      this.service.establecerUsuario({
        uid: user.uid,
        email: email,
        nombre: nombre,
        rol: 'psicologa',
        consentimientoLey1581: this.consentimiento,
        avatarIniciales: calcularIniciales(nombre, email),
        fotoUrl: fotoUrl
      });

      this.service.mostrarToast(`¡Bienvenida(o), ${nombre}!`);
      this.router.navigate(['/app/inicio-psicologa']);
    } catch (err: any) {
      console.error('Error al ingresar con Firebase:', err);
      this.mensajeError = this.traducirErrorFirebase(err);
    } finally {
      this.cargando = false;
    }
  }

  private traducirErrorFirebase(err: any): string {
    const code = err?.code || '';
    switch (code) {
      case 'auth/invalid-credential':
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        return 'Credenciales no válidas. Verifica que el correo y contraseña coincidan exactamente con los registrados en la consola de Firebase Authentication (Authentication > Users).';
      case 'auth/invalid-email':
        return 'El formato del correo electrónico ingresado no es válido.';
      case 'auth/user-disabled':
        return 'Esta cuenta ha sido inhabilitada en Firebase Authentication.';
      case 'auth/too-many-requests':
        return 'Demasiados intentos de acceso fallidos. Por seguridad, espera unos momentos antes de intentar de nuevo.';
      case 'auth/network-request-failed':
        return 'Error de conexión. Verifica tu conexión a internet e inténtalo de nuevo.';
      case 'auth/popup-closed-by-user':
        return 'Se cerró la ventana de autenticación de Google antes de finalizar el proceso.';
      case 'auth/popup-blocked':
        return 'El navegador bloqueó la ventana emergente de Google. Por favor permite los pop-ups para este sitio.';
      case 'auth/cancelled-popup-request':
        return 'Inicio de sesión con Google cancelado.';
      case 'auth/operation-not-allowed':
        return 'El proveedor de inicio de sesión aún no está habilitado en Firebase Authentication (actívalo en Firebase Console > Authentication > Sign-in method).';
      default:
        return err?.message || 'Ocurrió un error al procesar la autenticación. Por favor intenta nuevamente.';
    }
  }
}
