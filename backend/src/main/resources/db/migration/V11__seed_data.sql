-- =====================
-- SEED DATA
-- =====================

-- Users
INSERT INTO users (id, email, password_hash, full_name, role) VALUES
(1, 'admin@bugxyz.com', '$2a$10$TEnb1EXGh2npH7RpGcyLeeDJ2/L.mPkTtKkMWhZrHuFyjVqFUBztK', 'Admin User', 'ADMIN'),
(2, 'dev1@bugxyz.com', '$2a$10$TEnb1EXGh2npH7RpGcyLeeDJ2/L.mPkTtKkMWhZrHuFyjVqFUBztK', 'Alice Developer', 'DEVELOPER'),
(3, 'dev2@bugxyz.com', '$2a$10$TEnb1EXGh2npH7RpGcyLeeDJ2/L.mPkTtKkMWhZrHuFyjVqFUBztK', 'Bob Developer', 'DEVELOPER'),
(4, 'tester@bugxyz.com', '$2a$10$TEnb1EXGh2npH7RpGcyLeeDJ2/L.mPkTtKkMWhZrHuFyjVqFUBztK', 'Charlie Tester', 'TESTER');

SELECT setval('users_id_seq', 4);

-- Projects
INSERT INTO projects (id, name, key, description, owner_id) VALUES
(1, 'BugXYZ Platform', 'BXP', 'The main BugXYZ bug tracking platform', 1),
(2, 'Mobile App', 'MOB', 'BugXYZ mobile application for iOS and Android', 1),
(3, 'API Gateway', 'API', 'API gateway and integration services', 1);

SELECT setval('projects_id_seq', 3);

-- Project Members (all users in all projects)
INSERT INTO project_members (project_id, user_id, role) VALUES
(1, 1, 'ADMIN'),
(1, 2, 'DEVELOPER'),
(1, 3, 'DEVELOPER'),
(1, 4, 'TESTER'),
(2, 1, 'ADMIN'),
(2, 2, 'DEVELOPER'),
(2, 3, 'DEVELOPER'),
(2, 4, 'TESTER'),
(3, 1, 'ADMIN'),
(3, 2, 'DEVELOPER'),
(3, 3, 'DEVELOPER'),
(3, 4, 'TESTER');

-- Bugs
INSERT INTO bugs (id, project_id, reporter_id, assignee_id, title, description, status, severity, priority, bug_type, tags, steps_to_reproduce, expected_behavior, actual_behavior, affected_version) VALUES
(1, 1, 4, 2, 'Login page crashes on invalid email format', 'When entering an email without @ symbol, the page crashes with a white screen.', 'OPEN', 'HIGH', 'HIGH', 'BUG', '{"authentication","frontend"}', '1. Go to login page\n2. Enter "testuser" (no @)\n3. Click submit', 'Validation error message shown', 'Page crashes with white screen', '1.0.0'),
(2, 1, 4, 3, 'Dashboard loading time exceeds 10 seconds', 'The main dashboard takes over 10 seconds to load with 100+ bugs.', 'IN_PROGRESS', 'MEDIUM', 'HIGH', 'BUG', '{"performance","dashboard"}', '1. Log in\n2. Navigate to dashboard with 100+ bugs', 'Dashboard loads within 2 seconds', 'Dashboard takes 10+ seconds to load', '1.0.0'),
(3, 1, 2, NULL, 'Add dark mode support', 'Users have requested a dark mode option for the platform.', 'OPEN', 'LOW', 'MEDIUM', 'FEATURE', '{"ui","accessibility"}', NULL, NULL, NULL, NULL),
(4, 1, 4, 2, 'Bug status filter not working correctly', 'Filtering by CLOSED status still shows OPEN bugs.', 'IN_REVIEW', 'MEDIUM', 'MEDIUM', 'BUG', '{"filters","bugs"}', '1. Go to bug list\n2. Select status filter CLOSED\n3. Observe results', 'Only CLOSED bugs shown', 'OPEN bugs also appear in results', '1.0.0'),
(5, 1, 3, 3, 'Implement bulk bug assignment', 'Allow project admins to assign multiple bugs at once.', 'RESOLVED', 'LOW', 'LOW', 'IMPROVEMENT', '{"bulk-operations"}', NULL, NULL, NULL, '1.1.0'),
(6, 2, 4, 2, 'App crashes on Android 12 when uploading images', 'The mobile app crashes immediately when trying to upload an image attachment on Android 12 devices.', 'OPEN', 'CRITICAL', 'URGENT', 'BUG', '{"android","crash","attachments"}', '1. Open any bug on Android 12\n2. Tap "Add Attachment"\n3. Select an image from gallery', 'Image uploads successfully', 'App crashes with ANR dialog', '2.0.0'),
(7, 2, 2, 3, 'Push notifications not received on iOS', 'iOS users report not receiving push notifications for bug assignments.', 'IN_PROGRESS', 'HIGH', 'HIGH', 'BUG', '{"ios","notifications"}', '1. Assign a bug to an iOS user\n2. Check if notification is received', 'Push notification received within 1 minute', 'No notification received at all', '2.0.0'),
(8, 2, 4, NULL, 'Add offline mode for viewing bugs', 'Allow users to view previously loaded bugs when offline.', 'OPEN', 'MEDIUM', 'MEDIUM', 'FEATURE', '{"offline","mobile"}', NULL, NULL, NULL, NULL),
(9, 2, 3, 2, 'Memory leak in bug list scrolling', 'Scrolling through a long list of bugs causes increasing memory usage until the app becomes unresponsive.', 'CLOSED', 'HIGH', 'HIGH', 'BUG', '{"performance","memory"}', '1. Open bug list with 500+ bugs\n2. Scroll continuously for 2 minutes\n3. Observe memory usage', 'Memory stays stable during scrolling', 'Memory increases linearly, eventually causing OOM', '1.9.0'),
(10, 3, 2, 3, 'Rate limiter not applied to webhook endpoints', 'The /api/webhooks/* endpoints are missing rate limiting, allowing potential abuse.', 'OPEN', 'CRITICAL', 'URGENT', 'BUG', '{"security","rate-limiting"}', '1. Send 1000 requests to /api/webhooks/test in 1 second\n2. Observe all requests are processed', 'Requests throttled after 100/minute', 'All 1000 requests processed', '3.0.0'),
(11, 3, 4, 2, 'GraphQL query depth not limited', 'Deeply nested GraphQL queries can cause server resource exhaustion.', 'IN_PROGRESS', 'HIGH', 'HIGH', 'BUG', '{"security","graphql"}', NULL, 'Query depth limited to 10 levels', 'No depth limit enforced', '3.0.0'),
(12, 3, 3, NULL, 'Add gRPC support for internal services', 'Migrate internal service-to-service communication from REST to gRPC for better performance.', 'OPEN', 'MEDIUM', 'MEDIUM', 'IMPROVEMENT', '{"grpc","performance"}', NULL, NULL, NULL, NULL),
(13, 1, 4, 2, 'Search results include deleted bugs', 'Full-text search returns bugs that have been soft-deleted.', 'REOPENED', 'MEDIUM', 'HIGH', 'BUG', '{"search","data-integrity"}', '1. Delete a bug\n2. Search for its title\n3. Observe it still appears in results', 'Deleted bugs excluded from search', 'Deleted bugs still appear in search results', '1.0.0'),
(14, 1, 2, 3, 'Export to CSV missing custom fields', 'When exporting bugs to CSV, custom fields are not included in the output.', 'IN_REVIEW', 'LOW', 'LOW', 'BUG', '{"export","csv"}', NULL, 'CSV includes all fields including custom ones', 'Custom fields are omitted from CSV', '1.1.0'),
(15, 2, 4, 2, 'Biometric login fails after app update', 'Users who had biometric login enabled before the update can no longer authenticate using fingerprint/Face ID.', 'RESOLVED', 'HIGH', 'URGENT', 'BUG', '{"authentication","biometric","mobile"}', '1. Have biometric login enabled\n2. Update app to latest version\n3. Try biometric login', 'Biometric login works after update', 'Biometric login fails with generic error', '2.1.0'),
(16, 3, 2, 2, 'API response times spike during deployments', 'During rolling deployments, API response times increase by 5x for approximately 2 minutes.', 'IN_PROGRESS', 'MEDIUM', 'HIGH', 'BUG', '{"performance","deployment"}', NULL, 'Response times remain stable during deployments', 'Response times spike to 5x normal during deploy window', '3.0.0');

SELECT setval('bugs_id_seq', 16);

-- Comments
INSERT INTO comments (id, bug_id, author_id, content, is_internal) VALUES
(1, 1, 2, 'I can reproduce this consistently. The email validation regex is throwing an uncaught exception.', FALSE),
(2, 1, 4, 'This is blocking QA testing of the login flow. Please prioritize.', FALSE),
(3, 2, 3, 'I''ve identified the bottleneck - it''s the N+1 query in the bug list endpoint. Working on a fix with batch fetching.', FALSE),
(4, 2, 1, 'Internal note: This may be related to the recent ORM upgrade.', TRUE),
(5, 6, 4, 'Tested on Pixel 6 and Samsung Galaxy S22. Both crash on upload.', FALSE),
(6, 6, 2, 'The Android camera intent handling changed in API 31. Need to update the file provider configuration.', FALSE),
(7, 9, 2, 'Fixed by implementing RecyclerView pooling and limiting in-memory bug cache to 50 items.', FALSE),
(8, 10, 3, 'I''ll add rate limiting middleware this sprint. Targeting 100 requests per minute per API key.', FALSE),
(9, 13, 4, 'This was supposedly fixed in v1.0.1 but the issue has reappeared after the search index rebuild.', FALSE),
(10, 15, 2, 'Root cause: the biometric key alias changed in the new keystore configuration. Fix deployed in hotfix 2.1.1.', FALSE);

SELECT setval('comments_id_seq', 10);

-- Activity Log
INSERT INTO activity_log (id, bug_id, project_id, user_id, action, field_name, old_value, new_value) VALUES
(1, 1, 1, 4, 'CREATED', NULL, NULL, NULL),
(2, 1, 1, 1, 'ASSIGNED', 'assignee_id', NULL, '2'),
(3, 2, 1, 4, 'CREATED', NULL, NULL, NULL),
(4, 2, 1, 3, 'STATUS_CHANGED', 'status', 'OPEN', 'IN_PROGRESS'),
(5, 6, 2, 4, 'CREATED', NULL, NULL, NULL),
(6, 9, 2, 2, 'STATUS_CHANGED', 'status', 'IN_PROGRESS', 'RESOLVED'),
(7, 9, 2, 4, 'STATUS_CHANGED', 'status', 'RESOLVED', 'CLOSED'),
(8, 13, 1, 4, 'STATUS_CHANGED', 'status', 'RESOLVED', 'REOPENED'),
(9, 15, 2, 2, 'STATUS_CHANGED', 'status', 'IN_PROGRESS', 'RESOLVED'),
(10, 4, 1, 2, 'STATUS_CHANGED', 'status', 'IN_PROGRESS', 'IN_REVIEW');

SELECT setval('activity_log_id_seq', 10);

-- Bug Relations
INSERT INTO bug_relations (id, source_bug_id, target_bug_id, relation_type, created_by) VALUES
(1, 1, 4, 'RELATED_TO', 2),
(2, 11, 10, 'RELATED_TO', 3),
(3, 7, 6, 'BLOCKED_BY', 2);

SELECT setval('bug_relations_id_seq', 3);

-- Environment Snapshots
INSERT INTO environment_snapshots (id, bug_id, os, os_version, browser, browser_version, device_type, screen_resolution, app_version, additional_info) VALUES
(1, 6, 'Android', '12', NULL, NULL, 'mobile', '1080x2400', '2.0.0', '{"manufacturer": "Google", "model": "Pixel 6"}'),
(2, 7, 'iOS', '16.2', NULL, NULL, 'mobile', '1170x2532', '2.0.0', '{"model": "iPhone 14"}'),
(3, 1, 'Windows', '11', 'Chrome', '119.0', 'desktop', '1920x1080', '1.0.0', NULL);

SELECT setval('environment_snapshots_id_seq', 3);

-- Bug Confirmations
INSERT INTO bug_confirmations (id, bug_id, user_id, confirmed, environment_id, notes) VALUES
(1, 6, 3, TRUE, 1, 'Confirmed on Pixel 6 with Android 12. Crashes immediately on image selection.'),
(2, 1, 2, TRUE, 3, 'Confirmed. Regex pattern does not handle missing @ symbol.');

SELECT setval('bug_confirmations_id_seq', 2);
