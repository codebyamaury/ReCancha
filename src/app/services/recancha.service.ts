import { Injectable, signal, inject } from '@angular/core';
import { RolUsuario, UsuarioReCancha, DeportistaClinica, SesionCita, RecursoBiblioteca } from '../models/recancha.models';
import { FirebaseService } from './firebase.service';

const SESSION_STORAGE_KEY = 'recancha_usuario_activo';
const EXERCISES_STORAGE_KEY = 'recancha_ejercicios_comp';
const MOOD_STORAGE_KEY = 'recancha_animo_hoy';

export function calcularIniciales(nombre?: string | null, email?: string | null): string {
  if (nombre && nombre.trim().length > 0) {
    const partes = nombre.trim().split(/\s+/).filter(p => p.length > 0);
    if (partes.length >= 2) {
      return (partes[0][0] + partes[1][0]).toUpperCase();
    }
    return partes[0].substring(0, Math.min(2, partes[0].length)).toUpperCase();
  }
  if (email && email.trim().length > 0) {
    const parteLocal = email.split('@')[0];
    return parteLocal.substring(0, Math.min(2, parteLocal.length)).toUpperCase();
  }
  return 'RC';
}

@Injectable({
  providedIn: 'root'
})
export class RecanchaService {
  private fb = inject(FirebaseService);

  private recuperarUsuarioGuardado(): UsuarioReCancha {
    try {
      const data = localStorage.getItem(SESSION_STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Error leyendo sesión de localStorage:', e);
    }
    return {
      uid: '',
      email: '',
      nombre: '',
      rol: 'deportista',
      consentimientoLey1581: false,
      avatarIniciales: 'RC'
    };
  }

  usuarioActual = signal<UsuarioReCancha>(this.recuperarUsuarioGuardado());
  estaAutenticado = signal<boolean>(!!localStorage.getItem(SESSION_STORAGE_KEY));
  llamadaActiva = signal<boolean>(false);
  ejercicioSeleccionado = signal<RecursoBiblioteca | null>(null);
  toastMensaje = signal<string | null>(null);

  // Progreso real de ejercicios persistido
  ejerciciosCompletados = signal<number>(parseInt(localStorage.getItem(EXERCISES_STORAGE_KEY) || '2', 10));
  totalEjercicios = signal<number>(8);
  animoSeleccionadoHoy = signal<number>(parseInt(localStorage.getItem(MOOD_STORAGE_KEY) || '4', 10));

  // Expedientes clínicos reales de deportistas IDERT
  deportistas = signal<DeportistaClinica[]>([
    { id: 'dep-01', nombre: 'Valentina Ríos', lesion: 'Rodilla (ligamento cruzado anterior)', animoPromedio: '3.8 / 5', avance: 65, estado: 'En proceso', proximaSesion: 'Miércoles 4:00 p. m.', historial7Dias: [3, 4, 3, 4, 4, 4, 4] },
    { id: 'dep-02', nombre: 'Camila Herrera', lesion: 'Hombro (luxación acromioclavicular)', animoPromedio: '2.4 / 5', avance: 30, estado: 'Requiere atención', proximaSesion: 'Jueves 3:00 p. m.', historial7Dias: [2, 2, 1, 3, 2, 3, 2] },
    { id: 'dep-03', nombre: 'Daniela Pérez', lesion: 'Tobillo (esguince grado 3)', animoPromedio: '4.2 / 5', avance: 88, estado: 'En proceso', proximaSesion: 'Viernes 10:00 a. m.', historial7Dias: [4, 4, 3, 5, 4, 5, 5] },
    { id: 'dep-04', nombre: 'Laura Baldiris', lesion: 'Muñeca (fractura de escafoides)', animoPromedio: '3.5 / 5', avance: 58, estado: 'En proceso', proximaSesion: 'Lunes 11:00 a. m.', historial7Dias: [3, 3, 3, 4, 3, 4, 4] },
    { id: 'dep-05', nombre: 'Sara Mendoza', lesion: 'Clavícula (fisura distal)', animoPromedio: '2.6 / 5', avance: 25, estado: 'Requiere atención', proximaSesion: 'Martes 5:00 p. m.', historial7Dias: [2, 1, 2, 3, 2, 3, 3] }
  ]);

  sesiones = signal<SesionCita[]>([
    { id: 'ses-01', titulo: 'Sesión individual de TCC', fechaTexto: 'Miércoles 30 de septiembre', horaTexto: '4:00 p. m.', psicologa: 'Especialista en Psicología Deportiva IDERT', deportistaNombre: 'Amaury Mendoza', tipo: 'Sesión individual' },
    { id: 'ses-02', titulo: 'Sesión grupal: autodiálogo y resiliencia', fechaTexto: 'Viernes 2 de octubre', horaTexto: '5:00 p. m.', psicologa: 'Especialista en Psicología Deportiva IDERT', deportistaNombre: 'Amaury Mendoza', tipo: 'Sesión grupal' }
  ]);

  biblioteca = signal<RecursoBiblioteca[]>([
    { 
      id: 'b1', 
      categoria: 'Emociones', 
      tipo: 'Ejercicio Interactivo · 6 min', 
      titulo: 'Respiración diafragmática para la ansiedad', 
      descripcion: 'Técnica de modulación fisiológica para reducir la activación simpática y calmar el ritmo cardíaco antes de fisioterapia o al ver entrenar al equipo.', 
      accion: 'Iniciar ejercicio', 
      pasos: [
        'Adopta una postura cómoda con la espalda recta y los hombros relajados.',
        'Coloca una mano en tu pecho y otra en tu abdomen.',
        'Inhala lentamente por la nariz en 4 tiempos sintiendo cómo se expande el abdomen.',
        'Sostén el aire 2 segundos manteniendo la serenidad.',
        'Exhala suavemente por la boca en 6 tiempos liberando la tensión física.',
        'Repite el ciclo durante al menos 5 minutos continuos.'
      ] 
    },
    { 
      id: 'b2', 
      categoria: 'Autoestima', 
      tipo: 'Guía Clínica · 15 min', 
      titulo: 'Reestructuración de pensamientos negativos', 
      descripcion: 'Registro de evidencias cognitivas: identifica frases derrotistas sobre tu lesión y contrarréstalas con hechos objetivos de tu progreso.', 
      accion: 'Abrir guía',
      pasos: [
        'Identifica el pensamiento automático (ej. "nunca volveré a jugar igual").',
        'Busca evidencias reales en contra de ese pensamiento.',
        'Formula un pensamiento alternativo y adaptativo basado en la realidad médica.',
        'Califica tu nivel de malestar antes y después del ejercicio.'
      ]
    },
    { 
      id: 'b3', 
      categoria: 'Autodiálogo', 
      tipo: 'Entrenamiento · 8 min', 
      titulo: 'Autodiálogo positivo en la recuperación', 
      descripcion: 'Estrategias de habla interna para reemplazar frustración por autoafirmaciones que potencian la adherencia a la rehabilitación.', 
      accion: 'Abrir guía',
      pasos: [
        'Registra las frases internas más frecuentes durante el dolor físico.',
        'Sustituye "mi cuerpo me falló" por "mi cuerpo se está reparando día a día".',
        'Practica las nuevas frases en voz baja durante tus sesiones de fisioterapia.'
      ]
    },
    { 
      id: 'b4', 
      categoria: 'Metas', 
      tipo: 'Planificación · 10 min', 
      titulo: 'Micro-metas semanales de rehabilitación', 
      descripcion: 'Metodología SMART para definir objetivos pequeños, medibles y realistas fuera del terreno de juego.', 
      accion: 'Abrir guía',
      pasos: [
        'Define un objetivo motriz o de movilidad para los próximos 7 días.',
        'Asocia una recompensa psicológica a cada avance completado.',
        'Comparte tu meta con tu fisioterapeuta y psicóloga para validarla.'
      ]
    },
    { 
      id: 'b5', 
      categoria: 'Autoestima', 
      tipo: 'Técnica de Visualización · 10 min', 
      titulo: 'Visualización motora guiada', 
      descripcion: 'Activación de patrones neuromusculares mediante imaginería mental del retorno seguro y confiado a la cancha.', 
      accion: 'Iniciar ejercicio',
      pasos: [
        'Cierra los ojos y visualiza el campo de juego con todos tus sentidos.',
        'Imagínate realizando los movimientos técnicos con fluidez y sin dolor.',
        'Siente la firmeza de tu articulación y la confianza en tu entrenamiento.'
      ]
    },
    { 
      id: 'b6', 
      categoria: 'Emociones', 
      tipo: 'Reflexión Guiada · 12 min', 
      titulo: 'Aceptación de la fase de inmovilización', 
      descripcion: 'Proceso de duelo deportivo y adaptación emocional ante el reposo físico prescrito por el cuerpo médico.', 
      accion: 'Abrir guía'
    },
    { 
      id: 'b7', 
      categoria: 'Emociones', 
      tipo: 'Comunicación · 7 min', 
      titulo: 'Comunicación asertiva con el cuerpo técnico', 
      descripcion: 'Cómo expresar lo que sientes sin temor a perder tu lugar en la convocatoria ni aislarte de tus compañeras.', 
      accion: 'Abrir guía'
    },
    { 
      id: 'b8', 
      categoria: 'Autoestima', 
      tipo: 'Psicoeducación · 10 min', 
      titulo: 'Identidad atlética y valor personal', 
      descripcion: 'Comprender que tu valor como persona trasciende los minutos en cancha y fortalece tu resiliencia para el futuro.', 
      accion: 'Abrir guía'
    }
  ]);

  establecerUsuario(usuario: UsuarioReCancha) {
    this.usuarioActual.set(usuario);
    this.estaAutenticado.set(true);
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(usuario));
    } catch (e) {
      console.warn('Error guardando sesión:', e);
    }

    // Sincronizar en tiempo real con Firestore
    this.fb.sincronizarUsuario(usuario).catch(err => console.warn(err));

    // Si es un deportista que no estaba en la lista, agregarlo dinámicamente al panel de la psicóloga
    if (usuario.rol === 'deportista' && usuario.nombre) {
      const existe = this.deportistas().some(d => d.nombre.toLowerCase() === usuario.nombre.toLowerCase() || d.id === usuario.uid);
      if (!existe) {
        const nuevo: DeportistaClinica = {
          id: usuario.uid || Date.now().toString(),
          nombre: usuario.nombre,
          lesion: 'Evaluación inicial en proceso',
          animoPromedio: '4.0 / 5',
          avance: 15,
          estado: 'En proceso',
          proximaSesion: 'Por agendar',
          historial7Dias: [4, 4, 3, 4, 4, 4, 4]
        };
        this.deportistas.update(lista => [nuevo, ...lista]);
      }
    }
  }

  cerrarSesion() {
    this.fb.logout().catch(e => console.error(e));
    this.estaAutenticado.set(false);
    this.usuarioActual.set({
      uid: '',
      email: '',
      nombre: '',
      rol: 'deportista',
      consentimientoLey1581: false,
      avatarIniciales: 'RC'
    });
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch (e) {
      console.warn('Error al eliminar sesión:', e);
    }
  }

  // Registrar ánimo con persistencia local y en Firestore
  guardarCheckinAnimo(valor: number, nota?: string) {
    this.animoSeleccionadoHoy.set(valor);
    try {
      localStorage.setItem(MOOD_STORAGE_KEY, valor.toString());
    } catch (e) {}

    const uid = this.usuarioActual().uid;
    if (uid) {
      const hoy = new Date().toISOString().split('T')[0];
      this.fb.guardarCheckinAnimo(uid, { valor, nota, fecha: hoy }).catch(err => console.warn(err));
    }
    this.mostrarToast('Check-in emocional registrado correctamente');
  }

  agendarSesion(tipo: 'Sesión individual' | 'Sesión grupal', fecha: string, hora: string) {
    const usuario = this.usuarioActual();
    const deportistaNombre = usuario.rol === 'deportista' ? (usuario.nombre || 'Deportista IDERT') : 'Amaury Mendoza';
    const psicologaNombre = (usuario.rol === 'psicologa' && usuario.nombre)
      ? usuario.nombre
      : 'Especialista en Psicología Deportiva IDERT';

    const nueva: SesionCita = {
      id: Date.now().toString(),
      titulo: tipo,
      fechaTexto: fecha,
      horaTexto: hora,
      psicologa: psicologaNombre,
      deportistaNombre,
      tipo: tipo
    };
    this.sesiones.update(s => [...s, nueva]);
    
    // Guardar en Firestore
    this.fb.agendarSesion({
      titulo: tipo,
      fechaTexto: fecha,
      horaTexto: hora,
      psicologa: psicologaNombre,
      deportistaNombre,
      tipo: tipo,
      usuarioId: usuario.uid
    }).catch(err => console.warn(err));

    this.mostrarToast('Sesión clínica agendada con éxito');
  }

  cancelarSesion(id: string) {
    this.sesiones.update(s => s.filter(item => item.id !== id));
    this.fb.cancelarSesion(id).catch(err => console.warn(err));
    this.mostrarToast('Sesión cancelada');
  }

  completarEjercicio() {
    if (this.ejerciciosCompletados() < this.totalEjercicios()) {
      this.ejerciciosCompletados.update(n => {
        const nuevo = n + 1;
        try {
          localStorage.setItem(EXERCISES_STORAGE_KEY, nuevo.toString());
        } catch (e) {}
        return nuevo;
      });
    }
    this.ejercicioSeleccionado.set(null);
    this.mostrarToast('¡Ejercicio terapéutico completado!');
  }

  // Notas clínicas registradas por psicólogos
  notasClinicas = signal<Record<string, Array<{ id: string; texto: string; psicologa: string; fecha: string }>>>({
    'dep-01': [
      { id: 'n1', texto: 'Evaluación inicial satisfactoria. Manifiesta temor moderado al impacto en rodilla pero excelente adherencia a fisioterapia.', psicologa: 'Especialista en Psicología IDERT', fecha: '28 de sep, 4:30 p. m.' }
    ],
    'dep-02': [
      { id: 'n2', texto: 'Presenta sintomatología ansiosa por pérdida temporal del rol titular. Se inició reestructuración cognitiva.', psicologa: 'Especialista en Psicología IDERT', fecha: '25 de sep, 3:15 p. m.' }
    ]
  });

  guardarNotaClinica(deportistaId: string, texto: string) {
    if (!texto.trim()) return;
    const psicologa = this.usuarioActual().nombre || 'Especialista en Psicología IDERT';
    const ahora = new Date();
    const fecha = ahora.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' }) + ', ' + ahora.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
    const nuevaNota = { id: Date.now().toString(), texto: texto.trim(), psicologa, fecha };

    this.notasClinicas.update(mapa => {
      const lista = mapa[deportistaId] ? [nuevaNota, ...mapa[deportistaId]] : [nuevaNota];
      return { ...mapa, [deportistaId]: lista };
    });

    // Persistir en Firestore
    this.fb.guardarNotaClinica(deportistaId, { texto: texto.trim(), psicologa, fecha }).catch(err => console.warn(err));
    this.mostrarToast('Nota de evolución guardada en el expediente clínico');
  }

  mostrarToast(mensaje: string) {
    this.toastMensaje.set(mensaje);
    setTimeout(() => { this.toastMensaje.set(null); }, 3000);
  }
}
