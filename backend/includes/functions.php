<?php

/**
 * TaskFlow shared backend utilities.
 */

function start_app_session(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }

    ini_set('session.use_strict_mode', '1');
    ini_set('session.use_only_cookies', '1');

    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
        'httponly' => true,
        'samesite' => 'Lax'
    ]);

    session_start();
}

function json_response(
    bool $success,
    string $message,
    array $data = [],
    int $statusCode = 200
): void {
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');

    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data
    ], JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);

    exit;
}

function require_http_method(string $method): void
{
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== strtoupper($method)) {
        header('Allow: ' . strtoupper($method));
        json_response(false, 'Method not allowed.', [], 405);
    }
}

function get_json_input(): array
{
    $raw = file_get_contents('php://input');

    if ($raw === false || trim($raw) === '') {
        json_response(false, 'Request body is required.', [], 400);
    }

    $data = json_decode($raw, true);

    if (!is_array($data) || json_last_error() !== JSON_ERROR_NONE) {
        json_response(false, 'Invalid JSON request body.', [], 400);
    }

    return $data;
}

function clean_string(mixed $value): string
{
    return is_string($value) ? trim($value) : '';
}

function get_database(): PDO
{
    require_once __DIR__ . '/../config/database.php';

    return $pdo;
}
