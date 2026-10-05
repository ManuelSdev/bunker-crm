# Plan de Extracción de Layout del Dashboard a `packages/ui`

Este documento detalla el plan técnico para extraer los componentes del layout del dashboard, desde las aplicaciones hacia el paquete de UI compartida (`packages/ui`).

## 1. Estructura de Archivos Propuesta

La estructura dentro de `packages/ui/src` quedará organizada de la siguiente manera para alojar los nuevos componentes de layout:

```
packages/ui/src/
├── components/
│   ├── layout/
│   │   ├── AppLayout.tsx
│   │   ├── Header.tsx
│   │   ├── SideMenu.tsx
│   │   └── index.ts
│   └── card/
│       ├── StatCard.tsx
│       └── index.ts
├── providers/
│   ├── BunkerProvider.tsx
│   └── index.ts
└── index.ts
```

- **`components/layout/`**: Contendrá los componentes estructurales del dashboard.
- **`components/card/`**: Albergará componentes de visualización de datos como `StatCard`.
- **`providers/`**: Incluirá el `BunkerProvider` para la gestión del tema.
- **`index.ts`**: Exportará todos los componentes públicos del paquete.

---

## 2. Interfaces TypeScript de Componentes

A continuación se definen las interfaces de `props` para cada componente a crear. Estas interfaces garantizan el desacoplamiento y la parametrización.

### `AppLayout.tsx`

El `AppLayout` es el orquestador principal que ensambla el `Header`, `SideMenu` y el contenido de la página.

```typescript
// packages/ui/src/components/layout/AppLayout.tsx

import { ReactNode } from "react";

export interface AppLayoutProps {
  /** Título a mostrar en el Header */
  pageTitle: string;

  /** Contenido principal de la página a renderizar */
  children: ReactNode;

  /**
   * Define los elementos de navegación para el SideMenu.
   * Cada item puede tener sub-items anidados.
   */
  menuItems: NavItem[];

  /**
   * Configuración del perfil de usuario para el Header.
   */
  userProfile: UserProfile;
}

export interface NavItem {
  /** Texto a mostrar para el item de menú */
  label: string;
  /** Icono a mostrar junto al label (componente React) */
  icon: React.ElementType;
  /** Ruta de navegación */
  path: string;
  /** Opcional: Array de sub-items para menús anidados */
  children?: NavItem[];
}

export interface UserProfile {
  /** Nombre completo del usuario */
  fullName: string;
  /** URL de la imagen de avatar del usuario */
  avatarUrl?: string;
  /** Callback que se ejecuta al hacer clic en "Cerrar Sesión" */
  onLogout: () => void;
}
```

### `SideMenu.tsx`

Componente de navegación lateral, totalmente controlado por `props`.

```typescript
// packages/ui/src/components/layout/SideMenu.tsx

import { NavItem } from "./AppLayout.tsx";

export interface SideMenuProps {
  /** Array de objetos que definen la estructura de navegación */
  items: NavItem[];
  /** Estado que controla si el menú está abierto o colapsado */
  isOpen: boolean;
  /** Callback para cambiar el estado de apertura del menú */
  onToggle: () => void;
}
```

### `Header.tsx`

Barra superior que muestra el título de la página y el menú de usuario.

```typescript
// packages/ui/src/components/layout/Header.tsx

import { UserProfile } from "./AppLayout.tsx";

export interface HeaderProps {
  /** Título de la página actual, provisto por AppLayout */
  title: string;
  /** Objeto con la información del perfil de usuario */
  user: UserProfile;
  /** Callback para alternar la visibilidad del SideMenu en modo responsive */
  onMenuToggle: () => void;
}
```

### `StatCard.tsx`

Tarjeta genérica para mostrar una métrica clave.

```typescript
// packages/ui/src/components/card/StatCard.tsx

export interface StatCardProps {
  /** Título de la métrica (ej: "Ingresos Totales") */
  title: string;
  /** Valor principal de la métrica (ej: "$45,231.89") */
  value: string;
  /**
   * Descripción o cambio porcentual (ej: "+20.1% desde el mes pasado")
   * Puede ser un string o un nodo para mayor flexibilidad.
   */
  change?: React.ReactNode;
  /** Icono a mostrar en la tarjeta (componente React) */
  icon: React.ElementType;
}
```

---

## 3. Checklist de Implementación (Para Modo Code)

Esta es la secuencia de tareas a ejecutar por el modo `code` para implementar este plan.

- [ ] **1. Modificar `BunkerProvider`:**
  - [ ] Añadir modo oscuro al tema de MUI.
  - [ ] Exportar un hook `useBunkerTheme` para alternar entre modo claro/oscuro.
  - [ ] Mover a `packages/ui/src/providers/BunkerProvider.tsx`.

- [ ] **2. Crear Archivos de Componentes:**
  - [ ] Crear `packages/ui/src/components/layout/Header.tsx`.
  - [ ] Crear `packages/ui/src/components/layout/SideMenu.tsx`.
  - [ ] Crear `packages/ui/src/components/layout/AppLayout.tsx`.
  - [ ] Crear `packages/ui/src/components/card/StatCard.tsx`.
  - [ ] Crear archivos `index.ts` en cada nuevo directorio para exportar los componentes.

- [ ] **3. Implementar `Header.tsx`:**
  - [ ] Usar `AppBar`, `Toolbar`, `Typography`, `IconButton` y `Menu` de `@mui/material`.
  - [ ] Renderizar el `title` dinámicamente.
  - [ ] Implementar el menú de perfil con `Avatar` y `Menu` que muestre `user.fullName` y un botón de Logout que llame a `user.onLogout`.
  - [ ] Añadir un `IconButton` para `onMenuToggle` (visible en móvil).

- [ ] **4. Implementar `SideMenu.tsx`:**
  - [ ] Usar `Drawer` de `@mui/material` con variante `permanent` en desktop y `temporary` en móvil.
  - [ ] Mapear `items` para renderizar `List`, `ListItem`, `ListItemIcon` y `ListItemText`.
  - [ ] Implementar lógica para `Collapse` en items anidados.
  - [ ] El estado `isOpen` controlará la apertura del `Drawer`.

- [ ] **5. Implementar `StatCard.tsx`:**
  - [ ] Usar `Card`, `CardContent`, `Typography` y `Box` de `@mui/material`.
  - [ ] Estructurar la tarjeta para mostrar `icon`, `title`, `value` y `change` de forma clara.
  - [ ] No usar ninguna librería de gráficos, solo componentes base de MUI.

- [ ] **6. Implementar `AppLayout.tsx`:**
  - [ ] Ensamblar `Header` y `SideMenu`.
  - [ ] Usar un `useState` interno para gestionar el estado de apertura del `SideMenu`.
  - [ ] Pasar las `props` correspondientes (`pageTitle`, `menuItems`, `userProfile`) a los componentes hijos.
  - [ ] Renderizar `children` en el área de contenido principal.

- [ ] **7. Actualizar `packages/ui/src/index.ts`:**
  - [ ] Exportar todos los nuevos componentes (`AppLayout`, `Header`, `SideMenu`, `StatCard`) e interfaces (`AppLayoutProps`, `NavItem`, `UserProfile`, `StatCardProps`).
  - [ ] Exportar el `BunkerProvider` y el hook `useBunkerTheme`.

- [ ] **8. Verificación Final:**
  - [ ] Ejecutar `pnpm --filter @bunker/ui run build` para asegurar que no hay errores de tipo y el paquete compila correctamente.
