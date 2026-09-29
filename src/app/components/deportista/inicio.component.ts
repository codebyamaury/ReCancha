import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RecanchaService } from '../../services/recancha.service';

@Component({
  selector: 'app-inicio-deportista',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="title-head">
      <h2>Hola, {{ service.usuarioActual().nombre || 'Deportista' }}</h2>
      <p>Acompañamiento psicológico y evolución deportiva en tu proceso de recuperación.</p>
    </div>

    <div class="dashboard-row">
      <div class="box-card highlight-card">
        <div class="card-badge">Próxima cita</div>
        <div class="session-name">{{ proximaSesion ? proximaSesion.titulo : 'Sesión individual de TCC' }}</div>
        <div class="session-meta">
          {{ proximaSesion ? (proximaSesion.fechaTexto + ' · ' + proximaSesion.horaTexto + ' · Psic. ' + proximaSesion.psicologa) : 'Miércoles 30 de septiembre · 4:00 p. m. · Psicología Deportiva' }}
        </div>
        <button class="btn-action" (click)="service.llamadaActiva.set(true)">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="23 7 16 12 23 17 23 7"></polygon>
            <rect width="15" height="14" x="1" y="5" rx="2" ry="2"></rect>
          </svg>
          <span>Unirme a la videollamada</span>
        </button>
      </div>

      <div class="box-card">
        <h3>¿Cómo te sientes hoy?</h3>
        <p class="tip-sub">Registro de escala afectiva para tu psicólogo/a especialista.</p>
        
        <div class="mood-selector">
          <button 
            *ngFor="let nivel of escalaAnimo" 
            type="button"
            class="mood-btn" 
            [class.chosen]="service.animoSeleccionadoHoy() === nivel.valor"
            (click)="seleccionarAnimo(nivel.valor)">
            <svg class="mood-icon" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" [innerHTML]="nivel.svgContent">
            </svg>
            <span class="mood-score">{{ nivel.valor }}</span>
            <span class="mood-label">{{ nivel.nombre }}</span>
          </button>
        </div>
      </div>

      <div class="box-card">
        <h3>Progreso de ejercicios</h3>
        <p class="comp-txt">
          <strong>{{ service.ejerciciosCompletados() }} de {{ service.totalEjercicios() }} completados</strong>
        </p>
        <div class="bar-shell">
          <div class="bar-progress" [style.width.%]="(service.ejerciciosCompletados() / service.totalEjercicios()) * 100"></div>
        </div>
        <a routerLink="/app/biblioteca" class="link-action">
          <span>Explorar biblioteca de ejercicios</span>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </a>
      </div>
    </div>

    <div class="quote-card">
      <div class="quote-icon">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2v4"></path>
          <path d="m4.93 4.93 2.83 2.83"></path>
          <path d="M2 12h4"></path>
          <path d="m4.93 19.07 2.83-2.83"></path>
          <path d="M12 18v4"></path>
          <path d="m19.07 19.07-2.83-2.83"></path>
          <path d="M18 12h4"></path>
          <path d="m19.07 4.93-2.83 2.83"></path>
        </svg>
      </div>
      <div>
        <h4>Enfoque del día</h4>
        <p>Una lesión cambia temporalmente tu rutina física, pero no define tu valor ni tu identidad como deportista. Inicia con el ejercicio de respiración diafragmática de 6 minutos.</p>
      </div>
    </div>
  `,
  styles: [`
    .title-head h2 { font-size: 1.7rem; font-weight: 800; color: #0f172a; letter-spacing: -0.02em; }
    .title-head p { color: #64748b; font-size: 0.92rem; margin-top: 4px; margin-bottom: 26px; }
    
    .dashboard-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(290px, 1fr)); gap: 20px; margin-bottom: 24px; }
    
    .box-card { 
      background: #ffffff; 
      padding: 24px; 
      border-radius: 14px; 
      border: 1px solid #e2e8f0; 
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
      position: relative;
      display: flex;
      flex-direction: column;
    }
    
    .highlight-card {
      border-top: 4px solid #2563eb;
    }
    
    .card-badge {
      display: inline-block;
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #2563eb;
      background: #eff6ff;
      padding: 3px 8px;
      border-radius: 6px;
      width: fit-content;
      margin-bottom: 10px;
    }

    .box-card h3 { font-size: 0.98rem; font-weight: 700; color: #0f172a; margin-bottom: 6px; }
    .session-name { font-size: 1.25rem; font-weight: 800; color: #0f172a; margin-bottom: 4px; }
    .session-meta { font-size: 0.84rem; color: #64748b; margin-bottom: 20px; line-height: 1.45; }
    
    .btn-action { 
      background: linear-gradient(135deg, #2563eb 0%, #ec4899 100%); 
      color: #ffffff; 
      border: none; 
      padding: 11px 18px; 
      border-radius: 8px; 
      font-weight: 600; 
      cursor: pointer; 
      font-size: 0.88rem; 
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
      transition: all 0.2s ease;
      margin-top: auto;
    }
    .btn-action:hover {
      box-shadow: 0 6px 16px rgba(236, 72, 153, 0.35);
      transform: translateY(-1px);
    }
    
    .tip-sub { font-size: 0.8rem; color: #64748b; margin-bottom: 14px; }
    
    .mood-selector { 
      display: grid; 
      grid-template-columns: repeat(5, 1fr); 
      gap: 6px; 
      margin: 12px 0 6px 0; 
    }
    .mood-btn { 
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      background: #f8fafc; 
      border: 1px solid #e2e8f0; 
      border-radius: 10px; 
      padding: 10px 4px; 
      cursor: pointer; 
      color: #64748b;
      transition: all 0.18s ease; 
    }
    .mood-icon { stroke: #64748b; }
    .mood-score { font-size: 0.72rem; font-weight: 700; }
    .mood-label { font-size: 0.65rem; color: #94a3b8; }
    
    .mood-btn:hover { 
      background: #eff6ff; 
      border-color: #3b82f6; 
      color: #2563eb; 
    }
    .mood-btn:hover .mood-icon { stroke: #2563eb; }
    
    .mood-btn.chosen { 
      background: linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%); 
      border-color: #ec4899; 
      color: #0f172a;
      box-shadow: 0 0 0 2px rgba(236, 72, 153, 0.2);
    }
    .mood-btn.chosen .mood-icon { stroke: #ec4899; }
    .mood-btn.chosen .mood-label { color: #ec4899; font-weight: 600; }
    
    .comp-txt { font-size: 0.95rem; margin-bottom: 12px; color: #0f172a; }
    .bar-shell { background: #f1f5f9; height: 10px; border-radius: 6px; overflow: hidden; margin-bottom: 18px; }
    .bar-progress { 
      background: linear-gradient(90deg, #2563eb 0%, #ec4899 100%); 
      height: 100%; 
      border-radius: 6px; 
      transition: width 0.3s ease;
    }
    
    .link-action { 
      color: #2563eb; 
      text-decoration: none; 
      font-size: 0.85rem; 
      font-weight: 600; 
      display: inline-flex; 
      align-items: center; 
      gap: 6px;
      margin-top: auto;
      transition: color 0.15s ease;
    }
    .link-action:hover { color: #ec4899; }
    
    .quote-card { 
      background: linear-gradient(135deg, #eff6ff 0%, #fdf2f8 100%); 
      padding: 22px 24px; 
      border-radius: 14px; 
      border: 1px solid #dbeafe; 
      border-left: 4px solid #ec4899; 
      display: flex;
      align-items: flex-start;
      gap: 16px;
    }
    .quote-icon {
      color: #ec4899;
      background: #ffffff;
      padding: 8px;
      border-radius: 10px;
      box-shadow: 0 2px 6px rgba(236, 72, 153, 0.15);
      flex-shrink: 0;
    }
    .quote-card h4 { font-size: 0.82rem; text-transform: uppercase; color: #2563eb; font-weight: 700; letter-spacing: 0.05em; margin-bottom: 6px; }
    .quote-card p { font-size: 0.92rem; color: #1e293b; line-height: 1.5; }
  `]
})
export class InicioComponent { 
  service = inject(RecanchaService); 

  get proximaSesion() {
    return this.service.sesiones()[0] || null;
  }

  seleccionarAnimo(valor: number) {
    this.service.guardarCheckinAnimo(valor);
  }

  escalaAnimo = [
    { valor: 1, nombre: 'Bajo', svgContent: '<circle cx="12" cy="12" r="10"></circle><line x1="8" y1="15" x2="16" y2="15"></line><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line>' },
    { valor: 2, nombre: 'Regular', svgContent: '<circle cx="12" cy="12" r="10"></circle><path d="M16 16s-1.5-2-4-2-4 2-4 2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line>' },
    { valor: 3, nombre: 'Neutral', svgContent: '<circle cx="12" cy="12" r="10"></circle><line x1="8" y1="14" x2="16" y2="14"></line><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line>' },
    { valor: 4, nombre: 'Bueno', svgContent: '<circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line>' },
    { valor: 5, nombre: 'Excelente', svgContent: '<circle cx="12" cy="12" r="10"></circle><path d="M8 13c1.5 3 6.5 3 8 0"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line>' }
  ];
}
