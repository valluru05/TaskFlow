const API_BASE = '/backend/api';

async function getCsrfToken() {
    const response = await fetch(`${API_BASE}/auth/csrf.php`, {
        method: 'GET',
        credentials: 'same-origin'
    });

    const result = await response.json();

    if (!result.success) {
        throw new Error(result.message || 'Unable to initialize security token.');
    }

    const token = result.data?.csrf_token;

    if (!token) {
        throw new Error('Security token was not returned by the server.');
    }

    sessionStorage.setItem('taskflow_csrf_token', token);
    return token;
}

async function sendAuthRequest(endpoint, payload) {
    const csrfToken = await getCsrfToken();

    const response = await fetch(`${API_BASE}/auth/${endpoint}.php`, {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(result.message || 'Something went wrong.');
    }

    return result;
}

// LOGIN
const loginForm = document.getElementById('loginForm');

if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const email = loginForm.querySelector('[name="email"]').value.trim();
        const password = loginForm.querySelector('[name="password"]').value;

        try {
            const result = await sendAuthRequest('login', {
                email,
                password
            });

            const user = result.data.user;

            sessionStorage.setItem('taskflow_user', JSON.stringify(user));

            if (result.data.csrf_token) {
                sessionStorage.setItem(
                    'taskflow_csrf_token',
                    result.data.csrf_token
                );
            }

            window.location.href = 'dashboard.html';

        } catch (error) {
            showMessage(error.message, 'error');
        }
    });
}

// REGISTER
const registerForm = document.getElementById('registerForm');

if (registerForm) {
    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const name = registerForm.querySelector('[name="name"]').value.trim();
        const email = registerForm.querySelector('[name="email"]').value.trim();
        const password = registerForm.querySelector('[name="password"]').value;
        const confirmPassword = registerForm.querySelector(
            '[name="confirm_password"]'
        ).value;

        if (password !== confirmPassword) {
            showMessage('Passwords do not match.', 'error');
            return;
        }

        try {
            await sendAuthRequest('register', {
                name,
                email,
                password
            });

            showMessage('Registration successful! Please log in.', 'success');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1000);

        } catch (error) {
            showMessage(error.message, 'error');
        }
    });
}
