import { router, bindLandingEvents } from './routers/router.js';

// Cuando la página carga, iniciamos el router
window.addEventListener('load', () => {
    router();
});

// Cuando cambia el hash (#), ejecutamos el router
window.addEventListener('hashchange', router);