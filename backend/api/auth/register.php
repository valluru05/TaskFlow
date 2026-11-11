<?php

require_once __DIR__ . '/../../includes/csrf.php';

require_http_method('POST');
require_csrf_token();

$data = get_json_input();

$name = clean_string($data['name'] ?? '');
$email = strtolower(clean_string($data['email'] ?? ''));
$password = $data['password'] ?? '';

if (strlen($name) < 2 || strlen($name) > 100) {
    json_response(false, 'Name must contain between 2 and 100 characters.', [], 422);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 150) {
    json_response(false, 'Please provide a valid email address.', [], 422);
}

if (!is_string($password) || strlen($password) < 8 || strlen($password) > 72) {
    json_response(false, 'Password must contain between 8 and 72 characters.', [], 422);
}

try {
    $pdo = get_database();

    $check = $pdo->prepare('SELECT id FROM users WHERE email = :email LIMIT 1');
    $check->execute(['email' => $email]);

    if ($check->fetch()) {
        json_response(false, 'An account with this email already exists.', [], 409);
    }

    $passwordHash = password_hash($password, PASSWORD_DEFAULT);

    $stmt = $pdo->prepare(
        'INSERT INTO users (name, email, password) VALUES (:name, :email, :password)'
    );

    $stmt->execute([
        'name' => $name,
        'email' => $email,
        'password' => $passwordHash
    ]);

    json_response(
        true,
        'Registration successful. Please log in.',
        ['user_id' => (int) $pdo->lastInsertId()],
        201
    );

} catch (PDOException $e) {
    error_log('Registration error: ' . $e->getMessage());

    if ($e->getCode() === '23000') {
        json_response(false, 'An account with this email already exists.', [], 409);
    }

    json_response(false, 'Unable to create your account right now.', [], 500);
}
