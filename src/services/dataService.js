// src/services/dataService.js
const API_URL = 'http://localhost:3000';

export const dataService = {
    // --- USUARIOS ---
    login: async (username, password) => {
        try {
            // Busca coincidencia exacta de usuario y contraseña
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
        // _expand trae los datos del padre (categoria y proveedor) para mostrar nombres en vez de IDs
        const response = await fetch(`${API_URL}/productos?_expand=categoria&_expand=proveedor`);
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

    // --- PEDIDOS ---
    getPedidos: async () => {
        const response = await fetch(`${API_URL}/pedidos?_expand=proveedor`);
        return await response.json();
    },

    // --- ALBARANES ---
    getAlbaranes: async () => {
        const response = await fetch(`${API_URL}/albaranes`);
        return await response.json();
    },

    // --- DATOS AUXILIARES (Para Selects) ---
    getCategorias: async () => {
        const response = await fetch(`${API_URL}/categorias`);
        return await response.json();
    },


    // --- PROVEEDORES ---
    getProveedores: async () => {
        const response = await fetch(`${API_URL}/proveedores`);
        return await response.json();
    },

    //Función para crear un proveedor
    createProveedor: async (proveedor) => {
        try {
            const response = await fetch(`${API_URL}/proveedores`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(proveedor)
            });
            return await response.json();
        } catch (error) {
            console.error('Error creando proveedor:', error);
            return null;
        }
    }
};