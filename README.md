# Smart Scout In 🏆

> Plataforma avanzada de scouting de fútbol — análisis de jugadores, vídeo táctico y modelos de juego.

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 14 (App Router) |
| Lenguaje | TypeScript |
| Estilos | Tailwind CSS + shadcn/ui |
| Base de datos | Supabase (PostgreSQL) |
| Gráficos | Recharts |
| Drag & Drop | dnd-kit |
| Vídeo | react-player |
| Canvas táctico | Fabric.js |
| Iconos | lucide-react |

## Secciones de la App

### 📊 Dashboard
Vista general con KPIs del equipo: jugadores scouted, informes pendientes, valoraciones recientes y actividad del equipo.

### 👤 Jugadores
Catálogo completo de jugadores con búsqueda avanzada, filtros por posición/liga/edad, ficha individual con estadísticas detalladas y comparativas por temporada.

### 🎬 Análisis de Vídeo
Reproductor de vídeo integrado con herramientas de anotación táctica, marcadores de tiempo y exportación de clips destacados.

### ⚖️ Comparador
Comparativa lado a lado de hasta 4 jugadores con gráficos radar, estadísticas de rendimiento y informe de diferencias.

### 🗺️ Modelo de Juego
Editor táctico visual con canvas interactivo (Fabric.js), plantillas de formaciones, rutas de pressing y patrones de juego configurables.

## Estructura del Proyecto

```
smart-scout-in/
├── app/                    # App Router — páginas y layouts
│   ├── layout.tsx          # Layout raíz con tema oscuro
│   ├── page.tsx            # Dashboard principal
│   ├── players/            # Sección Jugadores
│   ├── video/              # Análisis de vídeo
│   ├── comparator/         # Comparador de jugadores
│   └── game-model/         # Modelo de juego
├── components/             # Componentes reutilizables
│   ├── ui/                 # shadcn/ui components
│   ├── dashboard/          # Componentes del dashboard
│   ├── players/            # Componentes de jugadores
│   ├── video/              # Componentes de vídeo
│   └── tactical/           # Componentes tácticos
├── lib/
│   └── supabaseClient.ts   # Cliente Supabase
└── types/
    └── index.ts            # Types globales
```

## Variables de Entorno

Copia `.env.local.example` a `.env.local` y rellena tus credenciales:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## Desarrollo

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Build

```bash
npm run build
npm start
```
