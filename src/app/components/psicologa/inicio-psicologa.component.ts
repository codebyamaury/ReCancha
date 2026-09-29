import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RecanchaService } from '../../services/recancha.service';

@Component({
  selector: 'app-inicio-psicologa',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="head">
      <h2>Buen día, {{ service.usuarioActual().nombre || 'Psicólogo/a Especialista' }}</h2>
      <p>Panel clínico principal: supervisión de expedientes deportivos, consultas virtuales y estado de adherencia.</p>
    </div>

    <div class="grid-stats">
      <!-- 1. Total Deportistas Activas -->
      <div class="stat-card">
        <div class="stat-header">
          <h3>Deportistas activas</h3>
          <div class="icon-chip blue">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
        </div>
        <div class="big-num text-blue">{{ service.deportistas().length }}</div>
        <p class="sub">En protocolo telepsicológico y seguimiento deportivo</p>
        <button type="button" class="btn-stat-link" routerLink="/app/deportistas">
          <span>Ver expedientes</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </button>
      </div>

      <!-- 2. Requieren Atención Clínica -->
      <div class="stat-card warning-card">
        <div class="stat-header">
          <h3>Requieren atención</h3>
          <div class="icon-chip pink">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
        </div>
        <div class="big-num text-pink">{{ totalRequierenAtencion }}</div>
        <p class="sub">Registraron descenso anímico o alerta en su último reporte</p>
        <button type="button" class="btn-stat-action" routerLink="/app/deportistas">
          <span>Atender casos prioritarios</span>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </button>
      </div>

      <!-- 3. Próximas Sesiones con Inicio Inmediato de Consulta Real -->
      <div class="stat-card">
        <div class="stat-header">
          <h3>Próximas sesiones</h3>
          <div class="icon-chip purple">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
              <line x1="16" x2="16" y1="2" y2="6"></line>
              <line x1="8" x2="8" y1="2" y2="6"></line>
              <line x1="3" x2="21" y1="10" y2="10"></line>
            </svg>
          </div>
        </div>

        <div class="sessions-mini-list">
          <div class="session-item" *ngFor="let s of service.sesiones()">
            <div class="session-item-info">
              <strong>{{ s.titulo }}</strong>
              <span>{{ s.fechaTexto }} · {{ s.horaTexto }}</span>
            </div>
            <button type="button" class="btn-mini-call" (click)="service.llamadaActiva.set(true)" title="Iniciar consulta en vivo">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="23 7 16 12 23 17 23 7"></polygon>
                <rect width="15" height="14" x="1" y="5" rx="2" ry="2"></rect>
              </svg>
              <span>Conectar</span>
            </button>
          </div>
        </div>

        <button type="button" class="btn-view-all-sessions" routerLink="/app/sesiones">
          <span>Gestionar todas las sesiones</span>
        </button>
      </div>

      <!-- 4. Biblioteca Terapéutica y Prescripción Clínica -->
      <div class="stat-card">
        <div class="stat-header">
          <h3>Biblioteca terapéutica</h3>
          <div class="icon-chip blue">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"></path>
              <path d="M6 6h10"></path>
              <path d="M6 10h10"></path>
            </svg>
          </div>
        </div>
        <div class="big-num text-blue">{{ service.biblioteca().length }}</div>
        <p class="sub">Protocolos clínicos, herramientas TCC y ejercicios publicados</p>
        <button type="button" class="btn-stat-action" routerLink="/app/biblioteca">
          <span>Gestionar y subir recursos</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .head h2 { font-size: clamp(1.35rem, 4vw, 1.7rem); font-weight: 800; color: #0f172a; letter-spacing: -0.02em; }
    .head p { color: #64748b; font-size: clamp(0.82rem, 2.2vw, 0.92rem); margin-top: 4px; margin-bottom: 22px; line-height: 1.45; }
    
    .grid-stats { 
      display: grid; 
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr)); 
      gap: clamp(14px, 2.5vw, 20px); 
    }
    .stat-card { 
      background: #ffffff; 
      padding: clamp(18px, 3.5vw, 26px); 
      border-radius: 16px; 
      border: 1px solid #e2e8f0; 
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
      display: flex;
      flex-direction: column;
    }
    
    .warning-card { border-left: 4px solid #ec4899; }
    
    .stat-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; gap: 8px; }
    .stat-card h3 { font-size: 0.95rem; font-weight: 700; color: #475569; margin: 0; }
    
    .icon-chip {
      width: 38px;
      height: 38px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .icon-chip.blue { background: #eff6ff; color: #2563eb; }
    .icon-chip.pink { background: #fdf2f8; color: #ec4899; }
    .icon-chip.purple { background: #faf5ff; color: #9333ea; }
    
    .big-num { font-size: clamp(2.2rem, 6vw, 2.8rem); font-weight: 800; line-height: 1; margin: 14px 0 8px 0; }
    .text-blue { color: #2563eb; }
    .text-pink { color: #ec4899; }
    
    .sub { font-size: 0.85rem; color: #64748b; line-height: 1.45; }
    
    .btn-stat-action { 
      background: linear-gradient(135deg, #2563eb 0%, #ec4899 100%); 
      color: #ffffff; 
      border: none; 
      padding: 11px 16px; 
      border-radius: 8px; 
      font-weight: 600; 
      font-size: 0.82rem;
      cursor: pointer; 
      margin-top: 18px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      width: fit-content;
      box-shadow: 0 4px 10px rgba(236, 72, 153, 0.25);
      transition: all 0.2s ease;
      min-height: 44px;
    }
    .btn-stat-action:hover {
      box-shadow: 0 6px 14px rgba(236, 72, 153, 0.35);
      transform: translateY(-1px);
    }

    .btn-stat-link {
      background: #eff6ff;
      color: #2563eb;
      border: 1px solid #bfdbfe;
      padding: 10px 14px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.82rem;
      cursor: pointer;
      margin-top: 18px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      width: fit-content;
      transition: all 0.15s ease;
      min-height: 44px;
    }
    .btn-stat-link:hover { background: #dbeafe; }
    
    .sessions-mini-list { margin-top: 14px; display: flex; flex-direction: column; gap: 10px; }
    .session-item { 
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
      padding: 10px 12px; 
      background: #f8fafc; 
      border: 1px solid #e2e8f0; 
      border-radius: 10px; 
      gap: 8px;
    }
    .session-item-info strong { display: block; font-size: 0.86rem; color: #0f172a; font-weight: 700; }
    .session-item-info span { font-size: 0.78rem; color: #64748b; margin-top: 2px; display: block; }
    
    .btn-mini-call {
      background: linear-gradient(135deg, #2563eb 0%, #ec4899 100%);
      color: #ffffff;
      border: none;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 0.76rem;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      box-shadow: 0 2px 6px rgba(37, 99, 235, 0.2);
      transition: all 0.15s ease;
      flex-shrink: 0;
      min-height: 36px;
    }
    .btn-mini-call:hover { transform: translateY(-1px); box-shadow: 0 4px 10px rgba(236, 72, 153, 0.35); }

    .btn-view-all-sessions {
      background: transparent;
      border: none;
      color: #2563eb;
      font-weight: 600;
      font-size: 0.82rem;
      cursor: pointer;
      text-align: left;
      padding: 12px 0 0 0;
      margin-top: auto;
      min-height: 40px;
      display: inline-flex;
      align-items: center;
    }
    .btn-view-all-sessions:hover { text-decoration: underline; }

    @media (max-width: 480px) {
      .btn-stat-action, .btn-stat-link {
        width: 100%;
      }
    }
  `]
})
export class InicioPsicologaComponent {
  service = inject(RecanchaService);

  get totalRequierenAtencion(): number {
    return this.service.deportistas().filter(d => d.estado === 'Requiere atención').length;
  }
}
