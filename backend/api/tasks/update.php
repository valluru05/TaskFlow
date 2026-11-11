<?php

require_once __DIR__ . '/../../includes/csrf.php';

require_http_method('POST');
require_auth();
require_csrf_token();

$input = get_json_input();

$id = filter_var($input['id'] ?? null, FILTER_VALIDATE_INT);
$title = clean_string($input['title'] ?? '');
$description = clean_string($input['description'] ?? '');
$status = clean_string($input['status'] ?? '');
$priority = clean_string($input['priority'] ?? '');
$dueDate = clean_string($input['due_date'] ?? '');

if (!$id || $id < 1) {
    json_response(false, 'A valid task ID is required.', [], 422);
}

if ($title === '' || mb_strlen($title) > 200) {
    json_response(false, 'Title is required and must not exceed 200 characters.', [], 422);
}

if (!in_array($status, ['Pending', 'In Progress', 'Completed'], true)) {
    json_response(false, 'Invalid task status.', [], 422);
}

if (!in_array($priority, ['Low', 'Medium', 'High'], true)) {
    json_response(false, 'Invalid task priority.', [], 422);
}

if ($dueDate !== '') {
    $date = DateTime::createFromFormat('!Y-m-d', $dueDate);

    if (!$date || $date->format('Y-m-d') !== $dueDate) {
        json_response(false, 'Invalid due date. Use YYYY-MM-DD.', [], 422);
    }
} else {
    $dueDate = null;
}

$pdo = get_database();
$userId = current_user_id();

$check = $pdo->prepare(
    'SELECT id FROM tasks WHERE id = :id AND user_id = :user_id'
);
$check->execute(['id' => $id, 'user_id' => $userId]);

if (!$check->fetch()) {
    json_response(false, 'Task not found.', [], 404);
}

$stmt = $pdo->prepare(
    'UPDATE tasks
     SET title = :title,
         description = :description,
         status = :status,
         priority = :priority,
         due_date = :due_date
     WHERE id = :id AND user_id = :user_id'
);

$stmt->execute([
    'title' => $title,
    'description' => $description,
    'status' => $status,
    'priority' => $priority,
    'due_date' => $dueDate,
    'id' => $id,
    'user_id' => $userId
]);

json_response(true, 'Task updated successfully.', [
    'id' => $id
]);
