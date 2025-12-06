// Ruta al archivo JSON (relativa al index.html)
const DATA_URL = './assets/data/db.json';

export const dataService = {

    // =================================================
    // MÉTODO GENÉRICO (Fetch de Lectura)
    // =================================================
    _fetchAll: async () => {
        try {
            const response = await fetch(DATA_URL);
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status} al cargar ${DATA_URL}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Error crítico cargando datos:", error);
            return null;
        }
    },

    //login
    authenticateUser: async (username, password) => {
        const data = await dataService._fetchAll();
        const user = data.usuarios.find(u => u.username === username && u.password === password);
        return user || null;
    },

    // =================================================
    // MÉTODOS SIMULADOS DE ESCRITURA (CRUD)
    // NOTA: Estas funciones SIMULAN la llamada a una API real.
    // =================================================
    
    createProveedor: async (nuevoProv) => {
        console.log("API SIMULADA: Creando Proveedor:", nuevoProv);
        await new Promise(resolve => setTimeout(resolve, 300)); 
        return { 
            ...nuevoProv, 
            id: Date.now() // ID temporal
        };
    },

    createProducto: async (nuevoProd) => {
        console.log("API SIMULADA: Creando Producto:", nuevoProd);
        await new Promise(resolve => setTimeout(resolve, 300));
        return { 
            ...nuevoProd, 
            id: Date.now() 
        };
    },

    deleteProducto: async (id) => {
        console.log(`API SIMULADA: Eliminando Producto ID: ${id}`);
        await new Promise(resolve => setTimeout(resolve, 200));
        return { success: true, id: id };
    },

    updateProducto: async (prod) => {
        console.log(`API SIMULADA: Actualizando Producto ID: ${prod.id}`, prod);
        await new Promise(resolve => setTimeout(resolve, 200));
        return { success: true, data: prod };
    },
    
    // 🆕 Usado en Recepción
    createAlbaran: async (nuevoAlbaran) => {
        console.log("API SIMULADA: Creando Albarán:", nuevoAlbaran);
        await new Promise(resolve => setTimeout(resolve, 300));
        return { 
            ...nuevoAlbaran, 
            id: Date.now() // ID temporal del nuevo albarán
        };
    },

    // 🆕 Usado en Recepción
    updatePedidoStatus: async (id, newStatus) => {
        console.log(`API SIMULADA: Actualizando Pedido ID ${id} a estado: ${newStatus}`);
        await new Promise(resolve => setTimeout(resolve, 100));
        return { success: true, id: id, status: newStatus };
    },

    // =================================================
    // MÉTODOS ESPECÍFICOS POR ENTIDAD (Lectura)
    // =================================================

    // 🆕 Usado en Recepción (Contiene el FIX para el TypeError)
    getPedidoById: async (id) => {
        // Usamos dataService. para evitar el error de ámbito (TypeError)
        const data = await dataService._fetchAll(); 
        return data && data.pedidos ? data.pedidos.find(p => p.id == id) : null;
    },
    
    getAllProductos: async () => {
        const data = await dataService._fetchAll();
        return data && data.productos ? data.productos : [];
    },

    getAllCategorias: async () => {
        const data = await dataService._fetchAll();
        return data && data.categorias ? data.categorias : [];
    },

    getAllProveedores: async () => {
        const data = await dataService._fetchAll();
        return data && data.proveedores ? data.proveedores : [];
    },

    getAllPedidos: async () => {
        const data = await dataService._fetchAll();
        return data && data.pedidos ? data.pedidos : [];
    },

    getAllAlbaranes: async () => {
        const data = await dataService._fetchAll();
        return data && data.albaranes ? data.albaranes : [];
    },

    getAllUsuarios: async () => {
        const data = await dataService._fetchAll();
        return data && data.usuarios ? data.usuarios : [];
    },

    getAllRecetas: async () => {
        const data = await dataService._fetchAll();
        return data && data.recetas ? data.recetas : [];
    }
};