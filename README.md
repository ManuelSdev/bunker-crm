# 🛡️ Búnker Suite (`bunker-crm`)

Monorepo de soluciones empresariales modulares basado en una arquitectura desacoplada, tipado estricto y un enfoque operativo _Zero-Ops_[cite: 2, 4].

El espacio de trabajo centraliza el desarrollo de dos plataformas de gestión de relaciones con clientes (CRM) que comparten un sistema de diseño visual unificado, manteniendo completamente independientes sus reglas de dominio, bases de datos y flujos de negocio[cite: 2, 4].

---

## 🏗️ Topología del Proyecto

El monorepo está orquestado mediante **pnpm workspaces** para aislar el cascarón de presentación agnóstico de la lógica de negocio y las APIs de cada aplicación[cite: 2, 4]:

```text
bunker-crm/
├── .devcontainer/              # Entorno de desarrollo estandarizado en contenedores[cite: 2]
├── docs/                       # Documentación viva, donante de UI y ADRs técnicos[cite: 2, 4]
├── packages/
│   └── ui/                     # Librería visual interna (@bunker/ui) basada en Material UI[cite: 2, 4]
├── apps/
│   ├── wmw-crm/                # CRM para gestión de socios y cuotas de club[cite: 2, 4]
│   │   ├── web/                # SPA React 19 que consume @bunker/ui[cite: 2, 4]
│   │   └── api/                # Backend FastAPI (hexagonal, OCR de documentos)[cite: 2, 4]
│   └── rh-crm/                 # CRM comercial con sincronización contable en Holded[cite: 2, 4]
│       ├── web/                # SPA React 19 que consume @bunker/ui[cite: 2, 4]
│       └── api/                # Backend FastAPI (hexagonal, pipeline, Holded SDK)[cite: 2, 4]
├── pnpm-workspace.yaml         # Configuración del espacio de trabajo pnpm[cite: 2, 4]
└── package.json                # Scripts globales de compilación y orquestación[cite: 2, 4]

```

---

## 📦 Aplicaciones y Paquetes

### 1. `@bunker/ui` (`packages/ui`)

- **Propósito:** Cascarón visual común y agnóstico de negocio.

- **Contenido:** Temas, tipografías, componentes atómicos, layouts estructurados (`AppLayout`, `SideMenu`, `Header`) y tablas de datos generadas a partir del sistema de diseño de Material UI.

- **Regla Inviolable:** 100% libre de lógica de dominio (no conoce conceptos de "socio", "lead" o "factura"); todo el contenido se parametriza vía contratos e interfaces estrictas de TypeScript.

### 2. `WMW CRM` (`apps/wmw-crm`)

- **Propósito:** Gestión ágil de membresías y socios de club (aprox. 200 socios).

- **Funcionalidades Clave:**
- Catálogo de socios y seguimiento de estados de cuota.

- Formulario de alta asistida con zona de _Drag & Drop_ para inspección visual de documentos.

- Procesamiento documental mediante visión artificial / OCR para auto-rellenado de fichas bajo cumplimiento estricto de GDPR y políticas _Zero Data Retention_ (ZDR).

### 3. `RH CRM` (`apps/rh-crm`)

- **Propósito:** Gestión comercial, prospección y seguimiento del ciclo de vida de clientes.

- **Fronteras Clave:**
- **Frontera Operativa (CRM SSOT):** Prospección, notas de seguimiento comercial, llamadas, tareas y pipeline de captación.

- **Frontera Financiera (Holded SSOT):** Holded se mantiene como la fuente de verdad inmutable para facturación pura, series fiscales y cobros contables.

- Entidades adaptadas a la fiscalidad española (NIF/CIF, personas físicas y jurídicas, recargo de equivalencia).

---

## 🛠️ Stack Tecnológico

### Frontend (Web Client)

- **Framework & Bundler:** React 19 compilado con Vite.

- **Lenguaje:** TypeScript bajo configuración _Pragmatic Strict_ (`strict: true`, `noImplicitAny: true`, `strictNullChecks: true`).

- **UI & Estilos:** Material UI (MUI v9) y Emotion (`@emotion/react`, `@emotion/styled`), encapsulados exclusivamente en `@bunker/ui`.

- **Formularios & Validación:** React Hook Form gestionado mediante `<Controller/>` y esquemas de validación estricta con Zod como única fuente de verdad (SSOT).

- **Estado de Servidor:** TanStack Query (React Query) desacoplado mediante adaptadores de transporte con Fetch nativo.

### Backend & Almacenamiento

- **Framework:** FastAPI (Python >= 3.11) estructurado con Pydantic y SQLAlchemy/SQLModel.

- **Base de Datos:** PostgreSQL gestionado en la nube (DBaaS) con _Connection Pooling_ estricto (ej. PgBouncer o límite de conexiones en SQLAlchemy) para no saturar memoria.

- **Gestión de Archivos:** Almacenamiento en buckets de objetos seguros (S3-compatible / Cloudflare R2 / Supabase Storage). Prohibido el almacenamiento de imágenes o PDFs como BLOBs en la base de datos relacional; en PostgreSQL solo residen URLs.

---

## 🏛️️ Arquitectura del Sistema: Patrón Hexagonal Unificado

Tanto el Frontend como el Backend implementan el **Patrón Hexagonal (Puertos y Adaptadores)** para aislar las reglas de negocio de la infraestructura volátil.

```text
             FRONTEND HEXAGON                                   BACKEND HEXAGON
┌───────────────────────────────────────┐           ┌───────────────────────────────────────┐
│ [DOM / Usuario]                       │           │ [Cliente HTTP / Request]              │
│       │                               │           │       │                               │
│       ▼                               │           │       ▼                               │
│ Adaptador Primario (React + MUI)      │           │ Adaptador Primario (FastAPI Routes)   │
│       │                               │           │       │ (Inyección vía Depends)       │
│       ▼                               │           │       ▼                               │
│  [ PUERTOS: Interfaces TS ]           │           │  [ PUERTOS: Protocols / ABC ]         │
│       ▲                               │           │       ▲                               │
│       │                               │           │       │                               │
│  [ DOMINIO: Schemas Zod + Entidades ] │           │  [ DOMINIO: Modelos Pydantic Puros ]  │
│       │                               │           │       │                               │
│       ▼                               │           │       ▼                               │
│ Adaptadores Secundarios:              │           │ Adaptadores Secundarios:              │
│  - Mock Adapter (Fase 0 en memoria)   │           │  - Mock / In-Memory Adapter           │
│  - Http Adapter (Fetch nativo)        │           │  - Postgres Adapter (SQLAlchemy)      │
│       │                               │           │  - Holded SDK / Vertex AI OCR Adapter │
│       ▼                               │           │       │                               │
│ [Red / Servidor Remoto]               │           │ [PostgreSQL / Buckets / APIs Nube]    │
└───────────────────────────────────────┘           └───────────────────────────────────────┘

```

### 1. Hexágono en Frontend (`apps/*/web/src/`)

- **Core / Dominio:** Entidades puras y esquemas Zod (sin dependencias de React ni de la red).

- **Puertos:** Interfaces TypeScript que definen los contratos requeridos por el sistema (ej. `SocioRepository`, `CustomerRepository`).

- **Adaptadores Secundarios:**
- _Mock Adapters:_ Adaptadores simulados en memoria con demoras artificiales (~500ms) que permiten validar la UI completa en **Fase 0** sin necesidad de backend o APIs activas.

- _Http Adapters:_ Implementaciones reales basadas en Fetch nativo tipado.

- **Adaptadores Primarios:** Componentes de presentación que consumen `@bunker/ui` y se comunican con los puertos a través de _custom hooks_ gobernados por TanStack Query (manejo de caché, reintentos y deduplicación).

### 2. Hexágono en Backend (`apps/*/api/src/`)

- **Core / Dominio:** Modelos y reglas de validación de negocio en Pydantic o dataclasses puras. Cero dependencias de FastAPI, cero sentencias SQL y cero llamadas HTTP externas.

- **Puertos:** Contratos abstractos definidos mediante `typing.Protocol` o `ABC` (ej. `SocioRepository`, `OCRProvider`, `HoldedClient`).

- **Adaptadores Secundarios (Infraestructura / Salida):**
- _Persistencia:_ Implementaciones que satisfacen los repositorios (ej. `PostgresSocioRepository` con SQLAlchemy o adaptadores temporales en memoria/hojas de cálculo).

- _Integraciones Externas:_ Clientes HTTP desacoplados para el SDK de Holded o servicios de IA/visión artificial (ej. Vertex AI / Mistral).

- **Adaptadores Primarios (Presentación / Entrada):** Rutas y controladores de FastAPI (`@router.get`, `@router.post`). Los endpoints **nunca** instancian bases de datos ni clientes directamente; consumen los Puertos mediante la inyección de dependencias nativa de FastAPI (`Depends`).

---

## 🚀 Inicio Rápido

### Requisitos Previos

- Node.js (>= 20.x)
- pnpm (>= 9.x)
- Python (>= 3.11)

### Instalación de dependencias

```bash
pnpm install

```

### Compilar el paquete visual compartido

```bash
pnpm --filter @bunker/ui run build

```

### Iniciar aplicaciones en desarrollo

```bash
# Frontend de WMW CRM
pnpm --filter @wmw-crm/web run dev

# Frontend de RH CRM
pnpm --filter @rh-crm/web run dev

```

---

## 📋 Directrices de Desarrollo (Ground Truth para Desarrolladores e IA)

1. **Aislamiento visual absoluto:** Las aplicaciones en `apps/*` tienen estrictamente prohibido importar directamente de `@mui/material` o dependencias de Emotion; todo componente visual debe provenir exportado desde `@bunker/ui`.

2. **Tipado inviolable (Zod & Pydantic SSOT):** Prohibido el uso de `any` o _type casting_ permisivo (`as unknown`). En frontend, todo tipo se infiere de esquemas Zod (`z.infer<...>`); en backend, se valida mediante esquemas estrictos de Pydantic.

3. **Independencia del Dominio (Hexágono):** El código dentro de `core/` o `domain/` (tanto en web como en api) no puede importar librerías de infraestructura (ni React, ni FastAPI, ni SQLAlchemy, ni clientes HTTP). Cambiar de base de datos o de proveedor de IA solo requiere modificar adaptadores secundarios sin tocar las rutas ni las reglas de dominio.

4. **Almacenamiento de archivos:** Bajo ninguna circunstancia se guardan imágenes o PDFs como BLOBs en PostgreSQL; se suben a buckets de objetos y se almacena únicamente la URL resultante.

5. **Decisiones Técnicas:** Cualquier alteración en la arquitectura o en las entidades debe documentarse en los ADRs dentro del directorio `docs/`.
