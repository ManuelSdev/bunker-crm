¡A la orden, camarada! Este es el tercer documento, el **Compendio Técnico de Arquitectura**.

A diferencia de la constitución de la IA (que era todo prohibiciones y reglas cortas), este archivo está diseñado para que cualquier agente en modo **Architect** entienda cómo está construido el sistema, cómo fluyen los datos y dónde debe ubicar cada pieza de código sin romper el aislamiento.

Aquí tienes la propuesta completa y estructurada para tu `docs/ARCHITECTURE.md` (o `HEXAGONAL_ARCHITECTURE.md`):

---

### Propuesta para `docs/ARCHITECTURE.md`

# Arquitectura del Sistema: Patrón Hexagonal Unificado (Búnker CRM)

Este documento define la estructura base y el flujo de datos para las aplicaciones del Búnker CRM. El ecosistema está orquestado mediante pnpm workspaces para aislar el cascarón de presentación visual de la lógica de negocio[cite: 5, 6].

Tanto el Frontend como el Backend implementan el Patrón Hexagonal (Puertos y Adaptadores) con el objetivo fundacional de que el núcleo de la aplicación no sepa nada del mundo exterior[cite: 1, 5, 6].

## 1. Topología del Monorepo

El monorepo separa estrictamente la interfaz genérica de las aplicaciones de negocio:

- **`packages/ui` (@bunker/ui)**: Es el cascarón visual común basado en Material UI v9[cite: 5, 6]. Es 100% libre de lógica de dominio y no conoce conceptos de negocio; se parametriza exclusivamente vía contratos TypeScript[cite: 5, 6].
- **`apps/wmw-crm`**: Aplicación para gestión de socios y cuotas de club (SPA React 19 + FastAPI)[cite: 5, 6].
- **`apps/rh-crm`**: Aplicación de gestión comercial con sincronización contable en Holded (SPA React 19 + FastAPI)[cite: 5, 6].

## 2. Las Capas del Hexágono

La arquitectura divide el código en tres capas fundamentales e inviolables para evitar el acoplamiento:

- **Dominio / Núcleo (Core)**: Contiene la lógica pura, entidades puras y esquemas de validación (Zod en frontend, Pydantic en backend)[cite: 1, 5, 6]. Es totalmente agnóstico de librerías de UI (React), del DOM, de frameworks (FastAPI) y de la red[cite: 1, 5, 6].
- **Puertos (Ports)**: Son interfaces puras de TypeScript (o Protocolos ABC en Python) que definen qué operaciones necesita el sistema sin detallar su implementación (ej. `CustomerRepository`)[cite: 1, 2, 5, 6].
- **Adaptadores Primarios (Driving / Conducentes)**: Son los que inician la acción[cite: 1]. En el frontend son React, Material UI y React Hook Form[cite: 1, 2]. En el backend son las rutas y controladores de FastAPI (`@router.get`)[cite: 5, 6].
- **Adaptadores Secundarios (Driven / Conducidos)**: Son invocados por el núcleo para hablar con el mundo exterior[cite: 1]. En el frontend es el cliente HTTP basado en Fetch nativo[cite: 1, 2, 5, 6]. En el backend son las implementaciones de bases de datos (SQLAlchemy/PostgreSQL) o integraciones como el SDK de Holded[cite: 5, 6].

## 3. Estructura Física de Carpetas (Frontend)

Para mantener a los agentes encarrilados, las aplicaciones cliente (`apps/*/web/src/`) siguen esta estructura estricta[cite: 1, 2]:

```text
src/
├── core/                        # NÚCLEO INVIOLABLE (Sin React, sin red)
│   ├── domain/                  # Entidades y Schemas Zod (Customer.ts)
│   └── ports/                   # Interfaces TypeScript (CustomerRepository.ts)
│
├── infrastructure/              # ADAPTADORES SECUNDARIOS (Mundo exterior)
│   └── api/
│       ├── httpClient.ts        # Cliente Fetch tipado base
│       ├── HttpCustomerAdapter.ts  # Implementación contra la API real
│       └── MockCustomerAdapter.ts  # Implementación simulada en memoria
│
└── presentation/                # ADAPTADORES PRIMARIOS (Interfaz de usuario)
    ├── theme/                   # Configuración del tema Material UI
    ├── components/              # Componentes UI reutilizables
    └── modules/                 # Vistas funcionales por dominio

```

## 4. Estrategia de Desarrollo: Fase 0 (Mock Adapters)

El patrón hexagonal permite construir la aplicación frontend completa sin depender del backend:

- Para construir y probar las vistas iniciales, se exige la implementación de adaptadores simulados en memoria (Mock Adapters) que cumplan con la interfaz del Puerto.

- Estos mocks deben incluir demoras artificiales (ej. 500ms) para simular latencia de red real.

- Cuando la API real esté lista, la transición se realiza cambiando una sola línea de inyección de dependencias hacia el `HttpAdapter`, sin modificar ninguna línea de código de la Interfaz de Usuario.

## 5. Transporte vs. Estado de Servidor

Queda estrictamente prohibido mezclar la tubería de comunicación (HTTP) con la gestión del ciclo de vida de los datos en la vista:

- **Transporte**: Las peticiones reales se realizan mediante la API nativa Fetch a través de los Adaptadores Secundarios. Queda prohibido usar `fetch` o Axios directamente dentro de hooks o componentes de interfaz.

- **Estado de Servidor**: TanStack Query (React Query) es el cerebro de sincronización de la aplicación. Se encarga de la caché, deduplicación de llamadas, reintentos y estados derivados (`isLoading`, `isError`).

El flujo completo es: Componente UI -> Hook de TanStack Query -> Puerto (Interface TS) -> Adaptador Secundario (Fetch o Mock).

---

**Resumen de la jugada:**
Con este documento (`ARCHITECTURE.md`), el primer archivo que hicimos (`.roo/rules/engineering.md`) y el README general, tienes tu **Pirámide de Contexto** perfectamente estructurada.

- **El README** saluda y ubica.
- **El archivo rules** pone los grilletes y prohíbe malas prácticas al vuelo.
- **El ARCHITECTURE.md** es el mapa de carreteras para que el agente Architect sepa cómo diseñar las carpetas y dónde conectar React Query con Zod sin acoplar la UI a la red.
