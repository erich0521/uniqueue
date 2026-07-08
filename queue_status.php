<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$DB_HOST = 'localhost';
$DB_NAME = 'uniqueue';
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

// ---- Validate input ----
$studentId = isset($_GET['student_id']) ? intval($_GET['student_id']) : 0;

if ($studentId <= 0) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'A valid student_id is required.',
    ]);
    exit;
}

// ---- Fetch the student's active queue ticket ----
// "Active" = not yet done or cancelled (waiting, called, or in_progress).
$sql = "
    SELECT
        qt.id,
        qt.queue_number,
        qt.status,
        qt.type,
        qt.priority,
        qt.appointment_date,
        qt.joined_at,
        o.name AS office_name,
        (
            SELECT COUNT(*)
            FROM queue_tickets qt2
            WHERE qt2.office_id = qt.office_id
              AND qt2.status = 'waiting'
              AND qt2.joined_at <= qt.joined_at
        ) AS position
    FROM queue_tickets qt
    JOIN offices o ON o.id = qt.office_id
    WHERE qt.student_id = ?
      AND qt.status IN ('waiting', 'called', 'in_progress')
    ORDER BY qt.joined_at DESC
    LIMIT 1
";

$stmt = $conn->prepare($sql);

if (!$stmt) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Query preparation failed: ' . $conn->error,
    ]);
    exit;
}

$stmt->bind_param('i', $studentId);
$stmt->execute();
$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
    // Roughly 3 minutes per person ahead in line — adjust to your own estimate logic.
    $peopleAhead = max(0, ((int) $row['position'] - 1));
    $estimatedWaitMinutes = $row['status'] === 'waiting' ? $peopleAhead * 3 : 0;

    echo json_encode([
        'success' => true,
        'in_queue' => true,
        'queue' => [
            'id' => (int) $row['id'],
            'queue_number' => $row['queue_number'],
            'office_name' => $row['office_name'],
            'status' => $row['status'],
            'type' => $row['type'],
            'priority' => (bool) $row['priority'],
            'appointment_date' => $row['appointment_date'],
            'position' => (int) $row['position'],
            'estimated_wait_minutes' => $estimatedWaitMinutes,
        ],
    ]);
} else {
    echo json_encode([
        'success' => true,
        'in_queue' => false,
    ]);
}

$stmt->close();
$conn->close();