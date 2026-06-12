// js/form.js
let map = null;
let marker = null;

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('reportForm');
    const btnGeo = document.getElementById('btnGeo');
    const geoStatus = document.getElementById('geoStatus');
    const geoCoords = document.getElementById('geoCoords');
    const mapDiv = document.getElementById('map');
    const latInput = document.getElementById('lat');
    const lngInput = document.getElementById('lng');
    const latDisplay = document.getElementById('latDisplay');
    const lngDisplay = document.getElementById('lngDisplay');
    const dropZone = document.getElementById('dropZone');
    const fotoInput = document.getElementById('foto');
    const imagePreview = document.getElementById('imagePreview');
    const descripcion = document.getElementById('descripcion');
    const charCount = document.getElementById('charCount');

    let fotoBase64 = null;
    let fotoNombre = null;

    // INICIALIZAR MAPA (Función)
    function initMap(lat, lng) {
        // Si ya existe el mapa, lo removemos
        if (map) {
            map.remove();
        }

        // Crear nuevo mapa centrado en la ubicación
        map = L.map('map').setView([lat, lng], 16);

        // Agregar capa de OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(map);

        // Agregar marcador
        marker = L.marker([lat, lng]).addTo(map)
            .bindPopup('<b>📍 Ubicación del Reporte</b><br>Lat: ' + lat + '<br>Lng: ' + lng)
            .openPopup();

        // Mostrar el div del mapa
        mapDiv.style.display = 'block';

        // Forzar redimensionamiento del mapa después de mostrarlo
        setTimeout(() => {
            map.invalidateSize();
        }, 100);
    }

    // 1. GEOLOCALIZACIÓN CON MAPA
    btnGeo.addEventListener('click', () => {
        if (!navigator.geolocation) {
            geoStatus.textContent = '❌ Tu navegador no soporta geolocalización';
            geoStatus.className = 'geo-status error';
            return;
        }

        geoStatus.textContent = '📡 Obteniendo coordenadas GPS...';
        geoStatus.className = 'geo-status';

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude.toFixed(6);
                const lng = position.coords.longitude.toFixed(6);
                
                latInput.value = lat;
                lngInput.value = lng;
                
                latDisplay.textContent = lat;
                lngDisplay.textContent = lng;
                geoCoords.style.display = 'flex';
                
                // Inicializar mapa
                initMap(lat, lng);
                
                const mapsLink = `https://www.google.com/maps?q=${lat},${lng}`;
                geoStatus.innerHTML = `✅ Ubicación capturada exitosamente<br><a href="${mapsLink}" target="_blank" style="color: var(--primary); font-weight: 600;">🗺️ Ver en Google Maps</a>`;
                geoStatus.className = 'geo-status success';
                document.getElementById('errorGeo').style.display = 'none';
            },
            (error) => {
                let mensaje = 'Error: ';
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        mensaje += 'Debes permitir el acceso a la ubicación';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        mensaje += 'Información de ubicación no disponible';
                        break;
                    case error.TIMEOUT:
                        mensaje += 'Tiempo de espera agotado';
                        break;
                    default:
                        mensaje += 'Error desconocido';
                }
                geoStatus.textContent = '❌ ' + mensaje;
                geoStatus.className = 'geo-status error';
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );
    });

    // 2. SUBIDA DE IMAGEN Y PREVIEW
    dropZone.addEventListener('click', () => fotoInput.click());

    // Drag and drop
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--primary)';
        dropZone.style.background = '#f8fafc';
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.style.borderColor = '#cbd5e1';
        dropZone.style.background = 'transparent';
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '#cbd5e1';
        dropZone.style.background = 'transparent';
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            procesarImagen(files[0]);
        }
    });

    fotoInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            procesarImagen(e.target.files[0]);
        }
    });

    function procesarImagen(file) {
        if (!file.type.startsWith('image/')) {
            alert('❌ Por favor selecciona un archivo de imagen válido (JPG, PNG, WEBP)');
            fotoInput.value = '';
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('❌ La imagen no debe superar los 5MB');
            fotoInput.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            imagePreview.src = event.target.result;
            imagePreview.style.display = 'block';
            fotoBase64 = event.target.result;
            fotoNombre = file.name;
            document.getElementById('errorFoto').style.display = 'none';
            
            // Cambiar texto del dropzone
            dropZone.innerHTML = '<p style="color: var(--success); font-weight: 600;">✓ Imagen cargada</p><small style="color: var(--gray);">Haz click para cambiar</small>';
        };
        reader.readAsDataURL(file);
    }

    // Contador de caracteres
    descripcion.addEventListener('input', (e) => {
        charCount.textContent = `(${e.target.value.length}/2000)`;
    });

    // 3. ENVÍO DEL FORMULARIO Y CONEXIÓN CON N8N
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Validaciones manuales
        let isValid = true;
        
        if (!latInput.value) {
            document.getElementById('errorGeo').style.display = 'block';
            geoStatus.scrollIntoView({ behavior: 'smooth', block: 'center' });
            isValid = false;
        }
        
        if (!fotoBase64) {
            document.getElementById('errorFoto').style.display = 'block';
            document.getElementById('foto').scrollIntoView({ behavior: 'smooth', block: 'center' });
            isValid = false;
        }

        if (!isValid) {
            alert('⚠️ Por favor completa todos los campos obligatorios');
            return;
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '⏳ Enviando a N8N y analizando con IA...';
        submitBtn.disabled = true;

        try {
            // Generar Ticket ID único (UNA SOLA VEZ)
            const ticketId = 'SC-' + Math.floor(1000 + Math.random() * 9000);

            // Preparar el payload para N8N
            const payload = {
                body: {
                    nombre: document.getElementById('nombre').value,
                    cedula: document.getElementById('cedula').value,
                    telefono: document.getElementById('telefono').value,
                    lat: latInput.value,
                    lng: lngInput.value,
                    direccion: document.getElementById('direccion').value || 'No especificada',
                    descripcion: descripcion.value,
                    fotoBase64: fotoBase64,
                    fotoNombre: fotoNombre,
                    timestamp: new Date().toISOString(),
                    ticketId: ticketId  // Enviar ticketId a N8N
                }
            };

            // ⚠️ REEMPLAZA CON TU URL DE N8N
            const N8N_WEBHOOK_URL = 'https://tu-dominio.ngrok-free.dev/webhook/smartcu'

            // Enviar a N8N
            const response = await fetch(N8N_WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'  
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error('Error en la conexión con N8N');
            }

            // N8N nos devolverá el análisis de la IA en tiempo real
            const aiResult = await response.json();

            // USAR el ticketId que devuelve N8N (o el que enviamos si no devuelve)
            const finalTicketId = aiResult.ticketId || ticketId;

            // Guardar en LocalStorage con el ticketId CORRECTO
            const ticket = {
                id: finalTicketId,
                ...payload.body,
                aiCategoria: aiResult.categoria,
                aiPrioridad: aiResult.prioridad,
                aiConfianza: aiResult.confianza,
                aiResumen: aiResult.resumen,
                estado: 'Registrado',
                fecha: new Date().toLocaleString('es-CO', { 
                    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                })
            };

            let tickets = JSON.parse(localStorage.getItem('smartcity_tickets') || '[]');
            tickets.unshift(ticket);
            localStorage.setItem('smartcity_tickets', JSON.stringify(tickets));
            localStorage.setItem('smartcity_last_ticket', JSON.stringify(ticket));

            // Redirigir a success con el ticketId correcto
            window.location.href = `success.html?ticket=${finalTicketId}`;

        } catch (error) {
            console.error('Error:', error);
            alert('❌ Error al procesar el reporte: ' + error.message);
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
});