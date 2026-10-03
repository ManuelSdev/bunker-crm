factor crítico: Privacidad y RGPD
La única justificación real para no usar una API externa en este caso no es económica, sino legal: estás enviando documentos de identidad a un tercero.

Para resolver esto sin montar hardware local costoso:

Políticas Enterprise / ZDR (Zero Data Retention): Usar las APIs comerciales a través de cuentas estándar con contrato B2B (Google Cloud Vertex AI con región en Fráncfort o Azure OpenAI en Europa). En estas plataformas los datos no se usan para entrenar y se eliminan tras la respuesta.

Proveedores europeos: Si el negocio es muy estricto con la soberanía del dato, se pueden usar endpoints de inferencia con modelos europeos (como Mistral vía sus endpoints en la UE) que manejan visión a precios igual de irrisorios.

---

3. El Flujo de Datos E2E (Paso a paso)
   Aclarado el coste, volvamos al flujo del dato puro: cómo viaja la información desde el soporte físico hasta quedar normalizada en el sistema.

[1. ENTRADA FÍSICA]
Escáner / Foto (Documento sobre fondo plano)
│
▼
[2. TRANSPORTE Y PREPARACIÓN]
Web CRM ──(HTTPS POST)──> Backend Docker
• Valida formato (MIME: image/jpeg, image/png, application/pdf).
• Normaliza resolución (redimensiona a máx 1920x1080 para ahorrar ancho de banda).
│
▼
[3. BIFURCACIÓN DE EXTRACCIÓN]
├── RUTA 1: Reverso DNI / Pasaporte (Algoritmo MRZ)
│ • Busca las líneas de caracteres OCR-B (<<<).
│ • Extrae: Número de documento, fecha de nacimiento, fecha de caducidad, sexo.
│ • VERIFICACIÓN MATEMÁTICA: Ejecuta el algoritmo de checksum (módulo 10).
│ Si el dígito de control no cuadra -> Alerta de lectura corrupta.
│
└── RUTA 2: Anverso DNI / Datos Visuales (VLM Multimodal)
• Envío del recorte a la API multimodal con Schema JSON estricto.
• Extrae campos no presentes en MRZ: Nombre, Primer apellido, Segundo apellido,
Dirección completa, Código postal, Municipio, Provincia.
│
▼
[4. CONCILIACIÓN DEL PAYLOAD]
El backend cruza ambas rutas:
• Si el número de DNI de la MRZ coincide con el del anverso -> Confianza 100%.
• Si la MRZ falló por reflejo -> Toma el valor del VLM y marca bandera "revisión manual".
│
▼
[5. ESTADO TRANSITORIO (Human-in-the-Loop)]
El backend devuelve al CRM web el formulario pre-rellenado:
• Izquierda: Imagen del documento con zoom.
• Derecha: Campos listos para editar si el empleado ve algún fallo.
│
▼ (Empleado pulsa "Confirmar y Guardar")
[6. PERSISTENCIA RELACIONAL]
• INSERT en PostgreSQL: - Campos limpios y validados. - `documento_numero` con índice UNIQUE por empresa (`tenant_id, doc_num`).
• Imagen archivada en Storage con clave privada cifrada.

---

Las tres reglas para no atascarse
No normalices de más: No crees tablas separadas para domicilios, tipos de documento o países este fin de semana. Todo plano en una sola tabla de clientes. Ya habrá tiempo de refactorizar cuando el Excel te revele el modelo de negocio real.

No te compliques con recortar o procesar la foto en backend: Manda la imagen tal cual entra (o con un reescalado básico en el canvas del navegador si pesa 15 MB). Los modelos multimodales modernos se tragan documentos en cualquier ángulo sin necesidad de OpenCV.

Trabaja con datos mockeados si la red baila: Guarda una respuesta JSON estática de prueba para diseñar el front sin gastar llamadas de API mientras cuadras los inputs.

---

1. La mecánica: Puertos (Contratos) vs Adaptadores (Fontanería)
   La separación se reduce a tres capas conceptuales:

┌────────────────────────────────────────────────────────┐
│ NÚCLEO (CASO DE USO) │
│ "RegistrarNuevoCliente(imagen, datos)" │
│ Solo habla el lenguaje del negocio. Cero librerías. │
└──────────────────────────┬─────────────────────────────┘
│ Depende únicamente de...
▼
┌────────────────────────────────────────────────────────┐
│ PUERTO (LA INTERFAZ CIEGA) │
│ DocumentExtractorPort: │
│ extraer(buffer: Buffer) -> DatosDocumento │
│ CustomerRepositoryPort: │
│ guardar(cliente: Cliente) -> void │
└──────────────────────────┬─────────────────────────────┘
│ Implementado por...
▼
┌────────────────────────────────────────────────────────┐
│ ADAPTADORES (MUNDO EXTERIOR) │
│ ├── GeminiVisionAdapter (Llama a Google Cloud) │
│ ├── MistralVisionAdapter (Llama a endpoints UE) │
│ ├── MockVisionAdapter (Devuelve JSON estático) │
│ ├── PostgresAdapter (Escribe SQL nativo) │
│ └── SupabaseStorageAdapter (Sube a bucket S3) │
└────────────────────────────────────────────────────────┘
El Puerto (El contrato)
El puerto es una simple interfaz (interface en TypeScript o clase abstracta / Protocol en Python). No contiene código ejecutable, solo define la firma de entrada y salida:

"Cualquiera que quiera ser un extractor de documentos en este sistema debe tener un método extraer() que reciba un chorro de bytes (la imagen) y me devuelva este objeto estructurado."

El Adaptador (La implementación sucia)
El adaptador es la clase que se come los detalles concretos, los SDKs de terceros y las peculiaridades del proveedor:

Si mañana Google sube las tarifas de Gemini o te banea la cuenta, no tocas ni una sola línea de tus controladores, ni de tu interfaz web, ni de tu lógica de clientes.

Escribes un archivo nuevo MistralVisionAdapter, instalas su cliente, mapeas su respuesta al objeto común que exige el puerto, y cambias una sola línea en el punto de arranque de la aplicación (en el inyector de dependencias).

2. El arma secreta para este finde: El Adaptador Mock
   Trabajar con adaptadores desacoplados te va a ahorrar el 80% del tiempo de desarrollo este fin de semana gracias a una técnica fundamental: el Mock Adapter.

Cuando estés maquetando la interfaz o ajustando cómo se rellenan los campos del formulario:

No llames a la API real. Cada prueba con una foto real son 2 segundos de latencia de red y quemar tokens innecesariamente.

Levantas el sistema inyectando un MockVisionAdapter.

Ese adaptador falso simplemente hace un retardo de 300 ms y te devuelve un JSON clavado con los datos de "ALEJANDRO GARCÍA LÓPEZ, DNI 12345678Z".

Desarrollas, rompes y pruebas el front a velocidad instantánea, sin conexión a internet y gratis.

Cuando el front esté pulido, cambias la inyección al GeminiVisionAdapter real y compruebas que el flujo se comporta exactamente igual.

3. Desacoplamiento de la Base de Datos (Repositorios)
   Con la base de datos se aplica exactamente el mismo principio:

El puerto: CustomerRepository. Define métodos como save(customer), findById(id), findByDocument(docNumber).

El adaptador hoy: PostgresRepository. Recibe la conexión a la base de datos (mediante un pool de conexiones como pg en Node o asyncpg en Python), ejecuta la sentencia SQL parametrizada (INSERT INTO clientes ...) y mapea la fila devuelta a tu entidad.

La migración mañana: Si el negocio escala y pasas de PostgreSQL a una solución multi-región o cambias de proveedor de almacenamiento (de Supabase Storage a Cloudflare R2 para pagar cero por ancho de banda de descarga), solo sustituyes la clase del adaptador. El caso de uso RegistrarCliente sigue ejecutando repository.save() sin saber qué motor hay por debajo.

4. La dosis de pragmatismo senior: Evitar la trampa de la sobreingeniería
   Hay un peligro clásico al aprender estos patrones: la parálisis por abstracción. En proyectos empresariales mastodónticos la gente crea capas infinitas: Entidad -> DTO de Dominio -> DTO de Aplicación -> Value Objects -> Mappers -> Interfaces.

Para el MVP de 48 horas de tu colega, mantén la arquitectura limpia pero afilada:

Una carpeta core/ o domain/: Donde viven los modelos de datos limpios (el esquema del cliente y del documento) y las interfaces de los puertos.

Una carpeta adapters/:

adapters/vision/ con gemini.adapter.ts y mock.adapter.ts.

adapters/db/ con postgres.adapter.ts.

Una carpeta api/ o controllers/: Los endpoints HTTP que reciben la petición del navegador, llaman al caso de uso inyectándole los adaptadores configurados en las variables de entorno, y devuelven la respuesta.

Con esa estructura en 3 carpetas tienes una aplicación con nivel de desacoplamiento profesional, modular, blindada ante cambios de precios de APIs y lista para ejecutarse en cualquier entorno sin tocar el núcleo.
