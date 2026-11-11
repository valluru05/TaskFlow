<?php

require_once __DIR__ . '/../../includes/csrf.php';

require_http_method('GET');

json_response(
    true,
    'CSRF token generated.',
    ['csrf_token' => generate_csrf_token()]
);
