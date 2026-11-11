<?php

require_once __DIR__ . '/../../includes/csrf.php';

require_http_method('POST');
require_auth();
require_csrf_token();

$input = get_json_input();
$id = filter_var($input['id'] ?? null, FILTER_VALIDATE_INT);

if (!$id || $id < 1) {
    json_response(false, 'A valid task ID is required.', [], 422);
}

$pdo = get_database();

$stmt = $pdo->prepare(
    'DELETE FROM tasks WHERE id = :id AND user_id = :user_id'
);

$stmt->execute([
    'id' => $id,
    'user_id' => current_user_id()
]);

if ($stmt->rowCount() === 0) {
    json_response(false, 'Task not found.', [], 404);
}

json_response(true, 'Task deleted successfully.');
