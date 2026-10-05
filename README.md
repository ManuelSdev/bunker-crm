Aquí tienes una propuesta técnica, estructurada y profesional para el archivo `README.md` raíz de tu monorepo (`bunker-crm`), lista para copiar y pegar en tu repositorio:

---

````markdown
# 🛡️ Búnker Suite (`bunker-crm`)

Monorepo de soluciones empresariales modulares basado en una arquitectura desacoplada, tipado estricto y un enfoque operativo _Zero-Ops_[cite: 1, 2].

El espacio de trabajo centraliza el desarrollo de dos plataformas de gestión de relaciones con clientes (CRM) que comparten un sistema de diseño visual unificado, manteniendo independientes sus reglas de dominio, bases de datos y flujos de negocio[cite: 1, 2].

---

## 🏗️ Topología del Proyecto

El monorepo está orquestado mediante **pnpm workspaces** para aislar estrictamente el cascarón de presentación de la lógica de negocio de cada aplicación[cite: 1, 2]:

```text
bunker-crm/
├── .devcontainer/              # Entorno de desarrollo estandarizado en contenedores[cite: 1]
├── docs/                       # Documentación viva, donante de UI y ADRs técnicos[cite: 1, 5]
├── packages/
│   └── ui/                     # Librería visual interna (@bunker/ui) basada en Material UI[cite: 1, 2]
├── apps/
│   ├── wmw-crm/                # CRM para gestión de socios y cuotas de club[cite: 1, 2]
│   │   ├── web/                # SPA React que consume @bunker/ui[cite: 1, 2]
│   │   └── api/                # Backend en FastAPI para lógica y extracción OCR[cite: 1, 2]
│   └── rh-crm/                 # CRM comercial con integración contable en Holded[cite: 1, 2]
│       ├── web/                # SPA React que consume @bunker/ui[cite: 1, 2]
│       └── api/                # Backend en FastAPI para pipeline y sincronización[cite: 1, 2]
├── pnpm-workspace.yaml         # Configuración del espacio de trabajo pnpm[cite: 1]
└── package.json                # Scripts globales de compilación y orquestación[cite: 1]
```
````

---

## 📦 Aplicaciones y Paquetes

### 1. `@bunker/ui` (`packages/ui`)

- **Propósito:** Cascarón visual común y agnóstico de negocio.

- **Contenido:** Temas, tipografías, componentes atómicos, layouts estructurados (`AppLayout`, `SideMenu`, `Header`) y tablas de datos generadas a partir del sistema de diseño de Material UI.

- **Regla de Oro:** 100% libre de lógica de dominio (no conoce conceptos de "socio", "lead" o "factura"); todo el contenido se parametriza vía contratos e interfaces estrictas de TypeScript.

### 2. `WMW CRM` (`apps/wmw-crm`)

- **Propósito:** Gestión ágil de membresías y socios de club (aprox. 200 socios).

- **Funcionalidades Clave:**
- Catálogo de socios y seguimiento de estados de cuota.

- Formulario de alta asistida con zona de _Drag & Drop_ para inspección visual de documentos.

- Procesamiento documental mediante visión artificial / OCR para auto-rellenado de fichas bajo cumplimiento estricto de GDPR.

### 3. `RH CRM` (`apps/rh-crm`)

- **Propósito:** Gestión comercial, prospección y seguimiento del ciclo de vida de clientes.

- **Funcionalidades Clave:**
- **Frontera Operativa (CRM SSOT):** Prospección, notas de seguimiento comercial, llamadas, tareas y pipeline de captación.

- **Frontera Financiera (Holded SSOT):** Holded se mantiene como la fuente de verdad inmutable para facturación pura, series fiscales y cobros contables.

- Entidades adaptadas a la fiscalidad española (NIF/CIF, personas físicas y jurídicas, recargo de equivalencia).

---

## 🛠️ Stack Tecnológico

### Frontend (Web Client)

- **Framework & Bundler:** React 19 compilado con Vite.

- **Lenguaje:** TypeScript bajo configuración _Pragmatic Strict_ (`strict: true`, `noImplicitAny: true`, `strictNullChecks: true`).

- **UI & Estilos:** Material UI (MUI v9) y Emotion (`@emotion/react`, `@emotion/styled`), encapsulados exclusivamente en `@bunker/ui`.

- **Formularios & Validación:** React Hook Form gestionado mediante `<Controller/>` y esquemas de validación estricta con Zod como única fuente de verdad.

- **Estado de Servidor:** TanStack Query (React Query) desacoplado mediante adaptadores de transporte con Fetch nativo.

### Backend & Almacenamiento

- **API:** FastAPI (Python) estructurado con Pydantic y SQLAlchemy/SQLModel.

- **Base de Datos:** PostgreSQL gestionado en la nube con _Connection Pooling_ estricto para evitar saturación de memoria.

- **Gestión de Archivos:** Almacenamiento en buckets de objetos seguros (ej. Cloudflare R2 / S3-compatible). Prohibido el almacenamiento de imágenes o PDFs como BLOBs en la base de datos relacional.

---

## 🏛️ Arquitectura Frontend: Patrón Hexagonal

Cada cliente web desacopla la red y la interfaz gráfica del dominio central mediante puertos y adaptadores:

- **Core / Dominio:** Entidades puras y esquemas Zod (sin dependencias de React ni de la red).

- **Puertos:** Interfaces TypeScript que definen los contratos requeridos por el sistema (ej. `CustomerRepository`, `SocioRepository`).

- **Adaptadores Secundarios (Infraestructura):** Implementaciones reales en Fetch y adaptadores simulados (_Mock Adapters_) en memoria con retrasos sintéticos para construir y probar la UI completa sin depender del backend activo (Fase 0).

- **Adaptadores Primarios (Presentación):** Componentes visuales que consumen `@bunker/ui` y se comunican con los puertos a través de custom hooks impulsados por TanStack Query.

---

## 🚀 Inicio Rápido

### Requisitos Previos

- Node.js (>= 20.x)
- pnpm (>= 9.x)
- Python (>= 3.11) para el desarrollo de APIs

### Instalación de dependencias

```bash
pnpm install

```

### Compilar el paquete visual compartido

```bash
pnpm --filter @bunker/ui run build

```

### Iniciar una aplicación en modo desarrollo

```bash
# Para ejecutar el frontend de WMW CRM
pnpm --filter @wmw-crm/web run dev

# Para ejecutar el frontend de RH CRM
pnpm --filter @rh-crm/web run dev

```

---

## 📋 Directrices de Desarrollo

1. **Aislamiento visual:** Las aplicaciones dentro de `apps/*` nunca deben importar directamente desde `@mui/material` ni dependencias de Emotion; todo componente visual debe provenir exportado desde `@bunker/ui`.

2. **Tipado inviolable:** Prohibido el uso de `any` o _type casting_ permisivo; todo tipo de datos de entrada debe inferirse de su respectivo esquema de Zod (`z.infer<...>`).

3. **Decisiones Técnicas:** Toda modificación arquitectónica o estructural de impacto debe registrarse en la documentación correspondiente dentro de la carpeta `docs/`.

---

### Detalles clave de esta definición:

- **Fronteras claras:** Separa con precisión el rol de `@bunker/ui` como lienzo común frente al dominio específico de `wmw-crm` (socios + OCR) y `rh-crm` (embudo comercial + Holded)[cite: 1, 2].
- **Rigor técnico:** Deja por escrito los estándares inmutables (React 19, Patrón Hexagonal, Zod SSOT, Zero-Ops y almacenamiento en buckets) para que cualquier persona —o agente IA— entienda la estructura al clonar el repositorio[cite: 2, 5].
