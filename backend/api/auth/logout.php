<?php

require_once __DIR__ . '/../../includes/csrf.php';

require_http_method('POST');
require_auth();
require_csrf_token();

// Remove session data.
$_SESSION = [];

// Expire the session cookie.
if (ini_get('session.use_cookies')) {
    $params = session_get_cookie_params();

    setcookie(
        session_name(),
        '',
        [
            'expires' => time() - 42000,
            'path' => $params['path'],
            'domain' => $params['domain'],
            'secure' => $params['secure'],
            'httponly' => $params['httponly'],
            'samesite' => $params['samesite'] ?? 'Lax'
        ]
    );
}

session_destroy();

json_response(true, 'Logged out successfully.');
