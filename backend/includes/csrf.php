<?php

require_once __DIR__ . '/auth.php';

function generate_csrf_token(): string
{
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }

    return $_SESSION['csrf_token'];
}

function require_csrf_token(): void
{
    $submittedToken = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';

    if (
        !is_string($submittedToken) ||
        empty($_SESSION['csrf_token']) ||
        !hash_equals($_SESSION['csrf_token'], $submittedToken)
    ) {
        json_response(false, 'Invalid or missing CSRF token. Refresh and try again.', [], 403);
    }
}
