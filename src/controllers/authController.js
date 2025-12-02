import { dataService } from '../services/dataService.js';

export const authController = () => {
    const form = document.getElementById('login-form');
    const errorMsg = document.getElementById('login-error-message');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Tus inputs tienen id="login-usuario" y "login-contrasena"
            const username = document.getElementById('login-usuario').value;
            const password = document.getElementById('login-contrasena').value;

            const user = await dataService.login(username, password);

            if (user) {
                // Login exitoso
                localStorage.setItem('user', JSON.stringify(user));
                window.location.hash = '#almacen'; // Redirigir al inventario
            } else {
                // Mostrar error
                if(errorMsg) errorMsg.style.display = 'block';
                alert('Credenciales incorrectas (Prueba: lala / lala)');
            }
        });
    }
    
    // Botón volver al inicio
    const btnBack = document.getElementById('btn-back-to-landing');
    if(btnBack) {
        btnBack.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.hash = ''; // Volver al home
        });
    }
};