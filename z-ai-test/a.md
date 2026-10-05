Cosa más rara, tío. Mira, ahora mismo tengo esto en un archivo que se llama plan de extracción. # Plan de Extracción de Componentes de Layout a `packages/ui`

Este documento detalla el plan para extraer los componentes de layout de la aplicación a un paquete de UI centralizado, asegurando su reutilización y aislamiento.

## 1. Árbol de Archivos Propuesto

La estructura dentro de `packages/ui/src/` será la siguiente para albergar los nuevos componentes de layout:

```
packages/ui/src/
├── components/
│   ├── layout/
│   │   ├── AppLayout.tsx
│   │   ├── Header.tsx
│   │   ├── SideMenu.tsx
│   │   └── index.ts
│   └── cards/
│       ├── StatCard.tsx
│       └── index.ts
├── theme/
│   ├── BunkerProvider.tsx
│   └── index.ts
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

- [ ] 1. Crear la estructura de directorios propuesta en `packages/ui/src/components/layout`, `packages/ui/src/components/cards` y `packages/ui/src/theme`.
- [ ] 2. Implementar `BunkerProvider.tsx` con la capacidad de alternar entre tema claro y oscuro.
- [ ] 3. Implementar el componente `SideMenu.tsx` basado en `@mui/material/Drawer` y las props de su interfaz.
- [ ] 4. Implementar el componente `Header.tsx` basado en `@mui/material/AppBar` y las props de su interfaz.
- [ ] 5. Implementar el componente `StatCard.tsx` usando `@mui/material/Card` y `Typography`.
- [ ] 6. Implementar el layout `AppLayout.tsx`, que integra `Header`, `SideMenu` y el contenido (`children`).
- [ ] 7. Crear y/o actualizar los archivos `index.ts` para exportar todos los nuevos componentes y tipos.
     [ ] 8. Ejecutar `pnpm --filter @bunker/ui run build` y verificar que compila sin errores. Cuando le di a save me apareció otro checkpoint, me subió la cuenta a 12 céntimos y ahora tengo una pantalla de estas partidas como de cambios y me pone extraction plan md: original y una flecha doble a roo, s changes editable. Y en el original tengo esto. # Plan de Extracción: Dashboard Layout a `packages/ui`

Este documento detalla la estrategia y los pasos técnicos para extraer los componentes del layout principal (Dashboard) desde las aplicaciones y consolidarlos como un conjunto de componentes reutilizables y agnósticos al negocio dentro de `packages/ui`.

## 1. Estructura de Archivos Propuesta

La nueva estructura dentro de `packages/ui/src` será la siguiente para albergar los componentes del layout:

```
packages/ui/src/
├── components/
│   ├── AppLayout/
│   │   ├── AppLayout.tsx
│   │   └── index.ts
│   ├── Header/
│   │   ├── Header.tsx
│   │   └── index.ts
│   ├── SideMenu/
│   │   ├── SideMenu.tsx
│   │   └── index.ts
│   └── StatCard/
│       ├── StatCard.tsx
│       └── index.ts
├── providers/
│   └── BunkerProvider.tsx  // Se mantiene y se ajusta si es necesario
└── index.ts                // Se actualizará para exportar los nuevos componentes
```

## 2. Interfaces TypeScript de Props

A continuación se definen las interfaces para cada componente, garantizando que sean completamente configurables y sin lógica de negocio.

### `SideMenu.tsx`

```typescript
import { ReactNode } from "react";

export interface SideMenuItem {
  id: string;
  label: string;
  icon?: ReactNode;
  path: string;
  children?: SideMenuItem[];
}

export interface SideMenuProps {
  items: SideMenuItem[];
  open: boolean;
  onToggle: () => void;
}
```

### `Header.tsx`

```typescript
import { ReactNode } from "react";

export interface UserProfile {
  name: string;
  avatarUrl?: string;
  email?: string;
}

export interface HeaderProps {
  title: string;
  userProfile: UserProfile;
  onLogout: () => void;
  onToggleMenu: () => void;
}
```

### `StatCard.tsx`

```typescript
import { ReactNode } from "react";

export interface StatCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  trend?: {
    direction: "up" | "down";
    percentage: number;
  };
}
```

### `AppLayout.tsx`

```typescript
import { ReactNode } from "react";
import { SideMenuItem } from "../SideMenu";
import { UserProfile } from "../Header";

export interface AppLayoutProps {
  children: ReactNode;
  menuItems: SideMenuItem[];
  userProfile: UserProfile;
  onLogout: () => void;
  initialTitle: string;
}
```

## 3. Checklist de Implementación (Para el Modo Code)

El siguiente checklist detalla los pasos atómicos a seguir para la implementación.

- [ ] **Estructura:** Crear la estructura de directorios propuesta en `packages/ui/src/components/`.
- [ ] **Componente `SideMenu`:**
- [ ] Crear `packages/ui/src/components/SideMenu/SideMenu.tsx` y su `index.ts`.
- [ ] Implementar el componente `SideMenu` usando `@mui/material` (`Drawer`, `List`, `ListItem`, etc.) basado en la interfaz `SideMenuProps`.
- [ ] Asegurar que sea responsive (colapsable en móvil).
- [ ] **Componente `Header`:**
- [ ] Crear `packages/ui/src/components/Header/Header.tsx` y su `index.ts`.
- [ ] Implementar el componente `Header` usando `@mui/material` (`AppBar`, `Toolbar`, `Typography`, `Avatar`, `Menu`, etc.) basado en la interfaz `HeaderProps`.
- [ ] El título debe ser dinámico a partir de las props.
- [ ] **Componente `StatCard`:**
- [ ] Crear `packages/ui/src/components/StatCard/StatCard.tsx` y su `index.ts`.
- [ ] Implementar el componente `StatCard` usando `@mui/material` (`Card`, `CardContent`, `Typography`) basado en la interfaz `StatCardProps`.
- [ ] **Componente `AppLayout`:**
- [ ] Crear `packages/ui/src/components/AppLayout/AppLayout.tsx` y su `index.ts`.
- [ ] Ensamblar `SideMenu` y `Header`, gestionando el estado de apertura del menú.
- [ ] Renderizar el contenido (`children`) en el área principal.
- [ ] **`BunkerProvider`:**
- [ ] Revisar y ampliar `packages/ui/src/providers/BunkerProvider.tsx` para incluir y unificar los modos oscuro/claro si es necesario.
- [ ] **Exportaciones:**
- [ ] Actualizar `packages/ui/src/index.ts` para exportar todos los nuevos componentes (`AppLayout`, `Header`, `SideMenu`, `StatCard`) y sus interfaces.
- [ ] **Validación:**
- [ ] Ejecutar `pnpm --filter @bunker/ui run build` para verificar que el paquete compila correctamente sin errores.
      Y en la parte derecha lo que yo entiendo que me pondría, porque está en verde, tengo esto otro. # Plan de Extracción de Componentes de Layout a `packages/ui`

Este documento detalla el plan para extraer los componentes de layout de la aplicación a un paquete de UI centralizado, asegurando su reutilización y aislamiento.

## 1. Árbol de Archivos Propuesto

La estructura dentro de `packages/ui/src/` será la siguiente para albergar los nuevos componentes de layout:

```
packages/ui/src/
├── components/
│   ├── layout/
│   │   ├── AppLayout.tsx
│   │   ├── Header.tsx
│   │   ├── SideMenu.tsx
│   │   └── index.ts
│   └── cards/
│       ├── StatCard.tsx
│       └── index.ts
├── theme/
│   ├── BunkerProvider.tsx
│   └── index.ts
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

- [ ] 1. Crear la estructura de directorios propuesta en `packages/ui/src/components/layout`, `packages/ui/src/components/cards` y `packages/ui/src/theme`.
- [ ] 2. Implementar `BunkerProvider.tsx` con la capacidad de alternar entre tema claro y oscuro.
- [ ] 3. Implementar el componente `SideMenu.tsx` basado en `@mui/material/Drawer` y las props de su interfaz.
- [ ] 4. Implementar el componente `Header.tsx` basado en `@mui/material/AppBar` y las props de su interfaz.
- [ ] 5. Implementar el componente `StatCard.tsx` usando `@mui/material/Card` y `Typography`.
- [ ] 6. Implementar el layout `AppLayout.tsx`, que integra `Header`, `SideMenu` y el contenido (`children`).
- [ ] 7. Crear y/o actualizar los archivos `index.ts` para exportar todos los nuevos componentes y tipos.
- [ ] 8. Ejecutar `pnpm --filter @bunker/ui run build` y verificar que compila sin errores.
- Como has visto en la captura, el archivo extraction plan ya está creado y ahora quiere editarlo. Entonces, lo que no sé es qué cojones está haciendo, qué coño es el archivo extraction plan, qué coño es el archivo extraction plan original que te he puesto ahí, que me aparece a la izquierda en rojo, y qué coño es este otro último que te he puesto, que me sale en verde a la derecha.
