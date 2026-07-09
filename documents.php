<?php
// documents.php
// Returns all requestable documents grouped with their office and requirements.
//
// Usage: GET /uniqueue_api/documents.php
//
// Matches the actual `uniqueue` schema:
//   documents(id, name, office_id, daily_capacity, processing_time)
//   document_requirements(id, document_id, requirement)
//   offices(id, name, slug, description, is_active)

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

$sql = "
    SELECT
        d.id,
        d.name,
        d.office_id,
        o.name AS office_name,
        d.daily_capacity,
        d.processing_time
    FROM documents d
    JOIN offices o ON o.id = d.office_id
    WHERE o.is_active = 1
    ORDER BY o.name ASC, d.name ASC
";

$result = $conn->query($sql);

if (!$result) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Query failed: ' . $conn->error,
    ]);
    exit;
}

$documents = [];
$documentIds = [];

while ($row = $result->fetch_assoc()) {
    $documents[$row['id']] = [
        'id' => (int) $row['id'],
        'name' => $row['name'],
        'office_id' => (int) $row['office_id'],
        'office_name' => $row['office_name'],
        'daily_capacity' => $row['daily_capacity'] !== null ? (int) $row['daily_capacity'] : null,
        'processing_time' => $row['processing_time'] !== null ? (int) $row['processing_time'] : null,
        'requirements' => [],
    ];
    $documentIds[] = (int) $row['id'];
}

// Attach requirements for all documents in one query.
if (!empty($documentIds)) {
    $placeholders = implode(',', array_fill(0, count($documentIds), '?'));
    $types = str_repeat('i', count($documentIds));


    
    $reqSql = "
        SELECT document_id, requirement
        FROM document_requirements
        WHERE document_id IN ($placeholders)
        ORDER BY id ASC
    ";

    $reqStmt = $conn->prepare($reqSql);
    $reqStmt->bind_param($types, ...$documentIds);
    $reqStmt->execute();
    $reqResult = $reqStmt->get_result();

    while ($reqRow = $reqResult->fetch_assoc()) {
        $docId = (int) $reqRow['document_id'];
        if (isset($documents[$docId])) {
            $documents[$docId]['requirements'][] = $reqRow['requirement'];
        }
    }

    $reqStmt->close();
}

echo json_encode([
    'success' => true,
    'documents' => array_values($documents),
]);

$conn->close();