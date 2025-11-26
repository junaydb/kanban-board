-- Insert test board for existing user
INSERT INTO boards (title, created_at, user_id)
SELECT 'Mock Board', '2025-08-05T10:00:00Z', id
FROM "user"
WHERE name LIKE 'Junayd Bhoyroo'
LIMIT 1;

-- Insert tasks with updated schema
INSERT INTO tasks (title, description, status, due_date, has_due_time, created_at, board_id)
SELECT
  title,
  description,
  status::task_status,
  due_date::timestamp,
  has_due_time,
  created_at::timestamp,
  board_id
FROM (VALUES
  ('Design homepage layout', 'Create wireframes for the homepage UI', 'TODO', '2025-09-10T09:00:00Z', true, '2025-08-05T12:00:00Z'),
  ('Set up project repository', NULL, 'DONE', '2025-09-05T14:00:00Z', true, '2025-08-05T12:15:00Z'),
  ('Implement user authentication', 'Add login and registration endpoints', 'IN_PROGRESS', '2025-09-15T11:00:00Z', true, '2025-08-05T12:30:00Z'),
  ('Write unit tests for API', 'Test core API endpoints for reliability', 'TODO', '2025-09-20T10:00:00Z', true, '2025-08-05T12:45:00Z'),
  ('Style navigation bar', NULL, 'IN_PROGRESS', '2025-09-12T15:00:00Z', false, '2025-08-05T13:00:00Z'),
  ('Optimize database queries', 'Improve performance of user data retrieval', 'TODO', '2025-09-25T13:00:00Z', true, '2025-08-05T13:15:00Z'),
  ('Add form validation', 'Implement client-side validation for input forms', 'DONE', '2025-09-08T16:00:00Z', true, '2025-08-05T13:30:00Z'),
  ('Set up CI/CD pipeline', NULL, 'IN_PROGRESS', '2025-09-18T09:00:00Z', false, '2025-08-05T13:45:00Z'),
  ('Create API documentation', 'Document all API endpoints in Swagger', 'TODO', '2025-09-22T14:00:00Z', true, '2025-08-05T14:00:00Z'),
  ('Fix responsive design issues', 'Ensure UI works on mobile devices', 'IN_PROGRESS', '2025-09-17T11:00:00Z', true, '2025-08-05T14:15:00Z'),
  ('Integrate payment gateway', NULL, 'TODO', '2025-09-30T12:00:00Z', true, '2025-08-05T14:30:00Z'),
  ('Conduct security audit', 'Review code for vulnerabilities', 'TODO', '2025-10-01T10:00:00Z', false, '2025-08-05T14:45:00Z'),
  ('Add user profile page', 'Design and code user profile interface', 'DONE', '2025-09-07T13:00:00Z', true, '2025-08-05T15:00:00Z'),
  ('Test cross-browser compatibility', NULL, 'IN_PROGRESS', '2025-09-23T15:00:00Z', true, '2025-08-05T15:15:00Z'),
  ('Implement search functionality', 'Add search bar with autocomplete', 'TODO', '2025-09-27T09:00:00Z', true, '2025-08-05T15:30:00Z'),
  ('Update dependencies', 'Upgrade libraries to latest versions', 'DONE', '2025-09-06T16:00:00Z', false, '2025-08-05T15:45:00Z'),
  ('Create error handling middleware', NULL, 'IN_PROGRESS', '2025-09-19T11:00:00Z', true, '2025-08-05T16:00:00Z'),
  ('Design database schema', 'Define tables for user and transaction data', 'DONE', '2025-09-05T12:00:00Z', true, '2025-08-05T16:15:00Z'),
  ('Add notification system', 'Implement email alerts for user actions', 'TODO', '2025-09-29T14:00:00Z', false, '2025-08-05T16:30:00Z'),
  ('Deploy to staging environment', NULL, 'IN_PROGRESS', '2025-10-02T09:00:00Z', true, '2025-08-05T16:45:00Z')
) AS task_data(title, description, status, due_date, has_due_time, created_at)
CROSS JOIN (
  SELECT id FROM boards WHERE title LIKE 'Mock Board' ORDER BY created_at DESC LIMIT 1
) AS board_data(board_id);
