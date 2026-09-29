import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RecanchaService } from '../../services/recancha.service';
import { DeportistaClinica } from '../../models/recancha.models';

@Component({
  selector: 'app-panel-deportistas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="head">
      <h2>Expedientes Clínicos de Deportistas</h2>
      <p>Monitoreo continuo de evolución psicológica, adherencia al tratamiento y registro de notas clínicas de rehabilitación.</p>
    </div>

    <!-- Tabla de Deportistas -->
    <div class="table-container">
      <table class="table-athletes">
        <thead>
          <tr>
            <th>Deportista</th>
            <th>Lesión Diagnosticada</th>
            <th>Ánimo (7 días)</th>
            <th>Avance</th>
            <th>Estado Clínico</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            *ngFor="let a of service.deportistas()" 
            [class.active-row]="seleccionada.id === a.id" 
            (click)="seleccionar(a)">
            <td>
              <div class="athlete-cell">
                <div class="table-avatar">{{ obtenerIniciales(a.nombre) }}</div>
                <div>
                  <span class="bold-name">{{ a.nombre }}</span>
                  <span class="athlete-sub">Rugby IDERT</span>
                </div>
              </div>
            </td>
            <td><span class="injury-tag">{{ a.lesion }}</span></td>
            <td>
              <div class="mood-rating-cell">
                <span class="mood-val">{{ a.animoPromedio }}</span>
              </div>
            </td>
            <td>
              <div class="prog-cell">
                <div class="mini-bar">
                  <div class="mini-fill" [style.width.%]="a.avance"></div>
                </div>
                <span>{{ a.avance }}%</span>
              </div>
            </td>
            <td>
              <span class="chip" [class.danger]="a.estado === 'Requiere atención'">
                {{ a.estado }}
              </span>
            </td>
            <td>
              <button type="button" class="btn-table-view" (click)="seleccionar(a); $event.stopPropagation()">
                Ver expediente
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Expediente Detallado de la Deportista Seleccionada -->
    <div class="detail-box">
      <div class="detail-top">
        <div class="athlete-profile-header">
          <div class="profile-avatar-lg">{{ obtenerIniciales(seleccionada.nombre) }}</div>
          <div>
            <h3>{{ seleccionada.nombre }}</h3>
            <p class="lesion-p"><strong>Lesión:</strong> {{ seleccionada.lesion }} · Deporte: Rugby Femenino IDERT</p>
          </div>
        </div>

        <div class="top-actions">
          <div class="next-time-box">
            <span class="next-label">Próxima sesión agendada</span>
            <strong>{{ seleccionada.proximaSesion }}</strong>
          </div>
          <button type="button" class="btn-start-call" (click)="service.llamadaActiva.set(true)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="23 7 16 12 23 17 23 7"></polygon>
              <rect width="15" height="14" x="1" y="5" rx="2" ry="2"></rect>
            </svg>
            <span>Iniciar Consulta Virtual</span>
          </button>
        </div>
      </div>

      <!-- Gráfico de Evolución Emocional de los Últimos 7 Días -->
      <div class="history-graph">
        <div class="graph-title-row">
          <div class="icon-chip pink">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 3v18h18"></path>
              <path d="m19 9-5 5-4-4-3 3"></path>
            </svg>
          </div>
          <h4>Evolución emocional registrada en los últimos 7 días (Escala 1 - 5)</h4>
        </div>

        <div class="bars-strip">
          <div *ngFor="let score of seleccionada.historial7Dias; let i = index" class="point-col">
            <span class="score-label">{{ score }}/5</span>
            <div class="pillar" [style.height.px]="score * 22"></div>
            <span class="day-code">Día {{ i + 1 }}</span>
          </div>
        </div>
      </div>

      <!-- Registro de Notas Clínicas de Evolución -->
      <div class="clinical-notes-section">
        <div class="notes-header-row">
          <div class="icon-chip blue">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
            </svg>
          </div>
          <h4>Notas de Evolución y Seguimiento TCC</h4>
        </div>

        <div class="add-note-card">
          <textarea 
            [(ngModel)]="nuevaNotaTexto" 
            class="note-input" 
            rows="3" 
            placeholder="Escribe aquí las observaciones clínicas, avances cognitivos o acuerdos terapéuticos con la deportista..."></textarea>
          <button type="button" class="btn-save-note" (click)="guardarNota()">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
              <polyline points="17 21 17 13 7 13 7 21"></polyline>
              <polyline points="7 3 7 8 15 8"></polyline>
            </svg>
            <span>Registrar nota en expediente</span>
          </button>
        </div>

        <!-- Lista de notas guardadas para esta deportista -->
        <div class="notes-history-list">
          <div class="note-item" *ngFor="let n of notasActuales">
            <div class="note-meta">
              <strong>{{ n.psicologa }}</strong>
              <span>{{ n.fecha }}</span>
            </div>
            <p class="note-text">{{ n.texto }}</p>
          </div>
          <div class="empty-notes" *ngIf="notasActuales.length === 0">
            <span>No hay notas clínicas registradas previamente para esta deportista.</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .head h2 { font-size: clamp(1.35rem, 4vw, 1.7rem); font-weight: 800; color: #0f172a; letter-spacing: -0.02em; }
    .head p { color: #64748b; font-size: clamp(0.82rem, 2.2vw, 0.92rem); margin-top: 4px; margin-bottom: 22px; line-height: 1.5; }
    
    .table-container {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.04);
      margin-bottom: 26px;
    }

    .table-athletes { width: 100%; border-collapse: collapse; min-width: 640px; }
    .table-athletes th, .table-athletes td { padding: 14px 16px; text-align: left; font-size: 0.88rem; border-bottom: 1px solid #f1f5f9; }
    .table-athletes th { background: #f8fafc; font-weight: 700; color: #475569; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.04em; }
    .table-athletes tr { cursor: pointer; transition: all 0.15s ease; }
    .table-athletes tr:hover { background: #f8fafc; }
    .table-athletes tr.active-row { 
      background: #eff6ff; 
      border-left: 4px solid #2563eb; 
    }
    
    .athlete-cell { display: flex; align-items: center; gap: 10px; }
    .table-avatar {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: linear-gradient(135deg, #2563eb 0%, #ec4899 100%);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.82rem;
      flex-shrink: 0;
    }
    .bold-name { font-weight: 700; color: #0f172a; display: block; font-size: 0.88rem; }
    .athlete-sub { font-size: 0.74rem; color: #64748b; }
    
    .injury-tag {
      background: #f1f5f9;
      color: #334155;
      padding: 4px 8px;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 500;
      white-space: nowrap;
    }

    .mood-rating-cell { display: flex; align-items: center; gap: 6px; }
    .mood-val { font-weight: 700; color: #0f172a; }

    .prog-cell { display: flex; align-items: center; gap: 8px; font-size: 0.82rem; font-weight: 600; color: #475569; }
    .mini-bar { width: 50px; height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden; flex-shrink: 0; }
    .mini-fill { height: 100%; background: linear-gradient(90deg, #2563eb 0%, #ec4899 100%); }

    .chip { 
      padding: 4px 10px; 
      border-radius: 20px; 
      font-size: 0.72rem; 
      font-weight: 700; 
      background: #eff6ff; 
      color: #2563eb; 
      display: inline-block;
      white-space: nowrap;
    }
    .chip.danger { background: #fdf2f8; color: #ec4899; }
    
    .btn-table-view {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 0.78rem;
      font-weight: 600;
      color: #2563eb;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.15s ease;
      min-height: 34px;
    }
    .btn-table-view:hover { background: #eff6ff; border-color: #93c5fd; }

    /* Caja de Detalle */
    .detail-box { 
      background: #ffffff; 
      padding: clamp(16px, 3.5vw, 28px); 
      border-radius: 16px; 
      border: 1px solid #e2e8f0; 
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); 
    }
    
    .detail-top { 
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
      margin-bottom: 24px; 
      flex-wrap: wrap; 
      gap: 16px; 
      border-bottom: 1px solid #f1f5f9;
      padding-bottom: 20px;
    }

    .athlete-profile-header { display: flex; align-items: center; gap: 14px; }
    .profile-avatar-lg {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: linear-gradient(135deg, #2563eb 0%, #ec4899 100%);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 1.15rem;
      box-shadow: 0 4px 10px rgba(37, 99, 235, 0.25);
      flex-shrink: 0;
    }
    .detail-top h3 { font-size: clamp(1.15rem, 3vw, 1.35rem); font-weight: 800; color: #0f172a; margin: 0; }
    .lesion-p { font-size: 0.86rem; color: #64748b; margin-top: 4px; }

    .top-actions { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
    .next-time-box {
      text-align: right;
      font-size: 0.85rem;
    }
    .next-label { display: block; font-size: 0.75rem; color: #64748b; }
    .next-time-box strong { color: #0f172a; font-weight: 700; }

    .btn-start-call {
      background: linear-gradient(135deg, #2563eb 0%, #ec4899 100%);
      color: #ffffff;
      border: none;
      padding: 11px 18px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 0.86rem;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
      transition: all 0.2s ease;
      min-height: 44px;
    }
    .btn-start-call:hover {
      box-shadow: 0 6px 16px rgba(236, 72, 153, 0.35);
      transform: translateY(-1px);
    }

    /* Gráfico de Barras */
    .history-graph { margin-bottom: 28px; }
    .graph-title-row { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
    .graph-title-row h4 { font-size: 0.95rem; font-weight: 700; color: #1e293b; margin: 0; }

    .icon-chip {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .icon-chip.pink { background: #fdf2f8; color: #ec4899; }
    .icon-chip.blue { background: #eff6ff; color: #2563eb; }

    .bars-strip { 
      height: 150px; 
      display: flex; 
      align-items: flex-end; 
      justify-content: space-around; 
      background: #f8fafc; 
      border-radius: 12px; 
      padding: 20px clamp(8px, 2vw, 16px) 14px clamp(8px, 2vw, 16px); 
      border: 1px solid #e2e8f0;
      gap: 6px;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
    }
    .point-col { text-align: center; display: flex; flex-direction: column; align-items: center; gap: 4px; min-width: 36px; }
    .score-label { font-size: 0.72rem; font-weight: 700; color: #64748b; }
    .pillar { 
      width: clamp(14px, 3vw, 22px); 
      background: linear-gradient(180deg, #ec4899 0%, #2563eb 100%); 
      border-radius: 6px; 
      transition: height 0.3s ease;
      box-shadow: 0 2px 6px rgba(236, 72, 153, 0.2);
    }
    .day-code { font-size: 0.72rem; color: #64748b; font-weight: 600; }

    /* Sección de Notas Clínicas */
    .clinical-notes-section { border-top: 1px solid #f1f5f9; padding-top: 22px; }
    .notes-header-row { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
    .notes-header-row h4 { font-size: 0.95rem; font-weight: 700; color: #1e293b; margin: 0; }

    .add-note-card { margin-bottom: 20px; }
    .note-input {
      width: 100%;
      padding: 12px 16px;
      border: 1.5px solid #e2e8f0;
      border-radius: 10px;
      font-size: 0.88rem;
      color: #0f172a;
      background: #f8fafc;
      font-family: inherit;
      resize: none;
      box-sizing: border-box;
      transition: all 0.15s ease;
    }
    .note-input:focus { outline: none; border-color: #2563eb; background: #ffffff; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12); }
    
    .btn-save-note {
      background: linear-gradient(135deg, #2563eb 0%, #ec4899 100%);
      color: #ffffff;
      border: none;
      padding: 11px 18px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.84rem;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 7px;
      margin-top: 10px;
      box-shadow: 0 4px 10px rgba(37, 99, 235, 0.2);
      transition: all 0.15s ease;
      min-height: 44px;
    }
    .btn-save-note:hover { transform: translateY(-1px); box-shadow: 0 6px 14px rgba(236, 72, 153, 0.35); }

    .notes-history-list { display: flex; flex-direction: column; gap: 12px; }
    .note-item {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-left: 3px solid #2563eb;
      border-radius: 8px;
      padding: 14px 18px;
    }
    .note-meta { display: flex; justify-content: space-between; font-size: 0.78rem; margin-bottom: 6px; flex-wrap: wrap; gap: 4px; }
    .note-meta strong { color: #1e3a8a; }
    .note-meta span { color: #64748b; }
    .note-text { font-size: 0.86rem; color: #334155; line-height: 1.5; margin: 0; }
    .empty-notes { color: #94a3b8; font-size: 0.85rem; font-style: italic; padding: 8px 0; }

    @media (max-width: 768px) {
      .detail-top {
        flex-direction: column;
        align-items: stretch;
      }
      .top-actions {
        flex-direction: column;
        align-items: stretch;
      }
      .next-time-box {
        text-align: left;
      }
      .btn-start-call {
        width: 100%;
      }
      .btn-save-note {
        width: 100%;
      }
    }
  `]
})
export class PanelDeportistasComponent {
  service = inject(RecanchaService);
  seleccionada: DeportistaClinica = this.service.deportistas()[0];
  nuevaNotaTexto = '';

  get notasActuales() {
    const mapa = this.service.notasClinicas();
    return mapa[this.seleccionada.id] || [];
  }

  seleccionar(a: DeportistaClinica) {
    this.seleccionada = a;
  }

  obtenerIniciales(nombre: string): string {
    if (!nombre) return 'DP';
    const partes = nombre.trim().split(/\s+/);
    if (partes.length >= 2) return (partes[0][0] + partes[1][0]).toUpperCase();
    return partes[0].substring(0, 2).toUpperCase();
  }

  guardarNota() {
    if (!this.nuevaNotaTexto.trim()) return;
    this.service.guardarNotaClinica(this.seleccionada.id, this.nuevaNotaTexto);
    this.nuevaNotaTexto = '';
  }
}
