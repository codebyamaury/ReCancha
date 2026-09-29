import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RecanchaService } from '../../services/recancha.service';

@Component({
  selector: 'app-sesiones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="head">
      <h2>Sesiones Clínicas</h2>
      <p>Gestión y acceso a tus consultas de telepsicología deportiva en vivo.</p>
    </div>

    <!-- Lista de Sesiones Programadas -->
    <div class="sessions-list">
      <div class="session-card-row" *ngFor="let s of service.sesiones()">
        <div class="left-info">
          <div class="tag-pill">{{ s.tipo }}</div>
          <h4>{{ s.titulo }}</h4>
          <div class="meta-row">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
              <line x1="16" x2="16" y1="2" y2="6"></line>
              <line x1="8" x2="8" y1="2" y2="6"></line>
              <line x1="3" x2="21" y1="10" y2="10"></line>
            </svg>
            <span>{{ s.fechaTexto }} · {{ s.horaTexto }} · {{ esPsicologa ? ('Deportista: ' + (s.deportistaNombre || 'Amaury Mendoza')) : (s.psicologa.startsWith('Psic.') || s.psicologa.startsWith('Especialista') ? s.psicologa : 'Psic. ' + s.psicologa) }}</span>
          </div>
        </div>

        <div class="right-buttons">
          <button type="button" class="btn-primary-action" (click)="service.llamadaActiva.set(true)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="23 7 16 12 23 17 23 7"></polygon>
              <rect width="15" height="14" x="1" y="5" rx="2" ry="2"></rect>
            </svg>
            <span>Ingresar a videollamada</span>
          </button>
          
          <button type="button" class="btn-outline-cancel" (click)="service.cancelarSesion(s.id!)">
            Cancelar
          </button>
        </div>
      </div>
    </div>

    <!-- Formulario para Agendar Nueva Sesión -->
    <div class="form-card">
      <div class="card-header-row">
        <div class="header-icon-box">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
            <line x1="16" x2="16" y1="2" y2="6"></line>
            <line x1="8" x2="8" y1="2" y2="6"></line>
            <line x1="3" x2="21" y1="10" y2="10"></line>
          </svg>
        </div>
        <div>
          <h3>Agendar una nueva cita</h3>
          <p class="sub-form">Selecciona la modalidad, fecha y hora de tu próxima intervención psicológica.</p>
        </div>
      </div>

      <div class="grid-form">
        <div>
          <label>Modalidad de Sesión</label>
          <select [(ngModel)]="tipoSeleccionado" class="inp-ctrl">
            <option value="Sesión individual">Sesión individual (Evaluación y TCC)</option>
            <option value="Sesión grupal">Sesión grupal (Autodiálogo y Resiliencia)</option>
          </select>
        </div>

        <div>
          <label>Fecha de Consulta</label>
          <input type="date" [(ngModel)]="fechaSeleccionada" class="inp-ctrl">
        </div>

        <div>
          <label>Horario Disponible</label>
          <input type="time" [(ngModel)]="horaSeleccionada" class="inp-ctrl">
        </div>
      </div>

      <button type="button" class="btn-primary-action submit-btn" (click)="agendar()">
        <span>Confirmar y Agendar Cita</span>
      </button>
    </div>
  `,
  styles: [`
    .head h2 { font-size: clamp(1.35rem, 4vw, 1.7rem); font-weight: 800; color: #0f172a; letter-spacing: -0.02em; }
    .head p { color: #64748b; font-size: clamp(0.82rem, 2.2vw, 0.92rem); margin-top: 4px; margin-bottom: 22px; line-height: 1.45; }
    
    .sessions-list { display: flex; flex-direction: column; gap: 14px; margin-bottom: 28px; }
    
    .session-card-row { 
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
      padding: clamp(16px, 3vw, 20px) clamp(16px, 3.5vw, 24px); 
      background: #ffffff; 
      border-radius: 14px; 
      border: 1px solid #e2e8f0; 
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
      transition: all 0.2s ease;
      gap: 16px;
    }
    .session-card-row:hover {
      box-shadow: 0 6px 16px -2px rgba(37, 99, 235, 0.1);
      border-color: #cbd5e1;
    }
    
    .tag-pill {
      display: inline-block;
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #2563eb;
      background: #eff6ff;
      padding: 3px 8px;
      border-radius: 6px;
      margin-bottom: 6px;
    }
    
    .left-info h4 { font-size: clamp(1.05rem, 2.5vw, 1.15rem); font-weight: 800; color: #0f172a; margin-bottom: 6px; }
    .meta-row { display: flex; align-items: center; gap: 6px; font-size: 0.85rem; color: #64748b; flex-wrap: wrap; }
    .meta-row svg { color: #ec4899; flex-shrink: 0; }
    
    .right-buttons { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
    
    .btn-primary-action { 
      background: linear-gradient(135deg, #2563eb 0%, #ec4899 100%); 
      color: #ffffff; 
      border: none; 
      padding: 11px 18px; 
      border-radius: 8px; 
      font-weight: 600; 
      cursor: pointer; 
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      font-size: 0.86rem;
      box-shadow: 0 4px 10px rgba(37, 99, 235, 0.25);
      transition: all 0.2s ease;
      min-height: 44px;
    }
    .btn-primary-action:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 14px rgba(236, 72, 153, 0.35);
    }
    
    .btn-outline-cancel { 
      background: #ffffff; 
      border: 1px solid #cbd5e1; 
      padding: 11px 16px; 
      border-radius: 8px; 
      cursor: pointer; 
      color: #64748b; 
      font-size: 0.86rem;
      font-weight: 600;
      transition: all 0.15s ease;
      min-height: 44px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    .btn-outline-cancel:hover { background: #f8fafc; color: #e11d48; border-color: #fecdd3; }
    
    .form-card { 
      background: #ffffff; 
      padding: clamp(18px, 3.5vw, 26px); 
      border-radius: 14px; 
      border: 1px solid #e2e8f0; 
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }
    
    .card-header-row { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 20px; }
    .header-icon-box {
      background: #eff6ff;
      color: #2563eb;
      padding: 8px;
      border-radius: 10px;
      flex-shrink: 0;
    }
    .form-card h3 { font-size: clamp(1.05rem, 2.5vw, 1.15rem); font-weight: 800; color: #0f172a; margin-bottom: 2px; }
    .sub-form { font-size: 0.84rem; color: #64748b; }
    
    .grid-form { 
      display: grid; 
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 200px), 1fr)); 
      gap: clamp(14px, 2.5vw, 18px); 
      margin-bottom: 20px; 
    }
    .grid-form label { display: block; font-size: 0.82rem; font-weight: 700; color: #334155; margin-bottom: 6px; }
    .inp-ctrl { 
      width: 100%; 
      padding: 11px 14px; 
      border: 1.5px solid #e2e8f0; 
      border-radius: 8px; 
      font-size: 0.88rem; 
      color: #0f172a; 
      background: #f8fafc;
      transition: all 0.15s ease;
      box-sizing: border-box;
      min-height: 44px;
    }
    .inp-ctrl:focus { outline: none; border-color: #2563eb; background: #fff; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12); }
    
    .submit-btn { width: fit-content; padding: 12px 24px; min-height: 44px; }

    @media (max-width: 768px) {
      .session-card-row {
        flex-direction: column;
        align-items: stretch;
      }
      .right-buttons {
        flex-direction: column;
        width: 100%;
      }
      .btn-primary-action, .btn-outline-cancel {
        width: 100%;
      }
      .submit-btn {
        width: 100%;
      }
    }
  `]
})
export class SesionesComponent {
  service = inject(RecanchaService);
  tipoSeleccionado: 'Sesión individual' | 'Sesión grupal' = 'Sesión individual';
  fechaSeleccionada: string;
  horaSeleccionada = '16:00';

  constructor() {
    const manana = new Date();
    manana.setDate(manana.getDate() + 1);
    this.fechaSeleccionada = manana.toISOString().split('T')[0];
  }

  get esPsicologa(): boolean {
    return this.service.usuarioActual().rol === 'psicologa';
  }

  agendar() { 
    this.service.agendarSesion(this.tipoSeleccionado, this.fechaSeleccionada, this.horaSeleccionada); 
  }
}
