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
    echo json_encode(['success' => false, 'message' => 'Only POST is allowed.']);
    exit;
}

$DB_HOST = 'localhost';
$DB_NAME = 'uniqueue';
$DB_USER = 'root';
$DB_PASS = '';

$conn = new mysqli($DB_HOST, $DB_USER, $DB_PASS, $DB_NAME);

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database connection failed.']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

$studentId = isset($input['student_id']) ? intval($input['student_id']) : 0;
$ticketId = isset($input['ticket_id']) ? intval($input['ticket_id']) : 0;
$rating = isset($input['rating']) ? intval($input['rating']) : 0;
$comment = isset($input['comment']) && trim($input['comment']) !== ''
    ? trim($input['comment'])
    : null;

if ($studentId <= 0 || $ticketId <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'A valid student_id and ticket_id are required.']);
    exit;
}

if ($rating < 1 || $rating > 5) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Rating must be between 1 and 5.']);
    exit;
}

// ---- Verify ticket belongs to student, is 'done', and has no existing feedback ----
$checkStmt = $conn->prepare("
    SELECT qt.id, qt.queue_number, o.name AS office_name, f.id AS feedback_id
    FROM queue_tickets qt
    JOIN offices o ON o.id = qt.office_id
    LEFT JOIN feedbacks f ON f.ticket_id = qt.id
    WHERE qt.id = ? AND qt.student_id = ?
");
$checkStmt->bind_param('ii', $ticketId, $studentId);
$checkStmt->execute();
$ticket = $checkStmt->get_result()->fetch_assoc();
$checkStmt->close();

if (!$ticket) {
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'Ticket not found for this student.']);
    exit;
}

if ($ticket['feedback_id'] !== null) {
    http_response_code(409);
    echo json_encode(['success' => false, 'message' => 'Feedback has already been submitted for this ticket.']);
    exit;
}

// Re-check status separately so we can give a clearer message than a generic 404
$statusStmt = $conn->prepare("SELECT status FROM queue_tickets WHERE id = ?");
$statusStmt->bind_param('i', $ticketId);
$statusStmt->execute();
$statusRow = $statusStmt->get_result()->fetch_assoc();
$statusStmt->close();

if (!$statusRow || $statusRow['status'] !== 'done') {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Feedback can only be submitted for completed transactions.']);
    exit;
}

// ---- Insert feedback ----
try {
    $insertStmt = $conn->prepare("
        INSERT INTO feedbacks (ticket_id, student_id, rating, comment)
        VALUES (?, ?, ?, ?)
    ");
    $insertStmt->bind_param('iiis', $ticketId, $studentId, $rating, $comment);
    $insertStmt->execute();
    $feedbackId = $conn->insert_id;
    $insertStmt->close();

    echo json_encode([
        'success' => true,
        'feedback' => [
            'id' => $feedbackId,
            'ticket_id' => $ticketId,
            'rating' => $rating,
            'comment' => $comment,
        ],
    ]);
} catch (Exception $e) {
    // Unique key on ticket_id will throw here if there's a race condition
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to submit feedback: ' . $e->getMessage(),
    ]);
}

$conn->close();