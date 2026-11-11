<?php

require_once __DIR__ . '/../../includes/auth.php';

require_http_method('GET');
$userId = current_user_id();

$pdo = get_database();

$stmt = $pdo->prepare(
    'SELECT id, title, description, status, priority, due_date, created_at, updated_at
     FROM tasks
     WHERE user_id = :user_id
     ORDER BY created_at DESC, id DESC'
);

$stmt->execute(['user_id' => $userId]);

$tasks = $stmt->fetchAll();

json_response(true, 'Tasks retrieved successfully.', [
    'tasks' => $tasks
]);
