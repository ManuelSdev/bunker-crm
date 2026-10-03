# bunker-crmLa estructura canónica del nuevo Monorepo

Crear el repo nuevo con su nombre definitivo (por ejemplo, bunker-crm o bunker-suite) te permite nacer con la topología correcta desde el commit cero:

Plaintext
bunker-crm/
├── .devcontainer/ # Entorno Podman / Bluefin compartido
├── docker-compose.yml # Servicios de desarrollo (Workspace + DBs)
├── pnpm-workspace.yaml # El cerebro del monorepo
├── package.json # Scripts raíz ("build", "dev", "lint")
│
├── packages/ # CÓDIGO COMPARTIDO (Agnóstico)
│ └── ui/ # Nuestro lienzo de Material UI
│ ├── package.json (name: "@bunker/ui")
│ └── src/
│ ├── theme/ # Paleta, sombras y radios de MUI
│ ├── layout/ # AppLayout, SideMenu, Header
│ └── components/ # StatCard, DataTable, FormTextField
│
└── apps/ # APLICACIONES DE NEGOCIO
├── club-crm/ # El CRM de Nadeth
│ ├── web/ (Consume @bunker/ui)
│ └── api/ (FastAPI: OCR de documentos y socios)
│
└── rh-crm/ # El CRM de tu primo
├── web/ (Consume @bunker/ui)
└── api/ (FastAPI: Holded, leads, finanzas)
El protocolo limpio para arrancar de cero
Creas el repositorio virgen en GitHub con el nombre que elijas (bunker-crm) y lo clonas en tu máquina.

Creas el archivo raíz pnpm-workspace.yaml con solo tres líneas:

YAML
packages:

- 'packages/\*'
- 'apps/_/_'
  Rescatas únicamente los contratos calibrados:

La configuración del contenedor (.devcontainer/).

El tsconfig.app.json pragmático que calibramos para TypeScript.  
ZIP

El documento de referencia del donante de MUI en docs/MUI_DASHBOARD_DONOR.md.

Haces tu primer commit limpio:

Bash
git add . && git commit -m "chore: scaffold bunker monorepo workspace"
A partir de ahí, el espacio de trabajo queda listo para que Roo Code genere el paquete @bunker/ui sin arrastrar residuos del proyecto anterior.
