import { loadView } from '../views/viewLoader.js';

// Importar controladores
import { authController } from '../controllers/authController.js';
import { inventarioController } from '../controllers/inventarioController.js';
import { productoNuevoController } from '../controllers/productoNuevoController.js';
import { pedidosController } from '../controllers/pedidosController.js';
import { albaranesController } from '../controllers/albaranesController.js';

const routes = {
    '': { view: 'landing', controller: null },
    '#login': { view: 'login', controller: authController },
    '#almacen': { view: 'almacen', controller: inventarioController },
    '#productoNuevo': { view: 'productoNuevo', controller: productoNuevoController },
    '#pedidos': { view: 'pedidos', controller: pedidosController },
    '#albaranes': { view: 'albaranes', controller: albaranesController },
    '#recepcion': { view: 'recepcionPedidos', controller: null }
};

export const router = async () => {
    const path = window.location.hash;
    const routeInfo = routes[path] || routes[''];

    // 1. Manejo del Landing
    if (path === '') {
        await loadView('landing');
        document.getElementById('main-nav').style.display = 'none'; // Ocultar nav en landing
        bindLandingEvents();
        return;
    }

    // 2. Protección de rutas (Si no hay usuario, manda al login)
    const user = localStorage.getItem('user');
    if (!user && path !== '#login') {
        window.location.hash = '#login';
        return;
    }

    // 3. Cargar Vista
    await loadView(routeInfo.view);

    // 4. ACTUALIZAR BARRA DE NAVEGACIÓN (Nueva función)
    updateNav(path);

    // 5. Ejecutar Controlador
    if (routeInfo.controller) {
        routeInfo.controller();
    }
};

// --- FUNCIONES AUXILIARES ---

function updateNav(currentPath) {
    const nav = document.getElementById('main-nav');
    const user = localStorage.getItem('user');

    // Lógica de visibilidad: Solo mostrar si hay usuario Y no estamos en login
    if (user && currentPath !== '#login') {
        nav.style.display = 'block';
    } else {
        nav.style.display = 'none';
    }

    // Lógica de clase "Active" (Para resaltar donde estamos)
    const links = nav.querySelectorAll('a');
    links.forEach(link => {
        // Compara el href del link con el hash actual
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // Lógica de Cerrar Sesión (Se asigna el evento una sola vez)
    const btnLogout = document.getElementById('btn-logout');
    // Usamos onclick directo para no acumular event listeners
    if (btnLogout) {
        btnLogout.onclick = (e) => {
            e.preventDefault();
            logout();
        };
    }
}

function logout() {
    if(confirm('¿Seguro que quieres cerrar sesión?')) {
        localStorage.removeItem('user'); // Borrar credenciales
        window.location.hash = ''; // Ir al inicio
        // El router detectará el cambio y ocultará el menú automáticamente
    }
}

export const bindLandingEvents = () => {
    const btnAcceder = document.getElementById('btn-show-login');
    if (btnAcceder) {
        btnAcceder.addEventListener('click', () => {
            window.location.hash = '#login';
        });
    }
};