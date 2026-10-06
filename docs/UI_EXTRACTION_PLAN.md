Las directrices que planteas forman una base sólida para evitar dependencias innecesarias y fugas de datos, pero para que la IA actúe como un cirujano y no se desvíe ni un milímetro al desguazar el template de Material UI, necesitas añadir estas **reglas de acotación operativa**:

---

### 1. Agnósticismo Radical de Dominio (Sin textos ni rutas fijas)

- **Prohibición de literales y textos quemados (_hardcoded_):** Ningún componente extraído puede contener cadenas de texto fijas (como _"Dashboard"_, _"Socios"_, _"Leads"_, _"Facturas"_ o nombres de usuario). Todo texto, etiqueta, título o descripción debe recibirse estrictamente como prop (`title: string`, `label: string`).

- **Nomenclatura neutral:** Los componentes deben nombrarse por su función estructural y no por su caso de uso de negocio (ej. usar `StatCard`, `DataTable`, `AppLayout`, `SideNav`, `HeaderToolbar` en lugar de `ClubMetrics` o `ClientsList`).

### 2. Aislamiento del Enrutador (Zero Routing Coupling)

- **Cero dependencias de librerías de rutas:** El cascarón visual compartido (`@bunker/ui`) no debe importar `react-router`, `wouter` ni depender de cómo se gestione la navegación.

- **Enlaces parametrizables:** Todo elemento del menú de navegación o acción debe recibir un callback genérico (`onClick?: () => void`) o una prop polimórfica para inyectar enlaces (`href?: string`, `component?: React.ElementType`).

### 3. Matriz de Sustitución para Componentes Complejos

- **Reemplazo de `@mui/x-data-grid`:** El template oficial de MUI suele implementar su tabla avanzada con dependencias pesadas. Debe quedar explícito: _«Si el donor utiliza DataGrid o TreeView, se reemplazará por una tabla atómica estándar construida exclusivamente con `@mui/material/Table`, `TableHead`, `TableRow`, `TableCell` y `TablePagination`»_.

- **Descarte de DatePickers propietarios:** Si la plantilla utiliza `@mui/x-date-pickers` y `dayjs`, se deben descartar o modelar como inputs nativos estándar (`<TextField type="date"/>`) para no inflar el árbol de dependencias.

### 4. Contratos de Iconografía y Assets

- **Prohibición de importar iconos estáticos en el cascarón:** En lugar de importar iconos específicos de `@mui/icons-material` dentro de la barra lateral o tarjetas, los items de menú deben tipar los iconos como nodos opcionales (`icon?: React.ReactNode`). De este modo, la aplicación consumidora decide qué icono renderizar y el componente se mantiene agnóstico.

- **Cero imágenes locales o avatares incrustados:** Fotos de perfil, logotipos o avatares de la plantilla deben pasar a ser props (`avatarUrl?: string`, `logo?: React.ReactNode`).

### 5. Contención del Sistema de Diseño (Temas y Modo Oscuro)

- **Unificación bajo `BunkerProvider`:** La plantilla de MUI suele venir con su propia carpeta `shared-theme/` y múltiples archivos de configuración de color. La directriz debe ordenar: _«No copiar la estructura multicarpetas de temas del donor; extraer únicamente las variables de paleta, sombras y bordes requeridas para integrarlas directamente dentro del `BunkerProvider` del paquete»_.

- **Sin CSS global huérfano:** Queda vetado el uso de archivos `.css` sueltos; cualquier ajuste debe resolverse mediante la prop `sx` o primitivas de Material UI y Emotion ya instaladas.

### 6. Entregables Obligatorios del Modo Arquitecto (DoD)

Antes de permitirle al agente pasar al modo codificador, exige en el prompt que el Arquitecto presente primero:

1. **Árbol de archivos resultante:** Ruta exacta donde se creará cada componente dentro de `packages/ui/src/`.

2. **Contratos e interfaces TypeScript (`Props`):** Definición formal de cada interfaz exportada antes de escribir el JSX.

3. **Mapeo del barril:** Declaración exacta de qué componentes y tipos se añadirán a `packages/ui/src/index.ts`.

4. **Checklist atómico:** Tareas individuales y secuenciales para que el codificador ejecute archivo por archivo y verifique con `pnpm --filter @bunker/ui run build`.

Las directrices que planteas forman una base sólida para evitar dependencias innecesarias y fugas de datos, pero para que la IA actúe como un cirujano y no se desvíe ni un milímetro al desguazar el template de Material UI, necesitas añadir estas **reglas de acotación operativa**:

---

### 1. Agnósticismo Radical de Dominio (Sin textos ni rutas fijas)

- **Prohibición de literales y textos quemados (_hardcoded_):** Ningún componente extraído puede contener cadenas de texto fijas (como _"Dashboard"_, _"Socios"_, _"Leads"_, _"Facturas"_ o nombres de usuario). Todo texto, etiqueta, título o descripción debe recibirse estrictamente como prop (`title: string`, `label: string`).

- **Nomenclatura neutral:** Los componentes deben nombrarse por su función estructural y no por su caso de uso de negocio (ej. usar `StatCard`, `DataTable`, `AppLayout`, `SideNav`, `HeaderToolbar` en lugar de `ClubMetrics` o `ClientsList`).

### 2. Aislamiento del Enrutador (Zero Routing Coupling)

- **Cero dependencias de librerías de rutas:** El cascarón visual compartido (`@bunker/ui`) no debe importar `react-router`, `wouter` ni depender de cómo se gestione la navegación.

- **Enlaces parametrizables:** Todo elemento del menú de navegación o acción debe recibir un callback genérico (`onClick?: () => void`) o una prop polimórfica para inyectar enlaces (`href?: string`, `component?: React.ElementType`).

### 3. Matriz de Sustitución para Componentes Complejos

- **Reemplazo de `@mui/x-data-grid`:** El template oficial de MUI suele implementar su tabla avanzada con dependencias pesadas. Debe quedar explícito: _«Si el donor utiliza DataGrid o TreeView, se reemplazará por una tabla atómica estándar construida exclusivamente con `@mui/material/Table`, `TableHead`, `TableRow`, `TableCell` y `TablePagination`»_.

- **Descarte de DatePickers propietarios:** Si la plantilla utiliza `@mui/x-date-pickers` y `dayjs`, se deben descartar o modelar como inputs nativos estándar (`<TextField type="date"/>`) para no inflar el árbol de dependencias.

### 4. Contratos de Iconografía y Assets

- **Prohibición de importar iconos estáticos en el cascarón:** En lugar de importar iconos específicos de `@mui/icons-material` dentro de la barra lateral o tarjetas, los items de menú deben tipar los iconos como nodos opcionales (`icon?: React.ReactNode`). De este modo, la aplicación consumidora decide qué icono renderizar y el componente se mantiene agnóstico.

- **Cero imágenes locales o avatares incrustados:** Fotos de perfil, logotipos o avatares de la plantilla deben pasar a ser props (`avatarUrl?: string`, `logo?: React.ReactNode`).

### 5. Contención del Sistema de Diseño (Temas y Modo Oscuro)

- **Unificación bajo `BunkerProvider`:** La plantilla de MUI suele venir con su propia carpeta `shared-theme/` y múltiples archivos de configuración de color. La directriz debe ordenar: _«No copiar la estructura multicarpetas de temas del donor; extraer únicamente las variables de paleta, sombras y bordes requeridas para integrarlas directamente dentro del `BunkerProvider` del paquete»_.

- **Sin CSS global huérfano:** Queda vetado el uso de archivos `.css` sueltos; cualquier ajuste debe resolverse mediante la prop `sx` o primitivas de Material UI y Emotion ya instaladas.

### 6. Entregables Obligatorios del Modo Arquitecto (DoD)

Antes de permitirle al agente pasar al modo codificador, exige en el prompt que el Arquitecto presente primero:

1. **Árbol de archivos resultante:** Ruta exacta donde se creará cada componente dentro de `packages/ui/src/`.

2. **Contratos e interfaces TypeScript (`Props`):** Definición formal de cada interfaz exportada antes de escribir el JSX.

3. **Mapeo del barril:** Declaración exacta de qué componentes y tipos se añadirán a `packages/ui/src/index.ts`.

4. **Checklist atómico:** Tareas individuales y secuenciales para que el codificador ejecute archivo por archivo y verifique con `pnpm --filter @bunker/ui run build`.
