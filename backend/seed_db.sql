-- Insert test board for existing user
INSERT INTO boards (title, created_at, user_id)
SELECT 'Mock Board', '2025-08-05T10:00:00Z', id
FROM "user"
WHERE name LIKE 'Junayd Bhoyroo'
LIMIT 1;

-- Insert tasks with updated schema
INSERT INTO tasks (title, description, status, due_date, due_time, created_at, board_id)
SELECT
  title,
  description,
  status::task_status,
  due_date::date,
  due_time::timestamptz,
  created_at::timestamptz,
  board_id
FROM (VALUES
  -- TODO tasks
  ('Design homepage layout', 'Create wireframes for the homepage UI', 'TODO', NULL, NULL, '2025-08-05T12:00:00Z'),
  ('Write unit tests for API', 'Test core API endpoints for reliability', 'TODO', '2025-09-20', '2025-09-20T10:00:00Z', '2025-08-05T12:45:00Z'),
  ('Optimize database queries', 'Improve performance of user data retrieval', 'TODO', NULL, NULL, '2025-08-05T13:15:00Z'),
  ('Create API documentation', 'Document all API endpoints in Swagger', 'TODO', '2025-09-22', '2025-09-22T14:00:00Z', '2025-08-05T14:00:00Z'),
  ('Integrate payment gateway', NULL, 'TODO', '2025-09-30', '2025-09-30T12:00:00Z', '2025-08-05T14:30:00Z'),
  ('Conduct security audit', 'Review code for vulnerabilities', 'TODO', NULL, NULL, '2025-08-05T14:45:00Z'),

  -- IN_PROGRESS tasks
  ('Implement user authentication', 'Add login and registration endpoints', 'IN_PROGRESS', NULL, NULL, '2025-08-05T12:30:00Z'),
  ('Fix responsive design issues', 'Ensure UI works on mobile devices', 'IN_PROGRESS', '2025-09-17', '2025-09-17T11:00:00Z', '2025-08-05T14:15:00Z'),
  ('Set up CI/CD pipeline', NULL, 'IN_PROGRESS', NULL, NULL, '2025-08-05T13:45:00Z'),
  ('Build notification center', 'Create notification management interface', 'IN_PROGRESS', '2025-09-28', '2025-09-28T11:00:00Z', '2025-08-06T03:15:00Z'),
  ('Implement user roles', 'Add role-based access control', 'IN_PROGRESS', '2025-09-30', '2025-09-30T15:00:00Z', '2025-08-06T03:30:00Z'),
  ('Create data visualization', 'Build charts and graphs for analytics', 'IN_PROGRESS', NULL, NULL, '2025-08-06T03:45:00Z'),
  ('Add filter system', 'Implement advanced filtering options', 'IN_PROGRESS', '2025-10-05', '2025-10-05T12:00:00Z', '2025-08-06T04:00:00Z'),

  -- DONE tasks
  ('Set up project repository', NULL, 'DONE', NULL, NULL, '2025-08-05T12:15:00Z'),
  ('Design database schema', 'Define tables for user and transaction data', 'DONE', '2025-09-05', '2025-09-05T12:00:00Z', '2025-08-05T16:15:00Z'),
  ('Configure TypeScript', 'Set up TypeScript configuration', 'DONE', NULL, NULL, '2025-08-06T12:15:00Z'),
  ('Install dependencies', 'Add required npm packages', 'DONE', '2025-09-03', '2025-09-03T15:00:00Z', '2025-08-06T12:30:00Z'),
  ('Set up environment variables', 'Configure .env files', 'DONE', NULL, NULL, '2025-08-06T13:00:00Z'),
  ('Configure database connection', 'Set up PostgreSQL connection', 'DONE', '2025-09-05', '2025-09-05T09:00:00Z', '2025-08-06T13:30:00Z')
) AS task_data(title, description, status, due_date, due_time, created_at)
CROSS JOIN (
  SELECT id FROM boards WHERE title LIKE 'Mock Board' ORDER BY created_at DESC LIMIT 1
) AS board_data(board_id);

-- Insert task positions for the mock board
INSERT INTO task_positions (board_id, todo_pos, in_progress_pos, done_pos)
SELECT
  b.id,
  ARRAY(SELECT t.id FROM tasks t WHERE t.board_id = b.id AND t.status = 'TODO' ORDER BY t.created_at),
  ARRAY(SELECT t.id FROM tasks t WHERE t.board_id = b.id AND t.status = 'IN_PROGRESS' ORDER BY t.created_at),
  ARRAY(SELECT t.id FROM tasks t WHERE t.board_id = b.id AND t.status = 'DONE' ORDER BY t.created_at)
FROM boards b
WHERE b.title LIKE 'Mock Board'
ORDER BY b.created_at DESC
LIMIT 1;
