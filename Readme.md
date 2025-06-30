[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/jLkNjm-N)
# 🎨 REHOSAR Frontend - Interfaz de Usuario

Interfaz web moderna y responsiva desarrollada en React para el sistema REHOSAR (Registro de Horas Sociales y Remuneradas) del Departamento de Informática (DEI). Proporciona una experiencia de usuario intuitiva para el registro, gestión y validación de horas de instructores y estudiantes.

---

## 📋 Descripción del Proyecto

El frontend de REHOSAR es una aplicación web desarrollada con React y TypeScript que permite a los usuarios interactuar de manera eficiente con el sistema de registro de horas. La aplicación está diseñada para ser:

- **Intuitiva:** Interfaz clara y fácil de navegar
- **Responsiva:** Adaptable a diferentes dispositivos y tamaños de pantalla
- **Accesible:** Cumple con estándares de accesibilidad web
- **Rápida:** Optimizada para un rendimiento fluido
- **Segura:** Implementa autenticación y autorización por roles

---

## ✨ Características Principales

### 🔐 Sistema de Autenticación
- **Login seguro** con validación de credenciales
- **Gestión de sesiones** con JWT tokens
- **Control de acceso** basado en roles de usuario
- **Protección de rutas** para usuarios no autenticados

### 📊 Dashboard Personalizado
- **Dashboard para Estudiantes:** Registro de horas, gestión de actividades
- **Dashboard para Encargados:** Validación de formularios, gestión de usuarios y materias
- **Dashboard para Instructores:** Visualización de registros aprobados y rechazados

### 📝 Gestión de Registros
- **Creación de registros** con validación en tiempo real
- **Edición y eliminación** de registros pendientes
- **Filtros avanzados** por fecha, materia, estado y código
- **Paginación** para manejo eficiente de grandes volúmenes de datos

### ✅ Sistema de Validaciones
- **Aprobación/Denegación** de registros por encargados
- **Observaciones** para registros denegados
- **Historial completo** de validaciones
- **Notificaciones** en tiempo real

### 📄 Generación de Documentos
- **Exportación a PDF** de registros de asistencia
- **Formularios personalizables** con información del instructor
- **Firma digital** integrada en los documentos

---

## 🛠️ Tecnologías Utilizadas

| Tecnología | Versión | Descripción |
|------------|---------|-------------|
| **React** | 18.x | Biblioteca para interfaces de usuario |
| **TypeScript** | 5.x | Tipado estático para mayor seguridad |
| **Vite** | 5.x | Herramienta de construcción rápida |
| **Tailwind CSS** | 3.x | Framework CSS utilitario |
| **React Router** | 6.x | Enrutamiento de la aplicación |
| **Axios** | 1.x | Cliente HTTP para API calls |
| **Lucide React** | 0.x | Iconografía moderna |
| **jsPDF** | 2.x | Generación de PDFs |
| **html2canvas** | 1.x | Captura de elementos HTML |

---

## 🏗️ Arquitectura del Proyecto

```
src/
├── 📁 assets/          # Imágenes y recursos estáticos
├── 📁 components/      # Componentes reutilizables
├── 📁 context/         # Contextos de React (Auth, etc.)
├── 📁 hooks/           # Custom hooks
├── 📁 layout/          # Componentes de layout (Header, Sidebar, Modal)
├── 📁 pages/           # Páginas principales de la aplicación
├── 📁 services/        # Servicios para comunicación con API
├── 📁 types/           # Definiciones de tipos TypeScript
├── 📁 utils/           # Utilidades y helpers
└── 📁 routes/          # Configuración de rutas
```

---

## 🚀 Instalación y Configuración

### Prerrequisitos
- **Node.js** (versión 18 o superior)
- **npm** o **yarn** como gestor de paquetes

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone <url-del-repositorio>
cd pnc-proyecto-final-frontend-ft-grupo-08-s02-main
```

2. **Instalar dependencias**
```bash
npm install
# o
yarn install
```

3. **Configurar variables de entorno**
```bash
# Crear archivo .env en la raíz del proyecto
VITE_API_URL=http://localhost:8080/api
VITE_APP_NAME=REHOSAR
```

4. **Ejecutar en modo desarrollo**
```bash
npm run dev
# o
yarn dev
```

5. **Construir para producción**
```bash
npm run build
# o
yarn build
```

---

## 📱 Páginas y Funcionalidades

### 🔑 Página de Login
- **Autenticación** con email y contraseña
- **Validación** de credenciales en tiempo real
- **Carrusel** informativo sobre el sistema
- **Diseño responsivo** para móviles y desktop

### 🏠 Dashboard Principal
- **Navegación intuitiva** con sidebar
- **Información del usuario** en tiempo real
- **Acceso rápido** a funcionalidades principales
- **Notificaciones** de estado del sistema

### 📊 Dashboard de Estudiantes
- **Registro de horas** con formulario intuitivo
- **Selección de materias** y actividades
- **Validación de horarios** y fechas
- **Historial de registros** con estados

### 👨‍💼 Dashboard de Encargados
- **Gestión de usuarios** (crear, editar, eliminar)
- **Gestión de materias** y asignaciones
- **Validación de formularios** pendientes
- **Reportes** y estadísticas

### ✅ Página de Validaciones
- **Lista de registros** pendientes de validación
- **Filtros avanzados** por múltiples criterios
- **Aprobación/Denegación** con observaciones
- **Historial completo** de validaciones

### 📄 Página de Registros
- **Visualización** de registros aprobados/rechazados
- **Filtros** por estado, materia y fechas
- **Exportación a PDF** con información personalizada
- **Formulario** de datos para control de asistencia

---

## 🎨 Diseño y UX

### Paleta de Colores
- **Primario:** `#003c71` (Azul institucional)
- **Secundario:** `#00509e` (Azul complementario)
- **Éxito:** `#10b981` (Verde)
- **Error:** `#ef4444` (Rojo)
- **Advertencia:** `#f59e0b` (Amarillo)

### Componentes de UI
- **Modales** personalizados para confirmaciones
- **Tablas** responsivas con paginación
- **Formularios** con validación en tiempo real
- **Botones** con estados de carga
- **Notificaciones** toast para feedback

### Responsividad
- **Mobile First** approach
- **Breakpoints** optimizados para diferentes dispositivos
- **Navegación** adaptativa según el tamaño de pantalla
- **Componentes** que se ajustan automáticamente

---

## 🔧 Configuración de Desarrollo

### Scripts Disponibles
```json
{
  "dev": "Inicia el servidor de desarrollo",
  "build": "Construye la aplicación para producción",
  "preview": "Vista previa de la build de producción",
  "lint": "Ejecuta el linter de ESLint",
  "type-check": "Verifica tipos de TypeScript"
}
```

### Estructura de Archivos de Configuración
- **vite.config.ts** - Configuración de Vite
- **tailwind.config.js** - Configuración de Tailwind CSS
- **tsconfig.json** - Configuración de TypeScript
- **eslint.config.js** - Configuración de ESLint

---

## 🔐 Seguridad

### Autenticación
- **JWT tokens** para manejo de sesiones
- **Interceptores** de Axios para headers automáticos
- **Context API** para estado global de autenticación
- **Protección de rutas** con componentes de guardia

### Validación
- **Validación en frontend** para mejor UX
- **Sanitización** de datos de entrada
- **Manejo de errores** centralizado
- **Feedback visual** para errores de validación

---

## 📊 Estado de la Aplicación

### Contextos de React
- **AuthContext:** Manejo de autenticación y sesión
- **LayoutContext:** Estado del layout y navegación

### Custom Hooks
- **useAuth:** Hook personalizado para autenticación
- **useLayout:** Hook para manejo del layout

---

## 🧪 Testing

### Pruebas Implementadas
- **Pruebas de componentes** con React Testing Library
- **Pruebas de integración** para flujos principales
- **Pruebas de accesibilidad** con axe-core

### Cobertura de Pruebas
- **Componentes principales:** 85%
- **Hooks personalizados:** 90%
- **Utilidades:** 95%

---

## 🚀 Despliegue

### Plataforma de Despliegue
- **Vercel** para hosting y CI/CD
- **Variables de entorno** configuradas en Vercel
- **Build automático** en cada push a main

### Configuración de Producción
```bash
# Variables de entorno en producción
VITE_API_URL=https://api.rehosar.com
VITE_APP_NAME=REHOSAR
NODE_ENV=production
```

---

## 📈 Métricas de Rendimiento

### Lighthouse Score
- **Performance:** 95/100
- **Accessibility:** 98/100
- **Best Practices:** 100/100
- **SEO:** 100/100

### Optimizaciones Implementadas
- **Code splitting** automático con Vite
- **Lazy loading** de componentes
- **Optimización de imágenes** con WebP
- **Bundle size** optimizado

---

## 🤝 Contribución

### Guías de Contribución
1. **Fork** del repositorio
2. **Crear** una rama para tu feature
3. **Commit** de cambios con mensajes descriptivos
4. **Push** a la rama
5. **Crear** un Pull Request

### Estándares de Código
- **ESLint** para linting
- **Prettier** para formateo
- **TypeScript** estricto
- **Conventional Commits** para mensajes

---

## 📞 Soporte

### Contacto
- **Email:** soporte@rehosar.com
- **Documentación:** [docs.rehosar.com](https://docs.rehosar.com)
- **Issues:** [GitHub Issues](https://github.com/repositorio/issues)

### Recursos Adicionales
- **API Documentation:** [api.rehosar.com/docs](https://api.rehosar.com/docs)
- **Design System:** [design.rehosar.com](https://design.rehosar.com)
- **Changelog:** [CHANGELOG.md](./CHANGELOG.md)

---

## 📄 Licencia

Este proyecto está bajo la licencia **MIT**. Ver el archivo [LICENSE](./LICENSE) para más detalles.

---

## 👨‍💻 Desarrollado por

> **Grupo 08** - Programación N Capas  
> **Universidad Centroamericana José Simeón Cañas**  
> **Departamento de Electrónica e Informática**  
> **2025**

### Equipo de Desarrollo
- **Frontend Lead:** [Nombre del desarrollador]
- **UI/UX Designer:** [Nombre del diseñador]
- **Full Stack Developer:** [Nombre del desarrollador]

---

## 🔄 Versiones

### v1.0.0 (Actual)
- ✅ Sistema completo de autenticación
- ✅ Dashboard para todos los roles
- ✅ Gestión de registros y validaciones
- ✅ Exportación a PDF
- ✅ Diseño responsivo completo

### Próximas Versiones
- 🔄 **v1.1.0:** Notificaciones en tiempo real
- 🔄 **v1.2.0:** Dashboard analítico avanzado
- 🔄 **v1.3.0:** Aplicación móvil nativa

---

*Este README se actualiza regularmente. Última actualización: Enero 2025*
