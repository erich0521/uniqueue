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

$sql = "SELECT id AS college_id, name AS college_name FROM colleges WHERE is_active = 1 ORDER BY name ASC";
$result = $conn->query($sql);

$colleges = [];
while ($row = $result->fetch_assoc()) {
    $colleges[] = $row;
}

echo json_encode($colleges);

$conn->close();
?>