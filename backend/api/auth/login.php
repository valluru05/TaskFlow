<?php

require_once __DIR__ . '/../../includes/csrf.php';

require_http_method('POST');
require_csrf_token();

$data = get_json_input();

$email = strtolower(clean_string($data['email'] ?? ''));
$password = $data['password'] ?? '';

if (!filter_var($email, FILTER_VALIDATE_EMAIL) || !is_string($password) || $password === '') {
    json_response(false, 'Please enter a valid email and password.', [], 422);
}

try {
    $pdo = get_database();

    $stmt = $pdo->prepare(
        'SELECT id, name, email, password, role FROM users WHERE email = :email LIMIT 1'
    );

    $stmt->execute(['email' => $email]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['password'])) {
        json_response(false, 'Invalid email or password.', [], 401);
    }

    // Prevent session fixation.
    session_regenerate_id(true);

    $_SESSION['user_id'] = (int) $user['id'];
    $_SESSION['user_name'] = $user['name'];
    $_SESSION['user_email'] = $user['email'];
    $_SESSION['user_role'] = $user['role'];

    // Rotate CSRF token after authentication.
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));

    json_response(
        true,
        'Login successful.',
        [
            'user' => [
                'id' => (int) $user['id'],
                'name' => $user['name'],
                'email' => $user['email'],
                'role' => $user['role']
            ],
            'csrf_token' => $_SESSION['csrf_token']
        ]
    );

} catch (PDOException $e) {
    error_log('Login error: ' . $e->getMessage());
    json_response(false, 'Unable to log in right now.', [], 500);
}
