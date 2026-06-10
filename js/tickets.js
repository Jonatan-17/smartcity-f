// js/tickets.js
document.addEventListener('DOMContentLoaded', () => {
    cargarTickets();
    
    // Event listeners para filtros
    document.getElementById('filtroEstado')?.addEventListener('change', cargarTickets);
    document.getElementById('filtroPrioridad')?.addEventListener('change', cargarTickets);
    document.getElementById('filtroCategoria')?.addEventListener('change', cargarTickets);
});

function cargarTickets() {
    const ticketList = document.getElementById('ticketList');
    if (!ticketList) return;

    const tickets = JSON.parse(localStorage.getItem('smartcity_tickets') || '[]');
    
    // Obtener filtros
    const filtroEstado = document.getElementById('filtroEstado')?.value || '';
    const filtroPrioridad = document.getElementById('filtroPrioridad')?.value || '';
    const filtroCategoria = document.getElementById('filtroCategoria')?.value || '';

    // Filtrar tickets
    const ticketsFiltrados = tickets.filter(ticket => {
        return (!filtroEstado || ticket.estado === filtroEstado) &&
               (!filtroPrioridad || ticket.aiPrioridad === filtroPrioridad) &&
               (!filtroCategoria || ticket.aiCategoria === filtroCategoria);
    });

    // Actualizar estadísticas
    document.getElementById('totalTickets').textContent = tickets.length;
    document.getElementById('totalRegistrados').textContent = tickets.filter(t => t.estado === 'Registrado').length;
    document.getElementById('totalProceso').textContent = tickets.filter(t => t.estado === 'En Asignación' || t.estado === 'En Reparación').length;
    document.getElementById('totalSolucionados').textContent = tickets.filter(t => t.estado === 'Solucionado').length;

    if (ticketsFiltrados.length === 0) {
        ticketList.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: var(--gray);">
                <p style="font-size: 3rem; margin-bottom: 1rem;">📭</p>
                <h3>No hay reportes ${filtroEstado || filtroPrioridad || filtroCategoria ? 'con esos filtros' : 'aún'}</h3>
                <p>${filtroEstado || filtroPrioridad || filtroCategoria ? 'Intenta con otros filtros' : 'Registra tu primer reporte de daño urbano'}</p>
                <a href="form.html" class="btn btn-primary" style="margin-top: 1rem;">Reportar Daño</a>
            </div>
        `;
        return;
    }

    ticketList.innerHTML = ticketsFiltrados.map(ticket => `
        <div class="ticket-item ${ticket.aiPrioridad.toLowerCase()}" onclick="verDetalle('${ticket.id}')">
            <div class="ticket-info">
                <h3>#${ticket.id} - ${ticket.aiCategoria}</h3>
                <p>${ticket.fecha} · Prioridad: ${ticket.aiPrioridad}</p>
                <p style="margin-top: 0.5rem;">${ticket.descripcion.substring(0, 100)}${ticket.descripcion.length > 100 ? '...' : ''}</p>
                <p style="margin-top: 0.5rem; font-size: 0.85rem; color: var(--primary);">
                    📍 ${ticket.lat}, ${ticket.lng}
                </p>
            </div>
            <span class="badge badge-${ticket.estado.toLowerCase().replace(' ', '-')}">${ticket.estado}</span>
        </div>
    `).join('');
}

function limpiarFiltros() {
    document.getElementById('filtroEstado').value = '';
    document.getElementById('filtroPrioridad').value = '';
    document.getElementById('filtroCategoria').value = '';
    cargarTickets();
}

function verDetalle(ticketId) {
    const tickets = JSON.parse(localStorage.getItem('smartcity_tickets') || '[]');
    const ticket = tickets.find(t => t.id === ticketId);
    
    if (!ticket) return;

    const modal = document.getElementById('ticketModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');

    modalTitle.textContent = `Ticket #${ticket.id}`;
    
    const mapsLink = `https://www.google.com/maps?q=${ticket.lat},${ticket.lng}`;
    
    modalBody.innerHTML = `
        <div style="margin-bottom: 1.5rem;">
            <h4 style="margin-bottom: 0.5rem; color: var(--primary);">📊 Estado</h4>
            <span class="badge badge-${ticket.estado.toLowerCase().replace(' ', '-')}" style="font-size: 1rem; padding: 0.5rem 1rem;">${ticket.estado}</span>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
            <div style="background: #f1f5f9; padding: 1rem; border-radius: 8px;">
                <strong>Categoría IA:</strong> ${ticket.aiCategoria}
            </div>
            <div style="background: #f1f5f9; padding: 1rem; border-radius: 8px;">
                <strong>Prioridad:</strong> ${ticket.aiPrioridad}
            </div>
        </div>

        <div style="margin-bottom: 1.5rem;">
            <h4 style="margin-bottom: 0.5rem; color: var(--primary);">👤 Datos del Ciudadano</h4>
            <p><strong>Nombre:</strong> ${ticket.nombre}</p>
            <p><strong>Cédula:</strong> ${ticket.cedula}</p>
            <p><strong>Teléfono:</strong> ${ticket.telefono}</p>
        </div>

        <div style="margin-bottom: 1.5rem;">
            <h4 style="margin-bottom: 0.5rem; color: var(--primary);">📍 Ubicación</h4>
            <p><strong>Coordenadas:</strong> ${ticket.lat}, ${ticket.lng}</p>
            <p><strong>Dirección:</strong> ${ticket.direccion}</p>
            <a href="${mapsLink}" target="_blank" class="btn btn-secondary" style="margin-top: 0.5rem;">🗺️ Ver en Google Maps</a>
        </div>

        <div style="margin-bottom: 1.5rem;">
            <h4 style="margin-bottom: 0.5rem; color: var(--primary);">📝 Descripción</h4>
            <p style="background: #f1f5f9; padding: 1rem; border-radius: 8px;">${ticket.descripcion}</p>
        </div>

        ${ticket.foto ? `
        <div style="margin-bottom: 1.5rem;">
            <h4 style="margin-bottom: 0.5rem; color: var(--primary);">📷 Fotografía</h4>
            <img src="${ticket.foto}" alt="Foto del daño" style="max-width: 100%; border-radius: 8px;">
            <p style="font-size: 0.85rem; color: var(--gray); margin-top: 0.5rem;">${ticket.fotoNombre}</p>
        </div>
        ` : ''}

        <div class="ai-box">
            <h4 style="margin-bottom: 1rem; color: var(--primary);">✦ Análisis de IA</h4>
            <div class="ai-grid">
                <div class="ai-item">
                    <strong>Categoría</strong>
                    <span>${ticket.aiCategoria}</span>
                </div>
                <div class="ai-item">
                    <strong>Prioridad</strong>
                    <span>${ticket.aiPrioridad}</span>
                </div>
                <div class="ai-item">
                    <strong>Confianza</strong>
                    <span>${ticket.aiConfianza}</span>
                </div>
            </div>
            <p style="margin-top: 1rem; font-style: italic; color: var(--gray);">${ticket.aiResumen}</p>
        </div>

        <div style="margin-top: 1.5rem; text-align: right;">
            <button onclick="cerrarModal()" class="btn btn-secondary">Cerrar</button>
        </div>
    `;

    modal.classList.add('active');
}

function cerrarModal() {
    const modal = document.getElementById('ticketModal');
    modal.classList.remove('active');
}

// Cerrar modal al hacer click fuera
document.getElementById('ticketModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'ticketModal') {
        cerrarModal();
    }
});