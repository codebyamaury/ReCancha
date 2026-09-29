import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RecanchaService } from '../../services/recancha.service';
import { RecursoBiblioteca, ModalidadEjercicio } from '../../models/recancha.models';

@Component({
  selector: 'app-biblioteca',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="head-row">
      <div class="head">
        <div class="title-chip-row">
          <h2>Biblioteca de Acompañamiento Psicológico</h2>
          <span class="specialist-badge" *ngIf="esPsicologa">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
            Panel de Gestión Especialista
          </span>
        </div>
        <p>Guías clínicas, protocolos de reestructuración cognitiva y ejercicios guiados para realizar a tu ritmo entre sesiones.</p>
      </div>

      <!-- Botón de acción clínica para la psicóloga -->
      <div class="head-actions" *ngIf="esPsicologa">
        <button type="button" class="btn-publish" (click)="abrirModalCrear()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>Subir recurso clínico</span>
        </button>
      </div>
    </div>

    <!-- Banner informativo para especialista si es psicóloga -->
    <div class="specialist-banner" *ngIf="esPsicologa">
      <div class="banner-icon">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"></path>
          <path d="M6 6h10"></path>
          <path d="M6 10h10"></path>
        </svg>
      </div>
      <div class="banner-info">
        <strong>Gestión y prescripción terapéutica de la Biblioteca:</strong>
        <span>Como profesional en psicología deportiva, los ejercicios y guías que subas quedarán inmediatamente disponibles para todos los deportistas en rehabilitación.</span>
      </div>
    </div>

    <!-- Filtros por categoría -->
    <div class="filters">
      <button 
        *ngFor="let cat of categorias" 
        type="button"
        class="pill" 
        [class.active]="filtroActivo === cat" 
        (click)="filtroActivo = cat">
        {{ cat }}
      </button>
    </div>

    <!-- Cuadrícula de Recursos Clínicos -->
    <div class="lib-grid">
      <div class="lib-card" *ngFor="let item of itemsFiltrados">
        <div class="card-main">
          <div class="tag-row">
            <span class="badge" [ngClass]="getBadgeClass(item.categoria)">
              {{ item.categoria }}
            </span>
            <span class="time">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span>{{ item.tipo }}</span>
            </span>
          </div>

          <h4>{{ item.titulo }}</h4>
          <p>{{ item.descripcion }}</p>

          <!-- Metadatos de Autoría y Modalidad Interactiva -->
          <div class="author-meta-row">
            <span class="modality-pill">
              {{ getModalidadLabel(item.modalidad) }}
            </span>
            <span class="author-name">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              {{ item.subidoPor || 'Psicología Deportiva IDERT' }}
            </span>
          </div>
        </div>

        <div class="card-footer">
          <button type="button" class="btn-primary-action" (click)="abrirRecurso(item)">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
            <span>{{ item.accion || 'Iniciar ejercicio' }}</span>
          </button>

          <!-- Botón de eliminar para psicóloga -->
          <button 
            *ngIf="esPsicologa" 
            type="button" 
            class="btn-delete-card" 
            (click)="eliminarRecurso(item)"
            title="Retirar recurso clínico de la biblioteca">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- ================= MODAL DE SUBIR / PUBLICAR NUEVO RECURSO (SOLO PSICÓLOGA) ================= -->
    <div class="modal-overlay" *ngIf="mostrarModalCrear" (click)="cerrarModalCrear()">
      <div class="modal-dialog-form" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <div>
            <h3>Publicar nuevo recurso en la Biblioteca</h3>
            <p>Define las especificaciones clínicas, la modalidad interactiva y los pasos guiados.</p>
          </div>
          <button type="button" class="btn-close-modal" (click)="cerrarModalCrear()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <form class="create-form" (ngSubmit)="guardarNuevoRecurso()">
          <!-- Título -->
          <div class="form-group">
            <label>Título del recurso o ejercicio clínico *</label>
            <input 
              type="text" 
              class="inp-field" 
              [(ngModel)]="nuevoTitulo" 
              name="titulo" 
              placeholder="Ej. Técnica de Afrontamiento del Dolor en Fisioterapia" 
              required>
          </div>

          <!-- Categoría y Modalidad en 2 columnas -->
          <div class="form-row-2">
            <div class="form-group">
              <label>Categoría temática *</label>
              <select class="inp-field" [(ngModel)]="nuevaCategoria" name="categoria">
                <option value="Emociones">Emociones</option>
                <option value="Autoestima">Autoestima</option>
                <option value="Autodiálogo">Autodiálogo</option>
                <option value="Metas">Metas</option>
                <option value="Visualización">Visualización</option>
                <option value="Rehabilitación">Rehabilitación</option>
              </select>
            </div>

            <div class="form-group">
              <label>Modalidad interactiva *</label>
              <select class="inp-field" [(ngModel)]="nuevaModalidad" name="modalidad">
                <option value="respiracion">Entrenador de respiración diafragmática</option>
                <option value="reestructuracion">Reestructuración cognitiva (TCC)</option>
                <option value="autodialogo">Transformador de autodiálogo y habla interna</option>
                <option value="visualizacion">Imaginería motora y retorno seguro</option>
                <option value="metas">Planificador de micro-metas SMART</option>
                <option value="lectura">Guía clínica psicoeducativa y reflexión</option>
              </select>
            </div>
          </div>

          <!-- Tipo / Duración y Autor -->
          <div class="form-row-2">
            <div class="form-group">
              <label>Duración estimada / Tipo *</label>
              <input 
                type="text" 
                class="inp-field" 
                [(ngModel)]="nuevoTipo" 
                name="tipo" 
                placeholder="Ej. Ejercicio Interactivo · 8 min" 
                required>
            </div>

            <div class="form-group">
              <label>Especialista responsable</label>
              <input 
                type="text" 
                class="inp-field" 
                [(ngModel)]="nuevoAutor" 
                name="autor" 
                placeholder="Nombre del psicólogo/a o IDERT">
            </div>
          </div>

          <!-- Descripción clínica -->
          <div class="form-group">
            <label>Descripción y objetivo terapéutico *</label>
            <textarea 
              class="inp-field text-area" 
              rows="3" 
              [(ngModel)]="nuevaDescripcion" 
              name="descripcion" 
              placeholder="Explica qué habilidad psicológica o fisiológica desarrollará el deportista al completar este recurso..." 
              required></textarea>
          </div>

          <!-- Pasos del protocolo clínico -->
          <div class="form-group">
            <div class="steps-head">
              <label>Pasos del protocolo técnico de ejecución:</label>
              <button type="button" class="btn-add-step" (click)="agregarPaso()">+ Añadir paso</button>
            </div>
            
            <div class="steps-list">
              <div class="step-row" *ngFor="let p of nuevosPasos; let i = index">
                <span class="step-num">{{ i + 1 }}</span>
                <input 
                  type="text" 
                  class="inp-field" 
                  [(ngModel)]="nuevosPasos[i]" 
                  name="paso_{{ i }}" 
                  placeholder="Detalle de la instrucción técnica...">
                <button 
                  type="button" 
                  class="btn-remove-step" 
                  (click)="eliminarPaso(i)" 
                  *ngIf="nuevosPasos.length > 1" 
                  title="Eliminar paso">
                  &times;
                </button>
              </div>
            </div>
          </div>

          <!-- Botones de acción modal -->
          <div class="modal-buttons">
            <button type="button" class="btn-modal-cancel" (click)="cerrarModalCrear()">Cancelar</button>
            <button type="submit" class="btn-modal-submit">
              <span>Publicar recurso en la Biblioteca</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Confirmación Eliminar Recurso (Sin alert/confirm nativo) -->
    <div class="modal-overlay" *ngIf="recursoAEliminar" (click)="recursoAEliminar = null">
      <div class="confirm-modal-box" (click)="$event.stopPropagation()">
        <div class="confirm-icon danger">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <path d="M3 6h18"></path>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </div>
        <h3 class="confirm-modal-title">¿Retirar recurso de la biblioteca?</h3>
        <p class="confirm-modal-desc">
          Estás a punto de retirar <strong>"{{ recursoAEliminar.titulo }}"</strong>. Esta acción quitará el ejercicio de la vista de todos los deportistas.
        </p>
        <div class="confirm-modal-buttons">
          <button type="button" class="btn-modal-cancel" (click)="recursoAEliminar = null">Cancelar</button>
          <button type="button" class="btn-confirm-delete" (click)="confirmarEliminarRecurso()">Retirar recurso</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .head-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }
    .head h2 { font-size: clamp(1.35rem, 4vw, 1.7rem); font-weight: 800; color: #0f172a; letter-spacing: -0.02em; }
    .title-chip-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
    .specialist-badge {
      background: linear-gradient(135deg, rgba(37, 99, 235, 0.12) 0%, rgba(236, 72, 153, 0.12) 100%);
      color: #2563eb;
      border: 1px solid rgba(37, 99, 235, 0.25);
      font-size: 0.75rem;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 20px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .head p { color: #64748b; font-size: clamp(0.82rem, 2.2vw, 0.92rem); margin-top: 4px; max-width: 760px; line-height: 1.5; }
    
    .head-actions { flex-shrink: 0; }
    .btn-publish {
      background: linear-gradient(135deg, #2563eb 0%, #ec4899 100%);
      color: #ffffff;
      border: none;
      padding: 11px 20px;
      border-radius: 10px;
      font-weight: 700;
      font-size: 0.88rem;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
      transition: all 0.2s ease;
      min-height: 44px;
    }
    .btn-publish:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(236, 72, 153, 0.35);
    }

    .specialist-banner {
      background: #eff6ff;
      border: 1.5px solid #bfdbfe;
      border-radius: 12px;
      padding: 12px 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 22px;
    }
    .banner-icon {
      color: #2563eb;
      background: #ffffff;
      padding: 8px;
      border-radius: 8px;
      flex-shrink: 0;
      box-shadow: 0 2px 6px rgba(37, 99, 235, 0.15);
    }
    .banner-info { font-size: 0.84rem; color: #1e3a8a; line-height: 1.45; }
    .banner-info strong { display: block; margin-bottom: 2px; }

    .filters { 
      display: flex; 
      gap: 8px; 
      margin-bottom: 24px; 
      overflow-x: auto; 
      padding-bottom: 6px;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
    }
    .filters::-webkit-scrollbar { display: none; }

    .pill { 
      background: #ffffff; 
      border: 1.5px solid #e2e8f0; 
      padding: 8px 18px; 
      border-radius: 20px; 
      cursor: pointer; 
      font-size: 0.85rem; 
      font-weight: 600; 
      color: #475569;
      transition: all 0.15s ease;
      white-space: nowrap;
      flex-shrink: 0;
      min-height: 38px;
    }
    .pill:hover { border-color: #cbd5e1; background: #f8fafc; }
    .pill.active { 
      background: linear-gradient(135deg, #2563eb 0%, #ec4899 100%); 
      color: #ffffff; 
      border-color: transparent; 
      box-shadow: 0 4px 10px rgba(37, 99, 235, 0.25);
    }
    
    .lib-grid { 
      display: grid; 
      grid-template-columns: repeat(auto-fill, minmax(min(100%, 290px), 1fr)); 
      gap: clamp(14px, 2.5vw, 20px); 
    }
    .lib-card { 
      background: #ffffff; 
      border: 1px solid #e2e8f0; 
      border-radius: 14px; 
      padding: clamp(18px, 3.5vw, 24px); 
      display: flex; 
      flex-direction: column; 
      justify-content: space-between; 
      height: 100%; 
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.04);
      transition: all 0.2s ease;
      box-sizing: border-box;
    }
    .lib-card:hover {
      box-shadow: 0 8px 20px -4px rgba(37, 99, 235, 0.12);
      border-color: #cbd5e1;
      transform: translateY(-2px);
    }

    .card-main { display: flex; flex-direction: column; }
    
    .tag-row { display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem; margin-bottom: 12px; }
    .badge { 
      background: #eff6ff; 
      color: #2563eb; 
      padding: 4px 10px; 
      border-radius: 6px; 
      font-weight: 700; 
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .badge-pink { background: #fdf2f8; color: #ec4899; }
    .badge-purple { background: #f5f3ff; color: #7c3aed; }
    .badge-teal { background: #f0fdfa; color: #0d9488; }

    .time { 
      color: #64748b; 
      display: inline-flex; 
      align-items: center; 
      gap: 5px; 
      font-size: 0.8rem;
      font-weight: 500;
    }
    .time svg { color: #ec4899; }
    
    .lib-card h4 { font-size: clamp(1.02rem, 2.8vw, 1.12rem); font-weight: 800; color: #0f172a; margin-bottom: 8px; line-height: 1.35; }
    .lib-card p { font-size: 0.86rem; color: #475569; line-height: 1.5; margin-bottom: 14px; flex: 1; }

    .author-meta-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      font-size: 0.72rem;
      color: #64748b;
      margin-bottom: 16px;
      border-top: 1px dashed #e2e8f0;
      padding-top: 10px;
      flex-wrap: wrap;
    }
    .modality-pill {
      background: #f1f5f9;
      color: #334155;
      font-weight: 600;
      padding: 2px 7px;
      border-radius: 4px;
    }
    .author-name {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-weight: 500;
    }
    
    .card-footer { 
      margin-top: auto; 
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .btn-primary-action { 
      background: linear-gradient(135deg, #2563eb 0%, #ec4899 100%); 
      color: #ffffff; 
      border: none; 
      padding: 11px 18px; 
      border-radius: 8px; 
      font-weight: 600; 
      font-size: 0.85rem; 
      cursor: pointer; 
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 7px;
      box-shadow: 0 4px 10px rgba(37, 99, 235, 0.2);
      transition: all 0.2s ease;
      flex: 1;
      min-height: 44px;
    }
    .btn-primary-action:hover {
      box-shadow: 0 6px 14px rgba(236, 72, 153, 0.35);
      transform: translateY(-1px);
    }

    .btn-delete-card {
      background: #fff;
      border: 1px solid #cbd5e1;
      color: #94a3b8;
      width: 44px;
      height: 44px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.15s ease;
      flex-shrink: 0;
    }
    .btn-delete-card:hover {
      background: #fff1f2;
      border-color: #fecdd3;
      color: #e11d48;
    }

    /* ================= MODAL SUBIR RECURSO ================= */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.7);
      backdrop-filter: blur(5px);
      z-index: 2500;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: clamp(10px, 2.5vw, 16px);
    }
    .modal-dialog-form {
      background: #ffffff;
      width: 100%;
      max-width: 640px;
      max-height: 94vh;
      max-height: 94dvh;
      overflow-y: auto;
      border-radius: clamp(14px, 3.5vw, 18px);
      padding: clamp(18px, 4vw, 28px);
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35);
      border: 1px solid #e2e8f0;
      -webkit-overflow-scrolling: touch;
      box-sizing: border-box;
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;
      margin-bottom: 20px;
    }
    .modal-header h3 { font-size: clamp(1.15rem, 3.5vw, 1.35rem); font-weight: 800; color: #0f172a; margin-bottom: 4px; }
    .modal-header p { font-size: 0.84rem; color: #64748b; }
    .btn-close-modal {
      background: #f1f5f9;
      border: none;
      width: 34px;
      height: 34px;
      border-radius: 8px;
      color: #64748b;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .btn-close-modal:hover { background: #e2e8f0; color: #0f172a; }

    .create-form { display: flex; flex-direction: column; gap: 14px; }
    .form-group label { display: block; font-size: 0.82rem; font-weight: 700; color: #1e293b; margin-bottom: 6px; }
    .form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    
    .inp-field {
      width: 100%;
      max-width: 100%;
      min-width: 0;
      padding: 10px 14px;
      border: 1.5px solid #cbd5e1;
      border-radius: 8px;
      font-size: 0.88rem;
      color: #0f172a;
      background: #f8fafc;
      box-sizing: border-box;
      font-family: inherit;
      min-height: 44px;
      display: block;
    }
    .inp-field:focus {
      outline: none;
      border-color: #2563eb;
      background: #ffffff;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
    }
    .text-area { resize: none; min-height: 80px; }

    .steps-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .btn-add-step {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      color: #2563eb;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 6px;
      cursor: pointer;
    }
    .btn-add-step:hover { background: #dbeafe; }

    .steps-list { display: flex; flex-direction: column; gap: 8px; }
    .step-row { display: flex; align-items: center; gap: 8px; }
    .step-num {
      width: 26px;
      height: 26px;
      border-radius: 50%;
      background: #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 700;
      color: #475569;
      flex-shrink: 0;
    }
    .btn-remove-step {
      background: #fff1f2;
      border: 1px solid #fecdd3;
      color: #e11d48;
      width: 32px;
      height: 32px;
      border-radius: 6px;
      font-size: 1.2rem;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      flex-shrink: 0;
    }

    .modal-buttons {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 10px;
      flex-wrap: wrap;
    }
    .btn-modal-cancel {
      background: #ffffff;
      border: 1.5px solid #cbd5e1;
      padding: 10px 18px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.86rem;
      color: #64748b;
      cursor: pointer;
      min-height: 44px;
    }
    .btn-modal-submit {
      background: linear-gradient(135deg, #2563eb 0%, #ec4899 100%);
      color: #ffffff;
      border: none;
      padding: 10px 22px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 0.86rem;
      cursor: pointer;
      min-height: 44px;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
    }

    /* Confirm Delete Modal */
    .confirm-modal-box {
      background: #ffffff;
      border-radius: 16px;
      padding: 24px;
      width: 100%;
      max-width: 440px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      box-shadow: 0 20px 40px rgba(15, 23, 42, 0.2);
      animation: modalSlide 0.2s ease-out;
    }
    .confirm-icon.danger {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: #fee2e2;
      color: #dc2626;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .confirm-modal-title {
      font-size: 1.15rem;
      font-weight: 800;
      color: #0f172a;
      margin: 0;
    }
    .confirm-modal-desc {
      font-size: 0.88rem;
      color: #64748b;
      line-height: 1.45;
      margin: 0;
    }
    .confirm-modal-buttons {
      display: flex;
      gap: 10px;
      width: 100%;
      margin-top: 10px;
    }
    .confirm-modal-buttons button {
      flex: 1;
    }
    .btn-confirm-delete {
      background: #dc2626;
      color: #ffffff;
      border: none;
      padding: 10px 18px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 0.86rem;
      cursor: pointer;
      min-height: 44px;
      transition: background 0.15s ease;
    }
    .btn-confirm-delete:hover {
      background: #b91c1c;
    }

    @media (max-width: 600px) {
      .form-row-2 { grid-template-columns: 1fr; gap: 10px; }
      .head-row { flex-direction: column; align-items: stretch; }
      .btn-publish { width: 100%; justify-content: center; }
      .modal-buttons { flex-direction: column; }
      .btn-modal-cancel, .btn-modal-submit { width: 100%; justify-content: center; }
    }
  `]
})
export class BibliotecaComponent {
  service = inject(RecanchaService);
  filtroActivo = 'Todos';
  mostrarModalCrear = false;

  get esPsicologa(): boolean {
    return this.service.usuarioActual().rol === 'psicologa';
  }

  get categorias(): string[] {
    const set = new Set<string>(['Todos', 'Emociones', 'Autoestima', 'Autodiálogo', 'Metas', 'Visualización', 'Rehabilitación']);
    this.service.biblioteca().forEach(item => {
      if (item.categoria) set.add(item.categoria);
    });
    return Array.from(set);
  }

  get itemsFiltrados(): RecursoBiblioteca[] {
    if (this.filtroActivo === 'Todos') return this.service.biblioteca();
    return this.service.biblioteca().filter(x => x.categoria.toLowerCase() === this.filtroActivo.toLowerCase());
  }

  /* ================= GESTIÓN DEL MODAL CREAR RECURSO ================= */
  nuevoTitulo = '';
  nuevaCategoria = 'Emociones';
  nuevaModalidad: ModalidadEjercicio = 'respiracion';
  nuevoTipo = 'Ejercicio Interactivo · 8 min';
  nuevoAutor = '';
  nuevaDescripcion = '';
  nuevosPasos: string[] = [
    'Adopta una postura cómoda y despeja cualquier distracción del entorno.',
    'Sigue las instrucciones visuales y registra tus sensaciones al finalizar.'
  ];

  abrirModalCrear() {
    this.nuevoAutor = this.service.usuarioActual().nombre || 'Psicóloga Especialista IDERT';
    this.mostrarModalCrear = true;
  }

  cerrarModalCrear() {
    this.mostrarModalCrear = false;
  }

  agregarPaso() {
    this.nuevosPasos.push('');
  }

  eliminarPaso(index: number) {
    if (this.nuevosPasos.length > 1) {
      this.nuevosPasos.splice(index, 1);
    }
  }

  recursoAEliminar: RecursoBiblioteca | null = null;

  guardarNuevoRecurso() {
    if (!this.nuevoTitulo.trim() || !this.nuevaDescripcion.trim()) {
      this.service.mostrarToast('Por favor completa el título y la descripción del recurso.');
      return;
    }

    const pasosLimpios = this.nuevosPasos.filter(p => p.trim().length > 0);

    this.service.publicarRecursoBiblioteca({
      titulo: this.nuevoTitulo.trim(),
      categoria: this.nuevaCategoria,
      modalidad: this.nuevaModalidad,
      tipo: this.nuevoTipo.trim() || 'Guía Clínica · 10 min',
      subidoPor: this.nuevoAutor.trim() || 'Psicología Deportiva IDERT',
      descripcion: this.nuevaDescripcion.trim(),
      pasos: pasosLimpios.length > 0 ? pasosLimpios : undefined,
      accion: this.nuevaModalidad === 'lectura' ? 'Abrir guía' : 'Iniciar ejercicio'
    });

    // Resetear formulario
    this.nuevoTitulo = '';
    this.nuevaDescripcion = '';
    this.nuevosPasos = [
      'Adopta una postura cómoda y despeja cualquier distracción del entorno.',
      'Sigue las instrucciones visuales y registra tus sensaciones al finalizar.'
    ];
    this.mostrarModalCrear = false;
  }

  eliminarRecurso(item: RecursoBiblioteca) {
    this.recursoAEliminar = item;
  }

  confirmarEliminarRecurso() {
    if (this.recursoAEliminar) {
      this.service.eliminarRecursoBiblioteca(this.recursoAEliminar.id);
      this.recursoAEliminar = null;
    }
  }

  abrirRecurso(item: RecursoBiblioteca) { 
    this.service.ejercicioSeleccionado.set(item); 
  }

  getBadgeClass(categoria: string): string {
    switch (categoria) {
      case 'Emociones': return 'badge-pink';
      case 'Autoestima': return 'badge-pink';
      case 'Autodiálogo': return 'badge-purple';
      case 'Metas': return 'badge-teal';
      case 'Visualización': return 'badge-purple';
      default: return '';
    }
  }

  getModalidadLabel(modalidad?: ModalidadEjercicio): string {
    switch (modalidad) {
      case 'respiracion': return 'Entrenador Respiratorio';
      case 'reestructuracion': return 'Herramienta TCC';
      case 'autodialogo': return 'Autodiálogo Deportivo';
      case 'visualizacion': return 'Imaginería Motora';
      case 'metas': return 'Micro-Metas SMART';
      case 'lectura': return 'Protocolo Clínico';
      default: return 'Intervención Clínica';
    }
  }
}
