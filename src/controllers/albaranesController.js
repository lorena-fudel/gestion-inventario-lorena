import { dataService } from '../services/dataService.js';

export const albaranesController = async () => {
    const tabla = document.querySelector('#albaranes-list-table tbody');

    if(tabla) {
        const albaranes = await dataService.getAlbaranes();
        tabla.innerHTML = '';
        
        albaranes.forEach(alb => {
            const row = `
                <tr>
                    <td>${alb.id}</td>
                    <td>${alb.fecha}</td>
                    <td>${alb.pedidoId || '-'}</td>
                    <td>${alb.articulos ? alb.articulos.length : 0} items</td>
                    <td>Confirmado</td>
                    <td><button class="btn-secondary">Ver PDF</button></td>
                </tr>
            `;
            tabla.innerHTML += row;
        });
    }
};