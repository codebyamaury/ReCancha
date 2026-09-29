import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RecanchaService } from '../../services/recancha.service';
import { NivelPsicologo, PsicologoMiembro } from '../../models/recancha.models';

@Component({
  selector: 'app-equipo-psicologos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="equipo-container">
      <!-- Cabecera Principal -->
      <header class="page-header">
        <div class="header-left">
          <div class="header-badge-row">
            <span class="badge-pill">
              <span class="badge-dot"></span>
              IDERT · Dirección de Telepsicología Deportiva
            </span>

            <span class="badge-user-role" [class.is-director]="service.esPsicologoPrincipal()">
              <svg *ngIf="service.esPsicologoPrincipal()" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
              </svg>
              <svg *ngIf="!service.esPsicologoPrincipal()" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <circle cx="12" cy="7" r="4"></circle>
                <path d="M5.5 21a8.5 8.5 0 0 1 13 0"></path>
              </svg>
              <span>{{ service.esPsicologoPrincipal() ? 'Tu rol: Psicólogo Principal (Director Clínico)' : 'Tu rol: Especialista Clínico' }}</span>
            </span>
          </div>

          <h1 class="page-title">Equipo Clínico y Asignación de Roles</h1>
          <p class="page-subtitle">
            Administración de especialistas en psicología deportiva. El <strong>Psicólogo Principal</strong> cuenta con facultades de control directivo, asignación de roles y alta de nuevos miembros.
          </p>
        </div>

        <div class="header-actions">
          <button 
            type="button" 
            class="btn-primary-add" 
            (click)="abrirModalRegistro()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>Registrar Psicólogo/a</span>
          </button>
        </div>
      </header>

      <!-- Guía Rápida para el Psicólogo Principal -->
      <div class="role-guide-banner" *ngIf="service.esPsicologoPrincipal()">
        <div class="guide-icon-box">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
          </svg>
        </div>
        <div class="guide-content">
          <strong>¿Cómo darle el rol de Psicólogo Principal a otra persona?</strong>
          <p>
            Puedes hacerlo de 2 formas:
            <strong>1)</strong> En la tarjeta del colega, haz clic en el botón dorado <strong>"Nombrar Psicólogo Principal"</strong> (o cambia su selector de rol a <em>Psicólogo Principal</em>). Podrás elegir si compartir la dirección o transferirla por completo.
            <strong>2)</strong> Al registrar un nuevo colega con el botón <strong>"+ Registrar Psicólogo/a"</strong>, selecciona directamente el rol <em>Psicólogo Principal (Director)</em>.
          </p>
        </div>
      </div>

      <!-- Métricas Resumen -->
      <section class="stats-row">
        <div class="stat-box">
          <div class="stat-info">
            <span class="stat-label">Total Especialistas</span>
            <strong class="stat-value text-blue">{{ totalPsicologos }}</strong>
          </div>
          <div class="stat-icon-wrap blue">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
        </div>

        <div class="stat-box">
          <div class="stat-info">
            <span class="stat-label">Directores Clínicos</span>
            <strong class="stat-value text-gold">{{ totalDirectores }}</strong>
          </div>
          <div class="stat-icon-wrap gold">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
            </svg>
          </div>
        </div>

        <div class="stat-box">
          <div class="stat-info">
            <span class="stat-label">Especialistas de Campo</span>
            <strong class="stat-value text-teal">{{ totalEspecialistas }}</strong>
          </div>
          <div class="stat-icon-wrap teal">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
        </div>

        <div class="stat-box">
          <div class="stat-info">
            <span class="stat-label">Cuentas Habilitadas</span>
            <strong class="stat-value text-green">{{ totalActivos }} / {{ totalPsicologos }}</strong>
          </div>
          <div class="stat-icon-wrap green">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
        </div>
      </section>

      <!-- Filtros y Búsqueda -->
      <section class="filters-card">
        <div class="search-field">
          <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            type="text" 
            [(ngModel)]="terminoBusqueda" 
            placeholder="Buscar por nombre, correo institucional o área de especialidad..." 
            class="search-input">
          <button *ngIf="terminoBusqueda" type="button" class="btn-clear-search" (click)="terminoBusqueda = ''" aria-label="Limpiar búsqueda">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div class="filter-pills">
          <button 
            type="button" 
            class="filter-pill" 
            [class.active]="filtroRol === 'todos'" 
            (click)="filtroRol = 'todos'">
            Todos ({{ totalPsicologos }})
          </button>
          <button 
            type="button" 
            class="filter-pill" 
            [class.active]="filtroRol === 'director'" 
            (click)="filtroRol = 'director'">
            Directores ({{ totalDirectores }})
          </button>
          <button 
            type="button" 
            class="filter-pill" 
            [class.active]="filtroRol === 'especialista'" 
            (click)="filtroRol = 'especialista'">
            Especialistas ({{ totalEspecialistas }})
          </button>
        </div>
      </section>

      <!-- Cuadrícula del Equipo -->
      <section class="team-grid">
        <div 
          class="team-card" 
          *ngFor="let p of psicologosFiltrados" 
          [class.card-director]="p.nivel === 'director'"
          [class.card-inactivo]="p.estado === 'inactivo'">
          
          <div class="card-top-bar">
            <div class="avatar-col">
              <div class="avatar-circle" [class.avatar-director]="p.nivel === 'director'">
                <img *ngIf="p.fotoUrl" [src]="p.fotoUrl" [alt]="p.nombre" class="avatar-img">
                <span *ngIf="!p.fotoUrl">{{ p.avatarIniciales || 'DR' }}</span>
              </div>
              <span class="status-indicator" [class.online]="p.estado === 'activo'" [title]="p.estado === 'activo' ? 'Cuenta Activa' : 'Cuenta Suspendida'"></span>
            </div>

            <div class="badges-col">
              <span class="level-badge" [class.director-badge]="p.nivel === 'director'" [class.especialista-badge]="p.nivel === 'especialista'">
                <svg *ngIf="p.nivel === 'director'" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                </svg>
                <span>{{ p.nivel === 'director' ? 'Psicólogo Principal' : 'Especialista Clínico' }}</span>
              </span>

              <span class="state-pill" [class.active-pill]="p.estado === 'activo'" [class.inactive-pill]="p.estado === 'inactivo'">
                {{ p.estado === 'activo' ? 'Activo' : 'Suspendido' }}
              </span>
            </div>
          </div>

          <div class="card-main-info">
            <div class="name-row">
              <h3 class="member-name">{{ p.nombre }}</h3>
              <span *ngIf="esUsuarioActual(p)" class="badge-you">(Tú)</span>
            </div>

            <p class="member-email" (click)="copiarTexto(p.email, 'Correo copiado')" title="Clic para copiar correo">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
              </svg>
              <span>{{ p.email }}</span>
            </p>

            <div class="specialty-tag">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
              </svg>
              <span>{{ p.especialidad }}</span>
            </div>
          </div>

          <div class="card-meta-row">
            <span class="meta-item">
              <strong>Deportistas:</strong> {{ p.deportistasAsignados || 0 }} en seguimiento
            </span>
            <span class="meta-item">
              <strong>Ingreso:</strong> {{ formatearFecha(p.fechaRegistro) }}
            </span>
          </div>

          <!-- BOTÓN DESTACADO: NOMBRAR PSICÓLOGO PRINCIPAL -->
          <div class="principal-promotion-bar" *ngIf="service.esPsicologoPrincipal() && !esUsuarioActual(p)">
            <button 
              *ngIf="p.nivel === 'especialista'"
              type="button" 
              class="btn-nombrar-principal" 
              (click)="abrirModalNombrarPrincipal(p)"
              title="Hacer clic para otorgarle el rol directivo de Psicólogo Principal">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
              </svg>
              <span>Nombrar Psicólogo Principal</span>
            </button>

            <button 
              *ngIf="p.nivel === 'director'"
              type="button" 
              class="btn-revertir-principal" 
              (click)="onCambiarRol(p, 'especialista')"
              title="Cambiar rol a Especialista Clínico">
              <span>Cambiar a Especialista Clínico</span>
            </button>
          </div>

          <!-- Acciones de Gestión y Control (Exclusivas para Psicólogo Principal) -->
          <div class="card-actions">
            <!-- Modificar Rol mediante Select -->
            <div class="action-role-wrapper" *ngIf="service.esPsicologoPrincipal()">
              <label class="action-label" for="rol-select-{{ p.id }}">Rol asignado:</label>
              <select 
                id="rol-select-{{ p.id }}" 
                class="role-select" 
                [ngModel]="p.nivel" 
                (ngModelChange)="onCambiarRol(p, $event)">
                <option value="director">Psicólogo Principal (Director)</option>
                <option value="especialista">Especialista Clínico</option>
              </select>
            </div>

            <!-- Botones secundarios -->
            <div class="btn-group-row">
              <button 
                type="button" 
                class="btn-action-ghost" 
                (click)="abrirModalCredenciales(p)" 
                title="Ver o copiar credenciales de inicio de sesión para el colega">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                <span>Credenciales</span>
              </button>

              <button 
                *ngIf="service.esPsicologoPrincipal() && !esUsuarioActual(p)"
                type="button" 
                class="btn-action-ghost" 
                [class.text-amber]="p.estado === 'activo'"
                [class.text-green]="p.estado === 'inactivo'"
                (click)="onToggleEstado(p)" 
                [title]="p.estado === 'activo' ? 'Suspender acceso temporalmente' : 'Reactivar acceso'">
                <svg *ngIf="p.estado === 'activo'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
                </svg>
                <svg *ngIf="p.estado === 'inactivo'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>{{ p.estado === 'activo' ? 'Suspender' : 'Activar' }}</span>
              </button>

              <button 
                *ngIf="service.esPsicologoPrincipal() && !esUsuarioActual(p)"
                type="button" 
                class="btn-action-ghost btn-delete" 
                (click)="abrirConfirmacionEliminar(p)" 
                title="Retirar profesional del equipo">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- ================= MODAL: NOMBRAR PSICÓLOGO PRINCIPAL ================= -->
      <div class="modal-overlay" *ngIf="psicologoParaPrincipal">
        <div class="modal-card modal-principal">
          <div class="principal-modal-icon">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
            </svg>
          </div>
          <h2 class="principal-modal-title">Nombrar Psicólogo Principal</h2>
          <p class="principal-modal-subtitle">
            Estás a punto de otorgarle facultades de <strong>Psicólogo Principal (Director Clínico)</strong> a <strong>{{ psicologoParaPrincipal.nombre }}</strong>.
          </p>

          <div class="transfer-options-list">
            <label 
              class="transfer-option-card" 
              [class.selected]="modalModoPrincipal === 'compartir'"
              (click)="modalModoPrincipal = 'compartir'">
              <div class="option-radio-dot" [class.dot-checked]="modalModoPrincipal === 'compartir'"></div>
              <div class="option-info">
                <strong>Compartir Dirección Clínica (Recomendado)</strong>
                <span>Ambos tendrán rol de Psicólogo Principal para administrar el equipo, asignar roles y registrar profesionales.</span>
              </div>
            </label>

            <label 
              class="transfer-option-card" 
              [class.selected]="modalModoPrincipal === 'transferir'"
              (click)="modalModoPrincipal = 'transferir'">
              <div class="option-radio-dot" [class.dot-checked]="modalModoPrincipal === 'transferir'"></div>
              <div class="option-info">
                <strong>Transferir Dirección Principal Completa</strong>
                <span>Ceder el rol de Director Principal exclusivamente a {{ psicologoParaPrincipal.nombre }}. Tu cuenta actual pasará a ser Especialista Clínico.</span>
              </div>
            </label>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn-cancel" (click)="psicologoParaPrincipal = null">Cancelar</button>
            <button type="button" class="btn-confirm-principal" (click)="confirmarNombramientoPrincipal()">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>Confirmar Nombramiento</span>
            </button>
          </div>
        </div>
      </div>

      <!-- ================= MODAL: CONFIRMAR ELIMINACIÓN (SIN ALERTS NATIVOS) ================= -->
      <div class="modal-overlay" *ngIf="psicologoAEliminar">
        <div class="modal-card modal-confirm">
          <div class="confirm-icon-box danger">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M3 6h18"></path>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </div>
          <h3 class="confirm-title">¿Retirar del equipo clínico?</h3>
          <p class="confirm-desc">
            Estás a punto de retirar a <strong>{{ psicologoAEliminar.nombre }}</strong> ({{ psicologoAEliminar.email }}). Esta acción revocará sus accesos y credenciales de acceso a la plataforma.
          </p>
          <div class="confirm-actions">
            <button type="button" class="btn-cancel" (click)="psicologoAEliminar = null">Cancelar</button>
            <button type="button" class="btn-danger-confirm" (click)="confirmarEliminacionPsicologo()">
              <span>Sí, retirar del equipo</span>
            </button>
          </div>
        </div>
      </div>

      <!-- ================= MODAL: REGISTRAR NUEVO PSICÓLOGO ================= -->
      <div class="modal-overlay" *ngIf="mostrarModalRegistro">
        <div class="modal-card">
          <header class="modal-header">
            <div class="modal-badge-row">
              <span class="badge-pill">ALTA DE PERSONAL CLÍNICO</span>
            </div>
            <h2 class="modal-title">Registrar Nuevo Psicólogo/a</h2>
            <p class="modal-subtitle">
              Genera los accesos directos para el nuevo profesional. Podrá ingresar de inmediato a <strong>PsicoConecta</strong> con este correo y contraseña.
            </p>
            <button type="button" class="btn-close-modal" (click)="cerrarModalRegistro()" aria-label="Cerrar ventana">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </header>

          <form class="modal-form" (ngSubmit)="guardarNuevoPsicologo()">
            <!-- Nombre Completo -->
            <div class="form-group">
              <label for="nuevo-nombre" class="form-label">Nombre y Apellidos del Profesional *</label>
              <div class="input-with-icon">
                <span class="field-prefix-icon">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </span>
                <input 
                  id="nuevo-nombre" 
                  type="text" 
                  [(ngModel)]="nuevoNombre" 
                  name="nuevoNombre" 
                  placeholder="Ej: Dr. Fernando Galvis" 
                  required
                  (keydown.enter)="$event.preventDefault()"
                  class="form-control">
              </div>
            </div>

            <!-- Correo Electrónico Institucional -->
            <div class="form-group">
              <label for="nuevo-email" class="form-label">Correo Electrónico Institucional *</label>
              <div class="input-with-icon">
                <span class="field-prefix-icon">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                  </svg>
                </span>
                <input 
                  id="nuevo-email" 
                  type="email" 
                  [(ngModel)]="nuevoEmail" 
                  name="nuevoEmail" 
                  placeholder="ejemplo.psico@idert.gov.co" 
                  required
                  (keydown.enter)="$event.preventDefault()"
                  class="form-control">
              </div>
            </div>

            <!-- Contraseña de Acceso -->
            <div class="form-group">
              <div class="label-row-action">
                <label for="nuevo-password" class="form-label">Contraseña de Acceso *</label>
                <button type="button" class="btn-link-action" (click)="generarPasswordSegura()">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"></circle>
                    <circle cx="15.5" cy="15.5" r="1.5" fill="currentColor"></circle>
                    <circle cx="15.5" cy="8.5" r="1.5" fill="currentColor"></circle>
                    <circle cx="8.5" cy="15.5" r="1.5" fill="currentColor"></circle>
                    <circle cx="12" cy="12" r="1.5" fill="currentColor"></circle>
                  </svg>
                  <span>Generar contraseña segura</span>
                </button>
              </div>
              <div class="input-with-icon input-with-toggle">
                <span class="field-prefix-icon">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </span>
                <input 
                  id="nuevo-password" 
                  [type]="mostrarPassModal ? 'text' : 'password'" 
                  [(ngModel)]="nuevoPassword" 
                  name="nuevoPassword" 
                  placeholder="Mínimo 6 caracteres" 
                  required
                  (keydown.enter)="$event.preventDefault()"
                  class="form-control">
                <button 
                  type="button" 
                  class="btn-toggle-eye" 
                  (click)="togglePasswordModal($event)"
                  [attr.aria-label]="mostrarPassModal ? 'Ocultar contraseña' : 'Ver contraseña'"
                  [title]="mostrarPassModal ? 'Ocultar contraseña' : 'Ver contraseña'">
                  <svg *ngIf="!mostrarPassModal" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                  <svg *ngIf="mostrarPassModal" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
                    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
                    <line x1="2" y1="2" x2="22" y2="22"></line>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Asignación de Rol / Nivel -->
            <div class="form-group">
              <label class="form-label">Asignación de Rol y Jerarquía Institucional *</label>
              <div class="roles-choice-grid">
                <label 
                  class="role-choice-card" 
                  [class.selected]="nuevoNivel === 'especialista'"
                  (click)="nuevoNivel = 'especialista'">
                  <div class="choice-icon blue">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                      <circle cx="12" cy="7" r="4"></circle>
                      <path d="M5.5 21a8.5 8.5 0 0 1 13 0"></path>
                    </svg>
                  </div>
                  <div class="choice-text">
                    <strong>Especialista Clínico</strong>
                    <span>Atención de deportistas asignados, notas de evolución y prescripción de biblioteca.</span>
                  </div>
                </label>

                <label 
                  class="role-choice-card" 
                  [class.selected]="nuevoNivel === 'director'"
                  (click)="nuevoNivel = 'director'">
                  <div class="choice-icon gold">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                    </svg>
                  </div>
                  <div class="choice-text">
                    <strong>Psicólogo Principal (Director)</strong>
                    <span>Control directivo total: puede agregar otros psicólogos, cambiar roles y supervisar todo el equipo.</span>
                  </div>
                </label>
              </div>
            </div>

            <!-- Área de Especialidad -->
            <div class="form-group">
              <label for="nueva-especialidad" class="form-label">Área de Especialidad Clínica *</label>
              <div class="input-with-icon">
                <span class="field-prefix-icon">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                  </svg>
                </span>
                <input 
                  id="nueva-especialidad" 
                  type="text" 
                  [(ngModel)]="nuevaEspecialidad" 
                  name="nuevaEspecialidad" 
                  placeholder="Ej: Neurocognición y Readaptación al Dolor" 
                  (keydown.enter)="$event.preventDefault()"
                  class="form-control">
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn-cancel" (click)="cerrarModalRegistro()">
                Cancelar
              </button>
              <button 
                type="submit" 
                class="btn-submit-save" 
                [disabled]="!nuevoNombre || !nuevoEmail || !nuevoPassword">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>Habilitar Acceso Clínico</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- ================= MODAL: VER / COMPARTIR CREDENCIALES ================= -->
      <div class="modal-overlay" *ngIf="psicologoCredenciales">
        <div class="modal-card modal-sm">
          <header class="modal-header">
            <div class="modal-badge-row">
              <span class="badge-pill">CREDENCIALES DE ACCESO</span>
            </div>
            <h2 class="modal-title">Accesos para {{ psicologoCredenciales.nombre }}</h2>
            <p class="modal-subtitle">
              Comparte estos datos con el profesional para que pueda iniciar sesión en la plataforma.
            </p>
            <button type="button" class="btn-close-modal" (click)="psicologoCredenciales = null" aria-label="Cerrar credenciales">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </header>

          <div class="credentials-box">
            <div class="cred-row">
              <span class="cred-label">Portal Web:</span>
              <code class="cred-code">https://recancha-4fcd9.web.app/login</code>
            </div>
            <div class="cred-row">
              <span class="cred-label">Correo:</span>
              <code class="cred-code">{{ psicologoCredenciales.email }}</code>
            </div>
            <div class="cred-row">
              <span class="cred-label">Contraseña:</span>
              <code class="cred-code font-bold">{{ psicologoCredenciales.password || 'psicoconecta2026' }}</code>
            </div>
            <div class="cred-row">
              <span class="cred-label">Rol Asignado:</span>
              <strong class="cred-role">{{ psicologoCredenciales.nivel === 'director' ? 'Psicólogo Principal (Director)' : 'Especialista Clínico' }}</strong>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn-cancel" (click)="psicologoCredenciales = null">
              Cerrar
            </button>
            <button type="button" class="btn-submit-save" (click)="copiarMensajeBienvenida(psicologoCredenciales)">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
              </svg>
              <span>Copiar Mensaje Completo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .equipo-container {
      max-width: 1240px;
      margin: 0 auto;
      padding-bottom: 50px;
    }

    /* ================= HEADER ================= */
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 24px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }

    .header-left {
      flex: 1;
      min-width: 280px;
    }

    .header-badge-row {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
      margin-bottom: 10px;
    }

    .badge-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      color: #2563eb;
      background: #eff6ff;
      border: 1px solid #dbeafe;
      padding: 4px 10px;
      border-radius: 20px;
    }

    .badge-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #ec4899;
      box-shadow: 0 0 6px #ec4899;
    }

    .badge-user-role {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 4px 12px;
      border-radius: 20px;
      background: #f1f5f9;
      color: #475569;
      border: 1px solid #e2e8f0;
    }

    .badge-user-role.is-director {
      background: #fef3c7;
      color: #92400e;
      border-color: #fde68a;
    }

    .page-title {
      font-size: clamp(1.4rem, 3.5vw, 1.95rem);
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.02em;
      line-height: 1.25;
      margin-bottom: 8px;
    }

    .page-subtitle {
      color: #64748b;
      font-size: 0.92rem;
      line-height: 1.5;
      max-width: 780px;
    }

    .page-subtitle strong {
      color: #1e293b;
    }

    .btn-primary-add {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 20px;
      border-radius: 12px;
      background: linear-gradient(135deg, #2563eb 0%, #db2777 100%);
      color: #ffffff;
      font-weight: 700;
      font-size: 0.92rem;
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(37, 99, 235, 0.28);
      transition: all 0.2s ease;
      white-space: nowrap;
    }

    .btn-primary-add:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(219, 39, 119, 0.35);
    }

    /* ================= ROLE GUIDE BANNER ================= */
    .role-guide-banner {
      background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
      border: 1.5px solid #fde68a;
      border-radius: 14px;
      padding: 14px 18px;
      display: flex;
      align-items: flex-start;
      gap: 14px;
      margin-bottom: 22px;
      box-shadow: 0 2px 8px rgba(217, 119, 6, 0.08);
    }

    .guide-icon-box {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: #fde68a;
      color: #b45309;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .guide-content strong {
      display: block;
      color: #92400e;
      font-size: 0.92rem;
      margin-bottom: 4px;
    }

    .guide-content p {
      color: #78350f;
      font-size: 0.84rem;
      line-height: 1.5;
      margin: 0;
    }

    /* ================= STATS ROW ================= */
    .stats-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .stat-box {
      background: #ffffff;
      border-radius: 16px;
      padding: 18px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border: 1px solid #e2e8f0;
      box-shadow: 0 2px 6px rgba(15, 23, 42, 0.04);
    }

    .stat-label {
      display: block;
      font-size: 0.8rem;
      color: #64748b;
      font-weight: 600;
      margin-bottom: 4px;
    }

    .stat-value {
      font-size: 1.6rem;
      font-weight: 800;
      letter-spacing: -0.02em;
    }

    .text-blue { color: #2563eb; }
    .text-gold { color: #d97706; }
    .text-teal { color: #0d9488; }
    .text-green { color: #16a34a; }

    .stat-icon-wrap {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stat-icon-wrap.blue { background: #eff6ff; color: #2563eb; }
    .stat-icon-wrap.gold { background: #fef3c7; color: #d97706; }
    .stat-icon-wrap.teal { background: #ccfbf1; color: #0f766e; }
    .stat-icon-wrap.green { background: #dcfce7; color: #16a34a; }

    /* ================= FILTROS ================= */
    .filters-card {
      background: #ffffff;
      border-radius: 16px;
      padding: 14px 18px;
      border: 1px solid #e2e8f0;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 14px;
      margin-bottom: 24px;
    }

    .search-field {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
      min-width: 250px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 8px 12px;
    }

    .search-icon { color: #94a3b8; }

    .search-input {
      border: none;
      background: transparent;
      outline: none;
      width: 100%;
      font-size: 0.88rem;
      color: #0f172a;
    }

    .btn-clear-search {
      border: none;
      background: #e2e8f0;
      color: #475569;
      border-radius: 50%;
      width: 20px;
      height: 20px;
      font-size: 0.7rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .filter-pills {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }

    .filter-pill {
      border: 1px solid #e2e8f0;
      background: #f8fafc;
      color: #64748b;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .filter-pill:hover {
      background: #f1f5f9;
      color: #0f172a;
    }

    .filter-pill.active {
      background: #2563eb;
      color: #ffffff;
      border-color: #2563eb;
    }

    /* ================= TEAM GRID ================= */
    .team-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 20px;
    }

    .team-card {
      background: #ffffff;
      border-radius: 18px;
      border: 1px solid #e2e8f0;
      padding: 22px;
      display: flex;
      flex-direction: column;
      gap: 14px;
      box-shadow: 0 3px 10px rgba(15, 23, 42, 0.04);
      position: relative;
      transition: all 0.2s ease;
    }

    .team-card:hover {
      box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
      transform: translateY(-2px);
    }

    .team-card.card-director {
      border-color: #fde68a;
      background: linear-gradient(180deg, #fffdf5 0%, #ffffff 70px);
    }

    .team-card.card-inactivo {
      opacity: 0.75;
      background: #f8fafc;
    }

    .card-top-bar {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;
    }

    .avatar-col {
      position: relative;
    }

    .avatar-circle {
      width: 52px;
      height: 52px;
      border-radius: 14px;
      background: #eff6ff;
      color: #2563eb;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 1.15rem;
      border: 2px solid #dbeafe;
      overflow: hidden;
    }

    .avatar-circle.avatar-director {
      background: #fef3c7;
      color: #b45309;
      border-color: #fde68a;
    }

    .avatar-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .status-indicator {
      position: absolute;
      bottom: -2px;
      right: -2px;
      width: 13px;
      height: 13px;
      border-radius: 50%;
      background: #94a3b8;
      border: 2px solid #ffffff;
    }

    .status-indicator.online {
      background: #10b981;
      box-shadow: 0 0 6px rgba(16, 185, 129, 0.6);
    }

    .badges-col {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 5px;
    }

    .level-badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 4px 10px;
      border-radius: 16px;
      font-size: 0.75rem;
      font-weight: 700;
    }

    .level-badge.director-badge {
      background: #fef3c7;
      color: #b45309;
      border: 1px solid #fde68a;
    }

    .level-badge.especialista-badge {
      background: #eff6ff;
      color: #2563eb;
      border: 1px solid #dbeafe;
    }

    .state-pill {
      font-size: 0.7rem;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 10px;
    }

    .state-pill.active-pill {
      background: #dcfce7;
      color: #166534;
    }

    .state-pill.inactive-pill {
      background: #fee2e2;
      color: #991b1b;
    }

    /* Info */
    .card-main-info {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .name-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .member-name {
      font-size: 1.12rem;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.3;
      margin: 0;
    }

    .badge-you {
      font-size: 0.72rem;
      font-weight: 700;
      color: #2563eb;
      background: #dbeafe;
      padding: 2px 6px;
      border-radius: 6px;
    }

    .member-email {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: #64748b;
      font-size: 0.84rem;
      cursor: pointer;
      transition: color 0.15s ease;
      word-break: break-all;
      margin: 0;
    }

    .member-email:hover {
      color: #2563eb;
    }

    .specialty-tag {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      padding: 4px 10px;
      border-radius: 8px;
      font-size: 0.78rem;
      color: #475569;
      margin-top: 4px;
      width: fit-content;
    }

    .card-meta-row {
      display: flex;
      justify-content: space-between;
      gap: 10px;
      font-size: 0.78rem;
      color: #64748b;
      border-top: 1px dashed #e2e8f0;
      padding-top: 10px;
      flex-wrap: wrap;
    }

    .card-meta-row strong {
      color: #334155;
    }

    /* ================= BOTÓN DESTACADO NOMBRAR PRINCIPAL ================= */
    .principal-promotion-bar {
      margin-top: 2px;
    }

    .btn-nombrar-principal {
      width: 100%;
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      color: #ffffff;
      border: none;
      padding: 9px 14px;
      border-radius: 10px;
      font-weight: 700;
      font-size: 0.84rem;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 7px;
      box-shadow: 0 3px 10px rgba(217, 119, 6, 0.25);
      transition: all 0.2s ease;
    }

    .btn-nombrar-principal:hover {
      transform: translateY(-1px);
      box-shadow: 0 5px 14px rgba(217, 119, 6, 0.35);
      background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
    }

    .btn-revertir-principal {
      width: 100%;
      background: #f8fafc;
      color: #64748b;
      border: 1px solid #cbd5e1;
      padding: 7px 12px;
      border-radius: 9px;
      font-weight: 600;
      font-size: 0.78rem;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .btn-revertir-principal:hover {
      background: #f1f5f9;
      color: #0f172a;
    }

    /* Actions */
    .card-actions {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-top: auto;
      border-top: 1px solid #f1f5f9;
      padding-top: 12px;
    }

    .action-role-wrapper {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      background: #f8fafc;
      padding: 6px 10px;
      border-radius: 10px;
      border: 1px solid #e2e8f0;
    }

    .action-label {
      font-size: 0.78rem;
      font-weight: 700;
      color: #475569;
      white-space: nowrap;
    }

    .role-select {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 4px 8px;
      font-size: 0.8rem;
      font-weight: 600;
      color: #0f172a;
      outline: none;
      cursor: pointer;
    }

    .btn-group-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .btn-action-ghost {
      flex: 1;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 7px 12px;
      border-radius: 9px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      color: #475569;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .btn-action-ghost:hover {
      background: #f1f5f9;
      color: #0f172a;
      border-color: #cbd5e1;
    }

    .btn-action-ghost.text-amber { color: #b45309; }
    .btn-action-ghost.text-green { color: #15803d; }

    .btn-delete {
      flex: 0 0 36px;
      padding: 7px 0;
      color: #dc2626;
      border-color: #fecaca;
    }

    .btn-delete:hover {
      background: #fef2f2;
      border-color: #f87171;
    }

    /* ================= MODALES ================= */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.65);
      backdrop-filter: blur(4px);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      overflow-y: auto;
    }

    .modal-card {
      background: #ffffff;
      border-radius: 20px;
      width: 100%;
      max-width: 540px;
      padding: 26px 28px;
      box-shadow: 0 20px 40px rgba(15, 23, 42, 0.25);
      position: relative;
      animation: modalSlide 0.2s ease-out;
    }

    .modal-card.modal-sm { max-width: 460px; }

    /* Modal Nombrar Principal */
    .modal-card.modal-principal {
      max-width: 480px;
      text-align: center;
    }

    .principal-modal-icon {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: #fef3c7;
      color: #d97706;
      border: 3px solid #fde68a;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 14px auto;
    }

    .principal-modal-title {
      font-size: 1.35rem;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 6px 0;
    }

    .principal-modal-subtitle {
      color: #64748b;
      font-size: 0.88rem;
      line-height: 1.45;
      margin: 0 0 18px 0;
    }

    .transfer-options-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
      text-align: left;
      margin-bottom: 20px;
    }

    .transfer-option-card {
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      padding: 14px;
      cursor: pointer;
      display: flex;
      align-items: flex-start;
      gap: 12px;
      transition: all 0.15s ease;
    }

    .transfer-option-card:hover {
      border-color: #cbd5e1;
      background: #f8fafc;
    }

    .transfer-option-card.selected {
      border-color: #f59e0b;
      background: #fffbeb;
    }

    .option-radio-dot {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      border: 2px solid #cbd5e1;
      background: #ffffff;
      flex-shrink: 0;
      margin-top: 2px;
      transition: all 0.15s ease;
    }

    .option-radio-dot.dot-checked {
      border-color: #d97706;
      background: #d97706;
      box-shadow: inset 0 0 0 3px #ffffff;
    }

    .option-info strong {
      display: block;
      font-size: 0.86rem;
      color: #0f172a;
      margin-bottom: 3px;
    }

    .option-info span {
      display: block;
      font-size: 0.76rem;
      color: #64748b;
      line-height: 1.4;
    }

    .btn-confirm-principal {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      border-radius: 10px;
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      color: #ffffff;
      font-weight: 700;
      font-size: 0.88rem;
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(217, 119, 6, 0.3);
      transition: all 0.15s ease;
    }

    .btn-confirm-principal:hover {
      background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
    }

    /* Modal Confirm Delete */
    .modal-card.modal-confirm {
      max-width: 440px;
      text-align: center;
      padding: 28px 24px;
    }

    .confirm-icon-box.danger {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: #fee2e2;
      color: #dc2626;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px auto;
    }

    .confirm-title {
      font-size: 1.25rem;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 8px 0;
    }

    .confirm-desc {
      font-size: 0.88rem;
      color: #64748b;
      line-height: 1.5;
      margin: 0 0 22px 0;
    }

    .confirm-actions {
      display: flex;
      gap: 10px;
    }

    .confirm-actions button { flex: 1; }

    .btn-danger-confirm {
      background: #dc2626;
      color: #ffffff;
      border: none;
      padding: 11px 18px;
      border-radius: 10px;
      font-weight: 700;
      font-size: 0.88rem;
      cursor: pointer;
      transition: background 0.15s ease;
    }

    .btn-danger-confirm:hover { background: #b91c1c; }

    @keyframes modalSlide {
      from { transform: translateY(15px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    .modal-header {
      margin-bottom: 20px;
      position: relative;
    }

    .modal-badge-row { margin-bottom: 8px; }

    .modal-title {
      font-size: 1.35rem;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 6px;
    }

    .modal-subtitle {
      color: #64748b;
      font-size: 0.86rem;
      line-height: 1.45;
    }

    .btn-close-modal {
      position: absolute;
      top: -6px;
      right: -6px;
      background: #f1f5f9;
      border: none;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      color: #475569;
      cursor: pointer;
      font-size: 0.88rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn-close-modal:hover {
      background: #e2e8f0;
      color: #0f172a;
    }

    /* Form */
    .modal-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .form-label {
      font-size: 0.82rem;
      font-weight: 700;
      color: #334155;
    }

    .label-row-action {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .btn-link-action {
      background: none;
      border: none;
      color: #2563eb;
      font-size: 0.78rem;
      font-weight: 700;
      cursor: pointer;
      padding: 0;
    }

    .btn-link-action:hover {
      text-decoration: underline;
    }

    .input-with-icon {
      position: relative;
      display: flex;
      align-items: center;
      width: 100%;
    }

    .field-prefix-icon {
      position: absolute;
      left: 13px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #94a3b8;
      pointer-events: none;
      z-index: 2;
    }

    .field-prefix-icon svg {
      display: block;
      color: currentColor;
    }

    .form-control {
      width: 100%;
      padding: 11px 14px 11px 40px;
      border: 1px solid #cbd5e1;
      border-radius: 10px;
      font-size: 0.88rem;
      color: #0f172a;
      background: #ffffff;
      outline: none;
      transition: all 0.15s ease;
      box-sizing: border-box;
    }

    .form-control:focus {
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
    }

    .input-with-toggle .form-control {
      padding-right: 46px;
    }

    .btn-toggle-eye {
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      background: transparent;
      border: none;
      cursor: pointer !important;
      padding: 6px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #64748b;
      transition: all 0.15s ease;
      z-index: 10;
      pointer-events: auto !important;
    }

    .btn-toggle-eye:hover {
      background: #f1f5f9;
      color: #0f172a;
    }

    .btn-toggle-eye:active {
      transform: translateY(-50%) scale(0.92);
    }

    .btn-toggle-eye svg {
      position: static !important;
      left: auto !important;
      pointer-events: auto !important;
      color: currentColor !important;
      display: block;
      width: 18px;
      height: 18px;
    }

    /* Role Choice Cards */
    .roles-choice-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .role-choice-card {
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      padding: 14px;
      cursor: pointer;
      transition: all 0.15s ease;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .role-choice-card:hover {
      border-color: #cbd5e1;
      background: #f8fafc;
    }

    .role-choice-card.selected {
      border-color: #2563eb;
      background: #eff6ff;
    }

    .choice-icon {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .choice-icon.blue { background: #dbeafe; color: #2563eb; }
    .choice-icon.gold { background: #fef3c7; color: #d97706; }

    .choice-text strong {
      display: block;
      font-size: 0.84rem;
      color: #0f172a;
      margin-bottom: 3px;
    }

    .choice-text span {
      display: block;
      font-size: 0.72rem;
      color: #64748b;
      line-height: 1.35;
    }

    /* Modal Footer */
    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 10px;
      padding-top: 14px;
      border-top: 1px solid #f1f5f9;
    }

    .btn-cancel {
      padding: 10px 18px;
      border-radius: 10px;
      background: #f1f5f9;
      color: #475569;
      font-weight: 600;
      font-size: 0.88rem;
      border: none;
      cursor: pointer;
    }

    .btn-cancel:hover { background: #e2e8f0; }

    .btn-submit-save {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      border-radius: 10px;
      background: linear-gradient(135deg, #2563eb 0%, #db2777 100%);
      color: #ffffff;
      font-weight: 700;
      font-size: 0.88rem;
      border: none;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .btn-submit-save:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-submit-save:not(:disabled):hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
    }

    /* Credenciales Box */
    .credentials-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 14px 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-bottom: 14px;
    }

    .cred-row {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .cred-label {
      font-size: 0.72rem;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .cred-code {
      background: #ffffff;
      padding: 6px 10px;
      border-radius: 6px;
      border: 1px solid #cbd5e1;
      font-size: 0.85rem;
      color: #0f172a;
      word-break: break-all;
    }

    .cred-role {
      font-size: 0.88rem;
      color: #2563eb;
    }

    .font-bold { font-weight: 700; }

    /* Responsive */
    @media (max-width: 640px) {
      .roles-choice-grid { grid-template-columns: 1fr; }
      .page-header { flex-direction: column; }
      .btn-primary-add { width: 100%; justify-content: center; }
      .stats-row { grid-template-columns: 1fr 1fr; }
      .role-guide-banner { flex-direction: column; }
    }
  `]
})
export class EquipoPsicologosComponent {
  service = inject(RecanchaService);

  terminoBusqueda = '';
  filtroRol: 'todos' | 'director' | 'especialista' = 'todos';

  mostrarModalRegistro = false;
  mostrarPassModal = false;

  nuevoNombre = '';
  nuevoEmail = '';
  nuevoPassword = '';
  nuevoNivel: NivelPsicologo = 'especialista';
  nuevaEspecialidad = '';

  psicologoCredenciales: PsicologoMiembro | null = null;

  // Estado para nombrar Psicólogo Principal
  psicologoParaPrincipal: PsicologoMiembro | null = null;
  modalModoPrincipal: 'compartir' | 'transferir' = 'compartir';

  // Estado para eliminar psicólogo (Sin alerts nativos)
  psicologoAEliminar: PsicologoMiembro | null = null;

  esUsuarioActual(p: PsicologoMiembro): boolean {
    const actual = this.service.usuarioActual();
    return p.id === actual.uid || p.email.toLowerCase() === (actual.email || '').toLowerCase();
  }

  get psicologosFiltrados(): PsicologoMiembro[] {
    let lista = this.service.psicologos();

    if (this.filtroRol !== 'todos') {
      lista = lista.filter(p => p.nivel === this.filtroRol);
    }

    if (this.terminoBusqueda.trim()) {
      const q = this.terminoBusqueda.toLowerCase().trim();
      lista = lista.filter(p => 
        p.nombre.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.especialidad.toLowerCase().includes(q)
      );
    }

    return lista;
  }

  get totalPsicologos(): number {
    return this.service.psicologos().length;
  }

  get totalDirectores(): number {
    return this.service.psicologos().filter(p => p.nivel === 'director').length;
  }

  get totalEspecialistas(): number {
    return this.service.psicologos().filter(p => p.nivel === 'especialista').length;
  }

  get totalActivos(): number {
    return this.service.psicologos().filter(p => p.estado === 'activo').length;
  }

  abrirModalRegistro() {
    this.nuevoNombre = '';
    this.nuevoEmail = '';
    this.generarPasswordSegura();
    this.mostrarPassModal = false;
    this.nuevoNivel = 'especialista';
    this.nuevaEspecialidad = 'Psicología Deportiva de Alto Rendimiento';
    this.mostrarModalRegistro = true;
  }

  cerrarModalRegistro() {
    this.mostrarModalRegistro = false;
    this.mostrarPassModal = false;
  }

  togglePasswordModal(event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.mostrarPassModal = !this.mostrarPassModal;
  }

  generarPasswordSegura() {
    const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$';
    let res = '';
    for (let i = 0; i < 9; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    this.nuevoPassword = 'psi-' + res;
  }

  guardarNuevoPsicologo() {
    if (!this.nuevoNombre.trim() || !this.nuevoEmail.trim() || !this.nuevoPassword.trim()) {
      return;
    }

    const creado = this.service.agregarPsicologo({
      nombre: this.nuevoNombre,
      email: this.nuevoEmail,
      password: this.nuevoPassword,
      nivel: this.nuevoNivel,
      especialidad: this.nuevaEspecialidad
    });

    this.cerrarModalRegistro();
    this.psicologoCredenciales = creado;
  }

  /* Nombrar Psicólogo Principal */
  abrirModalNombrarPrincipal(p: PsicologoMiembro) {
    this.psicologoParaPrincipal = p;
    this.modalModoPrincipal = 'compartir';
  }

  confirmarNombramientoPrincipal() {
    if (!this.psicologoParaPrincipal) return;

    if (this.modalModoPrincipal === 'transferir') {
      this.service.transferirDireccionPrincipal(this.psicologoParaPrincipal.id);
    } else {
      this.service.cambiarRolPsicologo(this.psicologoParaPrincipal.id, 'director');
    }

    this.psicologoParaPrincipal = null;
  }

  onCambiarRol(psicologo: PsicologoMiembro, nuevoNivel: NivelPsicologo) {
    if (psicologo.nivel === nuevoNivel) return;
    this.service.cambiarRolPsicologo(psicologo.id, nuevoNivel);
  }

  onToggleEstado(psicologo: PsicologoMiembro) {
    const nuevoEstado = psicologo.estado === 'activo' ? 'inactivo' : 'activo';
    this.service.cambiarEstadoPsicologo(psicologo.id, nuevoEstado);
  }

  /* Eliminar Profesional (Custom Modal sin alerts nativos) */
  abrirConfirmacionEliminar(p: PsicologoMiembro) {
    this.psicologoAEliminar = p;
  }

  confirmarEliminacionPsicologo() {
    if (this.psicologoAEliminar) {
      this.service.eliminarPsicologo(this.psicologoAEliminar.id);
      this.psicologoAEliminar = null;
    }
  }

  abrirModalCredenciales(psicologo: PsicologoMiembro) {
    this.psicologoCredenciales = psicologo;
  }

  copiarTexto(texto: string, mensajeConfirmacion = 'Copiado al portapapeles') {
    navigator.clipboard.writeText(texto).then(() => {
      this.service.mostrarToast(mensajeConfirmacion);
    }).catch(() => {
      this.service.mostrarToast('No se pudo copiar automáticamente');
    });
  }

  copiarMensajeBienvenida(p: PsicologoMiembro) {
    const pass = p.password || 'psicoconecta2026';
    const rolTexto = p.nivel === 'director' ? 'Psicólogo Principal (Director Clínico)' : 'Especialista Clínico';
    const msg = 
`¡Hola, ${p.nombre}! Te damos la bienvenida al equipo clínico de PsicoConecta (IDERT).
Tus credenciales de acceso institucional son:

Plataforma: https://recancha-4fcd9.web.app/login
Correo: ${p.email}
Contraseña: ${pass}
Rol asignado: ${rolTexto}

Al ingresar, selecciona la pestaña 'Psicólogo/a' y digita tus credenciales.`;

    this.copiarTexto(msg, '¡Mensaje con credenciales copiado listo para enviar!');
  }

  formatearFecha(fechaIso?: string): string {
    if (!fechaIso) return 'Reciente';
    try {
      const d = new Date(fechaIso);
      return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return fechaIso;
    }
  }
}
