# Plan de Extracción de Componentes de Layout a `packages/ui`

Este documento detalla el plan para extraer los componentes de layout de la aplicación a un paquete de UI centralizado, asegurando su reutilización y aislamiento.

## 1. Árbol de Archivos Propuesto

La estructura dentro de `packages/ui/src/` será la siguiente para albergar los nuevos componentes de layout:

```

packages/ui/src/

├── components/

│ ├── layout/

│ │ ├── AppLayout.tsx

│ │ ├── Header.tsx

│ │ ├── SideMenu.tsx

│ │ └── index.ts

│ └── cards/

│ ├── StatCard.tsx

│ └── index.ts

├── theme/

│ ├── BunkerProvider.tsx

│ └── index.ts

└── index.ts

```

## 2. Interfaces TypeScript para Props

A continuación se definen las interfaces para cada componente, garantizando la flexibilidad y el tipado estricto.

### `BunkerProvider`

Amplía el `ThemeProvider` de MUI para incluir un modo oscuro/claro y configuraciones de tema personalizadas.

```typescript
// packages/ui/src/theme/BunkerProvider.tsx

import { ReactNode } from "react";

export type ThemeMode = "light" | "dark";

export interface BunkerProviderProps {
  children: ReactNode;

  mode: ThemeMode;
}
```

### `SideMenu`

Componente de navegación lateral, totalmente configurable a través de `props`.

```typescript
// packages/ui/src/components/layout/SideMenu.tsx

export interface MenuItem {
  id: string;

  label: string;

  icon?: React.ReactNode;

  path: string;

  children?: MenuItem[];
}

export interface SideMenuProps {
  menuItems: MenuItem[];

  open: boolean;

  onToggle: () => void;
}
```

### `Header`

Barra superior que muestra un título dinámico y una sección para el perfil del usuario.

```typescript
// packages/ui/src/components/layout/Header.tsx

import { ReactNode } from "react";

export interface HeaderProps {
  title: string;

  userProfile: ReactNode;

  onMenuToggle: () => void;
}
```

### `AppLayout`

Ensambla `Header`, `SideMenu` y el contenido principal de la aplicación.

```typescript
// packages/ui/src/components/layout/AppLayout.tsx

import { ReactNode } from "react";

import { MenuItem } from "./SideMenu";

export interface AppLayoutProps {
  menuItems: MenuItem[];

  headerTitle: string;

  userProfile: ReactNode;

  children: ReactNode;
}
```

### `StatCard`

Tarjeta para mostrar métricas clave. Agnóstica a la lógica de negocio.

```typescript
// packages/ui/src/components/cards/StatCard.tsx

export interface StatCardProps {
  title: string;

  value: string;

  icon?: React.ReactNode;

  trend?: {
    value: string;

    direction: "up" | "down" | "neutral";
  };
}
```

## 3. Checklist de Implementación para el Modo `Code`

El modo `code` deberá seguir estos pasos en orden:

[ ] 1. Crear la estructura de directorios propuesta en `packages/ui/src/components/layout`, `packages/ui/src/components/cards` y `packages/ui/src/theme`.
[ ] 2. Implementar `BunkerProvider.tsx` con la capacidad de alternar entre tema claro y oscuro.
[ ] 3. Implementar el componente `SideMenu.tsx` basado en `@mui/material/Drawer` y las props de su interfaz.
[ ] 4. Implementar el componente `Header.tsx` basado en `@mui/material/AppBar` y las props de su interfaz.
[ ] 5. Implementar el componente `StatCard.tsx` usando `@mui/material/Card` y `Typography`.
[ ] 6. Implementar el layout `AppLayout.tsx`, que integra `Header`, `SideMenu` y el contenido (`children`).
[ ] 7. Crear y/o actualizar los archivos `index.ts` para exportar todos los nuevos componentes y tipos.
[ ] 8. Ejecutar `pnpm --filter @bunker/ui run build` y verificar que compila sin errores.
