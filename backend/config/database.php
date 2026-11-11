
<?php

$configFile = __DIR__ . '/database.local.php';

if (!file_exists($configFile)) {
    error_log('Database configuration file is missing.');
    http_response_code(500);
    exit('Database configuration is not available.');
}

$dbConfig = require $configFile;

try {
    $dsn = sprintf(
        'mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4',
        $dbConfig['host'],
        $dbConfig['port'],
        $dbConfig['database']
    );

    $pdo = new PDO(
        $dsn,
        $dbConfig['username'],
        $dbConfig['password'],
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false
        ]
    );

} catch (PDOException $e) {

    error_log('Database connection failed: ' . $e->getMessage());

    http_response_code(500);

    exit(
        'Unable to connect to the database. Please try again later.'
    );
}
