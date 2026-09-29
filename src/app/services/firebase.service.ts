import { Injectable } from '@angular/core';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  Auth, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  UserCredential, 
  User 
} from 'firebase/auth';
import { 
  getFirestore, 
  Firestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  updateDoc,
  onSnapshot,
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp 
} from 'firebase/firestore';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  app: FirebaseApp | null = null;
  auth: Auth | null = null;
  firestore: Firestore | null = null;
  firebaseConectado = false;

  constructor() {
    try {
      if (environment.firebase && environment.firebase.apiKey && environment.firebase.apiKey !== 'TU_API_KEY_DE_FIREBASE') {
        this.app = getApps().length > 0 ? getApp() : initializeApp(environment.firebase);
        this.auth = getAuth(this.app);
        this.firestore = getFirestore(this.app);
        this.firebaseConectado = true;
        console.log('Firebase y Firestore inicializados correctamente.');
        console.warn('Firebase en espera de inicialización o credenciales.');
      }
    } catch (e) {
      console.error('Error inicializando Firebase:', e);
    }
  }

  /* ================= AUTENTICACIÓN REAL ================= */

  async loginWithGoogle(): Promise<UserCredential> {
    if (!this.auth) {
      throw new Error('Firebase Auth no está inicializado.');
    }
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    return await signInWithPopup(this.auth, provider);
  }

  async loginWithEmail(email: string, pass: string): Promise<UserCredential> {
    if (!this.auth) {
      throw new Error('Firebase Auth no está inicializado.');
    }
    return await signInWithEmailAndPassword(this.auth, email.trim(), pass);
  }

  async logout(): Promise<void> {
    if (this.auth) {
      await signOut(this.auth);
    }
  }

  obtenerUsuarioActual(): User | null {
    return this.auth?.currentUser || null;
  }

  /* ================= FIRESTORE DATABASE (PERSISTENCIA 100% REAL) ================= */

  // Sincronizar / guardar perfil de usuario en Firestore
  async sincronizarUsuario(user: { uid: string; email: string; nombre: string; rol: string; avatarIniciales: string }): Promise<void> {
    if (!this.firestore || !user.uid) return;
    try {
      const userRef = doc(this.firestore, 'usuarios', user.uid);
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        nombre: user.nombre,
        rol: user.rol,
        avatarIniciales: user.avatarIniciales,
        ultimoAcceso: serverTimestamp()
      }, { merge: true });
    } catch (err) {
      console.warn('Firestore: no se pudo guardar perfil de usuario (verificar reglas):', err);
    }
  }

  // Guardar check-in de ánimo de hoy
  async guardarCheckinAnimo(uid: string, checkin: { valor: number; nota?: string; fecha: string }): Promise<void> {
    if (!this.firestore || !uid) return;
    try {
      const colRef = collection(this.firestore, `usuarios/${uid}/checkins`);
      await addDoc(colRef, {
        valor: checkin.valor,
        nota: checkin.nota || '',
        fecha: checkin.fecha,
        timestamp: serverTimestamp()
      });
    } catch (err) {
      console.warn('Firestore: no se pudo registrar check-in:', err);
    }
  }

  // Obtener historial de check-ins de un usuario
  async obtenerHistorialCheckins(uid: string): Promise<any[]> {
    if (!this.firestore || !uid) return [];
    try {
      const colRef = collection(this.firestore, `usuarios/${uid}/checkins`);
      const q = query(colRef, orderBy('timestamp', 'desc'), limit(14));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (err) {
      console.warn('Firestore: error al obtener check-ins:', err);
      return [];
    }
  }

  // Guardar sesión en Firestore
  async agendarSesion(sesion: { titulo: string; fechaTexto: string; horaTexto: string; psicologa: string; deportistaNombre?: string; tipo: string; usuarioId?: string }): Promise<string | null> {
    if (!this.firestore) return null;
    try {
      const colRef = collection(this.firestore, 'sesiones');
      const docRef = await addDoc(colRef, {
        ...sesion,
        creadoEn: serverTimestamp()
      });
      return docRef.id;
    } catch (err) {
      console.warn('Firestore: error agendando sesión:', err);
      return null;
    }
  }

  // Obtener todas las sesiones activas
  async obtenerSesiones(): Promise<any[]> {
    if (!this.firestore) return [];
    try {
      const colRef = collection(this.firestore, 'sesiones');
      const snap = await getDocs(colRef);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (err) {
      console.warn('Firestore: error cargando sesiones:', err);
      return [];
    }
  }

  // Cancelar sesión
  async cancelarSesion(id: string): Promise<void> {
    if (!this.firestore || !id) return;
    try {
      const docRef = doc(this.firestore, 'sesiones', id);
      await deleteDoc(docRef);
    } catch (err) {
      console.warn('Firestore: error cancelando sesión:', err);
    }
  }

  // Guardar nota clínica por un psicólogo
  async guardarNotaClinica(deportistaId: string, nota: { texto: string; psicologa: string; fecha: string }): Promise<void> {
    if (!this.firestore || !deportistaId) return;
    try {
      const colRef = collection(this.firestore, `expedientes/${deportistaId}/notas`);
      await addDoc(colRef, {
        ...nota,
        timestamp: serverTimestamp()
      });
    } catch (err) {
      console.warn('Firestore: error guardando nota clínica:', err);
    }
  }

  // ================= WEBRTC Y PRESENCIA EN TIEMPO REAL =================

  async registrarPresenciaSala(salaId: string, participante: { uid: string; nombre: string; rol: string }): Promise<() => void> {
    if (!this.firestore) return () => {};
    try {
      const partDocRef = doc(this.firestore, `salas_webrtc/${salaId}/participantes`, participante.uid);
      await setDoc(partDocRef, {
        ...participante,
        conectado: true,
        actualizadoEn: serverTimestamp()
      }, { merge: true });

      return async () => {
        try {
          await deleteDoc(partDocRef);
        } catch (e) {}
      };
    } catch (e) {
      console.warn('Error registrando presencia en sala:', e);
      return () => {};
    }
  }

  escucharParticipantesSala(salaId: string, callback: (participantes: any[]) => void): () => void {
    if (!this.firestore) return () => {};
    try {
      const colRef = collection(this.firestore, `salas_webrtc/${salaId}/participantes`);
      return onSnapshot(colRef, (snapshot) => {
        const parts = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        callback(parts);
      }, (err) => {
        console.warn('Error escuchando participantes:', err);
      });
    } catch (e) {
      return () => {};
    }
  }

  async guardarSenalWebRTC(salaId: string, tipo: 'offer' | 'answer', sdp: any): Promise<void> {
    if (!this.firestore) return;
    try {
      const salaRef = doc(this.firestore, 'salas_webrtc', salaId);
      await setDoc(salaRef, { [tipo]: sdp, actualizadoEn: serverTimestamp() }, { merge: true });
    } catch (e) {
      console.warn('Error guardando señal WebRTC:', e);
    }
  }

  escucharSenalWebRTC(salaId: string, callback: (data: any) => void): () => void {
    if (!this.firestore) return () => {};
    try {
      const salaRef = doc(this.firestore, 'salas_webrtc', salaId);
      return onSnapshot(salaRef, (snap) => {
        if (snap.exists()) {
          callback(snap.data());
        }
      });
    } catch (e) {
      return () => {};
    }
  }

  async agregarCandidatoICE(salaId: string, rol: string, candidate: any): Promise<void> {
    if (!this.firestore || !candidate) return;
    try {
      const colRef = collection(this.firestore, `salas_webrtc/${salaId}/candidatos_${rol}`);
      await addDoc(colRef, candidate.toJSON());
    } catch (e) {
      console.warn('Error agregando candidato ICE:', e);
    }
  }

  escucharCandidatosICE(salaId: string, rolRemoto: string, callback: (candidate: any) => void): () => void {
    if (!this.firestore) return () => {};
    try {
      const colRef = collection(this.firestore, `salas_webrtc/${salaId}/candidatos_${rolRemoto}`);
      return onSnapshot(colRef, (snap) => {
        snap.docChanges().forEach((change) => {
          if (change.type === 'added') {
            callback(change.doc.data());
          }
        });
      });
    } catch (e) {
      return () => {};
    }
  }

  /* ================= RECURSOS CLÍNICOS DE BIBLIOTECA EN FIRESTORE ================= */

  async guardarRecursoBiblioteca(recurso: any): Promise<string | null> {
    if (!this.firestore) return null;
    try {
      const colRef = collection(this.firestore, 'recursos_biblioteca');
      if (recurso.id && !recurso.id.startsWith('b')) {
        const docRef = doc(this.firestore, 'recursos_biblioteca', recurso.id);
        await setDoc(docRef, { ...recurso, actualizadoEn: serverTimestamp() }, { merge: true });
        return recurso.id;
      } else {
        const docRef = await addDoc(colRef, { ...recurso, creadoEn: serverTimestamp() });
        return docRef.id;
      }
    } catch (e) {
      console.warn('Firestore: no se pudo guardar recurso de biblioteca:', e);
      return null;
    }
  }

  async obtenerRecursosBiblioteca(): Promise<any[]> {
    if (!this.firestore) return [];
    try {
      const colRef = collection(this.firestore, 'recursos_biblioteca');
      const snap = await getDocs(colRef);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
      console.warn('Firestore: no se pudieron cargar recursos de biblioteca:', e);
      return [];
    }
  }

  async eliminarRecursoBiblioteca(id: string): Promise<void> {
    if (!this.firestore || !id) return;
    try {
      const docRef = doc(this.firestore, 'recursos_biblioteca', id);
      await deleteDoc(docRef);
    } catch (e) {
      console.warn('Firestore: error eliminando recurso:', e);
    }
  }

  /* ================= GESTIÓN DEL EQUIPO DE PSICÓLOGOS EN FIRESTORE ================= */

  async guardarPsicologo(psicologo: any): Promise<string | null> {
    if (!this.firestore) return null;
    try {
      const docRef = doc(this.firestore, 'equipo_psicologia', psicologo.id);
      await setDoc(docRef, { ...psicologo, actualizadoEn: serverTimestamp() }, { merge: true });
      return psicologo.id;
    } catch (e) {
      console.warn('Firestore: error guardando psicólogo en equipo:', e);
      return null;
    }
  }

  async obtenerPsicologos(): Promise<any[]> {
    if (!this.firestore) return [];
    try {
      const colRef = collection(this.firestore, 'equipo_psicologia');
      const snap = await getDocs(colRef);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
      console.warn('Firestore: error cargando equipo de psicólogos:', e);
      return [];
    }
  }

  async eliminarPsicologo(id: string): Promise<void> {
    if (!this.firestore || !id) return;
    try {
      const docRef = doc(this.firestore, 'equipo_psicologia', id);
      await deleteDoc(docRef);
    } catch (e) {
      console.warn('Firestore: error eliminando psicólogo:', e);
    }
  }
}
