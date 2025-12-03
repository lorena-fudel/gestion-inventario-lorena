const API_URL = 'http://localhost:3000';

export const dataService = {
    // --- USUARIOS ---
    login: async (username, password) => {
        try {
            const response = await fetch(`${API_URL}/usuarios?username=${username}&password=${password}`);
            const users = await response.json();
            return users.length > 0 ? users[0] : null;
        } catch (error) {
            console.error('Error login:', error);
            return null;
        }
    },

    // --- PRODUCTOS ---
    getProductos: async () => {
        // TRUCO ANTI-CACHÉ: 
        // Añadimos &t=${Date.now()} para que el navegador NO use datos viejos de la memoria.
        // _expand trae los objetos completos de categoria y proveedor.
        const url = `${API_URL}/productos?_expand=categoria&_expand=proveedor&t=${Date.now()}`;
        const response = await fetch(url);
        return await response.json();
    },

    createProducto: async (producto) => {
        const response = await fetch(`${API_URL}/productos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(producto)
        });
        return await response.json();
    },

    updateProducto: async (id, datosParciales) => {
        try {
            // USAMOS PATCH: Solo modifica los campos que enviamos, respeta el resto.
            const response = await fetch(`${API_URL}/productos/${id}`, {
                method: 'PATCH', 
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datosParciales)
            });
            return await response.json();
        } catch (error) {
            console.error('Error actualizando:', error);
            return null;
        }
    },

    // --- CATEGORÍAS Y PROVEEDORES ---
    getCategorias: async () => {
        const response = await fetch(`${API_URL}/categorias`);
        return await response.json();
    },

    getProveedores: async () => {
        const response = await fetch(`${API_URL}/proveedores`);
        return await response.json();
    },

    createProveedor: async (proveedor) => {
        const response = await fetch(`${API_URL}/proveedores`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(proveedor)
        });
        return await response.json();
    },

    // --- PEDIDOS Y ALBARANES ---
    getPedidos: async () => {
        const response = await fetch(`${API_URL}/pedidos?_expand=proveedor`);
        return await response.json();
    },

    getAlbaranes: async () => {
        const response = await fetch(`${API_URL}/albaranes`);
        return await response.json();
    }
};