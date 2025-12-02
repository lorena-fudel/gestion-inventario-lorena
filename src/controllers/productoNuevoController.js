import { dataService } from '../services/dataService.js';

let listaTemporal = []; // Array para guardar productos antes de enviar a DB

export const productoNuevoController = async () => {
    const btnAgregar = document.getElementById('btn-anadir-a-tabla');
    const btnRegistrarDB = document.getElementById('btn-registrar-productos');
    const tablaTemp = document.querySelector('#productos-temp-table tbody');
    const contador = document.getElementById('contador-productos-temp');

    // Referencias al formulario
    const inputNombre = document.getElementById('new-producto-nombre');
    const inputPrecio = document.getElementById('new-producto-precio');
    
    // NOTA: Para conectar con DB.json correctamente, deberías usar Selects para proveedor y categoría.
    // Asumiremos que has añadido <select id="select-categoria"> en tu HTML como sugería el comentario.
    const selectCategoria = document.getElementById('select-categoria'); // Asegúrate de agregarlo a tu HTML
    const selectProveedor = document.getElementById('select-proveedor'); // Asegúrate de agregarlo a tu HTML

    // Cargar selects si existen
    if(selectCategoria && selectProveedor) {
        const cats = await dataService.getCategorias();
        const provs = await dataService.getProveedores();
        
        selectCategoria.innerHTML = cats.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('');
        selectProveedor.innerHTML = provs.map(p => `<option value="${p.id}">${p.nombre}</option>`).join('');
    }

    // 1. Botón "Añadir a la Lista Temporal"
    if (btnAgregar) {
        btnAgregar.addEventListener('click', () => {
            // Validación simple
            if (!inputNombre.value || !inputPrecio.value) {
                alert('Faltan datos obligatorios (Nombre o Precio)');
                return;
            }

            const prodTemp = {
                idTemp: Date.now(), // ID temporal único
                nombre: inputNombre.value,
                precio: parseFloat(inputPrecio.value),
                stock: 0, // Inicial por defecto
                categoriaId: selectCategoria ? parseInt(selectCategoria.value) : 1, // Por defecto 1 si no hay select
                proveedorId: selectProveedor ? parseInt(selectProveedor.value) : 1,
                // Datos visuales para la tabla temporal
                provNombre: selectProveedor ? selectProveedor.options[selectProveedor.selectedIndex].text : 'General'
            };

            listaTemporal.push(prodTemp);
            renderTablaTemporal();
            
            // Limpiar inputs clave
            inputNombre.value = '';
            inputPrecio.value = '';
            inputNombre.focus();
        });
    }

    // 2. Renderizar tabla temporal
    const renderTablaTemporal = () => {
        tablaTemp.innerHTML = '';
        listaTemporal.forEach(p => {
            const row = `
                <tr>
                    <td>${p.idTemp}</td>
                    <td>${p.nombre}</td>
                    <td>${p.precio} €</td>
                    <td>${p.provNombre}</td>
                    <td>Hoy</td>
                    <td><button class="btn-danger" onclick="eliminarTemp(${p.idTemp})">🗑️</button></td>
                </tr>
            `;
            tablaTemp.innerHTML += row;
        });
        
        // Actualizar contador y botón guardar
        contador.innerText = listaTemporal.length;
        btnRegistrarDB.disabled = listaTemporal.length === 0;
    };

    // Hacer la función eliminar accesible globalmente para el onclick del string HTML
    window.eliminarTemp = (id) => {
        listaTemporal = listaTemporal.filter(p => p.idTemp !== id);
        renderTablaTemporal();
    };

    // 3. Botón "Registrar TODOS en DB"
    if (btnRegistrarDB) {
        btnRegistrarDB.addEventListener('click', async () => {
            if(!confirm('¿Seguro que quieres guardar estos productos en la base de datos?')) return;

            let guardados = 0;
            
            // Recorremos la lista y enviamos uno por uno
            for (const prod of listaTemporal) {
                // Quitamos propiedades temporales antes de enviar
                const { idTemp, provNombre, ...productoParaDB } = prod;
                
                const resultado = await dataService.createProducto(productoParaDB);
                if (resultado) guardados++;
            }

            if (guardados === listaTemporal.length) {
                alert('¡Todos los productos se han guardado correctamente!');
                listaTemporal = []; // Vaciar lista
                renderTablaTemporal();
                window.location.hash = '#almacen'; // Ir al almacén para verlos
            } else {
                alert(`Se guardaron ${guardados} de ${listaTemporal.length}. Hubo errores.`);
            }
        });
    }
};