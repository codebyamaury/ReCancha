export type RolUsuario = 'deportista' | 'psicologa';

export interface UsuarioReCancha {
  uid: string;
  email: string;
  nombre: string;
  rol: RolUsuario;
  consentimientoLey1581: boolean;
  avatarIniciales: string;
}

export interface DeportistaClinica {
  id: string;
  nombre: string;
  lesion: string;
  animoPromedio: string;
  avance: number;
  estado: 'En proceso' | 'Requiere atención';
  proximaSesion: string;
  historial7Dias: number[];
}

export interface SesionCita {
  id?: string;
  titulo: string;
  fechaTexto: string;
  horaTexto: string;
  psicologa: string;
  deportistaNombre?: string;
  tipo: 'Sesión individual' | 'Sesión grupal';
}

export type ModalidadEjercicio = 
  | 'respiracion' 
  | 'reestructuracion' 
  | 'autodialogo' 
  | 'visualizacion' 
  | 'metas' 
  | 'lectura';

export interface RecursoBiblioteca {
  id: string;
  categoria: 'Emociones' | 'Autoestima' | 'Autodiálogo' | 'Metas' | 'Visualización' | 'Rehabilitación' | string;
  tipo: string;
  titulo: string;
  descripcion: string;
  accion: 'Iniciar ejercicio' | 'Abrir guía' | 'Abrir';
  modalidad?: ModalidadEjercicio;
  subidoPor?: string;
  fechaPublicacion?: string;
  pasos?: string[];
  contenidoDetallado?: string;
}
