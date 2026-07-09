<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}


include "db.php";

$data = json_decode(file_get_contents("php://input"));

if (!$data) {
    echo json_encode([
        "success" => false,
        "message" => "No input received"
    ]);
    exit;
}

$sr_code = trim($data->sr_code ?? '');
$password = trim($data->password ?? '');

if (empty($sr_code) || empty($password)) {
    echo json_encode([
        "success" => false,
        "message" => "SR-Code and password are required"
    ]);
    exit;
}

$stmt = $conn->prepare(
    "SELECT s.id, s.first_name, s.last_name, s.sr_code, s.password,
            s.college_id, s.program_id, s.year_level,
            c.name AS college_name, p.name AS program_name
     FROM students s
     LEFT JOIN colleges c ON s.college_id = c.id
     LEFT JOIN programs p ON s.program_id = p.id
     WHERE s.sr_code = ?"
);
$stmt->bind_param("s", $sr_code);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid SR-Code or password"
    ]);
    exit;
}

$student = $result->fetch_assoc();

if (!password_verify($password, $student['password'])) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid SR-Code or password"
    ]);
    exit;
}

// Don't send the password hash back to the app
unset($student['password']);

echo json_encode([
    "success" => true,
    "message" => "Login successful",
    "student" => $student
]);

$stmt->close();
$conn->close();
?>