import { Component, inject, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RecanchaService, calcularIniciales } from '../../services/recancha.service';
import { FirebaseService } from '../../services/firebase.service';

@Component({
  selector: 'app-videollamada',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="video-modal-bg">
      <div class="video-shell">
        <!-- Barra Superior de Consulta -->
        <header class="top-bar">
          <div class="session-info">
            <span class="pulse-indicator"></span>
            <span class="session-title">
              {{ rolEsPsicologa ? 'Consulta Telepsicológica · IDERT' : 'Sesión con Psicología Deportiva' }}
            </span>
            <span class="session-secure">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <span>Cifrado WebRTC Seguro</span>
            </span>
          </div>

          <div class="call-meta">
            <span class="timer-red">{{ tiempoStr }}</span>
          </div>
        </header>

        <!-- Área de Video y Participantes -->
        <div class="streams-container" [class.with-notes]="mostrarNotas && rolEsPsicologa">
          <div class="video-grid">
            <!-- 1. Video Local (Tu Cámara Real) -->
            <div class="stream-box local-stream">
              <video #localVideo autoplay playsinline muted class="video-feed" [class.hidden]="!camaraActiva || !dispositivoConectado"></video>
              
              <div class="no-video-overlay" *ngIf="!camaraActiva || !dispositivoConectado">
                <div class="circle-avatar-feed">{{ service.usuarioActual().avatarIniciales || 'TU' }}</div>
                <span class="status-feed">{{ !dispositivoConectado ? 'Cámara lista / Sin cámara física' : 'Cámara desactivada' }}</span>
              </div>

              <div class="participant-badge local-tag">
                <div class="audio-wave" [class.silent]="!microfonoActivo">
                  <span></span><span></span><span></span>
                </div>
                <span>{{ service.usuarioActual().nombre || 'Tú' }} ({{ rolEsPsicologa ? 'Especialista' : 'Deportista' }})</span>
              </div>
            </div>

            <!-- 2. Video Remoto / Sala de Espera Real -->
            <div class="stream-box remote-stream" [class.waiting-mode]="!remotoConectado">
              <!-- PARTICIPANTE REMOTO CONECTADO REALMENTE -->
              <ng-container *ngIf="remotoConectado">
                <video #remoteVideo autoplay playsinline class="video-feed" [class.hidden]="!remotoTieneVideo"></video>

                <div class="no-video-overlay" *ngIf="!remotoTieneVideo">
                  <div class="circle-avatar-feed remote-avatar">
                    {{ remoteIniciales }}
                  </div>
                  <div class="remote-meta-box">
                    <span class="remote-name">{{ remoteNombre }}</span>
                    <span class="remote-sub">{{ remoteSub }}</span>
                  </div>
                </div>

                <div class="participant-badge">
                  <div class="audio-wave">
                    <span></span><span></span><span></span>
                  </div>
                  <span>{{ remoteNombre }} ({{ rolEsPsicologa ? 'Deportista' : 'Especialista' }})</span>
                </div>
              </ng-container>

              <!-- SALA DE ESPERA ACTIVA (CUANDO AÚN NO HA INGRESADO LA OTRA PERSONA) -->
              <div class="waiting-room-overlay" *ngIf="!remotoConectado">
                <div class="radar-box">
                  <div class="radar-ring"></div>
                  <div class="radar-center">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                  </div>
                </div>

                <h4 class="waiting-title">
                  {{ rolEsPsicologa ? 'Esperando ingreso de la deportista...' : 'Esperando ingreso del especialista...' }}
                </h4>
                <p class="waiting-desc">
                  {{ rolEsPsicologa 
                      ? 'Tu sala de consulta está activa y esperando al paciente. En cuanto la deportista ingrese desde su panel, la videollamada comenzará en vivo.'
                      : 'Tu sala de telepsicología está lista y cifrada. En cuanto el/la especialista se una a esta consulta, el video y audio se enlazarán en tiempo real.' }}
                </p>

                <div class="room-id-tag">
                  <span class="dot-amber"></span>
                  <span>Sala #REC-4899 · Estado: En espera de conexión</span>
                </div>

                <button type="button" class="btn-copy-room-link" (click)="copiarEnlaceSala()">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
                  </svg>
                  <span>Copiar enlace de acceso a la sala</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Panel Clínico Lateral (Solo visible para la Psicóloga en consulta) -->
          <aside class="clinical-notes-panel" *ngIf="mostrarNotas && rolEsPsicologa">
            <div class="notes-header">
              <h4>Notas de Evolución Clínica</h4>
              <button class="btn-close-notes" (click)="mostrarNotas = false">×</button>
            </div>
            <textarea 
              [(ngModel)]="notaConsulta" 
              class="notes-textarea" 
              rows="9" 
              placeholder="Registra aquí las observaciones del estado anímico, autodiálogo y tareas TCC acordadas con la paciente durante esta videollamada..."></textarea>
            <button class="btn-save-note" (click)="guardarNotaClinica()">Guardar en expediente</button>
          </aside>
        </div>

        <!-- Barra de Controles de Conferencia WebRTC -->
        <footer class="call-controls-bar">
          <!-- Micrófono Real -->
          <button 
            type="button"
            class="control-btn" 
            [class.off]="!microfonoActivo" 
            (click)="toggleMicrofono()" 
            [title]="microfonoActivo ? 'Silenciar micrófono' : 'Activar micrófono'">
            <svg *ngIf="microfonoActivo" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
              <line x1="12" y1="19" x2="12" y2="22"></line>
            </svg>
            <svg *ngIf="!microfonoActivo" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="2" y1="2" x2="22" y2="22"></line>
              <path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2"></path>
              <path d="M5 10v2a7 7 0 0 0 12 5"></path>
              <path d="M15 9.34V5a3 3 0 0 0-5.68-1.33"></path>
              <path d="M9 9v3a3 3 0 0 0 5.12 2.12"></path>
              <line x1="12" y1="19" x2="12" y2="22"></line>
            </svg>
          </button>

          <!-- Cámara Real -->
          <button 
            type="button"
            class="control-btn" 
            [class.off]="!camaraActiva" 
            (click)="toggleCamara()" 
            [title]="camaraActiva ? 'Apagar cámara' : 'Encender cámara'">
            <svg *ngIf="camaraActiva" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m22 8-6 4 6 4V8Z"></path>
              <rect width="14" height="12" x="2" y="6" rx="2" ry="2"></rect>
            </svg>
            <svg *ngIf="!camaraActiva" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="2" y1="2" x2="22" y2="22"></line>
              <path d="m22 8-6 4 6 4V8Z"></path>
              <path d="M14 18H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2"></path>
              <path d="M10 6h4a2 2 0 0 1 2 2v4"></path>
            </svg>
          </button>

          <!-- Compartir Pantalla Real -->
          <button 
            type="button"
            class="control-btn" 
            [class.active-feature]="compartiendoPantalla"
            (click)="toggleCompartirPantalla()" 
            title="Compartir pantalla">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect width="20" height="14" x="2" y="3" rx="2"></rect>
              <line x1="8" y1="21" x2="16" y2="21"></line>
              <line x1="12" y1="17" x2="12" y2="21"></line>
            </svg>
          </button>

          <!-- Abrir Notas Clínicas (para Psicóloga) -->
          <button 
            *ngIf="rolEsPsicologa"
            type="button"
            class="control-btn" 
            [class.active-feature]="mostrarNotas"
            (click)="mostrarNotas = !mostrarNotas" 
            title="Notas clínicas de sesión">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
            </svg>
          </button>

          <!-- Finalizar Sesión -->
          <button 
            type="button"
            class="btn-hang-up" 
            (click)="salir()" 
            title="Finalizar consulta">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"></path>
              <line x1="22" y1="2" x2="2" y2="22"></line>
            </svg>
            <span class="btn-hangup-text">Finalizar sesión</span>
          </button>
        </footer>
      </div>
    </div>
  `,
  styles: [`
    .video-modal-bg { 
      position: fixed; 
      inset: 0; 
      background: rgba(5, 11, 26, 0.94); 
      backdrop-filter: blur(12px);
      display: flex; 
      align-items: center; 
      justify-content: center; 
      z-index: 3000; 
      padding: clamp(0px, 2vw, 16px);
    }
    
    .video-shell { 
      background: #090f20; 
      border-radius: 18px; 
      width: 100%; 
      max-width: 960px; 
      color: #fff; 
      overflow: hidden; 
      border: 1px solid rgba(255, 255, 255, 0.12);
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(37, 99, 235, 0.2);
      display: flex; 
      flex-direction: column;
      max-height: 94vh;
      max-height: 94dvh;
    }
    
    .top-bar { 
      padding: clamp(10px, 2vw, 16px) clamp(12px, 2.5vw, 24px); 
      background: #111c38; 
      display: flex; 
      justify-content: space-between; 
      align-items: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      gap: 10px;
    }
    
    .session-info {
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 0;
    }
    
    .pulse-indicator {
      width: 9px;
      height: 9px;
      border-radius: 50%;
      background: #ec4899;
      box-shadow: 0 0 0 3px rgba(236, 72, 153, 0.35);
      animation: pulsePink 1.8s infinite;
      flex-shrink: 0;
    }
    @keyframes pulsePink {
      0% { transform: scale(0.95); opacity: 0.8; }
      50% { transform: scale(1.15); opacity: 1; }
      100% { transform: scale(0.95); opacity: 0.8; }
    }
    
    .session-title { 
      font-weight: 700; 
      font-size: clamp(0.82rem, 2vw, 0.95rem); 
      color: #ffffff; 
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .session-secure {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-size: 0.72rem;
      color: #38bdf8;
      background: rgba(56, 189, 248, 0.1);
      padding: 3px 8px;
      border-radius: 6px;
      border: 1px solid rgba(56, 189, 248, 0.25);
      white-space: nowrap;
      flex-shrink: 0;
    }
    
    .timer-red { 
      color: #f43f5e; 
      font-family: 'JetBrains Mono', monospace; 
      font-size: 0.9rem;
      font-weight: 700;
      background: rgba(244, 63, 94, 0.12);
      padding: 4px 8px;
      border-radius: 6px;
      border: 1px solid rgba(244, 63, 94, 0.25);
      white-space: nowrap;
      flex-shrink: 0;
    }
    
    .streams-container {
      display: flex;
      background: #060b18;
      flex: 1;
      min-height: 320px;
      position: relative;
      overflow: hidden;
    }
    
    .video-grid { 
      flex: 1;
      display: grid; 
      grid-template-columns: 1fr 1fr; 
      gap: clamp(8px, 1.5vw, 16px); 
      padding: clamp(10px, 2vw, 20px); 
    }
    
    .stream-box { 
      min-height: 180px; 
      background: #111a2e; 
      border-radius: 14px; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      position: relative; 
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.5);
    }
    
    .video-feed {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transform: scaleX(-1);
    }
    .video-feed.hidden { display: none; }
    
    .no-video-overlay {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      padding: 12px;
      text-align: center;
    }
    
    .circle-avatar-feed { 
      width: clamp(52px, 12vw, 72px); 
      height: clamp(52px, 12vw, 72px); 
      border-radius: 50%; 
      background: linear-gradient(135deg, #2563eb 0%, #ec4899 100%); 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      font-size: clamp(1.1rem, 3vw, 1.5rem); 
      font-weight: 800; 
      color: #fff;
      box-shadow: 0 8px 20px rgba(37, 99, 235, 0.35);
    }
    
    .remote-avatar {
      background: linear-gradient(135deg, #db2777 0%, #3b82f6 100%);
    }
    
    .status-feed { font-size: 0.76rem; color: #94a3b8; }
    
    .remote-meta-box { text-align: center; }
    .remote-name { display: block; font-size: 0.95rem; font-weight: 700; color: #fff; }
    .remote-sub { display: block; font-size: 0.72rem; color: #38bdf8; margin-top: 2px; }
    
    .participant-badge { 
      position: absolute; 
      bottom: clamp(6px, 1.5vw, 12px); 
      left: clamp(8px, 1.5vw, 14px); 
      font-size: 0.74rem; 
      font-weight: 600;
      background: rgba(5, 11, 26, 0.85); 
      backdrop-filter: blur(8px);
      padding: 4px 10px; 
      border-radius: 8px; 
      border: 1px solid rgba(255, 255, 255, 0.1);
      display: flex; 
      align-items: center; 
      gap: 6px;
      max-width: calc(100% - 20px);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .audio-wave {
      display: flex;
      align-items: flex-end;
      gap: 2px;
      height: 12px;
      flex-shrink: 0;
    }
    .audio-wave span {
      width: 2.5px;
      background: #10b981;
      border-radius: 2px;
      animation: waveBars 1.2s ease-in-out infinite;
    }
    .audio-wave span:nth-child(1) { height: 6px; animation-delay: 0.1s; }
    .audio-wave span:nth-child(2) { height: 12px; animation-delay: 0.25s; }
    .audio-wave span:nth-child(3) { height: 8px; animation-delay: 0.4s; }
    @keyframes waveBars {
      0%, 100% { transform: scaleY(0.4); }
      50% { transform: scaleY(1); }
    }
    .audio-wave.silent span {
      background: #64748b;
      animation: none;
      height: 3px;
    }

    /* ESTILOS DE LA SALA DE ESPERA REAL */
    .stream-box.waiting-mode {
      background: radial-gradient(circle at 50% 40%, #152244 0%, #0a1124 100%);
      border: 1px dashed rgba(56, 189, 248, 0.35);
    }
    .waiting-room-overlay {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: clamp(14px, 3vw, 24px) clamp(10px, 2.5vw, 20px);
      max-width: 340px;
    }
    .radar-box {
      position: relative;
      width: clamp(52px, 10vw, 68px);
      height: clamp(52px, 10vw, 68px);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 12px;
    }
    .radar-ring {
      position: absolute;
      inset: 0;
      border-radius: 50%;
      border: 2px solid rgba(56, 189, 248, 0.4);
      animation: radarPulse 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
    }
    @keyframes radarPulse {
      0% { transform: scale(0.6); opacity: 1; }
      100% { transform: scale(1.4); opacity: 0; }
    }
    .radar-center {
      width: clamp(36px, 8vw, 44px);
      height: clamp(36px, 8vw, 44px);
      border-radius: 50%;
      background: rgba(37, 99, 235, 0.2);
      border: 1.5px solid #38bdf8;
      color: #38bdf8;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .waiting-title {
      font-size: clamp(0.85rem, 2.2vw, 0.95rem);
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 6px;
    }
    .waiting-desc {
      font-size: clamp(0.72rem, 1.8vw, 0.78rem);
      color: #94a3b8;
      line-height: 1.45;
      margin-bottom: 12px;
    }
    .room-id-tag {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(245, 158, 11, 0.12);
      border: 1px solid rgba(245, 158, 11, 0.3);
      color: #fbbf24;
      padding: 4px 8px;
      border-radius: 6px;
      font-size: 0.7rem;
      font-weight: 600;
      margin-bottom: 10px;
      max-width: 100%;
    }
    .dot-amber {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #f59e0b;
      box-shadow: 0 0 6px #f59e0b;
      flex-shrink: 0;
    }
    .btn-copy-room-link {
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.18);
      color: #e2e8f0;
      padding: 7px 12px;
      border-radius: 8px;
      font-size: 0.76rem;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.15s ease;
      min-height: 36px;
    }
    .btn-copy-room-link:hover {
      background: rgba(255, 255, 255, 0.16);
      color: #ffffff;
      border-color: #38bdf8;
    }

    /* Panel de Notas Clínicas */
    .clinical-notes-panel { 
      width: 300px; 
      background: #0f172a; 
      border-left: 1px solid rgba(255, 255, 255, 0.08); 
      padding: 18px; 
      display: flex; 
      flex-direction: column; 
      z-index: 25;
    }
    .notes-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .notes-header h4 { font-size: 0.9rem; font-weight: 700; color: #fff; margin: 0; }
    .btn-close-notes { background: none; border: none; color: #94a3b8; font-size: 1.4rem; cursor: pointer; padding: 4px; }
    .notes-textarea { 
      flex: 1; 
      background: #1e293b; 
      border: 1px solid #334155; 
      border-radius: 8px; 
      padding: 12px; 
      color: #fff; 
      font-size: 0.82rem; 
      resize: none; 
      margin-bottom: 12px;
      font-family: inherit;
    }
    .notes-textarea:focus { outline: none; border-color: #2563eb; }
    .btn-save-note { 
      background: linear-gradient(135deg, #2563eb 0%, #ec4899 100%); 
      color: #fff; 
      border: none; 
      padding: 10px; 
      border-radius: 6px; 
      font-weight: 600; 
      font-size: 0.82rem; 
      cursor: pointer; 
      transition: all 0.15s ease;
      min-height: 40px;
    }
    .btn-save-note:hover { opacity: 0.9; }

    /* Controles de Llamada */
    .call-controls-bar { 
      padding: clamp(10px, 2vw, 16px) clamp(12px, 2.5vw, 24px); 
      background: #111c38; 
      display: flex; 
      justify-content: center; 
      align-items: center; 
      gap: clamp(8px, 1.8vw, 14px); 
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      flex-wrap: wrap;
    }
    
    .control-btn { 
      width: clamp(42px, 9vw, 48px); 
      height: clamp(42px, 9vw, 48px); 
      border-radius: 12px; 
      background: #1e293b; 
      border: 1px solid rgba(255, 255, 255, 0.1); 
      color: #ffffff; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      cursor: pointer; 
      transition: all 0.18s ease;
      flex-shrink: 0;
    }
    .control-btn:hover { background: #334155; transform: translateY(-2px); }
    .control-btn.off { background: #e11d48; border-color: #f43f5e; color: #fff; }
    .control-btn.active-feature { background: #2563eb; border-color: #3b82f6; }
    
    .btn-hang-up { 
      background: #e11d48; 
      color: #ffffff; 
      border: none; 
      padding: 0 clamp(12px, 3vw, 22px); 
      height: clamp(42px, 9vw, 48px); 
      border-radius: 12px; 
      font-weight: 700; 
      font-size: 0.88rem;
      cursor: pointer; 
      display: inline-flex; 
      align-items: center; 
      justify-content: center;
      gap: 8px;
      box-shadow: 0 4px 14px rgba(225, 29, 72, 0.35);
      transition: all 0.18s ease;
      flex-shrink: 0;
    }
    .btn-hang-up:hover {
      background: #be123c;
      transform: translateY(-2px);
      box-shadow: 0 6px 18px rgba(225, 29, 72, 0.45);
    }

    /* ================= BREAKPOINTS RESPONSIVOS VIDEOLLAMADA ================= */
    @media (max-width: 768px) {
      .video-modal-bg {
        padding: 0;
      }
      .video-shell {
        border-radius: 0;
        border: none;
        height: 100vh;
        height: 100dvh;
        max-height: 100dvh;
      }
      .video-grid {
        grid-template-columns: 1fr;
        grid-template-rows: 1fr 1fr;
        padding: 8px;
        gap: 8px;
      }
      .clinical-notes-panel {
        position: absolute;
        top: 0;
        bottom: 0;
        right: 0;
        width: min(340px, 90vw);
        box-shadow: -6px 0 25px rgba(0, 0, 0, 0.7);
      }
      .session-secure span {
        display: none;
      }
    }

    @media (max-width: 600px) {
      .btn-hangup-text {
        display: none;
      }
      .btn-hang-up {
        width: clamp(42px, 9vw, 48px);
        padding: 0;
      }
    }

    @media (orientation: landscape) and (max-height: 500px) {
      .video-shell {
        border-radius: 0;
        height: 100dvh;
        max-height: 100dvh;
      }
      .top-bar {
        padding: 6px 14px;
      }
      .call-controls-bar {
        padding: 6px 14px;
      }
      .video-grid {
        grid-template-columns: 1fr 1fr;
        grid-template-rows: 1fr;
      }
      .control-btn, .btn-hang-up {
        height: 38px;
        width: 38px;
      }
    }
  `]
})
export class VideollamadaComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('localVideo') localVideoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteVideo') remoteVideoRef!: ElementRef<HTMLVideoElement>;

  service = inject(RecanchaService);
  fb = inject(FirebaseService);
  
  segundos = 0;
  microfonoActivo = true;
  camaraActiva = true;
  compartiendoPantalla = false;
  dispositivoConectado = false;
  mostrarNotas = false;
  notaConsulta = '';

  // Estado real de presencia en sala
  remotoConectado = false;
  remotoTieneVideo = false;
  remoteNombre = '';
  remoteSub = '';
  remoteIniciales = '';
  salaId = 'consulta-principal';

  private timer: any;
  private mediaStream: MediaStream | null = null;
  private screenStream: MediaStream | null = null;
  private peerConnection: RTCPeerConnection | null = null;
  private cleanupPresencia: (() => void) | null = null;
  private cleanupParticipantes: (() => void) | null = null;

  get rolEsPsicologa(): boolean {
    return this.service.usuarioActual().rol === 'psicologa';
  }

  get tiempoStr(): string {
    const m = String(Math.floor(this.segundos / 60)).padStart(2, '0');
    const s = String(this.segundos % 60).padStart(2, '0');
    return `${m}:${s}`;
  }

  ngOnInit() {
    this.timer = setInterval(() => this.segundos++, 1000);
  }

  ngAfterViewInit() {
    this.iniciarCamaraReal();
    this.conectarSalaReal();
  }

  ngOnDestroy() {
    if (this.timer) clearInterval(this.timer);
    this.desconectarSala();
    this.detenerMedios();
  }

  /* ================= ACCESO REAL A CÁMARA Y MICRÓFONO CON WEBRTC ================= */
  async iniciarCamaraReal() {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        this.mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: true
        });

        this.dispositivoConectado = true;
        if (this.localVideoRef?.nativeElement) {
          this.localVideoRef.nativeElement.srcObject = this.mediaStream;
        }
      }
    } catch (err) {
      console.warn('Acceso a cámara/micrófono en navegador:', err);
      this.dispositivoConectado = false;
      this.service.mostrarToast('Cámara física no disponible en este dispositivo.');
    }
  }

  /* ================= CONEXIÓN Y SEÑALIZACIÓN EN SALA FIRESTORE ================= */
  async conectarSalaReal() {
    const usuario = this.service.usuarioActual();
    const uid = usuario.uid || 'usr-' + Math.random().toString(36).substring(2, 8);
    const nombre = usuario.nombre || (this.rolEsPsicologa ? 'Psicólogo/a Especialista' : 'Deportista');
    const rol = usuario.rol;

    // 1. Registrar presencia local
    this.cleanupPresencia = await this.fb.registrarPresenciaSala(this.salaId, { uid, nombre, rol });

    // 2. Escuchar participantes activos en tiempo real
    this.cleanupParticipantes = this.fb.escucharParticipantesSala(this.salaId, (participantes) => {
      const otro = participantes.find(p => p.uid !== uid && p.conectado);

      if (otro) {
        this.remotoConectado = true;
        this.remoteNombre = otro.nombre || (otro.rol === 'psicologa' ? 'Psicólogo/a Especialista' : 'Deportista IDERT');
        this.remoteSub = otro.rol === 'psicologa' ? 'Especialista en Psicología Deportiva' : 'Deportista IDERT';
        this.remoteIniciales = calcularIniciales(otro.nombre);
        this.iniciarP2PWebRTC(otro.rol);
      } else {
        this.remotoConectado = false;
        this.remotoTieneVideo = false;
        this.remoteNombre = '';
        this.remoteSub = '';
        this.remoteIniciales = '';
        if (this.peerConnection) {
          this.peerConnection.close();
          this.peerConnection = null;
        }
      }
    });
  }

  private async iniciarP2PWebRTC(rolRemoto: string) {
    if (this.peerConnection) return;

    try {
      const config: RTCConfiguration = {
        iceServers: [{ urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] }]
      };
      this.peerConnection = new RTCPeerConnection(config);

      // Enlazar tracks locales al peer
      if (this.mediaStream) {
        this.mediaStream.getTracks().forEach(t => {
          this.peerConnection?.addTrack(t, this.mediaStream!);
        });
      }

      // Recibir tracks remotos en el video
      this.peerConnection.ontrack = (event) => {
        if (this.remoteVideoRef?.nativeElement && event.streams[0]) {
          this.remoteVideoRef.nativeElement.srcObject = event.streams[0];
          this.remotoTieneVideo = true;
        }
      };

      // Candidatos ICE
      this.peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          this.fb.agregarCandidatoICE(this.salaId, this.service.usuarioActual().rol, event.candidate);
        }
      };

      this.fb.escucharCandidatosICE(this.salaId, rolRemoto, (candidateData) => {
        if (candidateData && this.peerConnection) {
          this.peerConnection.addIceCandidate(new RTCIceCandidate(candidateData)).catch(() => {});
        }
      });

      // Negociación SDP
      if (!this.rolEsPsicologa) {
        // Deportista crea oferta
        const offer = await this.peerConnection.createOffer();
        await this.peerConnection.setLocalDescription(offer);
        await this.fb.guardarSenalWebRTC(this.salaId, 'offer', { type: offer.type, sdp: offer.sdp });

        this.fb.escucharSenalWebRTC(this.salaId, async (data) => {
          if (data?.answer && this.peerConnection && !this.peerConnection.currentRemoteDescription) {
            await this.peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
          }
        });
      } else {
        // Psicóloga escucha oferta y responde
        this.fb.escucharSenalWebRTC(this.salaId, async (data) => {
          if (data?.offer && this.peerConnection && !this.peerConnection.currentRemoteDescription) {
            await this.peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
            const answer = await this.peerConnection.createAnswer();
            await this.peerConnection.setLocalDescription(answer);
            await this.fb.guardarSenalWebRTC(this.salaId, 'answer', { type: answer.type, sdp: answer.sdp });
          }
        });
      }
    } catch (e) {
      console.warn('Error en conexión P2P WebRTC:', e);
    }
  }

  copiarEnlaceSala() {
    const enlace = window.location.origin + '/app/sesiones';
    if (navigator.clipboard) {
      navigator.clipboard.writeText(enlace).then(() => {
        this.service.mostrarToast('Enlace de consulta copiado al portapapeles');
      }).catch(() => {
        this.service.mostrarToast('Código de consulta: #REC-4899');
      });
    } else {
      this.service.mostrarToast('Código de consulta: #REC-4899');
    }
  }

  toggleMicrofono() {
    if (this.mediaStream) {
      const audioTracks = this.mediaStream.getAudioTracks();
      if (audioTracks.length > 0) {
        this.microfonoActivo = !this.microfonoActivo;
        audioTracks.forEach(track => track.enabled = this.microfonoActivo);
      }
    } else {
      this.microfonoActivo = !this.microfonoActivo;
    }
    this.service.mostrarToast(this.microfonoActivo ? 'Micrófono activado' : 'Micrófono silenciado');
  }

  toggleCamara() {
    if (this.mediaStream) {
      const videoTracks = this.mediaStream.getVideoTracks();
      if (videoTracks.length > 0) {
        this.camaraActiva = !this.camaraActiva;
        videoTracks.forEach(track => track.enabled = this.camaraActiva);
      }
    } else {
      this.camaraActiva = !this.camaraActiva;
    }
    this.service.mostrarToast(this.camaraActiva ? 'Cámara activada' : 'Cámara desactivada');
  }

  async toggleCompartirPantalla() {
    if (this.compartiendoPantalla) {
      if (this.screenStream) {
        this.screenStream.getTracks().forEach(t => t.stop());
        this.screenStream = null;
      }
      this.compartiendoPantalla = false;
      return;
    }

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
        this.screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        this.compartiendoPantalla = true;
        
        if (this.localVideoRef?.nativeElement && this.screenStream) {
          this.localVideoRef.nativeElement.srcObject = this.screenStream;
        }

        this.screenStream.getVideoTracks()[0].onended = () => {
          this.compartiendoPantalla = false;
          if (this.localVideoRef?.nativeElement && this.mediaStream) {
            this.localVideoRef.nativeElement.srcObject = this.mediaStream;
          }
        };
      }
    } catch (err) {
      console.warn('Pantalla no compartida:', err);
      this.compartiendoPantalla = false;
    }
  }

  guardarNotaClinica() {
    if (!this.notaConsulta.trim()) return;
    const depId = this.service.deportistas()[0]?.id || 'dep-01';
    this.service.guardarNotaClinica(depId, this.notaConsulta);
    this.notaConsulta = '';
    this.mostrarNotas = false;
  }

  salir() {
    this.desconectarSala();
    this.detenerMedios();
    this.service.llamadaActiva.set(false);
  }

  private desconectarSala() {
    if (this.cleanupPresencia) {
      this.cleanupPresencia();
      this.cleanupPresencia = null;
    }
    if (this.cleanupParticipantes) {
      this.cleanupParticipantes();
      this.cleanupParticipantes = null;
    }
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
  }

  private detenerMedios() {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(t => t.stop());
      this.mediaStream = null;
    }
    if (this.screenStream) {
      this.screenStream.getTracks().forEach(t => t.stop());
      this.screenStream = null;
    }
  }
}
