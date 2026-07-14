<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Only POST requests are allowed.',
    ]);
    exit;
}

$DB_HOST = 'localhost';
$DB_NAME = 'trackademic'; // <-- palitan kung iba ang db name mo
$DB_USER = 'root';
$DB_PASS = '';

$conn = new mysqli($DB_HOST, $DB_USER, $DB_PASS, $DB_NAME);

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database connection failed.',
    ]);
    exit;
}

// ---- Read input (JSON body) ----
$data = json_decode(file_get_contents('php://input'), true);

$studentId = isset($data['student_id']) ? intval($data['student_id']) : 0;
$firstName = isset($data['first_name']) ? trim($data['first_name']) : '';
$lastName  = isset($data['last_name']) ? trim($data['last_name']) : '';
$srCode    = isset($data['sr_code']) ? trim($data['sr_code']) : '';

// ---- Validate input ----
if ($studentId <= 0) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'A valid student_id is required.',
    ]);
    exit;
}

if ($firstName === '' || $lastName === '' || $srCode === '') {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'First name, last name, and SR-Code are all required.',
    ]);
    exit;
}

// ---- Make sure the SR-Code isn't already used by another student ----
$checkSql = "SELECT id FROM students WHERE sr_code = ? AND id != ? LIMIT 1";
$checkStmt = $conn->prepare($checkSql);

if (!$checkStmt) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Query preparation failed: ' . $conn->error,
    ]);
    exit;
}

$checkStmt->bind_param('si', $srCode, $studentId);
$checkStmt->execute();
$checkResult = $checkStmt->get_result();

if ($checkResult->fetch_assoc()) {
    $checkStmt->close();
    $conn->close();
    http_response_code(409);
    echo json_encode([
        'success' => false,
        'message' => 'That SR-Code is already used by another account.',
    ]);
    exit;
}

$checkStmt->close();

// ---- Update the student's profile ----
$updateSql = "
    UPDATE students
    SET first_name = ?, last_name = ?, sr_code = ?
    WHERE id = ?
";

$updateStmt = $conn->prepare($updateSql);

if (!$updateStmt) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Query preparation failed: ' . $conn->error,
    ]);
    exit;
}

$updateStmt->bind_param('sssi', $firstName, $lastName, $srCode, $studentId);

if (!$updateStmt->execute()) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to update profile: ' . $updateStmt->error,
    ]);
    $updateStmt->close();
    $conn->close();
    exit;
}

// ---- Return the updated fields (no extra SELECT needed, we already have the values) ----
echo json_encode([
    'success' => true,
    'message' => 'Profile updated successfully.',
    'student' => [
        'id' => $studentId,
        'first_name' => $firstName,
        'last_name' => $lastName,
        'sr_code' => $srCode,
    ],
]);

$updateStmt->close();
$conn->close();