import { dataService } from '../services/dataService.js';

export const inventarioController = async () => {
    // --- REFERENCIAS AL DOM ---
    const tabla = document.querySelector('#tabla-inventario tbody');
    const btnNuevo = document.getElementById('btn-abrir-modal-producto');
    
    // Filtros
    const inputBusqueda = document.getElementById('filtro-producto-nombre');
    const selectCategoriaFiltro = document.getElementById('filtro-producto-categoria');
    const btnFiltrar = document.getElementById('btn-filtrar-inventario');
    const btnOrdenar = document.getElementById('btn-ordenar-precio');

    // Modal y Formulario
    const modal = document.getElementById('producto-modal');
    const formModal = document.getElementById('producto-form');
    const btnCerrarModal = document.querySelector('.close-button');
    const btnCancelarModal = document.getElementById('btn-cancelar-producto');
    
    // Inputs del Formulario Modal
    const inpId = document.getElementById('producto-id');
    const inpNombre = document.getElementById('producto-nombre');
    const inpSku = document.getElementById('producto-sku');
    const inpStock = document.getElementById('producto-stock');
    const inpStockMin = document.getElementById('producto-stock-minimo');
    const inpPrecio = document.getElementById('producto-precio');
    const inpUnidad = document.getElementById('producto-unidad-medida');
    const txtDesc = document.getElementById('producto-descripcion');
    
    // Selects del Modal
    const selCatModal = document.getElementById('producto-categoria');
    const selProvModal = document.getElementById('producto-proveedor');

    let todosLosProductos = [];

    // ============================================================
    // 1. CARGA INICIAL
    // ============================================================
    if (tabla) {
        tabla.innerHTML = '<tr><td colspan="9">Cargando inventario...</td></tr>';
        try {
            await cargarFiltrosCabecera();
            // TRUCO: Cargar selects del modal al inicio para asegurar que existen
            await cargarSelectsDelModal(); 
            todosLosProductos = await dataService.getAllProductos();
            renderizarTabla(todosLosProductos);
        } catch (error) {
            console.error("Error inicial:", error);
        }
    }

    // ============================================================
    // 2. RENDERIZAR TABLA
    // ============================================================
    function renderizarTabla(lista) {
        tabla.innerHTML = '';
        if (!lista || lista.length === 0) {
            tabla.innerHTML = '<tr><td colspan="9" align="center">No hay productos disponibles</td></tr>';
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
                    <td>
                        <button class="btn-primary-small btn-editar" data-id="${prod.id}">✏️</button>
                    </td>
                </tr>
            `;
        });

        document.querySelectorAll('.btn-editar').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                abrirModalParaEditar(id);
            });
        });
    }

    // ============================================================
    // 3. ABRIR MODAL (Aquí asignamos los valores)
    // ============================================================
    async function abrirModalParaEditar(idProducto) {
        const producto = todosLosProductos.find(p => p.id == idProducto);
        if (!producto) return;

        // Aseguramos que los selects tengan opciones
        if (selCatModal.options.length <= 1 || selProvModal.options.length <= 1) {
            await cargarSelectsDelModal();
        }

        // Rellenar Campos Básicos
        inpId.value = producto.id;
        inpNombre.value = producto.nombre;
        inpSku.value = producto.codigoBarras || '';
        inpStock.value = producto.stock;
        inpStockMin.value = producto.stockMinimo;
        inpPrecio.value = producto.precio;
        inpUnidad.value = producto.unidadMedida || '';
        txtDesc.value = producto.descripcion || '';

        // Rellenar SELECTS (Conversión Crítica)
        // 1. Obtenemos el ID. Si no existe en categoriaId, lo buscamos en el objeto expandido.
        const catId = producto.categoriaId || (producto.categoria ? producto.categoria.id : "");
        const provId = producto.proveedorId || (producto.proveedor ? producto.proveedor.id : "");

        // 2. Convertimos a String porque el 'value' del HTML Option es texto.
        selCatModal.value = String(catId);
        selProvModal.value = String(provId);

        console.log(`Abriendo ID ${producto.id}. Cat: ${catId}, Prov: ${provId}`);

        document.getElementById('modal-title').innerText = `Editar Producto #${producto.id}`;
        modal.style.display = 'block';
    }

    // ============================================================
    // 4. GUARDAR CAMBIOS (Aquí estaba el fallo)
    // ============================================================
    if (formModal) {
        formModal.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Depuración: Ver qué valores tienen los selects en este momento
            console.log("Valor Select Categoria:", selCatModal.value);
            console.log("Valor Select Proveedor:", selProvModal.value);

            // Validar
            if (!selCatModal.value || !selProvModal.value) {
                alert("Selecciona Categoría y Proveedor antes de guardar.");
                return;
            }

            const datosAUpdatear = {
                nombre: inpNombre.value,
                codigoBarras: inpSku.value,
                stock: parseInt(inpStock.value),
                stockMinimo: parseInt(inpStockMin.value),
                precio: parseFloat(inpPrecio.value),
                unidadMedida: inpUnidad.value,
                descripcion: txtDesc.value,
                
                // IMPORTANTE: Volvemos a usar parseInt.
                // Tu Solomillo (que funciona) usa números (categoriaId: 3).
                // Si enviamos "3" (string), se rompe la relación.
                categoriaId: parseInt(selCatModal.value),
                proveedorId: parseInt(selProvModal.value)
            };

            console.log("Enviando PATCH...", datosAUpdatear);

            const res = await dataService.updateProducto(inpId.value, datosAUpdatear);

            if (res) {
                alert('✅ Guardado');
                modal.style.display = 'none';
                
                // Recarga forzosa
                tabla.innerHTML = '<tr><td colspan="9" align="center">Actualizando...</td></tr>';
                todosLosProductos = await dataService.getProductos();
                renderizarTabla(todosLosProductos);
            } else {
                alert('❌ Error al guardar');
            }
        });
    }

    const cerrarModal = () => { modal.style.display = 'none'; };
    if(btnCerrarModal) btnCerrarModal.addEventListener('click', cerrarModal);
    if(btnCancelarModal) btnCancelarModal.addEventListener('click', cerrarModal);


    // ============================================================
    // 5. CARGAR SELECTS
    // ============================================================
    async function cargarFiltrosCabecera() {
        if(selectCategoriaFiltro) {
            const cats = await dataService.getAllCategorias();
            selectCategoriaFiltro.innerHTML = '<option value="">Todas las Categorías</option>' + 
                cats.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('');
        }
    }

    async function cargarSelectsDelModal() {
        const cats = await dataService.getAllCategorias();
        const provs = await dataService.getAllProveedores();

        if (selCatModal) {
            selCatModal.innerHTML = '<option value="">Selecciona...</option>' + 
                cats.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('');
        }
        if (selProvModal) {
            selProvModal.innerHTML = '<option value="">Selecciona...</option>' + 
                provs.map(p => `<option value="${p.id}">${p.nombre}</option>`).join('');
        }
    }

    // ============================================================
    // 6. FILTROS
    // ============================================================
    function aplicarFiltros() {
        const texto = inputBusqueda.value.toLowerCase().trim();
        const catId = selectCategoriaFiltro.value;
        const filtrados = todosLosProductos.filter(prod => {
            const nombreOk = prod.nombre.toLowerCase().includes(texto);
            const catOk = catId === "" || prod.categoriaId == catId;
            return nombreOk && catOk;
        });
        renderizarTabla(filtrados);
    }

    if (inputBusqueda) inputBusqueda.addEventListener('input', aplicarFiltros);
    if (selectCategoriaFiltro) selectCategoriaFiltro.addEventListener('change', aplicarFiltros);
    if (btnFiltrar) btnFiltrar.addEventListener('click', aplicarFiltros);
    if (btnOrdenar) btnOrdenar.addEventListener('click', () => {
        todosLosProductos.sort((a, b) => a.precio - b.precio);
        aplicarFiltros();
    });
    if (btnNuevo) btnNuevo.addEventListener('click', () => { window.location.hash = '#productoNuevo'; });
};

