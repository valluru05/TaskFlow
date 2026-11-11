<?php

require_once __DIR__ . '/../../includes/auth.php';

require_http_method('GET');

date_default_timezone_set('Asia/Kolkata');

$userId = current_user_id();
$pdo = get_database();

// Task summary
$summaryStmt = $pdo->prepare(
    "SELECT
        COUNT(*) AS total,
        COALESCE(SUM(status = 'Pending'), 0) AS pending,
        COALESCE(SUM(status = 'In Progress'), 0) AS in_progress,
        COALESCE(SUM(status = 'Completed'), 0) AS completed
     FROM tasks
     WHERE user_id = :user_id"
);

$summaryStmt->execute(['user_id' => $userId]);
$summary = $summaryStmt->fetch();

$total = (int) $summary['total'];
$completed = (int) $summary['completed'];

$summary['total'] = $total;
$summary['pending'] = (int) $summary['pending'];
$summary['in_progress'] = (int) $summary['in_progress'];
$summary['completed'] = $completed;
$summary['completion_percentage'] = $total > 0
    ? (int) round(($completed / $total) * 100)
    : 0;

// Five most recently created tasks
$recentStmt = $pdo->prepare(
    "SELECT id, title, description, status, priority, due_date, created_at
     FROM tasks
     WHERE user_id = :user_id
     ORDER BY created_at DESC, id DESC
     LIMIT 5"
);

$recentStmt->execute(['user_id' => $userId]);
$recentTasks = $recentStmt->fetchAll();

// Five upcoming deadlines
$deadlineStmt = $pdo->prepare(
    "SELECT id, title, status, priority, due_date
     FROM tasks
     WHERE user_id = :user_id
       AND due_date >= CURDATE()
       AND status <> 'Completed'
     ORDER BY due_date ASC, id ASC
     LIMIT 5"
);

$deadlineStmt->execute(['user_id' => $userId]);
$upcomingDeadlines = $deadlineStmt->fetchAll();

// Weekly completed tasks, Monday through Sunday
$monday = new DateTimeImmutable('monday this week');
$nextMonday = $monday->modify('+7 days');

$weeklyStmt = $pdo->prepare(
    "SELECT DATE(updated_at) AS completion_date, COUNT(*) AS task_count
     FROM tasks
     WHERE user_id = :user_id
       AND status = 'Completed'
       AND updated_at >= :week_start
       AND updated_at < :week_end
     GROUP BY DATE(updated_at)"
);

$weeklyStmt->execute([
    'user_id' => $userId,
    'week_start' => $monday->format('Y-m-d 00:00:00'),
    'week_end' => $nextMonday->format('Y-m-d 00:00:00')
]);

$weeklyResults = $weeklyStmt->fetchAll();

$weeklyCounts = [];

foreach ($weeklyResults as $row) {
    $weeklyCounts[$row['completion_date']] = (int) $row['task_count'];
}

$weeklyProductivity = [];

for ($i = 0; $i < 7; $i++) {
    $day = $monday->modify("+{$i} days");
    $date = $day->format('Y-m-d');

    $weeklyProductivity[] = [
        'date' => $date,
        'day' => $day->format('D'),
        'completed' => $weeklyCounts[$date] ?? 0
    ];
}

json_response(true, 'Dashboard statistics retrieved successfully.', [
    'summary' => $summary,
    'recent_tasks' => $recentTasks,
    'upcoming_deadlines' => $upcomingDeadlines,
    'weekly_productivity' => $weeklyProductivity
]);
