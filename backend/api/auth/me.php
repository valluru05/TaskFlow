<?php

require_once __DIR__ . '/../../includes/csrf.php';

require_http_method('GET');

$user = current_user();

json_response(true, 'Authenticated user retrieved successfully.', [
    'user' => $user,
    'csrf_token' => generate_csrf_token()
]);
