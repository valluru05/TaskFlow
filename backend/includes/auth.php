<?php

require_once __DIR__ . '/functions.php';

start_app_session();

function require_auth(): void
{
    if (empty($_SESSION['user_id'])) {
        json_response(false, 'Authentication required. Please log in.', [], 401);
    }
}

function current_user_id(): int
{
    require_auth();

    return (int) $_SESSION['user_id'];
}

function current_user(): array
{
    require_auth();

    return [
        'id' => (int) $_SESSION['user_id'],
        'name' => $_SESSION['user_name'] ?? '',
        'email' => $_SESSION['user_email'] ?? ''
    ];
}
