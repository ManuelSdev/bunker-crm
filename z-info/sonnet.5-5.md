# Plano técnico: extracción del Dashboard Layout a `@bunker/ui`

No escribí ni edité nada en disco. No leí [`docs/extraction-plan.md`](docs/extraction-plan.md) ni [`BunkerProvider.tsx`](BunkerProvider.tsx), porque la lectura fue denegada. Todo lo que dice este plano sobre el `BunkerProvider` actual es por tanto una suposición, y el paso 0 del checklist obliga a leerlo antes de tocarlo.

## 0. Hallazgos que condicionan el plan

1. **El build actual está roto.** [`packages/ui/src/index.ts`](packages/ui/src/index.ts:2) exporta `./BunkerBadge`, `./BunkerProvider` y `./ActionCard`, pero `packages/ui/src/` solo contiene `index.ts`. Los tres archivos están sueltos en la raíz de `/workspaces`. Hay que moverlos a `packages/ui/src` antes de cualquier otra cosa.
2. **`tsc` emitiría archivos dentro de `src/`.** [`packages/ui/tsconfig.json`](packages/ui/tsconfig.json) tiene `declaration: true`, no tiene `outDir` ni `noEmit`, y el paquete se consume desde `src/index.ts`. Con ese `build`, `tsc` crearía `.js` y `.d.ts` junto al código fuente. Propongo `noEmit: true` y quitar `declaration`, de modo que `build` solo verifique tipos. **Necesito tu aprobación para este cambio.**
3. **Las apps no pueden importar de MUI.** Si solo exportamos los 5 primitivos, las apps no tendrán `Stack`, `Typography` ni `Grid` para maquetar el contenido, porque la regla las obliga a pasar por `@bunker/ui`. Propongo reexportar esos primitivos en `primitives.ts`, junto con `Box` y `Container`, que ya se exportan. No agrega ninguna librería. **Necesito tu aprobación para este cambio.**
4. **Dependencias.** `@mui/material`, `@mui/icons-material` y `@emotion/*` ya están en [`packages/ui/package.json`](packages/ui/package.json). No hace falta instalar nada. No se usará `prop-types`, `@mui/x-*` ni `react-router`.

## 1. Poda del donante

| Donante                                                                                                                               | Decisión                                                                                            |
| ------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `x-charts`, `SparkLineChart`, `AreaGradient`, `getDaysInMonth`                                                                        | Se descartan. `StatCard` ofrece un slot `footer` en su lugar.                                       |
| `x-date-pickers`, `x-data-grid-pro`, `x-tree-view` y sus `customizations`                                                             | Se descartan.                                                                                       |
| `CustomDatePicker`, `Search`, `NavbarBreadcrumbs`, `MainGrid`, `AppNavbar`, `CardAlert`, `SelectContent`, `OptionsMenu`, `MenuButton` | Se descartan. Se sustituyen por slots `ReactNode`: `brand`, `footerSlot`, `userActions`, `actions`. |
| `AppTheme` y `shared-theme/*`                                                                                                         | Se reemplazan por `createBunkerTheme` y `BunkerProvider`.                                           |
| Textos fijos ("Riley Carter", "Home", "Analytics", `+25%`, `Open notifications`) y rutas                                              | Se eliminan. Todo entra por props.                                                                  |
| `PropTypes`                                                                                                                           | Se eliminan. Los tipos van en TypeScript.                                                           |

## 2. Árbol propuesto de `packages/ui/src/`

```text
packages/ui/src/
├── index.ts                      # Barril público (componentes, hooks, tipos)
├── primitives.ts                 # Reexports de MUI: Box, Container, Stack, Typography, Grid
├── types.ts                      # BunkerUser y tipos compartidos
├── theme/
│   ├── createBunkerTheme.ts      # (mode, tokens) => Theme
│   └── theme.types.ts            # BunkerColorMode, BunkerThemeTokens
├── provider/
│   ├── BunkerProvider.tsx        # Movido desde la raíz y ampliado
│   ├── BunkerColorModeContext.ts # Contexto del modo de color
│   ├── useBunkerColorMode.ts     # Hook de consumo
│   ├── BunkerProvider.types.ts
│   └── index.ts
└── components/
    ├── BunkerBadge/              # Movido desde la raíz, sin cambios de lógica
    │   ├── BunkerBadge.tsx
    │   └── index.ts
    ├── ActionCard/               # Movido desde la raíz, sin cambios de lógica
    │   ├── ActionCard.tsx
    │   └── index.ts
    ├── SideMenu/
    │   ├── SideMenu.tsx
    │   ├── SideMenu.types.ts
    │   └── index.ts
    ├── Header/
    │   ├── Header.tsx
    │   ├── Header.types.ts
    │   └── index.ts
    ├── AppLayout/
    │   ├── AppLayout.tsx
    │   ├── AppLayout.types.ts
    │   └── index.ts
    └── StatCard/
        ├── StatCard.tsx
        ├── StatCard.types.ts
        └── index.ts
```

Cada carpeta de componente tiene su `index.ts` con `export *`. Los tipos viven en `*.types.ts` y se exportan desde el barril.

## 3. Interfaces TypeScript

### 3.1 `types.ts` (compartido)

```ts
import type { ReactNode } from "react";

export interface BunkerUser {
  name: string;
  email?: string;
  avatarSrc?: string;
  avatarAlt?: string;
}

export interface BunkerNavItem {
  id: string;
  label: string;
  icon?: ReactNode;
  href?: string;
  disabled?: boolean;
  /** Contenido auxiliar a la derecha, por ejemplo un contador. */
  endAdornment?: ReactNode;
}
```

### 3.2 `theme/theme.types.ts`

```ts
/** Preferencia del consumidor. 'system' sigue prefers-color-scheme. */
export type BunkerColorMode = "light" | "dark" | "system";
export type BunkerResolvedColorMode = "light" | "dark";

export interface BunkerThemeTokens {
  primaryColor?: string;
  secondaryColor?: string;
  /** En unidades de theme.shape.borderRadius. */
  borderRadius?: number;
  fontFamily?: string;
  /** Fondos por modo. Si faltan, se usan los valores por defecto del tema. */
  backgroundDefault?: Partial<Record<BunkerResolvedColorMode, string>>;
  backgroundPaper?: Partial<Record<BunkerResolvedColorMode, string>>;
}
```

### 3.3 `provider/BunkerProvider.types.ts`

```ts
import type { ReactNode } from "react";
import type {
  BunkerColorMode,
  BunkerResolvedColorMode,
  BunkerThemeTokens,
} from "../theme/theme.types";

export interface BunkerProviderProps {
  children: ReactNode;
  /** Modo controlado. Si se omite, el provider gestiona su propio estado. */
  colorMode?: BunkerColorMode;
  /** Modo inicial cuando no está controlado. Por defecto 'system'. */
  defaultColorMode?: BunkerColorMode;
  /** Se invoca en cada cambio. La persistencia (localStorage, etc.) la decide la app. */
  onColorModeChange?: (mode: BunkerColorMode) => void;
  tokens?: BunkerThemeTokens;
  /** Desactiva CssBaseline. Por defecto false. */
  disableCssBaseline?: boolean;
}

export interface BunkerColorModeContextValue {
  mode: BunkerColorMode;
  resolvedMode: BunkerResolvedColorMode;
  setMode: (mode: BunkerColorMode) => void;
}
```

`useBunkerColorMode(): BunkerColorModeContextValue` lanza un error si se usa fuera del provider. El texto del error es de desarrollo, no de UI.

### 3.4 `components/SideMenu/SideMenu.types.ts`

```ts
import type { ReactNode } from "react";
import type { SxProps, Theme } from "@mui/material/styles";
import type { BunkerNavItem, BunkerUser } from "../../types";

export interface SideMenuProps {
  /** Grupo superior de navegación. */
  primaryItems: BunkerNavItem[];
  /** Grupo inferior de navegación (ajustes, ayuda, etc.). */
  secondaryItems?: BunkerNavItem[];
  /** id del BunkerNavItem activo. */
  selectedId?: string;
  onNavigate?: (item: BunkerNavItem) => void;

  /** Cabecera del menú: logo, selector de organización, etc. */
  brand?: ReactNode;
  /** Zona sobre el pie: alertas, banners, etc. */
  footerSlot?: ReactNode;
  /** Pie con perfil. Si se omite, no se renderiza. */
  user?: BunkerUser;
  /** Acciones del perfil: menú de opciones, logout, etc. */
  userActions?: ReactNode;

  /** Etiqueta accesible de la navegación (aria-label). Viene de la app por i18n. */
  ariaLabel: string;

  /** Ancho en px. Por defecto 240. */
  width?: number;
  /** Breakpoint desde el que el menú es permanente. Por defecto 'md'. */
  permanentFrom?: "sm" | "md" | "lg";
  /** Estado del drawer temporal en pantallas pequeñas. */
  mobileOpen?: boolean;
  onMobileClose?: () => void;

  sx?: SxProps<Theme>;
}
```

### 3.5 `components/Header/Header.types.ts`

```ts
import type { ReactNode } from "react";
import type { SxProps, Theme } from "@mui/material/styles";
import type { BunkerUser } from "../../types";

export interface HeaderProps {
  /** Título dinámico: la app lo calcula según la ruta. */
  title: ReactNode;
  subtitle?: ReactNode;

  /** Perfil a la derecha. Si se omite, no se muestra. */
  user?: BunkerUser;
  onUserClick?: () => void;

  /** Slot derecho: notificaciones, toggle de tema, búsqueda, etc. */
  actions?: ReactNode;

  /** Botón de menú para móvil. Se muestra solo si se pasa onMenuClick. */
  onMenuClick?: () => void;
  menuButtonLabel?: string;

  /** Ancho máximo del contenido en px. Por defecto 1700. */
  maxWidth?: number;
  /** Por defecto 'static'. */
  position?: "static" | "sticky";

  sx?: SxProps<Theme>;
}
```

### 3.6 `components/AppLayout/AppLayout.types.ts`

```ts
import type { ReactNode } from "react";
import type { SxProps, Theme } from "@mui/material/styles";
import type { SideMenuProps } from "../SideMenu/SideMenu.types";
import type { HeaderProps } from "../Header/Header.types";

export interface AppLayoutProps {
  /** El AppLayout gestiona mobileOpen y onMobileClose. */
  sideMenu: Omit<SideMenuProps, "mobileOpen" | "onMobileClose">;
  /** El AppLayout inyecta onMenuClick. */
  header: Omit<HeaderProps, "onMenuClick">;
  /** Etiqueta del botón de menú móvil, delegada a la app. */
  mobileMenuButtonLabel?: string;
  children: ReactNode;
  /** Ancho máximo del contenido en px. Por defecto 1700. */
  contentMaxWidth?: number;
  /** Separación entre Header y children, en unidades del tema. */
  contentSpacing?: number;
  sx?: SxProps<Theme>;
  contentSx?: SxProps<Theme>;
}
```

### 3.7 `components/StatCard/StatCard.types.ts`

```ts
import type { ReactNode } from "react";
import type { SxProps, Theme } from "@mui/material/styles";

export type StatCardTrend = "up" | "down" | "neutral";

export interface StatCardProps {
  title: string;
  value: ReactNode;
  /** Texto secundario, por ejemplo el intervalo o periodo. */
  caption?: string;
  /** Define el color del Chip. Sin él, no hay Chip. */
  trend?: StatCardTrend;
  /** Texto del Chip. Lo calcula la app. Nunca hay valores por defecto. */
  trendLabel?: string;
  icon?: ReactNode;
  /** Slot inferior para sparkline, barra de progreso, etc. Lo aporta la app. */
  footer?: ReactNode;
  loading?: boolean;
  onClick?: () => void;
  sx?: SxProps<Theme>;
}
```

### 3.8 Contrato del barril `index.ts`

```ts
export * from "./primitives";
export * from "./types";
export * from "./theme/theme.types";
export { createBunkerTheme } from "./theme/createBunkerTheme";
export * from "./provider";
export * from "./components/BunkerBadge";
export * from "./components/ActionCard";
export * from "./components/SideMenu";
export * from "./components/Header";
export * from "./components/AppLayout";
export * from "./components/StatCard";
export type { SxProps, Theme } from "@mui/material/styles";
```

## 4. Reglas de diseño por componente

- **BunkerProvider**: `ThemeProvider` con `createBunkerTheme(resolvedMode, tokens)` y `CssBaseline` opcional. Resuelve `'system'` con `useMediaQuery('(prefers-color-scheme: dark)')`. No lee ni escribe `localStorage`. Se evita `cssVariables` y `colorSchemes` salvo que Code confirme que la API de MUI 9.4 lo requiere.
- **SideMenu**: `Drawer` permanente desde `permanentFrom` y `Drawer` temporal por debajo. Usa `List`, `ListItemButton` y `Avatar` de MUI puro. Si un item trae `href`, renderiza `ListItemButton` con `component="a"`. Siempre invoca `onNavigate`. No importa ningún router.
- **Header**: `Stack` o `Toolbar`, sin `AppBar` elevado. Muestra el botón de menú con `MenuRoundedIcon` solo por debajo del breakpoint y si recibe `onMenuClick`. Su `aria-label` viene de `menuButtonLabel`.
- **AppLayout**: `Box` flex con `SideMenu`, un `main` con `Stack` centrado, `Header` y `children`. Es dueño del estado `mobileOpen`. Replica la estructura del `Dashboard.tsx` donante, sin `AppNavbar` ni `MainGrid`.
- **StatCard**: `Card variant="outlined"`, `CardContent`, `Typography`, `Chip` y `Skeleton`. No hay datos inventados ni cálculo de fechas.

## 5. Checklist atómico para el modo Code

### Fase A: saneamiento previo

- [ ] A1. Leer [`BunkerProvider.tsx`](BunkerProvider.tsx), [`BunkerBadge.tsx`](BunkerBadge.tsx), [`ActionCard.tsx`](ActionCard.tsx) y [`docs/extraction-plan.md`](docs/extraction-plan.md). Anotar su API actual y sus imports.
- [ ] A2. Mover `BunkerBadge.tsx` a `packages/ui/src/components/BunkerBadge/BunkerBadge.tsx` y crear su `index.ts`.
- [ ] A3. Mover `ActionCard.tsx` a `packages/ui/src/components/ActionCard/ActionCard.tsx` y crear su `index.ts`.
- [ ] A4. Mover `BunkerProvider.tsx` a `packages/ui/src/provider/BunkerProvider.tsx`.
- [ ] A5. Actualizar los imports relativos de los tres archivos movidos y quitar de ellos cualquier `any`.
- [ ] A6. Ajustar [`packages/ui/tsconfig.json`](packages/ui/tsconfig.json): `noEmit: true` y sin `declaration`, si el usuario lo aprobó.
- [ ] A7. Reescribir [`packages/ui/src/index.ts`](packages/ui/src/index.ts) con las rutas nuevas, sin los reexports de los componentes futuros.
- [ ] A8. Ejecutar `pnpm --filter @bunker/ui run build` y confirmar que pasa antes de continuar.

### Fase B: tipos base y tema

- [ ] B1. Crear `types.ts` con `BunkerUser` y `BunkerNavItem`.
- [ ] B2. Crear `theme/theme.types.ts` con los tipos de modo de color y `BunkerThemeTokens`.
- [ ] B3. Crear `theme/createBunkerTheme.ts`, que aplica paleta, tipografía, forma y fondos por modo.
- [ ] B4. Crear `provider/BunkerProvider.types.ts` con las interfaces de la sección 3.3.
- [ ] B5. Crear `provider/BunkerColorModeContext.ts` y `provider/useBunkerColorMode.ts`.
- [ ] B6. Ampliar `BunkerProvider.tsx`: modo controlado o no, resolución de `'system'`, `CssBaseline` opcional y `tokens`. Mantener compatibilidad con el uso actual.
- [ ] B7. Crear `provider/index.ts` y ejecutar build.

### Fase C: componentes

- [ ] C1. Crear `StatCard.types.ts` y `StatCard.tsx` con `Card`, `Chip` y `Skeleton`, e `index.ts`. Ejecutar build.
- [ ] C2. Crear `SideMenu.types.ts`.
- [ ] C3. Crear `SideMenu.tsx` con el `Drawer` permanente y el temporal, las listas, el pie con `Avatar` y los slots `brand`, `footerSlot` y `userActions`.
- [ ] C4. Crear el `index.ts` de SideMenu y ejecutar build.
- [ ] C5. Crear `Header.types.ts` y `Header.tsx` con título, perfil, `actions` y botón de menú móvil. Crear su `index.ts` y ejecutar build.
- [ ] C6. Crear `AppLayout.types.ts` y `AppLayout.tsx`, que ensambla `SideMenu`, `Header` y `children` y gestiona `mobileOpen`. Crear su `index.ts` y ejecutar build.

### Fase D: barril y verificación

- [ ] D1. Crear `primitives.ts` con `Box`, `Container`, `Stack`, `Typography` y `Grid`, según lo aprobado.
- [ ] D2. Reescribir [`packages/ui/src/index.ts`](packages/ui/src/index.ts) según la sección 3.8. Quitar los reexports sueltos de `Box` y `Container`, que pasan a `primitives.ts`.
- [ ] D3. Verificar con búsquedas que en `packages/ui/src` no hay `any`, `prop-types`, `@mui/x-`, `react-router` ni textos de negocio.
- [ ] D4. Verificar que cada prop de componente tiene su `interface` exportada desde el barril.
- [ ] D5. Ejecutar `pnpm --filter @bunker/ui run build` y confirmar que termina con éxito. Es el criterio de cierre.
- [ ] D6. Anotar en [`docs/DECISIONS.md`](docs/DECISIONS.md) una ADR-005 que recoja la poda del donante y el patrón de slots y props.

## 6. Fuera de alcance de esta fase

No se tocan `apps/*`, ni se hace la integración en `apps/wmw-crm/web`, ni se crea un `ColorModeToggle`. La app lo compone con `useBunkerColorMode` dentro del slot `actions` del Header. Tampoco se incluyen breadcrumbs, búsqueda ni selector de fechas.

## 7. Decisiones que necesito de ti

1. ¿Apruebas `noEmit: true` y quitar `declaration` en el `tsconfig` de `packages/ui`?
2. ¿Apruebas reexportar `Stack`, `Typography` y `Grid` en `primitives.ts`?

Con tu confirmación, el siguiente paso es cambiar al modo Code para ejecutar el checklist.
