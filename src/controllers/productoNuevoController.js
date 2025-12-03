import { dataService } from '../services/dataService.js';

let listaTemporal = [];

export const productoNuevoController = async () => {
    // --- Referencias al DOM ---
    const btnAgregar = document.getElementById('btn-anadir-a-tabla');
    const btnRegistrarDB = document.getElementById('btn-registrar-productos');
    const tablaTemp = document.querySelector('#productos-temp-table tbody');
    const contador = document.getElementById('contador-productos-temp');

    // Inputs Producto
    const inputNombre = document.getElementById('new-producto-nombre');
    const inputPrecio = document.getElementById('new-producto-precio');
    const selectCategoria = document.getElementById('select-categoria'); 
    
    // Inputs Proveedor y Toggle
    const selectProveedor = document.getElementById('select-proveedor');
    const inputProvNombre = document.getElementById('new-prov-nombre');
    const divExtraProv = document.getElementById('extra-prov-fields');
    const btnToggleProv = document.getElementById('btn-toggle-new-prov');
    
    // Inputs Extra Proveedor
    const inputProvEmail = document.getElementById('new-prov-email');
    const inputProvTel = document.getElementById('new-prov-telefono');
    const inputProvDir = document.getElementById('new-prov-direccion');

    // Estado: ¿Estamos creando un proveedor nuevo?
    let isNewProvMode = false;

    // --- 1. CARGAR DATOS INICIALES ---
    if(selectCategoria) {
        const cats = await dataService.getCategorias();
        selectCategoria.innerHTML = cats.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('');
    }
    await cargarProveedoresEnSelect();

    // --- 2. LÓGICA DEL BOTÓN "NUEVO / EXISTENTE" ---
    if (btnToggleProv) {
        btnToggleProv.addEventListener('click', () => {
            isNewProvMode = !isNewProvMode; // Cambiar estado true/false

            if (isNewProvMode) {
                // Modo CREAR
                selectProveedor.style.display = 'none';
                inputProvNombre.style.display = 'block';
                divExtraProv.style.display = 'block';
                btnToggleProv.innerText = '📋 Listado';
                btnToggleProv.classList.replace('btn-secondary', 'btn-primary');
                inputProvNombre.focus();
            } else {
                // Modo SELECCIONAR
                selectProveedor.style.display = 'block';
                inputProvNombre.style.display = 'none';
                divExtraProv.style.display = 'none';
                btnToggleProv.innerText = '➕ Nuevo';
                btnToggleProv.classList.replace('btn-primary', 'btn-secondary');
            }
        });
    }

    // --- 3. BOTÓN AÑADIR A LISTA TEMPORAL ---
    if (btnAgregar) {
        btnAgregar.addEventListener('click', async () => {
            // Validaciones básicas
            if (!inputNombre.value || !inputPrecio.value) {
                alert('Falta el nombre o precio del producto.');
                return;
            }

            let finalProveedorId = null;
            let finalProveedorNombre = '';

            // --- LÓGICA CRÍTICA: GESTIÓN DEL PROVEEDOR ---
            if (isNewProvMode) {
                // A) MODO NUEVO: Primero creamos el proveedor en la BD
                if (!inputProvNombre.value) {
                    alert('Escribe el nombre del nuevo proveedor.');
                    return;
                }

                if(!confirm(`Se va a registrar primero al proveedor "${inputProvNombre.value}". ¿Continuar?`)) return;

                const nuevoProv = {
                    nombre: inputProvNombre.value,
                    email: inputProvEmail.value,
                    telefono: inputProvTel.value,
                    direccion: inputProvDir.value
                };

                // Guardamos en BD y esperamos respuesta
                const provGuardado = await dataService.createProveedor(nuevoProv);
                
                if (provGuardado) {
                    finalProveedorId = provGuardado.id; // ¡Tenemos ID nuevo!
                    finalProveedorNombre = provGuardado.nombre;
                    
                    // IMPORTANTE: Refrescar el select y volver al modo lista
                    await cargarProveedoresEnSelect();
                    selectProveedor.value = finalProveedorId; // Seleccionamos el nuevo
                    btnToggleProv.click(); // Volver visualmente a modo lista
                } else {
                    alert('Error al crear el proveedor.');
                    return;
                }

            } else {
                // B) MODO EXISTENTE: Usamos el ID del select
                if (!selectProveedor.value) {
                    alert('Selecciona un proveedor de la lista.');
                    return;
                }
                finalProveedorId = parseInt(selectProveedor.value);
                finalProveedorNombre = selectProveedor.options[selectProveedor.selectedIndex].text;
            }

            // --- CREAR OBJETO PRODUCTO TEMPORAL ---
            const prodTemp = {
                idTemp: Date.now(),
                nombre: inputNombre.value,
                precio: parseFloat(inputPrecio.value),
                stock: 0,
                categoriaId: selectCategoria ? parseInt(selectCategoria.value) : 1,
                proveedorId: finalProveedorId, // ID REAL (existente o recién creado)
                displayProveedor: finalProveedorNombre // Solo para mostrar en tabla
            };

            listaTemporal.push(prodTemp);
            renderTabla();
            
            // Limpiar inputs de producto
            inputNombre.value = '';
            inputPrecio.value = '';
            inputNombre.focus();
        });
    }

    // --- 4. RENDERIZAR TABLA TEMPORAL ---
    const renderTabla = () => {
        tablaTemp.innerHTML = '';
        listaTemporal.forEach(p => {
            tablaTemp.innerHTML += `
                <tr>
                    <td>${p.idTemp}</td>
                    <td>${p.nombre}</td>
                    <td>${p.precio} €</td>
                    <td>${p.displayProveedor}</td>
                    <td>Hoy</td>
                    <td><button onclick="window.borrarTemp(${p.idTemp})">🗑️</button></td>
                </tr>
            `;
        });
        if(contador) contador.innerText = listaTemporal.length;
        if(btnRegistrarDB) btnRegistrarDB.disabled = listaTemporal.length === 0;
    };

    window.borrarTemp = (id) => {
        listaTemporal = listaTemporal.filter(x => x.idTemp !== id);
        renderTabla();
    };

    // --- 5. GUARDAR PRODUCTOS EN BD ---
    if (btnRegistrarDB) {
        btnRegistrarDB.addEventListener('click', async () => {
            let count = 0;
            // Guardamos producto a producto
            for(let item of listaTemporal) {
                const { idTemp, displayProveedor, ...cleanItem } = item;
                const res = await dataService.createProducto(cleanItem);
                if(res) count++;
            }
            alert(`¡Éxito! Se han registrado ${count} productos.`);
            listaTemporal = [];
            renderTabla();
            window.location.hash = '#almacen';
        });
    }

    // --- AUXILIAR: CARGAR SELECT ---
    async function cargarProveedoresEnSelect() {
        if(selectProveedor) {
            const provs = await dataService.getProveedores();
            selectProveedor.innerHTML = '<option value="">-- Selecciona --</option>' + 
                provs.map(p => `<option value="${p.id}">${p.nombre}</option>`).join('');
        }
    }
};