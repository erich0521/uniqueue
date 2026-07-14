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
$type = isset($input['type']) && in_array($input['type'], ['walkin', 'appointment'], true)
    ? $input['type']
    : 'walkin';
$appointmentDate = ($type === 'appointment' && !empty($input['appointment_date']))
    ? $input['appointment_date']
    : null;
$documents = isset($input['documents']) && is_array($input['documents']) ? $input['documents'] : [];

if ($studentId <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'A valid student_id is required.']);
    exit;
}

if (empty($documents)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Select at least one document to request.']);
    exit;
}


if ($type === 'appointment' && !$appointmentDate) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'An appointment date is required.']);
    exit;
}

// ---- Validate documents belong to a single office ----
$documentIds = array_map(fn($d) => intval($d['document_id']), $documents);
$placeholders = implode(',', array_fill(0, count($documentIds), '?'));
$types = str_repeat('i', count($documentIds));

$docStmt = $conn->prepare("SELECT id, office_id FROM documents WHERE id IN ($placeholders)");
$docStmt->bind_param($types, ...$documentIds);
$docStmt->execute();
$docResult = $docStmt->get_result();

$officeIds = [];
$foundIds = [];
while ($row = $docResult->fetch_assoc()) {
    $officeIds[(int) $row['id']] = (int) $row['office_id'];
    $foundIds[] = (int) $row['id'];
}
$docStmt->close();

if (count($foundIds) !== count($documentIds)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'One or more selected documents no longer exist.']);
    exit;
}

$uniqueOffices = array_unique(array_values($officeIds));
if (count($uniqueOffices) > 1) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Selected documents belong to different offices. Please submit separate requests per office.',
    ]);
    exit;
}

$officeId = $uniqueOffices[0];

// ---- Generate queue number for this office ----
$countStmt = $conn->prepare("SELECT COUNT(*) AS total FROM queue_tickets WHERE office_id = ?");
$countStmt->bind_param('i', $officeId);
$countStmt->execute();
$countRow = $countStmt->get_result()->fetch_assoc();
$countStmt->close();

$nextNumber = ((int) $countRow['total']) + 1;
$queueNumber = 'Q-' . str_pad((string) $nextNumber, 4, '0', STR_PAD_LEFT);

// ---- Insert the queue ticket + linked documents in a transaction ----
$conn->begin_transaction();

try {
    $ticketStmt = $conn->prepare("
        INSERT INTO queue_tickets
            (student_id, office_id, queue_number, type, status, appointment_date, joined_at)
        VALUES (?, ?, ?, ?, 'waiting', ?, NOW())
    ");
    $ticketStmt->bind_param(
        'iisss',
        $studentId,
        $officeId,
        $queueNumber,
        $type,
        $appointmentDate
    );
    $ticketStmt->execute();
    $ticketId = $conn->insert_id;
    $ticketStmt->close();

    $linkStmt = $conn->prepare("
        INSERT INTO queue_ticket_document (ticket_id, document_id, quantity)
        VALUES (?, ?, ?)
    ");

    foreach ($documents as $doc) {
        $documentId = intval($doc['document_id']);
        $quantity = isset($doc['quantity']) ? max(1, intval($doc['quantity'])) : 1;
        $linkStmt->bind_param('iii', $ticketId, $documentId, $quantity);
        $linkStmt->execute();
    }
    $linkStmt->close();

    $conn->commit();

    echo json_encode([
        'success' => true,
        'ticket' => [
            'id' => $ticketId,
            'queue_number' => $queueNumber,
            'office_id' => $officeId,
            'type' => $type,
            'status' => 'waiting',
            'appointment_date' => $appointmentDate,
        ],
    ]);
} catch (Exception $e) {
    $conn->rollback();
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to submit request: ' . $e->getMessage(),
    ]);
}

$conn->close();