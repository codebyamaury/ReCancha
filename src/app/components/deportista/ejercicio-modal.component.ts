import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RecanchaService } from '../../services/recancha.service';

type FaseRespiracion = 'inhalar' | 'sostener' | 'exhalar';

@Component({
  selector: 'app-ejercicio-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="overlay" (click)="cerrar()">
      <div class="card-dialog" (click)="$event.stopPropagation()">
        <!-- Encabezado con etiquetas -->
        <div class="dialog-header">
          <div class="row-meta">
            <span class="tag-cat">{{ ejercicio?.categoria }}</span>
            <span class="tag-dur">{{ ejercicio?.tipo }}</span>
            <span class="tag-author" *ngIf="ejercicio?.subidoPor">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
              </svg>
              {{ ejercicio?.subidoPor }}
            </span>
          </div>
          <button type="button" class="btn-close-corner" (click)="cerrar()" title="Cerrar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <h3 class="exercise-name">{{ ejercicio?.titulo }}</h3>
        <p class="summary">{{ ejercicio?.descripcion }}</p>

        <!-- ================= 1. MODALIDAD: RESPIRACIÓN Y MODULACIÓN FISIOLÓGICA ================= -->
        <div class="tool-box pacer-container" *ngIf="modalidadActiva === 'respiracion'">
          <div class="tool-badge-row">
            <span class="tool-live-badge">Entrenador Fisiológico</span>
          </div>

          <div class="pacer-visual" [class]="faseActual" [class.paused]="!enReproduccion">
            <div class="outer-glow-ring"></div>
            <div class="pacer-circle">
              <span class="phase-label">{{ textoFase }}</span>
              <span class="phase-timer">{{ tiempoFase }}s</span>
            </div>
          </div>

          <div class="pacer-meta-row">
            <span class="cycle-count">Ciclo {{ cicloActual }} de 6</span>
            <span class="phase-instruction">{{ instruccionFase }}</span>
          </div>

          <!-- Controles del Pacer -->
          <div class="pacer-controls">
            <button 
              type="button" 
              class="btn-pacer-action" 
              (click)="toggleReproduccion()" 
              [title]="enReproduccion ? 'Pausar ejercicio' : 'Iniciar ejercicio guiado'">
              <svg *ngIf="!enReproduccion" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
              <svg *ngIf="enReproduccion" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16"></rect>
                <rect x="14" y="4" width="4" height="16"></rect>
              </svg>
              <span>{{ enReproduccion ? 'Pausar' : (cicloActual > 1 ? 'Continuar' : 'Iniciar respiración guiada') }}</span>
            </button>

            <button type="button" class="btn-pacer-secondary" (click)="reiniciarPacer()" title="Reiniciar ciclo">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                <path d="M3 3v5h5"></path>
              </svg>
              <span>Reiniciar</span>
            </button>

            <button 
              type="button" 
              class="btn-pacer-secondary" 
              [class.muted]="sonidoSilenciado"
              (click)="toggleSonido()" 
              [title]="sonidoSilenciado ? 'Activar campana armónica' : 'Silenciar campana armónica'">
              <svg *ngIf="!sonidoSilenciado" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
              </svg>
              <svg *ngIf="sonidoSilenciado" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <line x1="23" y1="9" x2="17" y2="15"></line>
                <line x1="17" y1="9" x2="23" y2="15"></line>
              </svg>
              <span>{{ sonidoSilenciado ? 'Silencio' : 'Sonido' }}</span>
            </button>
          </div>
        </div>

        <!-- ================= 2. MODALIDAD: REESTRUCTURACIÓN COGNITIVA TCC ================= -->
        <div class="tool-box tcc-container" *ngIf="modalidadActiva === 'reestructuracion'">
          <div class="tool-header-row">
            <span class="tool-badge blue-badge">Herramienta Clínica TCC</span>
            <span class="tool-subtitle">Registro de Evidencias y Debate Cognitivo</span>
          </div>

          <div class="tcc-form">
            <!-- 1. Pensamiento Negativo Automático -->
            <div class="field-block">
              <label>1. Pensamiento limitante o temor sobre tu lesión:</label>
              <div class="presets-row">
                <button 
                  type="button" 
                  class="btn-preset" 
                  *ngFor="let p of presetsTcc" 
                  (click)="tccPensamientoNegativo = p">
                  {{ p }}
                </button>
              </div>
              <textarea 
                class="form-control" 
                rows="2" 
                [(ngModel)]="tccPensamientoNegativo" 
                placeholder="Escribe el pensamiento exacto que te causa malestar o frustración..."></textarea>
            </div>

            <!-- 2. Distorsión Cognitiva -->
            <div class="field-block">
              <label>2. Distorsión cognitiva identificada:</label>
              <select class="form-control" [(ngModel)]="tccDistorsion">
                <option value="Catastrofismo">Catastrofismo (imaginar el peor escenario posible)</option>
                <option value="Pensamiento todo o nada">Pensamiento todo o nada (si no estoy al 100%, no sirve)</option>
                <option value="Adivinación del futuro">Adivinación del futuro (anticipar que fallaré al volver)</option>
                <option value="Filtro mental negativo">Filtro mental (centrarse solo en el dolor e ignorar avances)</option>
              </select>
            </div>

            <!-- 3. Evidencias Objetivas en Contra -->
            <div class="field-block">
              <label>3. Hechos y evidencias médicas reales en contra:</label>
              <textarea 
                class="form-control" 
                rows="2" 
                [(ngModel)]="tccEvidencias" 
                placeholder="Ejemplo: La resonancia muestra cicatrización; el fisioterapeuta me felicitó por la flexión ganada esta semana..."></textarea>
            </div>

            <!-- 4. Pensamiento Adaptativo y Funcional -->
            <div class="field-block">
              <label>4. Pensamiento alternativo y adaptativo:</label>
              <textarea 
                class="form-control highlight-input" 
                rows="2" 
                [(ngModel)]="tccPensamientoAdaptativo" 
                placeholder="Ejemplo: Mi proceso toma tiempo pero cada día mi cuerpo se fortalece; la paciencia también es parte de mi entrenamiento."></textarea>
            </div>

            <button type="button" class="btn-tcc-save" (click)="guardarTcc()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                <polyline points="7 3 7 8 15 8"></polyline>
              </svg>
              <span>{{ tccGuardado ? '¡Evidencia guardada en expediente!' : 'Guardar reestructuración cognitiva' }}</span>
            </button>
          </div>
        </div>

        <!-- ================= 3. MODALIDAD: AUTODIÁLOGO POSITIVO ================= -->
        <div class="tool-box self-talk-container" *ngIf="modalidadActiva === 'autodialogo'">
          <div class="tool-header-row">
            <span class="tool-badge purple-badge">Entrenamiento de Habla Interna</span>
            <span class="tool-subtitle">Toca cada tarjeta para transformar la frase limitante</span>
          </div>

          <div class="cards-flip-grid">
            <div 
              class="flip-card" 
              *ngFor="let c of tarjetasAutodialogo" 
              [class.flipped]="c.volteada" 
              (click)="c.volteada = !c.volteada">
              <div class="card-inner">
                <div class="card-front">
                  <div class="card-badge red">❌ Pensamiento Limitante</div>
                  <p class="card-text">"{{ c.limitante }}"</p>
                  <span class="flip-hint">Toca para reencuadrar ➔</span>
                </div>
                <div class="card-back">
                  <div class="card-badge green">✅ Afirmación Potenciadora</div>
                  <p class="card-text">"{{ c.potenciadora }}"</p>
                  <span class="flip-hint">✓ Grabado en mente deportiva</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Generador de mantra propio -->
          <div class="mantra-creator">
            <label>Crea tu autoafirmación para tu próxima fisioterapia:</label>
            <div class="mantra-input-row">
              <input 
                type="text" 
                class="form-control" 
                [(ngModel)]="miMantra" 
                placeholder="Ejemplo: Hoy pongo mi cuerpo y mente en cada repetición.">
              <button type="button" class="btn-save-mantra" (click)="guardarMantra()">Guardar</button>
            </div>
            <p class="mantra-success" *ngIf="mantraGuardado">✓ Afirmación fijada en tu bitácora de seguimiento.</p>
          </div>
        </div>

        <!-- ================= 4. MODALIDAD: VISUALIZACIÓN E IMAGINERÍA MOTORA ================= -->
        <div class="tool-box visual-container" *ngIf="modalidadActiva === 'visualizacion'">
          <div class="tool-header-row">
            <span class="tool-badge pink-badge">Imaginería Motora Guiada</span>
            <span class="tool-subtitle">Activación neuromuscular por representación mental</span>
          </div>

          <!-- Selector de Fases de Imaginería -->
          <div class="stages-stepper">
            <button 
              type="button" 
              class="stage-pill" 
              *ngFor="let st of etapasVisualizacion; let idx = index" 
              [class.active]="etapaVisualSeleccionada === idx" 
              (click)="etapaVisualSeleccionada = idx">
              <span class="num">{{ idx + 1 }}</span>
              <span class="name">{{ st.titulo }}</span>
            </button>
          </div>

          <div class="visual-stage-card">
            <h4>{{ etapasVisualizacion[etapaVisualSeleccionada].titulo }}</h4>
            <p class="stage-desc">{{ etapasVisualizacion[etapaVisualSeleccionada].instruccion }}</p>
            <div class="sensory-cue">
              <strong>Foco sensorial:</strong> {{ etapasVisualizacion[etapaVisualSeleccionada].focoSensorial }}
            </div>
          </div>

          <!-- Temporizador guiado de inmersión -->
          <div class="immersion-timer-box">
            <div class="timer-display">
              <span class="time-num">{{ formatMinutos(segundosVisualizacion) }}</span>
              <span class="time-label">Tiempo de inmersión mental</span>
            </div>
            <div class="timer-actions">
              <button type="button" class="btn-timer" (click)="toggleTimerVisualizacion()">
                {{ timerVisualActivo ? 'Pausar inmersión' : 'Iniciar sesión guiada (3 min)' }}
              </button>
              <button type="button" class="btn-timer-reset" (click)="resetTimerVisualizacion()">Reiniciar</button>
            </div>
          </div>
        </div>

        <!-- ================= 5. MODALIDAD: MICRO-METAS SMART DE REHABILITACIÓN ================= -->
        <div class="tool-box goals-container" *ngIf="modalidadActiva === 'metas'">
          <div class="tool-header-row">
            <span class="tool-badge blue-badge">Planificación SMART</span>
            <span class="tool-subtitle">Objetivos clínicos semanales de recuperación</span>
          </div>

          <!-- Progreso de la semana -->
          <div class="progress-box">
            <div class="progress-labels">
              <span>Metas completadas esta semana</span>
              <strong>{{ porcentajeMetas() }}%</strong>
            </div>
            <div class="progress-track">
              <div class="progress-fill" [style.width.%]="porcentajeMetas()"></div>
            </div>
          </div>

          <!-- Lista interactiva de metas -->
          <div class="goals-checklist">
            <div 
              class="goal-item" 
              *ngFor="let g of metasRehabilitacion" 
              [class.done]="g.completada" 
              (click)="toggleMeta(g)">
              <div class="chk-square" [class.checked]="g.completada">
                <svg *ngIf="g.completada" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <span class="goal-text">{{ g.texto }}</span>
              <span class="goal-cat-tag">{{ g.area }}</span>
            </div>
          </div>

          <!-- Agregar nueva meta -->
          <div class="add-goal-row">
            <input 
              type="text" 
              class="form-control" 
              [(ngModel)]="nuevaMetaTexto" 
              placeholder="Escribe una micro-meta personalizada (ej. 'Completar 15 min de hielo')..."
              (keyup.enter)="agregarMeta()">
            <button type="button" class="btn-add-goal" (click)="agregarMeta()">+ Agregar meta</button>
          </div>
        </div>

        <!-- ================= 6. MODALIDAD: LECTURA CLÍNICA Y REFLEXIÓN ================= -->
        <div class="tool-box reading-container" *ngIf="modalidadActiva === 'lectura'">
          <div class="tool-header-row">
            <span class="tool-badge blue-badge">Guía Psicoeducativa</span>
            <span class="tool-subtitle">Protocolo de Intervención IDERT</span>
          </div>

          <div class="reading-note-box">
            <h4>Reflexión guiada para el deportista:</h4>
            <p>La recuperación deportiva no ocurre únicamente en los tejidos biológicos; ocurre en cómo respondes psicológicamente a la incertidumbre. Redacta a continuación tus observaciones sobre el protocolo de hoy:</p>
            <textarea 
              class="form-control" 
              rows="3" 
              [(ngModel)]="reflexionLectura" 
              placeholder="¿Qué aprendizaje o sensación te deja esta lectura para tu proceso actual?"></textarea>
            <button type="button" class="btn-save-reflection" (click)="guardarReflexion()">
              {{ reflexionGuardada ? '✓ Reflexión guardada en expediente' : 'Guardar notas de la sesión' }}
            </button>
          </div>
        </div>

        <!-- Pasos guiados clínicos comunes si existen -->
        <div class="instructions" *ngIf="ejercicio?.pasos as pasos">
          <div class="inst-head">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
              <path d="m9 12 2 2 4-4"></path>
            </svg>
            <strong>Protocolo de ejecución técnica recomendada:</strong>
          </div>
          <ol>
            <li *ngFor="let p of pasos">{{ p }}</li>
          </ol>
        </div>

        <!-- Botones de pie -->
        <div class="footer-btns">
          <button type="button" class="btn-cancel" (click)="cerrar()">Cerrar</button>
          <button type="button" class="btn-finish" (click)="marcar()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>Marcar como completado</span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .overlay { 
      position: fixed; 
      inset: 0; 
      background: rgba(15, 23, 42, 0.75); 
      backdrop-filter: blur(6px);
      display: flex; 
      align-items: center; 
      justify-content: center; 
      z-index: 2000; 
      padding: clamp(10px, 2.5vw, 16px);
    }
    
    .card-dialog { 
      background: #ffffff; 
      width: 100%; 
      max-width: 640px; 
      max-height: 94vh;
      max-height: 94dvh;
      overflow-y: auto;
      border-radius: clamp(14px, 3.5vw, 18px); 
      padding: clamp(16px, 4vw, 28px); 
      color: #0f172a; 
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35);
      border: 1px solid #e2e8f0;
      -webkit-overflow-scrolling: touch;
      box-sizing: border-box;
    }
    
    .dialog-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; gap: 8px; }
    .row-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .tag-cat { 
      background: #eff6ff; 
      color: #2563eb; 
      padding: 4px 10px; 
      border-radius: 6px; 
      font-size: 0.75rem; 
      font-weight: 700; 
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .tag-dur { 
      background: #fdf2f8; 
      color: #ec4899; 
      padding: 4px 10px; 
      border-radius: 6px; 
      font-size: 0.75rem; 
      font-weight: 600; 
    }
    .tag-author {
      background: #f1f5f9;
      color: #475569;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 0.73rem;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    
    .btn-close-corner {
      background: #f1f5f9;
      border: none;
      width: 34px;
      height: 34px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #64748b;
      cursor: pointer;
      transition: all 0.15s ease;
      flex-shrink: 0;
    }
    .btn-close-corner:hover { background: #e2e8f0; color: #0f172a; }

    .exercise-name { font-size: clamp(1.15rem, 3.5vw, 1.4rem); font-weight: 800; color: #0f172a; margin-bottom: 8px; line-height: 1.3; }
    .summary { font-size: clamp(0.82rem, 2.2vw, 0.88rem); color: #475569; line-height: 1.5; margin-bottom: 18px; }

    /* Contenedor genérico de herramienta */
    .tool-box {
      border-radius: 14px;
      padding: clamp(14px, 3.5vw, 22px);
      margin-bottom: 20px;
      box-sizing: border-box;
    }
    .tool-header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 14px;
      flex-wrap: wrap;
      gap: 6px;
    }
    .tool-badge {
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      padding: 3px 8px;
      border-radius: 6px;
    }
    .blue-badge { background: #eff6ff; color: #2563eb; }
    .purple-badge { background: #f5f3ff; color: #7c3aed; }
    .pink-badge { background: #fdf2f8; color: #db2777; }
    .tool-subtitle { font-size: 0.78rem; color: #64748b; font-weight: 500; }

    .form-control {
      width: 100%;
      max-width: 100%;
      min-width: 0;
      padding: 10px 12px;
      border: 1.5px solid #cbd5e1;
      border-radius: 8px;
      font-size: 0.88rem;
      color: #0f172a;
      background: #ffffff;
      box-sizing: border-box;
      font-family: inherit;
      transition: all 0.15s ease;
      display: block;
      resize: none;
    }
    .form-control:focus {
      outline: none;
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
    }

    /* ================= 1. ESTILOS PACER ================= */
    .pacer-container {
      background: linear-gradient(180deg, #0b1120 0%, #1e293b 100%);
      color: #ffffff;
      display: flex;
      flex-direction: column;
      align-items: center;
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.4);
    }
    .tool-badge-row { width: 100%; display: flex; justify-content: flex-start; }
    .tool-live-badge {
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      background: rgba(37, 99, 235, 0.3);
      color: #93c5fd;
      padding: 3px 8px;
      border-radius: 6px;
    }
    .pacer-visual {
      position: relative;
      width: clamp(130px, 36vw, 170px);
      height: clamp(130px, 36vw, 170px);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 10px 0 14px 0;
    }
    .outer-glow-ring {
      position: absolute;
      inset: 0;
      border-radius: 50%;
      border: 2px dashed rgba(236, 72, 153, 0.4);
      animation: rotateRing 20s linear infinite;
    }
    @keyframes rotateRing {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .pacer-circle {
      width: clamp(90px, 25vw, 120px);
      height: clamp(90px, 25vw, 120px);
      border-radius: 50%;
      background: radial-gradient(circle, #2563eb 0%, #1e3a8a 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 30px rgba(37, 99, 235, 0.5);
      transition: transform 1s ease-in-out, box-shadow 1s ease-in-out, background 1s ease-in-out;
    }
    .pacer-visual.inhalar .pacer-circle {
      transform: scale(1.28);
      background: radial-gradient(circle, #ec4899 0%, #be185d 100%);
      box-shadow: 0 0 45px rgba(236, 72, 153, 0.7);
    }
    .pacer-visual.sostener .pacer-circle {
      transform: scale(1.28);
      background: radial-gradient(circle, #38bdf8 0%, #0284c7 100%);
      box-shadow: 0 0 45px rgba(56, 189, 248, 0.7);
    }
    .pacer-visual.exhalar .pacer-circle {
      transform: scale(0.9);
      background: radial-gradient(circle, #2563eb 0%, #1e3a8a 100%);
      box-shadow: 0 0 25px rgba(37, 99, 235, 0.4);
    }
    .phase-label { font-size: 0.95rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; }
    .phase-timer { font-size: 1.8rem; font-weight: 900; line-height: 1; margin-top: 2px; }
    .pacer-meta-row { display: flex; flex-direction: column; align-items: center; gap: 4px; text-align: center; margin-bottom: 16px; }
    .cycle-count { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8; font-weight: 700; }
    .phase-instruction { font-size: clamp(0.82rem, 2.2vw, 0.9rem); color: #cbd5e1; max-width: 380px; }
    .pacer-controls { display: flex; align-items: center; justify-content: center; gap: 10px; width: 100%; flex-wrap: wrap; }
    .btn-pacer-action {
      background: linear-gradient(135deg, #2563eb 0%, #ec4899 100%);
      color: #fff;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.88rem;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);
      min-height: 44px;
    }
    .btn-pacer-secondary {
      background: rgba(255, 255, 255, 0.1);
      color: #cbd5e1;
      border: 1px solid rgba(255, 255, 255, 0.15);
      padding: 9px 14px;
      border-radius: 8px;
      font-size: 0.82rem;
      font-weight: 500;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      min-height: 44px;
    }
    .btn-pacer-secondary.muted { opacity: 0.6; }

    /* ================= 2. ESTILOS TCC ================= */
    .tcc-container { background: #f8fafc; border: 1.5px solid #e2e8f0; }
    .tcc-form { display: flex; flex-direction: column; gap: 14px; }
    .field-block label { display: block; font-size: 0.82rem; font-weight: 700; color: #1e293b; margin-bottom: 6px; }
    .presets-row { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 6px; }
    .btn-preset {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      color: #1d4ed8;
      font-size: 0.72rem;
      padding: 3px 8px;
      border-radius: 6px;
      cursor: pointer;
      text-align: left;
    }
    .btn-preset:hover { background: #dbeafe; }
    .highlight-input { border-color: #3b82f6; background: #eff6ff; }
    .btn-tcc-save {
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      color: #fff;
      border: none;
      padding: 11px 18px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.85rem;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      min-height: 44px;
      width: 100%;
    }

    /* ================= 3. ESTILOS AUTODIÁLOGO ================= */
    .self-talk-container { background: #faf5ff; border: 1.5px solid #e9d5ff; }
    .cards-flip-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; margin-bottom: 14px; }
    .flip-card {
      background: #ffffff;
      border: 1.5px solid #e2e8f0;
      border-radius: 10px;
      padding: 12px;
      cursor: pointer;
      transition: all 0.2s ease;
      min-height: 120px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .flip-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(124, 58, 237, 0.1); }
    .flip-card.flipped { background: #f0fdf4; border-color: #86efac; }
    .card-badge { font-size: 0.68rem; font-weight: 700; text-transform: uppercase; margin-bottom: 6px; }
    .card-badge.red { color: #dc2626; }
    .card-badge.green { color: #16a34a; }
    .card-text { font-size: 0.82rem; font-weight: 600; color: #1e293b; line-height: 1.4; }
    .flip-hint { font-size: 0.7rem; color: #7c3aed; font-weight: 600; margin-top: 6px; display: block; }
    
    .mantra-creator { background: #ffffff; padding: 12px; border-radius: 10px; border: 1px solid #e9d5ff; }
    .mantra-creator label { display: block; font-size: 0.8rem; font-weight: 700; color: #4c1d95; margin-bottom: 6px; }
    .mantra-input-row { display: flex; gap: 8px; }
    .btn-save-mantra {
      background: #7c3aed;
      color: #fff;
      border: none;
      padding: 0 16px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.82rem;
      cursor: pointer;
      white-space: nowrap;
      min-height: 44px;
    }
    .mantra-success { font-size: 0.78rem; color: #16a34a; font-weight: 600; margin-top: 6px; }

    /* ================= 4. ESTILOS VISUALIZACIÓN ================= */
    .visual-container { background: #fdf2f8; border: 1.5px solid #fbcfe8; }
    .stages-stepper { display: flex; gap: 6px; overflow-x: auto; margin-bottom: 14px; padding-bottom: 4px; }
    .stage-pill {
      background: #fff;
      border: 1px solid #f472b6;
      border-radius: 20px;
      padding: 6px 12px;
      font-size: 0.75rem;
      font-weight: 600;
      color: #9d174d;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      white-space: nowrap;
      flex-shrink: 0;
    }
    .stage-pill.active { background: #db2777; color: #fff; }
    .stage-pill .num {
      background: rgba(0,0,0,0.1);
      width: 18px;
      height: 18px;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 0.7rem;
    }
    .visual-stage-card {
      background: #ffffff;
      padding: 14px;
      border-radius: 10px;
      border: 1px solid #fbcfe8;
      margin-bottom: 14px;
    }
    .visual-stage-card h4 { font-size: 0.95rem; font-weight: 800; color: #831843; margin-bottom: 6px; }
    .stage-desc { font-size: 0.84rem; color: #374151; line-height: 1.45; margin-bottom: 8px; }
    .sensory-cue { font-size: 0.78rem; color: #be185d; background: #fff1f2; padding: 6px 10px; border-radius: 6px; }

    .immersion-timer-box {
      background: #831843;
      color: #fff;
      padding: 14px;
      border-radius: 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 10px;
    }
    .timer-display { display: flex; flex-direction: column; }
    .time-num { font-size: 1.6rem; font-weight: 900; line-height: 1; }
    .time-label { font-size: 0.72rem; color: #fbcfe8; }
    .timer-actions { display: flex; gap: 8px; }
    .btn-timer {
      background: #db2777;
      color: #fff;
      border: none;
      padding: 8px 14px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.82rem;
      cursor: pointer;
      min-height: 40px;
    }
    .btn-timer-reset {
      background: rgba(255,255,255,0.15);
      color: #fff;
      border: none;
      padding: 8px 12px;
      border-radius: 8px;
      font-size: 0.8rem;
      cursor: pointer;
      min-height: 40px;
    }

    /* ================= 5. ESTILOS METAS ================= */
    .goals-container { background: #f8fafc; border: 1.5px solid #e2e8f0; }
    .progress-box { margin-bottom: 14px; }
    .progress-labels { display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 700; color: #1e293b; margin-bottom: 6px; }
    .progress-track { height: 8px; background: #e2e8f0; border-radius: 6px; overflow: hidden; }
    .progress-fill { height: 100%; background: linear-gradient(90deg, #2563eb, #ec4899); border-radius: 6px; transition: width 0.3s ease; }

    .goals-checklist { display: flex; flex-direction: column; gap: 8px; margin-bottom: 14px; }
    .goal-item {
      display: flex;
      align-items: center;
      gap: 10px;
      background: #ffffff;
      padding: 10px 12px;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .goal-item:hover { border-color: #3b82f6; }
    .goal-item.done { background: #f0fdf4; border-color: #bbf7d0; }
    .goal-item.done .goal-text { text-decoration: line-through; color: #64748b; }
    .chk-square {
      width: 20px;
      height: 20px;
      border-radius: 5px;
      border: 2px solid #cbd5e1;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      flex-shrink: 0;
    }
    .chk-square.checked { background: #16a34a; border-color: #16a34a; }
    .goal-text { font-size: 0.85rem; color: #1e293b; font-weight: 500; flex: 1; }
    .goal-cat-tag { font-size: 0.68rem; font-weight: 700; text-transform: uppercase; background: #eff6ff; color: #2563eb; padding: 2px 6px; border-radius: 4px; }

    .add-goal-row { display: flex; gap: 8px; }
    .btn-add-goal {
      background: #2563eb;
      color: #fff;
      border: none;
      padding: 0 14px;
      border-radius: 8px;
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
      min-height: 44px;
    }

    /* ================= 6. ESTILOS LECTURA ================= */
    .reading-container { background: #f8fafc; border: 1.5px solid #e2e8f0; }
    .reading-note-box { background: #ffffff; padding: 14px; border-radius: 10px; border: 1px solid #e2e8f0; }
    .reading-note-box h4 { font-size: 0.92rem; font-weight: 800; color: #0f172a; margin-bottom: 6px; }
    .reading-note-box p { font-size: 0.82rem; color: #475569; line-height: 1.45; margin-bottom: 10px; }
    .btn-save-reflection {
      background: #2563eb;
      color: #fff;
      border: none;
      padding: 10px 16px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.82rem;
      cursor: pointer;
      margin-top: 10px;
      width: 100%;
      min-height: 42px;
    }

    /* ================= PROTOCOLO GENERAL ================= */
    .instructions {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 10px;
      padding: 14px 16px;
      margin-bottom: 22px;
    }
    .inst-head { display: flex; align-items: center; gap: 8px; color: #1e3a8a; font-size: 0.84rem; margin-bottom: 8px; }
    .instructions ol { padding-left: 20px; font-size: 0.82rem; color: #1e293b; line-height: 1.55; }
    .instructions li { margin-bottom: 4px; }

    /* ================= FOOTER ================= */
    .footer-btns { display: flex; justify-content: flex-end; gap: 10px; flex-wrap: wrap; }
    .btn-cancel {
      background: #ffffff;
      border: 1.5px solid #cbd5e1;
      padding: 10px 18px;
      border-radius: 8px;
      font-size: 0.86rem;
      font-weight: 600;
      color: #475569;
      cursor: pointer;
      min-height: 44px;
    }
    .btn-cancel:hover { background: #f8fafc; color: #0f172a; }
    .btn-finish {
      background: linear-gradient(135deg, #2563eb 0%, #ec4899 100%);
      color: #ffffff;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      font-size: 0.86rem;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 4px 10px rgba(37, 99, 235, 0.25);
      min-height: 44px;
    }

    @media (max-width: 600px) {
      .footer-btns {
        flex-direction: column;
      }
      .btn-cancel, .btn-finish {
        width: 100%;
        justify-content: center;
      }
      .mantra-input-row, .add-goal-row {
        flex-direction: column;
      }
      .btn-save-mantra, .btn-add-goal {
        width: 100%;
      }
    }
  `]
})
export class EjercicioModalComponent implements OnInit, OnDestroy {
  service = inject(RecanchaService);

  get ejercicio() {
    return this.service.ejercicioSeleccionado();
  }

  get modalidadActiva(): string {
    const ej = this.ejercicio;
    if (!ej) return 'lectura';
    if (ej.modalidad) return ej.modalidad;
    // Detección automática por título o categoría si no tuviese modalidad explícita
    const t = ej.titulo.toLowerCase();
    if (t.includes('respiración') || t.includes('ansiedad')) return 'respiracion';
    if (t.includes('reestructuración') || t.includes('pensamientos')) return 'reestructuracion';
    if (t.includes('autodiálogo') || t.includes('frases')) return 'autodialogo';
    if (t.includes('visualización') || t.includes('motora')) return 'visualizacion';
    if (t.includes('meta') || t.includes('objetivo')) return 'metas';
    return 'lectura';
  }

  /* ================= 1. PACER DE RESPIRACIÓN ================= */
  faseActual: FaseRespiracion = 'inhalar';
  tiempoFase = 4;
  cicloActual = 1;
  enReproduccion = false;
  sonidoSilenciado = false;
  private timerInterval: any = null;
  private audioCtx: AudioContext | null = null;

  get textoFase(): string {
    switch (this.faseActual) {
      case 'inhalar': return 'Inhala';
      case 'sostener': return 'Sostén';
      case 'exhalar': return 'Exhala';
    }
  }

  get instruccionFase(): string {
    switch (this.faseActual) {
      case 'inhalar': return 'Inhala profundamente por la nariz expandiendo tu diafragma...';
      case 'sostener': return 'Mantén la calma y conserva el aire en tus pulmones...';
      case 'exhalar': return 'Libera el aire suavemente por la boca aflojando los hombros...';
    }
  }

  /* ================= 2. REESTRUCTURACIÓN TCC ================= */
  presetsTcc = [
    'Siento que mi rodilla va a ceder otra vez',
    'El equipo ya no me necesita y perderé mi lugar',
    'El dolor de hoy significa que empeoré'
  ];
  tccPensamientoNegativo = 'Siento que nunca volveré a jugar con la misma potencia de antes.';
  tccDistorsion = 'Catastrofismo';
  tccEvidencias = 'El médico confirmó cicatrización del tejido; en fisioterapia aumenté 15 grados de movilidad sin inflamación.';
  tccPensamientoAdaptativo = 'La recuperación es gradual y mi cuerpo necesita tiempo biológico; mi constancia diaria es lo que garantiza mi retorno sólido.';
  tccGuardado = false;

  guardarTcc() {
    this.tccGuardado = true;
    this.service.mostrarToast('✓ Reestructuración cognitiva registrada');
    setTimeout(() => { this.tccGuardado = false; }, 3500);
  }

  /* ================= 3. AUTODIÁLOGO POSITIVO ================= */
  tarjetasAutodialogo = [
    {
      id: 1,
      limitante: 'Me siento inútil viendo el entrenamiento desde la banca sin poder correr.',
      potenciadora: 'Mi disciplina en rehabilitación hoy construye mi rendimiento de mañana. Cada sesión cuenta.',
      volteada: false
    },
    {
      id: 2,
      limitante: 'Si no puedo entrenar al 100%, no sirve de nada el esfuerzo.',
      potenciadora: 'Acepto mi ritmo actual. Adaptarse a las cargas es la marca de una atleta inteligente.',
      volteada: false
    },
    {
      id: 3,
      limitante: 'Tengo miedo de que al volver a saltar me vuelva a lesionar.',
      potenciadora: 'El miedo es natural; entreno mi propiocepción y fortalezco mis músculos para proteger mi articulación.',
      volteada: false
    }
  ];
  miMantra = 'Hoy pongo mi cuerpo y mente en cada repetición de fisioterapia.';
  mantraGuardado = false;

  guardarMantra() {
    if (!this.miMantra.trim()) return;
    this.mantraGuardado = true;
    this.service.mostrarToast('✓ Autoafirmación fijada en tu bitácora');
    setTimeout(() => { this.mantraGuardado = false; }, 3000);
  }

  /* ================= 4. VISUALIZACIÓN E IMAGINERÍA MOTORA ================= */
  etapaVisualSeleccionada = 0;
  etapasVisualizacion = [
    {
      titulo: '1. Relajación y Anclaje',
      instruccion: 'Cierra los ojos. Suelta la tensión de la mandíbula, cuello y piernas. Respira pausado sintiendo apoyo pleno en el suelo.',
      focoSensorial: 'Tacto y peso corporal relajado.'
    },
    {
      titulo: '2. Reconstrucción del Escenario',
      instruccion: 'Imagina tu cancha deportiva con nitidez. Siente la iluminación, el sonido del balón, la voz de tu entrenador y la textura de tu uniforme.',
      focoSensorial: 'Visión nítida y memoria auditiva del campo.'
    },
    {
      titulo: '3. Ejecución del Movimiento Perfecto',
      instruccion: 'Obsérvate realizando el gesto técnico específico de tu disciplina en cámara lenta. La articulación lesionada responde firme, potente y sin ninguna molestia.',
      focoSensorial: 'Propiocepción muscular y fluidez biomecánica.'
    },
    {
      titulo: '4. Cierre y Emoción de Triunfo',
      instruccion: 'Siente la satisfacción de culminar la jugada y abrazar a tus compañeras. Ancla esta sensación de seguridad en tu mente antes de abrir los ojos.',
      focoSensorial: 'Confianza y alegría de competir.'
    }
  ];
  segundosVisualizacion = 180;
  timerVisualActivo = false;
  private visualInterval: any = null;

  toggleTimerVisualizacion() {
    this.timerVisualActivo = !this.timerVisualActivo;
    if (this.timerVisualActivo) {
      this.reproducirChime(440);
      this.visualInterval = setInterval(() => {
        if (this.segundosVisualizacion > 0) {
          this.segundosVisualizacion--;
        } else {
          this.resetTimerVisualizacion();
          this.reproducirChime(660);
          this.service.mostrarToast('¡Sesión de visualización motora completada!');
        }
      }, 1000);
    } else {
      if (this.visualInterval) clearInterval(this.visualInterval);
    }
  }

  resetTimerVisualizacion() {
    this.timerVisualActivo = false;
    if (this.visualInterval) clearInterval(this.visualInterval);
    this.segundosVisualizacion = 180;
  }

  formatMinutos(s: number): string {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  }

  /* ================= 5. METAS REHABILITACIÓN SMART ================= */
  metasRehabilitacion = [
    { id: 1, texto: 'Completar 3 sesiones de movilidad de rodilla según protocolo', area: 'Fisioterapia', completada: true },
    { id: 2, texto: 'Aplicar frío y compresión durante 15 min después de cada serie', area: 'Cuidado', completada: true },
    { id: 3, texto: 'Realizar 6 min de respiración diafragmática antes de dormir', area: 'Psicología', completada: false },
    { id: 4, texto: 'Anotar sensaciones en la bitácora tras el entrenamiento del equipo', area: 'Seguimiento', completada: false }
  ];
  nuevaMetaTexto = '';

  toggleMeta(g: any) {
    g.completada = !g.completada;
  }

  agregarMeta() {
    if (!this.nuevaMetaTexto.trim()) return;
    this.metasRehabilitacion.push({
      id: Date.now(),
      texto: this.nuevaMetaTexto.trim(),
      area: 'Objetivo',
      completada: false
    });
    this.nuevaMetaTexto = '';
    this.service.mostrarToast('✓ Nueva meta clínica agregada');
  }

  porcentajeMetas(): number {
    if (!this.metasRehabilitacion.length) return 0;
    const comps = this.metasRehabilitacion.filter(m => m.completada).length;
    return Math.round((comps / this.metasRehabilitacion.length) * 100);
  }

  /* ================= 6. LECTURA CLÍNICA Y REFLEXIÓN ================= */
  reflexionLectura = '';
  reflexionGuardada = false;

  guardarReflexion() {
    if (!this.reflexionLectura.trim()) return;
    this.reflexionGuardada = true;
    this.service.mostrarToast('✓ Reflexión guardada en expediente');
    setTimeout(() => { this.reflexionGuardada = false; }, 3000);
  }

  /* ================= CICLO DE VIDA ================= */
  ngOnInit() {
    if (this.modalidadActiva === 'respiracion') {
      this.iniciarPacer();
    }
  }

  ngOnDestroy() {
    this.detenerTimer();
    if (this.visualInterval) clearInterval(this.visualInterval);
    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      this.audioCtx.close().catch(() => {});
    }
  }

  iniciarPacer() {
    this.enReproduccion = true;
    this.faseActual = 'inhalar';
    this.tiempoFase = 4;
    this.detenerTimer();
    this.reproducirChime(520);

    this.timerInterval = setInterval(() => {
      if (!this.enReproduccion) return;

      this.tiempoFase--;
      if (this.tiempoFase <= 0) {
        this.avanzarFase();
      }
    }, 1000);
  }

  avanzarFase() {
    if (this.faseActual === 'inhalar') {
      this.faseActual = 'sostener';
      this.tiempoFase = 2;
      this.reproducirChime(660);
    } else if (this.faseActual === 'sostener') {
      this.faseActual = 'exhalar';
      this.tiempoFase = 6;
      this.reproducirChime(440);
    } else {
      this.faseActual = 'inhalar';
      this.tiempoFase = 4;
      this.cicloActual++;
      this.reproducirChime(520);
    }
  }

  toggleReproduccion() {
    this.enReproduccion = !this.enReproduccion;
  }

  reiniciarPacer() {
    this.cicloActual = 1;
    this.iniciarPacer();
  }

  toggleSonido() {
    this.sonidoSilenciado = !this.sonidoSilenciado;
  }

  private reproducirChime(frecuencia: number) {
    if (this.sonidoSilenciado) return;
    try {
      if (!this.audioCtx) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) this.audioCtx = new AudioContextClass();
      }
      if (!this.audioCtx) return;

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(frecuencia, this.audioCtx.currentTime);

      gain.gain.setValueAtTime(0.001, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.12, this.audioCtx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + 0.8);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.85);
    } catch (e) {
      // Audio autoplay policy fallback
    }
  }

  private detenerTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  cerrar() { 
    this.detenerTimer();
    if (this.visualInterval) clearInterval(this.visualInterval);
    this.service.ejercicioSeleccionado.set(null); 
  }

  marcar() { 
    this.detenerTimer();
    if (this.visualInterval) clearInterval(this.visualInterval);
    this.service.completarEjercicio(); 
  }
}
