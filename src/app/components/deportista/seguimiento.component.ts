import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RecanchaService } from '../../services/recancha.service';

@Component({
  selector: 'app-seguimiento',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="head">
      <h2>Mi Seguimiento Psicológico</h2>
      <p>Registro continuo de tu estado afectivo y evolución en el protocolo de rehabilitación.</p>
    </div>

    <div class="grid-layout">
      <!-- 1. Check-in de Hoy -->
      <div class="card-seg">
        <div class="card-title-row">
          <div class="icon-chip blue">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <h3>Registro de hoy</h3>
        </div>

        <p class="sub-txt">Selecciona tu nivel de ánimo actual:</p>
        <div class="mood-selector">
          <button 
            *ngFor="let nivel of escalaAnimo" 
            type="button"
            class="mood-btn" 
            [class.active]="service.animoSeleccionadoHoy() === nivel.valor" 
            (click)="service.animoSeleccionadoHoy.set(nivel.valor)">
            <svg class="mood-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" [innerHTML]="nivel.svgContent">
            </svg>
            <span class="mood-score">{{ nivel.valor }}</span>
            <span class="mood-label">{{ nivel.nombre }}</span>
          </button>
        </div>

        <div class="field-note">
          <label>Bitácora emocional (opcional)</label>
          <textarea 
            class="txt-area" 
            rows="3" 
            [(ngModel)]="notaDia" 
            placeholder="¿Qué sensaciones o pensamientos sobre tu lesión experimentaste hoy?"></textarea>
        </div>

        <button type="button" class="btn-save-checkin" (click)="guardar()">
          <span>Guardar registro en expediente</span>
        </button>
      </div>

      <!-- 2. Evolución Semanal -->
      <div class="card-seg">
        <div class="card-title-row">
          <div class="icon-chip pink">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 3v18h18"></path>
              <path d="m19 9-5 5-4-4-3 3"></path>
            </svg>
          </div>
          <h3>Evolución anímica de los últimos 7 días</h3>
        </div>

        <div class="chart-box">
          <div *ngFor="let d of semana" class="col-chart">
            <div class="bar-pill" [style.height.px]="d.val * 24"></div>
            <span class="bar-val">{{ d.val }}</span>
            <span class="day-text">{{ d.dia }}</span>
          </div>
        </div>
        <p class="chart-caption">Promedio semanal: <strong>3.6 / 5.0</strong> · Tendencia positiva</p>
      </div>

      <!-- 3. Etapa de Recuperación -->
      <div class="card-seg">
        <div class="card-title-row">
          <div class="icon-chip purple">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2v20"></path>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
          <h3>Fase del protocolo clínico</h3>
        </div>

        <div class="track-stepper">
          <div class="step done">1. Diagnóstico</div>
          <div class="step cur">2. Rehabilitación</div>
          <div class="step">3. Retorno al juego</div>
        </div>

        <div class="advance-metric">
          <div class="metric-row">
            <span>Avance general de recuperación</span>
            <strong>65 %</strong>
          </div>
          <div class="bar-shell">
            <div class="bar-fill" style="width: 65%;"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Metas Terapéuticas de la Semana -->
    <div class="card-seg metas-card">
      <div class="card-title-row">
        <div class="icon-chip blue">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 11l3 3L22 4"></path>
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
          </svg>
        </div>
        <h3>Compromisos terapéuticos de la semana</h3>
      </div>

      <ul class="task-list">
        <li *ngFor="let m of metas" [class.completed]="m.completada">
          <input type="checkbox" [id]="m.id" [(ngModel)]="m.completada" class="custom-chk">
          <label [for]="m.id">{{ m.texto }}</label>
        </li>
      </ul>
    </div>
  `,
  styles: [`
    .head h2 { font-size: clamp(1.35rem, 4vw, 1.7rem); font-weight: 800; color: #0f172a; letter-spacing: -0.02em; }
    .head p { color: #64748b; font-size: clamp(0.82rem, 2.2vw, 0.92rem); margin-top: 4px; margin-bottom: 22px; line-height: 1.45; }
    
    .grid-layout { 
      display: grid; 
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr)); 
      gap: clamp(14px, 2.5vw, 20px); 
    }
    
    .card-seg { 
      background: #ffffff; 
      padding: clamp(18px, 3.5vw, 24px); 
      border-radius: 14px; 
      border: 1px solid #e2e8f0; 
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
      display: flex;
      flex-direction: column;
    }
    
    .card-title-row { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
    .card-seg h3 { font-size: 1rem; font-weight: 700; color: #0f172a; margin: 0; }
    
    .icon-chip {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .icon-chip.blue { background: #eff6ff; color: #2563eb; }
    .icon-chip.pink { background: #fdf2f8; color: #ec4899; }
    .icon-chip.purple { background: #faf5ff; color: #9333ea; }
    
    .sub-txt { font-size: 0.8rem; color: #64748b; margin-bottom: 10px; }
    
    .mood-selector { 
      display: grid; 
      grid-template-columns: repeat(5, 1fr); 
      gap: clamp(3px, 1.2vw, 6px); 
      margin-bottom: 16px; 
    }
    .mood-btn { 
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 3px;
      background: #f8fafc; 
      border: 1px solid #e2e8f0; 
      border-radius: 10px; 
      padding: clamp(8px, 1.8vw, 10px) 2px; 
      cursor: pointer; 
      color: #64748b;
      transition: all 0.15s ease;
      min-height: 44px;
    }
    .mood-icon { stroke: #64748b; width: clamp(20px, 4.5vw, 24px); height: clamp(20px, 4.5vw, 24px); }
    .mood-score { font-size: 0.72rem; font-weight: 700; }
    .mood-label { font-size: clamp(0.55rem, 1.8vw, 0.62rem); color: #94a3b8; }
    
    .mood-btn:hover { background: #eff6ff; border-color: #3b82f6; }
    .mood-btn:hover .mood-icon { stroke: #2563eb; }
    
    .mood-btn.active { 
      background: linear-gradient(135deg, rgba(37, 99, 235, 0.12) 0%, rgba(236, 72, 153, 0.12) 100%); 
      border-color: #ec4899; 
      color: #0f172a;
      box-shadow: 0 0 0 2px rgba(236, 72, 153, 0.25);
    }
    .mood-btn.active .mood-icon { stroke: #ec4899; }
    
    .field-note label { display: block; font-size: 0.8rem; font-weight: 700; color: #334155; margin-bottom: 6px; }
    .txt-area { 
      width: 100%; 
      border: 1.5px solid #e2e8f0; 
      border-radius: 8px; 
      padding: 10px 12px; 
      font-size: 0.85rem; 
      margin-bottom: 14px; 
      background: #f8fafc;
      color: #0f172a;
      box-sizing: border-box;
      resize: none;
    }
    .txt-area:focus { outline: none; border-color: #2563eb; background: #fff; }
    
    .btn-save-checkin { 
      background: linear-gradient(135deg, #2563eb 0%, #ec4899 100%); 
      color: #fff; 
      border: none; 
      padding: 11px 16px; 
      border-radius: 8px; 
      font-weight: 600; 
      font-size: 0.85rem;
      cursor: pointer; 
      transition: all 0.18s ease;
      margin-top: auto;
      width: 100%;
      min-height: 44px;
    }
    .btn-save-checkin:hover { box-shadow: 0 4px 12px rgba(236, 72, 153, 0.35); transform: translateY(-1px); }
    
    .chart-box { 
      height: 150px; 
      display: flex; 
      align-items: flex-end; 
      justify-content: space-between; 
      padding: 16px 10px 0 10px; 
      background: #f8fafc;
      border-radius: 10px;
      margin-bottom: 12px;
      gap: 4px;
    }
    .col-chart { text-align: center; flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; height: 100%; min-width: 0; }
    .bar-pill { width: clamp(8px, 2.5vw, 14px); background: linear-gradient(180deg, #ec4899 0%, #2563eb 100%); border-radius: 4px; }
    .bar-val { font-size: 0.7rem; font-weight: 700; color: #2563eb; margin-top: 4px; }
    .day-text { font-size: 0.72rem; color: #64748b; margin-top: 2px; }
    .chart-caption { font-size: 0.78rem; color: #64748b; text-align: center; }
    
    .track-stepper { 
      display: flex; 
      border: 1.5px solid #e2e8f0; 
      border-radius: 8px; 
      overflow: hidden; 
      margin: 16px 0; 
    }
    .step { flex: 1; text-align: center; padding: 10px 4px; font-size: 0.75rem; font-weight: 700; background: #f8fafc; color: #64748b; }
    .step.done { background: #eff6ff; color: #2563eb; }
    .step.cur { background: linear-gradient(135deg, #2563eb 0%, #ec4899 100%); color: #ffffff; }
    
    .advance-metric { margin-top: 14px; }
    .metric-row { display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 700; color: #0f172a; margin-bottom: 6px; }
    .bar-shell { background: #f1f5f9; height: 10px; border-radius: 6px; overflow: hidden; }
    .bar-fill { background: linear-gradient(90deg, #2563eb 0%, #ec4899 100%); height: 100%; border-radius: 6px; }
    
    .metas-card { margin-top: 24px; width: 100%; }
    .task-list { list-style: none; display: flex; flex-direction: column; gap: 12px; margin-top: 10px; }
    .task-list li { display: flex; gap: 12px; font-size: 0.88rem; align-items: center; color: #334155; }
    .task-list li.completed label { text-decoration: line-through; color: #94a3b8; }
    .custom-chk { width: 20px; height: 20px; accent-color: #ec4899; cursor: pointer; flex-shrink: 0; }

    @media (max-width: 480px) {
      .mood-label {
        display: none;
      }
      .track-stepper {
        flex-direction: column;
      }
      .step {
        padding: 8px 10px;
        text-align: left;
        border-bottom: 1px solid #e2e8f0;
      }
      .step:last-child {
        border-bottom: none;
      }
    }
  `]
})
export class SeguimientoComponent {
  service = inject(RecanchaService);
  notaDia = '';

  escalaAnimo = [
    { valor: 1, nombre: 'Bajo', svgContent: '<circle cx="12" cy="12" r="10"></circle><line x1="8" y1="15" x2="16" y2="15"></line><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line>' },
    { valor: 2, nombre: 'Regular', svgContent: '<circle cx="12" cy="12" r="10"></circle><path d="M16 16s-1.5-2-4-2-4 2-4 2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line>' },
    { valor: 3, nombre: 'Neutral', svgContent: '<circle cx="12" cy="12" r="10"></circle><line x1="8" y1="14" x2="16" y2="14"></line><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line>' },
    { valor: 4, nombre: 'Bueno', svgContent: '<circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line>' },
    { valor: 5, nombre: 'Excelente', svgContent: '<circle cx="12" cy="12" r="10"></circle><path d="M8 13c1.5 3 6.5 3 8 0"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line>' }
  ];

  semana = [
    { dia: 'Mié', val: 3 }, { dia: 'Jue', val: 4 }, { dia: 'Vie', val: 3 },
    { dia: 'Sáb', val: 4 }, { dia: 'Dom', val: 4 }, { dia: 'Lun', val: 3 }, { dia: 'Hoy', val: 4 }
  ];

  metas = [
    { id: 'm1', texto: 'Completar los ejercicios de respiración 4 días esta semana', completada: true },
    { id: 'm2', texto: 'Registrar pensamientos automáticos y evidencias en la guía clínica', completada: false },
    { id: 'm3', texto: 'Conectarme puntualmente a la videollamada de seguimiento', completada: true }
  ];

  guardar() {
    this.service.guardarCheckinAnimo(this.service.animoSeleccionadoHoy(), this.notaDia);
    this.notaDia = '';
  }
}
