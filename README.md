# 🐾 HappyTails AI

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![License](https://img.shields.io/badge/license-MIT-green)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)

**Plataforma impulsada por IA para la gestión integral de mascotas y adopciones inteligentes**

[Características](#-características-principales) • [Tecnologías](#-stack-tecnológico) • [Instalación](#-instalación-y-configuración) • [Estructura](#-estructura-del-proyecto) • [Contribuir](#-contribuir)

</div>

## ✨ Visión General

HappyTails AI es un ecosistema completo que revoluciona la gestión de mascotas mediante inteligencia artificial. Conectamos dueños, refugios y amantes de los animales en una plataforma unificada que garantiza el bienestar de cada compañero peludo.

> **Más que un sistema de gestión:** Una comunidad dedicada a crear historias felices para cada mascota.

## 🌟 Características Principales

### 🔐 Gestión de Usuarios y Seguridad Avanzada
- **Autenticación JWT con Cookies**: Sistema seguro y escalable
- **Doble Factor de Autenticación (MFA)**: Protección adicional mediante OTP
- **Control de Acceso Basado en Roles**: Tres niveles (Usuario, Admin, Superadmin)

### 🐕 Cuidado Integral de Mascotas
- **Dashboard Personalizado**: Perfiles detallados de cada mascota
- **Sistema de Recordatorios Inteligente**: Notificaciones para vacunas, citas y cuidados
- **Historial Médico Centralizado**: Toda la información vital en un solo lugar

### 🏡 Adopciones Inteligentes
- **Plataforma de Matchmaking**: Conecta mascotas con familias ideales
- **Panel de Gestión para Refugios**: Administración completa de candidatos y procesos
- **Seguimiento de Adopciones**: Transparencia en todo el proceso

### 🤖 Asistente Virtual con IA
- **Chatbot 24/7**: Respuestas instantáneas sobre cuidado, salud y comportamiento
- **Motor de Mistral AI**: Procesamiento de lenguaje natural avanzado
- **Recomendaciones Personalizadas**: Consejos adaptados a cada mascota

### ⚡ Experiencia en Tiempo Real
- **Notificaciones Instantáneas**: Socket.io para actualizaciones en vivo
- **Interfaz Dinámica**: Animaciones fluidas con Framer Motion
- **Diseño Responsivo**: Experiencia optimizada en todos los dispositivos

## 🛠️ Stack Tecnológico

| Capa | Tecnologías |
|------|-------------|
| **Frontend** | Next.js 15 (App Router), TypeScript, React 18 |
| **Estilos** | Tailwind CSS 4, Framer Motion, Lucide Icons |
| **Backend** | Next.js API Routes, Node.js |
| **Base de Datos** | MySQL, Prisma ORM |
| **Inteligencia Artificial** | Mistral AI API, Hugging Face Integrations |
| **Comunicación en Tiempo Real** | Socket.io, WebSockets |
| **Seguridad** | JWT, bcryptjs, otplib, CORS middleware |
| **Desarrollo** | ESLint, Prettier, TypeScript, Git |

## 🚀 Instalación y Configuración

### 📋 Prerrequisitos

- **Node.js** 18.x o superior
- **MySQL** 8.0+ (local o remoto)
- **npm** 9.x o superior
- **Clave API de Mistral AI** (opcional para funciones de IA)

### 🛠️ Configuración Paso a Paso

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/happytails-ia.git
   cd happytails-ia
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   # o
   yarn install
   ```

3. **Configurar base de datos**
   ```sql
   -- Crear base de datos
   CREATE DATABASE happytails_db_normalizada;
   
   -- Importar estructura (desde el archivo SQL proporcionado)
   -- mysql -u usuario -p happytails_db_normalizada < happytails_db_normalizada.sql
   ```

4. **Configurar variables de entorno**
   ```bash
   cp .env.example .env.local
   ```
   
   Editar `.env.local` con tus configuraciones:
   ```env
   DATABASE_URL="mysql://usuario:contraseña@localhost:3306/happytails_db_normalizada"
   JWT_SECRET="tu-clave-secreta-jwt-aqui"
   MISTRAL_API_KEY="tu-clave-mistral-aqui"
   NEXTAUTH_SECRET="tu-secreto-nextauth"
   NEXTAUTH_URL="http://localhost:3000"
   ```

5. **Ejecutar migraciones de base de datos**
   ```bash
   npx prisma migrate deploy
   # o
   npm run db:migrate
   ```

6. **Iniciar servidor de desarrollo**
   ```bash
   npm run dev
   # o
   yarn dev
   ```

7. **Acceder a la aplicación**
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - API: [http://localhost:3000/api](http://localhost:3000/api)
   - Documentación API: [http://localhost:3000/api-docs](http://localhost:3000/api-docs) (si está disponible)

## 📂 Estructura del Proyecto

```
happytails-ia/
├── app/
│   ├── api/                 # Endpoints de API
│   ├── auth/               # Autenticación y autorización
│   ├── dashboard/          # Panel de usuario
│   ├── pets/              # Gestión de mascotas
│   ├── adoptions/         # Módulo de adopciones
│   └── layout.tsx         # Layout principal
├── components/
│   ├── ui/                # Componentes UI básicos
│   ├── pets/              # Componentes específicos de mascotas
│   ├── chat/              # Componentes del chatbot
│   └── shared/            # Componentes reutilizables
├── lib/
│   ├── db/                # Configuración de base de datos
│   ├── sockets/           # Configuración de Socket.io
│   ├── ai/               # Integraciones con IA
│   └── utils/            # Utilidades generales
├── prisma/
│   └── schema.prisma      # Esquema de base de datos
├── public/
│   ├── images/            # Assets estáticos
│   └── icons/             # Íconos y favicons
└── types/
    └── index.ts           # Tipos TypeScript globales
```

## 🧪 Comandos Útiles

```bash
# Desarrollo
npm run dev              # Inicia servidor de desarrollo
npm run build            # Construye para producción
npm start               # Inicia servidor de producción

# Base de datos
npm run db:migrate      # Ejecuta migraciones
npm run db:seed         # Pobla base de datos con datos de prueba
npm run db:studio       # Abre Prisma Studio

# Calidad de código
npm run lint            # Ejecuta ESLint
npm run format          # Formatea con Prettier
npm run type-check      # Verifica tipos TypeScript
```

## 🤝 Cómo Contribuir

¡Agradecemos y valoramos todas las contribuciones! Sigue estos pasos:

1. **Reportar Issues**
   - Revisa [issues existentes](https://github.com/fceli6787/happytails-ia/issues)
   - Crea un nuevo issue con la plantilla correspondiente

2. **Desarrollo de Features**
   ```bash
   # 1. Haz fork del repositorio
   # 2. Clona tu fork
   git clone https://github.com/fceli6787/happytails-ia.git
   
   # 3. Crea una rama para tu feature
   git checkout -b feature/nueva-caracteristica
   
   # 4. Desarrolla y prueba tus cambios
   # 5. Haz commit con mensajes descriptivos
   git commit -m "feat: añade sistema de notificaciones push"
   
   # 6. Sube los cambios
   git push origin feature/nueva-caracteristica
   
   # 7. Abre un Pull Request
   ```

3. **Guías de Estilo**
   - Sigue las convenciones de commits (Conventional Commits)
   - Mantén la cobertura de tests por encima del 80%
   - Documenta nuevas funcionalidades

## 📄 Licencia

Este proyecto está bajo la **Licencia MIT**. Consulta el archivo [LICENSE](LICENSE) para más detalles.

## 🆘 Soporte

- **Documentación**: [docs.happytails-ai.com](https://docs.happytails-ai.com)
- **Issues**: [GitHub Issues](https://github.com/tu-usuario/happytails-ia/issues)
- **Email**: soporte@happytails-ai.com
- **Discord**: [Comunidad HappyTails](https://discord.gg/happytails)

## 🙏 Agradecimientos

- **Mistral AI** por su potente API de lenguaje natural
- **Comunidad de Next.js** por el increíble framework
- **Todos los contribuidores** que han ayudado a mejorar HappyTails

---

<div align="center">

**Desarrollado con ❤️ para los amantes de los animales** 🐕🐈🐾

© 2024 HappyTails AI. Todos los derechos reservados.

</div>
