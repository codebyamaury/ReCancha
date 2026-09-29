# ReCancha · Plataforma de Soporte Psicológico Deportivo

> **IDERT (Instituto Departamental de Recreación y Deportes de Santander) & Universidad del Sinú**  
> Plataforma web especializada para el acompañamiento y rehabilitación psicológica de deportistas durante procesos de lesión física mediante telepsicología, seguimiento del estado anímico y terapia cognitivo-conductual (TCC).

🌐 **Despliegue en producción:** [https://recancha-4fcd9.web.app](https://recancha-4fcd9.web.app)

---

## 🌟 Características Principales

* **Consulta Telepsicológica WebRTC en Vivo**:
  * Sala de consulta con cifrado P2P en tiempo real y detección automática de presencia mediante Firebase Firestore.
  * Sala de espera inteligente con radar interactivo cuando un participante ingresa antes que el especialista.
  * Controles de hardware en caliente (activación/silenciado de micrófono, alternar cámara física y compartir pantalla con `getDisplayMedia`).
  * Panel de notas clínicas de evolución para que el psicólogo registre intervenciones en el expediente del paciente.

* **Doble Perfil de Usuario con Flujos Clínicos Específicos**:
  * **Perfil Deportista**:
    * Registro de check-in emocional diario (escala visual adaptativa).
    * Biblioteca de recursos terapéuticos guiados (respiración diafragmática, reestructuración cognitiva, autodiálogo).
    * Calendario y agendamiento interactivo de sesiones clínicas individuales o grupales.
  * **Perfil Especialista en Psicología Deportiva**:
    * Tablero clínico con métricas en tiempo real de deportistas en recuperación.
    * Expedientes de evolución clínica y notas de intervención.
    * Monitoreo del estado anímico semanal y adherencia a los ejercicios.

* **Diseño Visual e Interactividad**:
  * Paleta de colores oficial: Blanco, Azul (`#2563eb`, `#1e3a8a`, `#0f172a`) y Rosado (`#ec4899`).
  * Partículas 3D interactivas optimizadas con Three.js que reaccionan sutilmente al cursor y movimiento del mouse.
  * Microanimaciones suaves, tarjetas elevadas, tipografía moderna e iconografía SVG pura sin emojis.

* **Cumplimiento y Privacidad**:
  * Marco de consentimiento informado bajo la **Ley 1581 de 2012** de Protección de Datos Personales de Colombia.

---

## 🛠️ Tecnologías

* **Frontend**: [Angular 19](https://angular.dev/) (Standalone Components, Signals, Zoneless reactive state)
* **Estilos**: Vanilla CSS con variables CSS personalizadas y diseño adaptativo / responsive
* **Efectos 3D**: [Three.js](https://threejs.org/) para el lienzo de partículas y animación geométrica
* **Backend & Base de Datos**: [Firebase](https://firebase.google.com/) (Authentication, Cloud Firestore, WebRTC Signaling)
* **Despliegue & Hosting**: Firebase Hosting con HTTPS y compresión Brotli / Gzip

---

## 🚀 Instalación y Desarrollo Local

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/codebyamaury/ReCancha.git
   cd ReCancha
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Ejecutar servidor de desarrollo**:
   ```bash
   npm start
   ```
   Abrir `http://localhost:4200` en tu navegador.

4. **Compilar para producción**:
   ```bash
   npm run build
   ```

5. **Desplegar en Firebase**:
   ```bash
   firebase deploy --only hosting
   ```

---

## 📄 Licencia

Desarrollado para el proyecto de investigación y acompañamiento deportivo IDERT / Universidad del Sinú.
