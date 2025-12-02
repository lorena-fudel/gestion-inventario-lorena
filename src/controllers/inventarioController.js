import { dataService } from '../services/dataService.js';

export const inventarioController = async () => {
    const tabla = document.querySelector('#tabla-inventario tbody');
    const btnNuevo = document.getElementById('btn-abrir-modal-producto');
    
    // Controles
    const inputBusqueda = document.getElementById('filtro-producto-nombre');
    const selectCategoria = document.getElementById('filtro-producto-categoria');
    const btnFiltrar = document.getElementById('btn-filtrar-inventario');
    const btnOrdenar = document.getElementById('btn-ordenar-precio');

    let todosLosProductos = [];

    // --- 1. CARGA INICIAL ---
    if (tabla) {
        tabla.innerHTML = '<tr><td colspan="9">Cargando...</td></tr>';
        try {
            todosLosProductos = await dataService.getProductos();
            await cargarCategoriasFiltro();
            renderizarTabla(todosLosProductos);
        } catch (error) {
            console.error(error);
        }
    }

    // --- 2. FUNCIÓN DE RENDERIZADO ---
    function renderizarTabla(lista) {
        tabla.innerHTML = '';
        if (!lista || lista.length === 0) {
            tabla.innerHTML = '<tr><td colspan="9" align="center">No hay coincidencias</td></tr>';
            return;
        }
        
        lista.forEach(prod => {
            const catName = prod.categoria ? prod.categoria.nombre : '-';
            const provName = prod.proveedor ? prod.proveedor.nombre : '-';
            const stockStyle = prod.stock <= prod.stockMinimo ? 'color:red; font-weight:bold' : '';

            tabla.innerHTML += `
                <tr>
                    <td>${prod.id}</td>
                    <td><strong>${prod.nombre}</strong></td>
                    <td>${prod.codigoBarras || '-'}</td>
                    <td style="${stockStyle}">${prod.stock}</td>
                    <td>${prod.stockMinimo}</td>
                    <td>${prod.precio} €</td>
                    <td>${catName}</td>
                    <td>${provName}</td>
                    <td><button class="btn-primary-small">✏️</button></td>
                </tr>
            `;
        });
    }

    // --- 3. LÓGICA DE FILTRADO CENTRALIZADA ---
    // Creamos esta función para poder llamarla desde el input, el select o el botón
    function aplicarFiltros() {
        const texto = inputBusqueda.value.toLowerCase().trim();
        const catId = selectCategoria.value;

        const filtrados = todosLosProductos.filter(prod => {
            // Filtro Texto
            const nombreOk = prod.nombre.toLowerCase().includes(texto);
            // Filtro Categoría
            const catOk = catId === "" || prod.categoriaId == catId;
            
            return nombreOk && catOk;
        });

        renderizarTabla(filtrados);
    }

    // --- 4. EVENTOS (Aquí está la magia) ---

    // A) Mientras escribes (Tiempo Real)
    if (inputBusqueda) {
        inputBusqueda.addEventListener('input', aplicarFiltros);
    }

    // B) Al cambiar la categoría (Tiempo Real)
    if (selectCategoria) {
        selectCategoria.addEventListener('change', aplicarFiltros);
    }

    // C) Botón Filtrar (Opcional, ya que ahora es automático, pero lo mantenemos)
    if (btnFiltrar) {
        btnFiltrar.addEventListener('click', aplicarFiltros);
    }

    // D) Botón Ordenar Precio
    if (btnOrdenar) {
        btnOrdenar.addEventListener('click', () => {
            // Ordenamos la lista maestra
            todosLosProductos.sort((a, b) => a.precio - b.precio);
            // Re-aplicamos los filtros para mantener la búsqueda actual pero ordenada
            aplicarFiltros();
        });
    }

    // --- 5. CARGAR CATEGORÍAS ---
    async function cargarCategoriasFiltro() {
        if (selectCategoria) {
            const cats = await dataService.getCategorias();
            selectCategoria.innerHTML = '<option value="">Todas las Categorías</option>' + 
                cats.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('');
        }
    }

    // --- 6. NAV A NUEVO PRODUCTO ---
    if (btnNuevo) {
        btnNuevo.addEventListener('click', () => {
            window.location.hash = '#productoNuevo';
        });
    }
};