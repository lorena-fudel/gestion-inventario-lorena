import { dataService } from '../services/dataService.js';

export const pedidosController = async () => {
    const tabla = document.querySelector('#tabla-pedidos tbody');

    if (tabla) {
        const pedidos = await dataService.getPedidos();
        tabla.innerHTML = '';

        pedidos.forEach(p => {
            const provName = p.proveedor ? p.proveedor.nombre : 'Desconocido';
            
            // Determinar clase para el estado
            let statusClass = 'status-pending'; // define css styles si quieres
            if(p.estado === 'Recibido') statusClass = 'status-ok';

            const row = `
                <tr>
                    <td>${p.id}</td>
                    <td>${p.fecha || '2024-01-01'}</td>
                    <td>${provName}</td>
                    <td>${p.total || 0} €</td>
                    <td><span class="badge ${statusClass}">${p.estado}</span></td>
                    <td><button class="btn-primary-small">👁️</button></td>
                </tr>
            `;
            tabla.innerHTML += row;
        });
    }
};