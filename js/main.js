// js/main.js - Para success.html
document.addEventListener('DOMContentLoaded', () => {
    const ticket = JSON.parse(localStorage.getItem('smartcity_last_ticket'));
    
    if (ticket) {
        document.getElementById('ticketId').textContent = '#' + ticket.id;
        document.getElementById('aiCategoria').textContent = ticket.aiCategoria;
        document.getElementById('aiPrioridad').textContent = ticket.aiPrioridad;
        document.getElementById('aiConfianza').textContent = ticket.aiConfianza;
        document.getElementById('aiResumen').textContent = ticket.aiResumen;
    } else {
        // Si no hay ticket, redirigir al formulario
        window.location.href = 'form.html';
    }
});