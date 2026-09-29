import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecanchaService } from '../../services/recancha.service';
import { RecursoBiblioteca } from '../../models/recancha.models';

@Component({
  selector: 'app-biblioteca',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="head">
      <h2>Biblioteca de Acompañamiento Psicológico</h2>
      <p>Guías clínicas, protocolos de reestructuración cognitiva y ejercicios guiados para realizar a tu ritmo entre sesiones.</p>
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
            <span class="badge" [class.badge-pink]="item.categoria === 'Emociones' || item.categoria === 'Autoestima'">
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
        </div>

        <div class="card-footer">
          <button type="button" class="btn-primary-action" (click)="abrirRecurso(item)">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
            <span>{{ item.accion }}</span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .head h2 { font-size: clamp(1.35rem, 4vw, 1.7rem); font-weight: 800; color: #0f172a; letter-spacing: -0.02em; }
    .head p { color: #64748b; font-size: clamp(0.82rem, 2.2vw, 0.92rem); margin-top: 4px; margin-bottom: 22px; max-width: 760px; line-height: 1.5; }
    
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
      grid-template-columns: repeat(auto-fill, minmax(min(100%, 280px), 1fr)); 
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
    .badge-pink {
      background: #fdf2f8;
      color: #ec4899;
    }

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
    .lib-card p { font-size: 0.86rem; color: #475569; line-height: 1.5; margin-bottom: 20px; flex: 1; }
    
    .card-footer { margin-top: auto; }
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
      width: 100%;
      min-height: 44px;
    }
    .btn-primary-action:hover {
      box-shadow: 0 6px 14px rgba(236, 72, 153, 0.35);
      transform: translateY(-1px);
    }
  `]
})
export class BibliotecaComponent {
  service = inject(RecanchaService);
  categorias = ['Todos', 'Emociones', 'Autoestima', 'Autodiálogo', 'Metas'];
  filtroActivo = 'Todos';

  get itemsFiltrados(): RecursoBiblioteca[] {
    if (this.filtroActivo === 'Todos') return this.service.biblioteca();
    return this.service.biblioteca().filter(x => x.categoria.toLowerCase() === this.filtroActivo.toLowerCase());
  }

  abrirRecurso(item: RecursoBiblioteca) { 
    this.service.ejercicioSeleccionado.set(item); 
  }
}
