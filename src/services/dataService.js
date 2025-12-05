// Ruta al archivo JSON (relativa al index.html)
const DATA_URL = './assets/data/db.json';

export const dataService = {

    // =================================================
    // MÉTODO GENÉRICO (Para evitar repetir código)
    // =================================================
    _fetchAll: async () => {
        try {
            const response = await fetch(DATA_URL);
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Error crítico cargando datos:", error);
            return null;
        }
    },

    // =================================================
    // MÉTODOS ESPECÍFICOS POR ENTIDAD
    // =================================================

    // 1. PRODUCTOS (Usado en Almacén y para precios en Albaranes)
    getAllProductos: async () => {
        const data = await dataService._fetchAll();
        return data && data.productos ? data.productos : [];
    },

    // 2. CATEGORÍAS (Usado en Almacén para los filtros)
    getAllCategorias: async () => {
        const data = await dataService._fetchAll();
        return data && data.categorias ? data.categorias : [];
    },

    // 3. PROVEEDORES (Usado en TODO: Almacén, Pedidos, Albaranes)
    getAllProveedores: async () => {
        const data = await dataService._fetchAll();
        return data && data.proveedores ? data.proveedores : [];
    },

    // 4. PEDIDOS (Usado en la sección Pedidos)
    getAllPedidos: async () => {
        const data = await dataService._fetchAll();
        return data && data.pedidos ? data.pedidos : [];
    },

    // 5. ALBARANES (Usado en la sección Albaranes)
    getAllAlbaranes: async () => {
        const data = await dataService._fetchAll();
        return data && data.albaranes ? data.albaranes : [];
    },

    // 6. USUARIOS (Usado para el Login)
    getAllUsuarios: async () => {
        const data = await dataService._fetchAll();
        return data && data.usuarios ? data.usuarios : [];
    },

    // 7. RECETAS (Si lo necesitas en el futuro)
    getAllRecetas: async () => {
        const data = await dataService._fetchAll();
        return data && data.recetas ? data.recetas : [];
    }
};