import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecanchaService } from '../../services/recancha.service';

type FaseRespiracion = 'inhalar' | 'sostener' | 'exhalar';

@Component({
  selector: 'app-ejercicio-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="overlay" (click)="cerrar()">
      <div class="card-dialog" (click)="$event.stopPropagation()">
        <!-- Encabezado con etiquetas -->
        <div class="dialog-header">
          <div class="row-meta">
            <span class="tag-cat">{{ service.ejercicioSeleccionado()?.categoria }}</span>
            <span class="tag-dur">{{ service.ejercicioSeleccionado()?.tipo }}</span>
          </div>
          <button type="button" class="btn-close-corner" (click)="cerrar()" title="Cerrar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <h3 class="exercise-name">{{ service.ejercicioSeleccionado()?.titulo }}</h3>
        <p class="summary">{{ service.ejercicioSeleccionado()?.descripcion }}</p>

        <!-- HERRAMIENTA INTERACTIVA REAL: Entrenador de Respiración & Modulación Emocional -->
        <div class="pacer-container">
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

            <button type="button" class="btn-pacer-secondary" (click)="reiniciar()" title="Reiniciar ciclo">
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

        <!-- Pasos guiados clínicos -->
        <div class="instructions" *ngIf="service.ejercicioSeleccionado()?.pasos as pasos">
          <div class="inst-head">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
              <path d="m9 12 2 2 4-4"></path>
            </svg>
            <strong>Protocolo de ejecución técnica:</strong>
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
      max-width: 600px; 
      max-height: 94vh;
      max-height: 94dvh;
      overflow-y: auto;
      border-radius: clamp(14px, 3.5vw, 18px); 
      padding: clamp(16px, 4vw, 28px); 
      color: #0f172a; 
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35);
      border: 1px solid #e2e8f0;
      -webkit-overflow-scrolling: touch;
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

    /* Entrenador visual de respiración real */
    .pacer-container {
      background: linear-gradient(180deg, #0b1120 0%, #1e293b 100%);
      border-radius: 14px;
      padding: clamp(16px, 3.5vw, 24px) clamp(12px, 3vw, 20px);
      display: flex;
      flex-direction: column;
      align-items: center;
      color: #ffffff;
      margin-bottom: 20px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.4);
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

    .phase-label {
      font-size: 0.8rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #ffffff;
      text-shadow: 0 2px 4px rgba(0,0,0,0.5);
    }
    .phase-timer {
      font-size: clamp(1.3rem, 4vw, 1.7rem);
      font-weight: 800;
      font-family: 'JetBrains Mono', monospace;
      color: #ffffff;
      margin-top: 2px;
      text-shadow: 0 2px 6px rgba(0,0,0,0.6);
    }

    .pacer-meta-row {
      text-align: center;
      margin-bottom: 14px;
    }
    .cycle-count {
      display: block;
      font-size: 0.78rem;
      font-weight: 700;
      color: #ec4899;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 2px;
    }
    .phase-instruction {
      font-size: clamp(0.82rem, 2.2vw, 0.9rem);
      color: #cbd5e1;
      font-weight: 500;
    }

    .pacer-controls {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      flex-wrap: wrap;
      width: 100%;
    }

    .btn-pacer-action {
      background: linear-gradient(135deg, #2563eb 0%, #ec4899 100%);
      color: #ffffff;
      border: none;
      padding: 10px 18px;
      border-radius: 10px;
      font-weight: 700;
      font-size: 0.86rem;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 4px 14px rgba(236, 72, 153, 0.35);
      transition: all 0.2s ease;
      min-height: 42px;
    }
    .btn-pacer-action:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 18px rgba(236, 72, 153, 0.45);
    }

    .btn-pacer-secondary {
      background: rgba(255, 255, 255, 0.08);
      color: #e2e8f0;
      border: 1px solid rgba(255, 255, 255, 0.15);
      padding: 9px 14px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.82rem;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.15s ease;
      min-height: 42px;
    }
    .btn-pacer-secondary:hover {
      background: rgba(255, 255, 255, 0.16);
      color: #ffffff;
    }
    .btn-pacer-secondary.muted { color: #94a3b8; }

    /* Lista guiada */
    .instructions { 
      background: #f8fafc; 
      padding: clamp(14px, 3vw, 18px); 
      border-radius: 12px; 
      border: 1px solid #e2e8f0; 
      margin-bottom: 22px; 
    }
    .inst-head { display: flex; align-items: center; gap: 8px; font-size: 0.88rem; color: #1e3a8a; margin-bottom: 10px; }
    .inst-head svg { color: #2563eb; flex-shrink: 0; }
    .instructions ol { margin-left: 18px; margin-top: 4px; }
    .instructions li { font-size: 0.86rem; color: #475569; line-height: 1.55; margin-bottom: 6px; }

    /* Botones de acción inferiores */
    .footer-btns { display: flex; justify-content: flex-end; gap: 10px; flex-wrap: wrap; }
    .btn-cancel { 
      background: #ffffff; 
      border: 1.5px solid #cbd5e1; 
      padding: 10px 18px; 
      border-radius: 8px; 
      cursor: pointer; 
      font-weight: 600;
      font-size: 0.88rem;
      color: #64748b;
      transition: all 0.15s ease;
      min-height: 44px;
    }
    .btn-cancel:hover { background: #f8fafc; color: #0f172a; border-color: #94a3b8; }
    
    .btn-finish { 
      background: linear-gradient(135deg, #2563eb 0%, #ec4899 100%); 
      color: #ffffff; 
      border: none; 
      padding: 10px 22px; 
      border-radius: 8px; 
      font-weight: 700; 
      font-size: 0.88rem;
      cursor: pointer; 
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
      transition: all 0.2s ease;
      min-height: 44px;
    }
    .btn-finish:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(236, 72, 153, 0.35);
    }

    @media (max-width: 480px) {
      .pacer-controls {
        flex-direction: column;
      }
      .btn-pacer-action, .btn-pacer-secondary {
        width: 100%;
        justify-content: center;
      }
      .footer-btns {
        flex-direction: column-reverse;
      }
      .btn-cancel, .btn-finish {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class EjercicioModalComponent implements OnInit, OnDestroy {
  service = inject(RecanchaService);

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

  ngOnInit() {
    this.iniciarPacer();
  }

  ngOnDestroy() {
    this.detenerTimer();
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

  reiniciar() {
    this.cicloActual = 1;
    this.iniciarPacer();
  }

  toggleSonido() {
    this.sonidoSilenciado = !this.sonidoSilenciado;
  }

  /* Síntesis de sonido suave con Web Audio API pura (sin archivos externos) */
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
    this.service.ejercicioSeleccionado.set(null); 
  }

  marcar() { 
    this.detenerTimer();
    this.service.completarEjercicio(); 
  }
}
