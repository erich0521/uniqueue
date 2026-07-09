<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}



include "db.php";

$college_id = intval($_GET['college_id'] ?? 0);

if (!$college_id) {
    echo json_encode([]);
    exit;
}

$stmt = $conn->prepare("SELECT id AS program_id, name AS program_name FROM programs WHERE college_id = ? AND is_active = 1 ORDER BY name ASC");
$stmt->bind_param("i", $college_id);
$stmt->execute();
$result = $stmt->get_result();

$programs = [];
while ($row = $result->fetch_assoc()) {
    $programs[] = $row;
}

echo json_encode($programs);

$stmt->close();
$conn->close();
?>