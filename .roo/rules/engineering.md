# Constitución Técnica - Búnker Suite

### 1. Fronteras de Arquitectura y Monorepo

- Todo componente visual vive exclusivamente en `packages/ui`.
- Las aplicaciones en `apps/*` NUNCA importan directamente de `@mui/material` ni `@emotion/*`; todo se consume exportado desde `@bunker/ui`.
- Prohibido instalar librerías externas en npm/pnpm sin la aprobación explícita del usuario.

### 2. Contratos y TypeScript Estricto

- Prohibido terminantemente el uso de `any`.
- Toda prop de componente debe contar con su `interface` TypeScript explícita, descriptiva y exportada.
- Los componentes deben ser agnósticos al negocio: cero textos de CRM o rutas fijas hardcodeadas (todo entra por props).

### 3. Protocolo Operativo y Calidad (DoD)

- El modo Architect NUNCA escribe código ejecutable (`.ts`, `.tsx`); solo genera especificaciones, esquemas y checklists en Markdown.
- El modo Code no da una tarea por finalizada sin ejecutar y verificar con éxito `pnpm --filter @bunker/ui run build`.

### 4. Reglas de Poda y Suplantación Estricta:

- Prohibido importar o referenciar `@mui/x-data-grid` o `@mui/x-data-grid-pro`.Utiliza exclusivamente @mui/material puro

# Constitución de IA - Reglas de Ingeniería (Búnker CRM)

## 1. Dualidad Operativa y Flujo de Trabajo

- **Rol Architect**: Inspecciona el entorno y genera contratos (árbol de directorios, interfaces TS/esquemas Zod y checklist atómico)[cite: 2]. Tiene prohibido ejecutar comandos peligrosos o realizar edición destructiva de código fuente[cite: 2].
- **Entregables del Arquitecto (DoD)**: Antes de escribir código JSX, debe presentar: ruta exacta de archivos, definición formal de interfaces (Props), mapeo del barril de exportaciones (`index.ts`) y un checklist atómico secuencial[cite: 3].
- **Rol Code**: Es el ejecutor ciego que trabaja sobre tareas atómicas definidas por el Architect[cite: 2]. No puede dar una tarea por cerrada sin verificar la compilación a cero errores (`npm run build` o `pnpm run build`)[cite: 2].

## 2. Restricciones de Stack y Tipado

- **Fuente de Verdad Única (SSOT)**: Es obligatorio usar Zod para inferir automáticamente los tipos de TypeScript en el frontend[cite: 2, 6, 7].
- **Tipado Inviolable**: Queda estrictamente prohibido el uso de `any` o type casting permisivo (`as unknown`)[cite: 6, 7]. El compilador operará en modo "Pragmatic Strict" (`strict: true`, `noImplicitAny: true`)[cite: 2, 6, 7].
- **Formularios y Estado**: Se usará Material UI + React Hook Form gestionado mediante el componente `<Controller/>`[cite: 2, 6, 7]. Prohibido el uso de `useState` para el control de formularios[cite: 2].

## 3. Prohibiciones y Líneas Rojas (Aislamiento de @bunker/ui)

- **Agnosticismo Radical de Dominio**: Ningún componente visual puede contener literales o textos quemados (ej. "Dashboard", "Socios")[cite: 3]. Todo texto, título o etiqueta debe recibirse estrictamente como prop[cite: 3].
- **Cero Acoplamiento de Rutas**: El cascarón visual no debe importar `react-router` ni depender de sistemas de navegación[cite: 3]. Los enlaces se inyectarán mediante callbacks o props polimórficas[cite: 3].
- **Reemplazo de Componentes MUI Complejos**: Prohibido usar `@mui/x-data-grid` y `@mui/x-date-pickers`[cite: 3]. Si el diseño lo requiere, se sustituirán por tablas atómicas con `@mui/material/Table` estándar y `<TextField type="date"/>`[cite: 3].
- **Manipulación de Fechas**: Prohibido instalar librerías externas como `moment.js` o `dayjs`[cite: 1, 2]. Se debe usar la API nativa `Intl` o `Date` de JavaScript[cite: 1, 2].
- **Iconografía y Assets**: Prohibido importar iconos estáticos o imágenes locales incrustadas en los componentes[cite: 3]. Deben pasarse como nodos opcionales por props (`icon?: React.ReactNode`)[cite: 3].

## 4. Arquitectura Hexagonal y Fase 0

- **Independencia del Dominio**: El código dentro de los directorios `core/` o `domain/` no puede importar librerías de infraestructura (ni React, ni FastAPI, ni clientes HTTP)[cite: 6, 7].
- **Transporte vs Estado**: Prohibido usar `fetch` o `axios` directamente dentro de hooks o componentes de interfaz[cite: 4]. Las llamadas de red operarán a través de Adaptadores Secundarios gobernados por TanStack Query[cite: 4, 6, 7].
- **Adaptadores Mock (Fase 0)**: Para construir y probar las vistas iniciales, se exige la implementación de adaptadores simulados en memoria (Mock Adapters) con demoras artificiales antes de conectar APIs reales[cite: 2, 4, 6, 7].
