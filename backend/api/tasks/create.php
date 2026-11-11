<?php

require_once __DIR__ . '/../../includes/csrf.php';

require_http_method('POST');
require_auth();
require_csrf_token();

$input = get_json_input();

$title = clean_string($input['title'] ?? '');
$description = clean_string($input['description'] ?? '');
$status = clean_string($input['status'] ?? 'Pending');
$priority = clean_string($input['priority'] ?? 'Medium');
$dueDate = clean_string($input['due_date'] ?? '');

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

$stmt = $pdo->prepare(
    'INSERT INTO tasks (user_id, title, description, status, priority, due_date)
     VALUES (:user_id, :title, :description, :status, :priority, :due_date)'
);

$stmt->execute([
    'user_id' => current_user_id(),
    'title' => $title,
    'description' => $description,
    'status' => $status,
    'priority' => $priority,
    'due_date' => $dueDate
]);

$taskId = (int) $pdo->lastInsertId();

json_response(true, 'Task created successfully.', [
    'id' => $taskId
], 201);
