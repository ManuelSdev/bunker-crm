**Architecture Decision Records - ADRs**

El registro inmutable de compromisos técnicos:

- _ADR-001:_ Monorepo con `pnpm workspaces` y Dev Container aislado en Podman rootless.

- _ADR-002:_ Separación estricta: `packages/ui` como librería visual agnóstica; aplicaciones cliente consumiendo vía workspace.

- _ADR-003:_ Validación y tipado cerrado mediante Zod como fuente única de verdad.

- _ADR-004:_ Adopción de TanStack Query para server-state y descarte de Axios en favor de `fetch` nativo.

# Reglas de Arquitectura - Búnker Suite

1. **Aislamiento del Monorepo:**
   - Todo componente visual vive exclusivamente en `packages/ui`.
   - Las aplicaciones en `apps/*` NUNCA importan directamente de `@mui/material` ni `@emotion/*`; todo debe consumirse exportado desde `@bunker/ui`.
2. **TypeScript Estricto:**
   - Prohibido el uso de `any`.
   - Todas las props de componentes deben tener su interfaz TypeScript explícita y exportada.
3. **Extracción del Donante:**
   - Desacoplar cualquier texto o dato estático: los componentes deben recibir sus datos mediante props (títulos, menús, rutas, usuarios).

Actúa como Arquitecto de Software Senior. Inspecciona el archivo docs/MUI_DASHBOARD_DONOR.md y el paquete packages/ui.

Tu objetivo exclusivo en este turno es diseñar el plan de extracción del lienzo visual genérico (Dashboard Layout) hacia packages/ui, cumpliendo estas restricciones:

1. Aislamiento estricto: Todo el código visual debe residir dentro de packages/ui. Ningún componente debe contener textos de negocio hardcodeados; todo el contenido (títulos, rutas del menú lateral, datos del usuario) debe entrar mediante props con interfaces TypeScript explícitas y exportadas.
2. Dependencias mínimas: Identifica qué piezas del donante requieren dependencias externas complejas (como @mui/x-charts o @mui/x-data-grid) y descártalas por ahora para priorizar los primitivos esenciales:
   - ThemeProvider y paleta base (modo oscuro/claro).
   - SideMenu (barra lateral responsive).
   - Header (barra superior con breadcrumbs y acciones).
   - AppLayout (contenedor que ensambla SideMenu + Header + children).
   - StatCard (tarjeta genérica de métrica).
3. No escribas código de implementación todavía: Genera un checklist atómico de extracción archivo por archivo con sus respectivas interfaces de TypeScript propuestas.
