# Implementación de Inteligencia Artificial con InsForge en MotoGestor

## Visión General
La aplicación **MotoGestor** utiliza funciones de Inteligencia Artificial integradas directamente a través del SDK de **InsForge** (Backend-as-a-Service). Esta arquitectura permite consumir modelos de IA como Claude (Anthropic) y GPT (OpenAI) directamente desde el código frontend (React Native / Expo), pero de una manera segura y optimizada para producción.

No existe un servidor o backend propio intermedio programado manualmente para esto; toda la lógica de negocio y los prompts residen en la aplicación móvil, mientras que la seguridad y enrutamiento recaen sobre la infraestructura de InsForge.

## Arquitectura y Flujo en Producción

El ciclo de vida de una petición de IA en la app consta de los siguientes pasos:

1. **Frontend (La Aplicación):**
   - El usuario realiza una acción, como enviar un mensaje en el Asistente o escanear una tarjeta de propiedad.
   - El código en React Native recolecta los datos, imágenes y el contexto necesario.
   - Se utiliza el cliente `insforge.ai.chat.completions.create` pasándole el prompt del sistema y el modelo a utilizar.

2. **Backend/Proxy (InsForge):**
   - La petición llega de forma segura a los servidores de InsForge.
   - **Autenticación:** InsForge verifica que la llamada provenga de una sesión válida de la app.
   - **Seguridad:** Las API Keys secretas de OpenAI y Anthropic se almacenan exclusivamente en el dashboard de InsForge, **NUNCA** en el código fuente de la app.
   - InsForge actúa como un proxy seguro, inyectando las API keys y enrutando la petición al proveedor de IA correspondiente.

3. **Proveedor de IA (OpenAI / Anthropic):**
   - El proveedor procesa la solicitud.
   - Retorna la respuesta (texto, JSON, o streaming) hacia InsForge, que a su vez se lo envía de vuelta a la aplicación móvil.

## Casos de Uso Implementados

### 1. Asistente MotoGestor IA (Chatbot)
- **Ubicación en el código:** `src/store/asistenteStore.ts`
- **Modelo utilizado:** `anthropic/claude-sonnet-4.5` (Claude 3.5 Sonnet)
- **Funcionamiento:** En el estado global (Zustand) del asistente, se construye un contexto dinámico (ej. las motos actuales del usuario, kilometraje, etc.) y se inyecta en el *System Prompt*. La respuesta se procesa mediante *streaming* para mostrar el texto en pantalla a medida que se va generando, mejorando la experiencia de usuario.

### 2. Escaneo Inteligente de Documentos
- **Ubicación en el código:** `src/app/(tabs)/garaje/register.tsx` y `src/app/garaje/edit.tsx`
- **Modelo utilizado:** `openai/gpt-4o-mini`
- **Funcionamiento:** Al subir o tomar una foto de la tarjeta de propiedad, la app envía la imagen en formato Base64. Se le da una instrucción estricta al modelo para extraer los datos (marca, modelo, placa, etc.) en un formato JSON. La aplicación captura esa respuesta, parsea el JSON y autocompleta automáticamente los campos del formulario.

## Ventajas de esta Arquitectura
- **Seguridad Máxima:** Imposibilidad de que atacantes extraigan las API keys descompilando la aplicación, ya que están resguardadas en InsForge.
- **Sin Mantenimiento de Servidores (Serverless):** No es necesario programar ni pagar hosting por un servidor Node.js/Python dedicado solo a esconder llaves y rutear peticiones.
- **Flexibilidad:** Permite cambiar el modelo de IA utilizado (por ejemplo, pasar de GPT-4o a GPT-4o-mini) con solo modificar una línea de texto en el código, gracias a la compatibilidad universal del SDK.
- **Control de Costos:** Al pasar por InsForge, es posible monitorizar y aplicar límites de uso (Rate Limiting) en un futuro para prevenir abusos.
