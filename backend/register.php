<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$host = 'localhost';
$db   = 'uniqueue';
$user = 'root';
$pass = '';

$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    echo json_encode(['success' => false, 'message' => 'Invalid data']);
    exit;
}

$firstName = trim($data['firstName'] ?? '');
$lastName = trim($data['lastName'] ?? '');
$srCode = trim($data['srCode'] ?? '');
$password = $data['password'] ?? '';

if ($firstName === '' || $lastName === '' || $srCode === '' || $password === '') {
    echo json_encode(['success' => false, 'message' => 'Please fill in all fields.']);
    exit;
}

if (strlen($password) < 8) {
    echo json_encode(['success' => false, 'message' => 'Password must be at least 8 characters.']);
    exit;
}

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    ]);

    $check = $pdo->prepare('SELECT id FROM students WHERE sr_code = :sr_code');
    $check->execute([':sr_code' => $srCode]);
    if ($check->fetch()) {
        echo json_encode(['success' => false, 'message' => 'SR-Code already exists.']);
        exit;
    }

    $hash = password_hash($password, PASSWORD_BCRYPT);
    $stmt = $pdo->prepare('INSERT INTO students (first_name, last_name, sr_code, password, created_at, updated_at) VALUES (:first_name, :last_name, :sr_code, :password, NOW(), NOW())');
    $stmt->execute([
        ':first_name' => $firstName,
        ':last_name' => $lastName,
        ':sr_code' => $srCode,
        ':password' => $hash,
    ]);

    echo json_encode(['success' => true, 'message' => 'Account created successfully.']);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
