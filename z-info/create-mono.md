# Apuntes Maestros: Construcción del Monorepo Búnker Suite

Documento técnico de referencia y bitácora de arquitectura para el arranque y configuración de un monorepo modular con `pnpm workspaces`, contenedores de desarrollo en Podman rootless, Vite y React 19 con TypeScript estricto.

---

## Dónde y cómo se instalan las herramientas

Un monorepo **no mezcla las dependencias de Node con las de Python en el mismo sitio**. Se distribuyen por fronteras de responsabilidad:

```
bunker-crm/
├── package.json          <── RAÍZ: Herramientas globales (TypeScript base, Prettier)
├── pnpm-workspace.yaml   <── Declara dónde hay paquetes
│
├── packages/
│   └── ui/
│       ├── package.json  <── AQUÍ se instala Material UI (@mui/material, @emotion)
│       └── src/
│
└── apps/
    ├── wmw-crm/
    │   ├── web/          <── package.json: React, Vite, Zod, @bunker/ui
    │   └── api/          <── pyproject.toml: AQUÍ se instala FastAPI con `uv add`
    │
    └── rh-crm/
        ├── web/          <── package.json: React, Vite, Zod, @bunker/ui
        └── api/          <── pyproject.toml: FastAPI, SDK Holded con `uv add`

```

---

## 1. Principios de Arquitectura y Decisiones de Diseño

### A. Monorepo vs. Repositorios Aislados

- **El monorepo es una herramienta de desarrollo, no una atadura de despliegue:** Los paquetes se gestionan juntos para agilizar cambios cruzados en caliente, pero cada aplicación (`apps/*`) compila a artefactos estáticos independientes (`dist/`) o imágenes Docker aisladas (usando herramientas como `turbo prune`).
- **Regla del "Día Cero" limpio:** En lugar de arrastrar código y reestructurar repositorios antiguos (lo que genera residuos en el historial de Git, rotura de montajes en Docker y conflictos en lockfiles), se inicia un repositorio virgen estableciendo las reglas de juego desde el commit inicial.
- **Prohibición de la chatarra preventiva:** No se instalan librerías de terceros (UI, validación, utilidades) ni backends (FastAPI) hasta que el cimiento sobre el que van a operar esté validado mediante pruebas de humo (_smoke tests_).

---

## 2. Infraestructura del Entorno (Dev Container & Podman)

El entorno se aísla mediante contenedores de desarrollo ejecutados sobre Podman rootless (Fedora / Bluefin), garantizando que el sistema operativo anfitrión permanezca libre de dependencias globales de Node.js o Python.

### A. Dockerfile Multi-Stage (`.devcontainer/Dockerfile`)

Combina la imagen oficial de desarrollo de Python con los binarios oficiales de Node.js extraídos de su imagen base, evitando scripts arbitrarios de instalación (`curl | bash`):

```dockerfile
# 1. Imagen efímera para extraer el runtime de Node
FROM node:22.14.0-bookworm-slim AS node-source

# 2. Imagen base de desarrollo Python
FROM mcr.microsoft.com/devcontainers/python:3.12-bookworm
ENV DEBIAN_FRONTEND=noninteractive

# Extraer binarios y librerías de Node.js
COPY --from=node-source /usr/local/bin/node /usr/local/bin/node
COPY --from=node-source /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN ln -s /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
    && ln -s /usr/local/lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx

# Instalar gestores de paquetes oficiales
RUN npm install -g pnpm \
    && pip install --no-cache-dir uv

```

### B. Orquestación y Permisos (`.devcontainer/docker-compose.yml`)

Configurado para compatibilidad estricta con SELinux y el mapeo de identidades de Podman:

```yaml
name: bunker-crm

services:
  bunker-crm-workspace:
    build:
      context: ..
      dockerfile: .devcontainer/Dockerfile
    volumes:
      # Flag :Z obligatoria para reetiquetado de inodos en SELinux
      - ..:/workspaces:Z
    # Mapea el UID 1000 del host dentro del contenedor (evita permisos root corruptos)
    userns_mode: "keep-id"
    tty: true
    command: /bin/sh -c "while sleep 1000; do :; done"
    ports:
      - "5173:5173" # Servidor de desarrollo Vite
      - "8000:8000" # Servidor backend FastAPI
    networks:
      - bunker-crm-net

networks:
  bunker-crm-net:
    driver: bridge
```

### C. Configuración del Espacio de Trabajo (`.devcontainer/devcontainer.json`)

- **Under the hood del fallo de inicialización:** Si `postCreateCommand` apunta a rutas que no existen (`cd /workspaces/apps/web`), la shell POSIX devuelve un código de salida `1` (`No such file or directory`). VS Code interpreta esto como un fallo crítico del contenedor y bloquea el acceso.

- **Solución del monorepo:** Delegar toda la instalación a la raíz (`/workspaces`), donde `pnpm` resuelve automáticamente los paquetes existentes:

```json
{
  "name": "bunker-crm-workspace",
  "dockerComposeFile": "docker-compose.yml",
  "service": "bunker-crm-workspace",
  "workspaceFolder": "/workspaces",
  "overrideCommand": false,
  "customizations": {
    "vscode": {
      "settings": {
        "python.defaultInterpreterPath": "/usr/local/bin/python",
        "python.terminal.activateEnvironment": true
      },
      "extensions": [
        "rooveterinaryinc.roo-cline",
        "dbaeumer.vscode-eslint",
        "esbenp.prettier-vscode",
        "ms-python.python",
        "ms-python.vscode-pylance"
      ]
    }
  },
  "postCreateCommand": "pnpm install",
  "remoteUser": "vscode",
  "containerUser": "vscode",
  "updateRemoteUserUID": false
}
```

---

## 3. Andamiaje del Monorepo e Higiene del Repositorio

### A. Declaración del Espacio de Trabajo (`pnpm-workspace.yaml`)

Define las rutas donde `pnpm` debe rastrear paquetes válidos:

```yaml
packages:
  - "packages/*"
  - "apps/*/*"
```

### B. Manifiesto Raíz (`package.json`)

Debe ser estrictamente minimalista al nacer para no predefinir dependencias innecesarias:

```json
{
  "name": "bunker-crm-monorepo",
  "private": true
}
```

### C. Higiene de Git (`.gitignore`)

- **Regla sin barra (`node_modules/`):** Al no llevar barra inicial, Git ignora las carpetas de dependencias a cualquier nivel del árbol (`apps/wmw-crm/web/node_modules`, `packages/ui/node_modules`).
- **Protección de secretos:** Se ignoran todas las variantes de `.env`, permitiendo únicamente versionar plantillas mediante la excepción `!.env.example`.

---

## 4. Establecimiento del Estándar Oficial con Vite

Para evitar discrepancias teóricas de versiones, no se teclean dependencias a mano; se permite que la herramienta oficial de empaquetado (`Vite`) dicte el estándar de la plataforma web.

### A. Generación del Primer Cliente

Desde la terminal integrada dentro del contenedor (`/workspaces`):

```bash
pnpm create vite apps/wmw-crm/web --template react-ts

```

- **Elección de linter:** ESLint (estándar consolidado con ecosistema completo de plugins frente a Oxlint).
- **Instalación inmediata diferida:** Se selecciona `No` en el asistente para evitar inicializaciones locales aisladas y permitir que el monorepo gobierne la resolución de dependencias desde la raíz.

### B. Auditoría de Versiones Obtenidas

Vite fijó la línea base estable del proyecto:

- **React / React-DOM:** `^19.2.8`

- **TypeScript:** `~6.0.2`

- **Vite:** `^8.3.0`

- **Tipos React:** `@types/react: ^19.2.18`, `@types/react-dom: ^19.2.7`

### C. Prevención de Colisiones de Nombres

Vite asigna `"name": "web"` por defecto. En un monorepo, el campo `name` es el identificador único global del workspace. Se modifica `apps/wmw-crm/web/package.json` para darle identidad propia:

```json
{
  "name": "wmw-web",
  "private": true,
  "version": "0.0.0",
  ...
}

```

---

## 5. Abstracción del Paquete Compartido (`@bunker/ui`)

`packages/ui` no es una aplicación web; es una librería interna de componentes reutilizables sin `index.html` ni servidor propio.

### A. Configuración de Identidad (`packages/ui/package.json`)

```json
{
  "name": "@bunker/ui",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts"
  },
  "scripts": {
    "build": "tsc"
  },
  "peerDependencies": {
    "react": "^19.2.8",
    "react-dom": "^19.2.8"
  },
  "devDependencies": {
    "@types/react": "^19.2.18",
    "@types/react-dom": "^19.2.7",
    "typescript": "~6.0.2"
  }
}
```

#### Mecánica interna de `peerDependencies` (_Under the hood_):

React requiere ser un _singleton_ absoluto en memoria durante la ejecución en el navegador. Si `@bunker/ui` instalara su propia copia física de React en sus dependencias directas, el empaquetador cargaría dos instancias concurrentes. Al ejecutar cualquier hook (`useState`, `useEffect`), la aplicación colapsaría con el error de hooks inválidos. Declararlo en `peerDependencies` garantiza que la librería use la misma instancia física que carga la aplicación cliente.

### B. Compilador de TypeScript (`packages/ui/tsconfig.json`)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "react-jsx",
    "strict": true,
    "skipLibCheck": true,
    "declaration": true
  },
  "include": ["src"]
}
```

- **`"jsx": "react-jsx"`:** Permite el uso de sintaxis JSX moderna sin requerir la importación explícita de `React` en cada archivo.
- **`"moduleResolution": "Bundler"`:** Optimiza la resolución de módulos delegando el proceso de empaquetado en Vite.
- **`"skipLibCheck": true`:** Ignora la comprobación de tipos dentro de `node_modules`, acelerando la compilación y aislando el código frente a discrepancias de tipado de terceros.

---

## 6. Enlace del Workspace y Prueba de Humo (_Smoke Test_)

### A. Sincronización Global

Desde la raíz del workspace se descarga el árbol de dependencias y se genera el lockfile unificado:

```bash
pnpm install

```

### B. Enlace Simbólico Local

Se vincula el paquete de UI a la aplicación del club:

```bash
pnpm --filter wmw-web add @bunker/ui --workspace

```

Esto inyecta automáticamente en `apps/wmw-crm/web/package.json`:

```json
"dependencies": {
  "@bunker/ui": "workspace:*"
}

```

### C. Componente de Prueba (`packages/ui/src/BunkerBadge.tsx`)

```tsx
export function BunkerBadge() {
  return (
    <div
      style={{
        padding: "10px 16px",
        backgroundColor: "#1e293b",
        color: "#38bdf8",
        borderRadius: "6px",
        fontFamily: "monospace",
        fontWeight: "bold",
        display: "inline-block",
      }}
    >
      [BÚNKER UI]: Enlace de Monorepo Operativo
    </div>
  );
}
```

Exposición en el barril público (`packages/ui/src/index.ts`):

```typescript
export * from "./BunkerBadge";
```

### D. Consumo en la Aplicación (`apps/wmw-crm/web/src/App.tsx`)

```tsx
import { BunkerBadge } from "@bunker/ui";

export function App() {
  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>WMW CRM - Portal del Club</h1>
      <BunkerBadge />
    </div>
  );
}

export default App;
```

### E. Ejecución y Validación de Red

Dentro de la terminal del contenedor:

```bash
pnpm --filter wmw-web dev -- --host

```

- **Mecánica del flag `--host` (_Under the hood_):** Por defecto, Vite se vincula a `127.0.0.1` (interfaz de _loopback_ interna del contenedor). Para que el tráfico reenviado por los puertos del host (`5173:5173` en Compose) penetre en la máquina virtual o contenedor de Podman, es obligatorio indicar `--host` para que el servidor escuche en `0.0.0.0` (todas las interfaces disponibles).

- **Resultado:** Conexión exitosa desde el navegador host en `http://localhost:5173`, confirmando la resolución transparente de TypeScript, JSX y enlaces simbólicos entre paquetes.
