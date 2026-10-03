**Constitución del proyecto**

1. **`docs/SYSTEM_DESIGN.md` (La Superestructura de Negocio):**

Aquí definimos tú y yo:

- Qué es `wmw-crm`: el alcance real de la Fase 1 (ingesta de altas de socios, fichas de contacto, control de cuotas).

- Las entidades principales y sus campos mínimos.

- La estrategia de datos: TanStack Query v5 + `fetch` nativo tipado a través de puertos y adaptadores (dejando los mocks listos para no depender de la API al arrancar).
