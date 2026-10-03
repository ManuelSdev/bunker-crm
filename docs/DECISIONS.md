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
