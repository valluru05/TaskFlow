<?php

require_once __DIR__ . '/../../includes/auth.php';

require_http_method('GET');

$userId = current_user_id();
$pdo = get_database();

$userStmt = $pdo->prepare(
    'SELECT id, name, email, role, created_at
     FROM users
     WHERE id = :id
     LIMIT 1'
);

$userStmt->execute(['id' => $userId]);
$user = $userStmt->fetch();

if (!$user) {
    json_response(false, 'User account not found.', [], 404);
}

$statsStmt = $pdo->prepare(
    "SELECT
        COUNT(*) AS total,
        COALESCE(SUM(status = 'Completed'), 0) AS completed,
        COALESCE(SUM(status = 'Pending'), 0) AS pending,
        COALESCE(SUM(status = 'In Progress'), 0) AS in_progress
     FROM tasks
     WHERE user_id = :user_id"
);

$statsStmt->execute(['user_id' => $userId]);
$stats = $statsStmt->fetch();

foreach ($stats as $key => $value) {
    $stats[$key] = (int) $value;
}

json_response(true, 'Profile retrieved successfully.', [
    'user' => $user,
    'statistics' => $stats
]);
