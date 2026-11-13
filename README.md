# SmartCity-F - Sistema de Reportes Urbanos con IA

Sistema automatizado para recepción, análisis y priorización de incidentes urbanos (baches, luminarias, semáforos, fugas de agua). Integra visión artificial (Google Gemini 2.5 Flash), automatización con N8N, geolocalización y notificaciones por Telegram.

## Objetivos

- Formulario web con geolocalización y carga de imágenes.
- Almacenamiento automático en Google Sheets.
- Clasificación por IA (categoría, prioridad, confianza).
- Bot de Telegram para consulta de estado de tickets.
- Lógica de criticidad (urgente/normal/revisión).
- Geocodificación inversa y detección de duplicados en 20m.
- Filtro anti-spam visual.
- Panel de métricas.

## Arquitectura

Ciudadano -> Formulario web (GPS + foto) -> Webhook N8N -> Base64 a binario -> Geocodificación -> Gemini 2.5 Flash -> Lógica de criticidad -> Google Sheets -> Notificaciones Telegram (urgente/normal) -> Bot de consulta.

## Tecnologías

- Frontend: HTML5, CSS3, JavaScript, Leaflet.js, OpenStreetMap
- Automatización: N8N
- IA: Google Gemini 2.5 Flash
- Almacenamiento: Google Sheets API
- Notificaciones: Telegram Bot API
- Infraestructura: Docker, Nginx, ngrok

## Instalación rápida

1. Clonar el repositorio:

   ```bash
   git clone https://github.com/Jonatan-17/smartcity-f.git
   cd smartcity-f
   ```

2. Copiar `.env.example` como `.env` y completar `NGROK_AUTHTOKEN` y `NGROK_DOMAIN`.

3. Levantar los contenedores:

   ```bash
   docker compose up -d
   ```

4. Abrir N8N en `https://<tu-dominio>.ngrok-free.dev/`, importar `workflow.json` y configurar las credenciales de Gemini, Google Sheets y Telegram. En los nodos de Google Sheets, reemplazar `TU_GOOGLE_SHEET_ID` por el ID de tu hoja, y en el nodo de alertas, `TU_CHAT_ID_DE_TELEGRAM` por tu chat ID.
5. En `js/form.js`, poner la URL del webhook de tu N8N en `N8N_WEBHOOK_URL`.
6. Abrir `index.html` (por ejemplo con Live Server) y enviar un reporte de prueba.

## Funcionalidades principales

- **Formulario geo-localizado:** captura automática de coordenadas y fotos.
- **Geocodificación inversa:** convierte coordenadas en dirección legible (Nominatim).
- **IA multimodal:** clasifica tipo de daño, asigna prioridad y confianza.
- **Filtro anti-spam:** rechaza imágenes no relacionadas con vía pública.
- **Detección de duplicados:** evita reportes en radio <20m (fórmula de Haversine).
- **Lógica de criticidad:**
  - Crítica + confianza ≥85% → notificación urgente.
  - Baja o confianza <60% → revisión manual.
  - Otros → flujo normal.
- **Almacenamiento en Google Sheets:** registra ticket, datos, IA, estado.
- **Bot de Telegram:** consulta de estado con formato SC-XXXX y validación anti-spam.
- **Panel de métricas:** estadísticas con Chart.js.

## Solución de problemas comunes

- **Error "Failed to fetch"** : habilitar CORS en N8N (`N8N_CORS_ENABLED=true`) y verificar que el contenedor esté activo.
- **Chat ID vacío en Telegram:** usar ID fijo obtenido de @userinfobot o expresión `{{ $json.chatId || 'TU_ID' }}`.
- **Webhook sin respuesta:** activar workflow en N8N, ejecutar ngrok si se usa y actualizar URL en `js/form.js`.

## Autor

- Jonatan David Sarmiento Sierra 

## Licencia

Proyecto académico.