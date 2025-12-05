import { dataService } from '../services/dataService.js';

// Variables de estado
let productos = [];
let categorias = [];
let proveedores = [];

export const inventarioController = {
    
    // Método de inicio
    init: async () => {
        console.log("Controlador de Inventario INICIADO");

        // 1. Cargar datos en paralelo para mayor velocidad
        // Necesitamos categorías y proveedores para rellenar nombres en la tabla
        const data = await Promise.all([
            dataService.getAllProductos(),
            dataService.getAllCategorias ? dataService.getAllCategorias() : fetchCategoriasFallback(),
            dataService.getAllProveedores()
        ]);

        productos = data[0];
        categorias = data[1];
        proveedores = data[2];

        // 2. Renderizar inicial
        renderizarFiltros();
        renderizarTabla(productos);

        // 3. Configurar eventos (Búsqueda y Filtros)
        configurarListeners();
    }
};

// --- FUNCIONES DE AYUDA ---

// Por si no tienes getAllCategorias en dataService
async function fetchCategoriasFallback() {
    try {
        const resp = await fetch('assets/data/db.json');
        const json = await resp.json();
        return json.categorias || [];
    } catch (e) { return []; }
}

// --- RENDERIZADO ---

function renderizarTabla(listaProductos) {
    const tbody = document.getElementById('tablaProductosBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (listaProductos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding: 20px;">No se encontraron productos.</td></tr>';
        return;
    }

    listaProductos.forEach(prod => {
        // Cruzar datos: Obtener nombres de categoría y proveedor
        const cat = categorias.find(c => c.id == prod.categoriaId)?.nombre || 'Sin Cat.';
        const prov = proveedores.find(p => p.id == prod.proveedorId)?.nombre || 'Sin Prov.';
        
        // Calcular estado del stock
        let stockClass = 'ok';
        let stockText = 'OK';
        
        if (prod.stock <= 0) {
            stockClass = 'agotado';
            stockText = 'AGOTADO';
        } else if (prod.stock <= prod.stockMinimo) {
            stockClass = 'bajo';
            stockText = 'BAJO';
        }

        // Imagen por defecto si no hay
        const imagenUrl = prod.imagen ? `assets/images/${prod.imagen}` : 'assets/images/placeholder.png'; // Asegúrate de tener una imagen placeholder

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><img src="${imagenUrl}" alt="prod" class="img-thumb" onerror="this.src='https://via.placeholder.com/40'"></td>
            <td>
                <strong>${prod.nombre}</strong>
                <span class="text-small">Ref: ${prod.codigoBarras || 'N/A'}</span>
            </td>
            <td>${cat}</td>
            <td>${prov}</td>
            <td style="text-align: right;" class="precio-cell">${parseFloat(prod.precio).toFixed(2)} €</td>
            <td style="text-align: center; font-weight: bold;">${prod.stock}</td>
            <td style="text-align: center;">
                <span class="stock-badge ${stockClass}">${stockText}</span>
            </td>
            <td>
                <div class="acciones-group">
                    <button class="btn-icon edit" title="Editar" onclick="alert('Editar ID: ${prod.id}')">✏️</button>
                    <button class="btn-icon delete" title="Eliminar" onclick="alert('Eliminar ID: ${prod.id}')">🗑️</button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function renderizarFiltros() {
    // Rellenar Select de Categorías
    const selectCat = document.getElementById('filtroCategoria');
    if (selectCat) {
        selectCat.innerHTML = '<option value="">Todas las categorías</option>';
        categorias.forEach(c => {
            selectCat.innerHTML += `<option value="${c.id}">${c.nombre}</option>`;
        });
    }

    // Rellenar Select de Proveedores
    const selectProv = document.getElementById('filtroProveedor');
    if (selectProv) {
        selectProv.innerHTML = '<option value="">Todos los proveedores</option>';
        proveedores.forEach(p => {
            selectProv.innerHTML += `<option value="${p.id}">${p.nombre}</option>`;
        });
    }
}

// --- EVENTOS ---

function configurarListeners() {
    const inputBuscar = document.getElementById('busquedaNombre');
    const filtroCat = document.getElementById('filtroCategoria');
    const filtroProv = document.getElementById('filtroProveedor');
    const filtroStock = document.getElementById('filtroStock');
    const btnLimpiar = document.getElementById('btnLimpiar');
    const btnNuevo = document.getElementById('btnNuevoProducto');

    const filtrarDatos = () => {
        const texto = inputBuscar.value.toLowerCase();
        const catId = filtroCat.value;
        const provId = filtroProv.value;
        const stockStatus = filtroStock.value; // bajo, agotado, ok

        const filtrados = productos.filter(p => {
            // 1. Texto (Nombre o Código)
            const matchTexto = p.nombre.toLowerCase().includes(texto) || 
                               (p.codigoBarras && p.codigoBarras.includes(texto));

            // 2. Categoría
            const matchCat = catId === "" || p.categoriaId == catId;

            // 3. Proveedor
            const matchProv = provId === "" || p.proveedorId == provId;

            // 4. Estado Stock
            let matchStock = true;
            if (stockStatus === 'agotado') matchStock = p.stock <= 0;
            else if (stockStatus === 'bajo') matchStock = p.stock > 0 && p.stock <= p.stockMinimo;
            else if (stockStatus === 'ok') matchStock = p.stock > p.stockMinimo;

            return matchTexto && matchCat && matchProv && matchStock;
        });

        renderizarTabla(filtrados);
    };

    // Listeners
    if(inputBuscar) inputBuscar.addEventListener('input', filtrarDatos);
    if(filtroCat) filtroCat.addEventListener('change', filtrarDatos);
    if(filtroProv) filtroProv.addEventListener('change', filtrarDatos);
    if(filtroStock) filtroStock.addEventListener('change', filtrarDatos);

    if(btnLimpiar) {
        btnLimpiar.addEventListener('click', () => {
            inputBuscar.value = '';
            filtroCat.value = '';
            filtroProv.value = '';
            filtroStock.value = '';
            renderizarTabla(productos);
        });
    }

    // Navegación al botón de Nuevo Producto
    if(btnNuevo) {
        btnNuevo.addEventListener('click', () => {
            window.location.hash = '#productoNuevo'; // Asegúrate de tener esta ruta en el router
        });
    }
}