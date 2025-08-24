-- Insert test user
INSERT INTO "user" (id, name, email, email_verified, image, created_at, updated_at) VALUES
('test-user-1', 'John Doe', 'john.doe@example.com', true, 'https://example.com/avatar.jpg', '2025-08-01T10:00:00Z', '2025-08-01T10:00:00Z');

-- Insert test board
INSERT INTO boards (title, created_at, user_id) VALUES
('Project Board', '2025-08-05T10:00:00Z', 'test-user-1');

-- Insert tasks with updated schema
INSERT INTO tasks (title, description, status, due_date, has_due_time, created_at, board_id) VALUES
('Design homepage layout', 'Create wireframes for the homepage UI', 'TODO', '2025-09-10T09:00:00Z', true, '2025-08-05T12:00:00Z', 1),
('Set up project repository', NULL, 'DONE', '2025-09-05T14:00:00Z', true, '2025-08-05T12:15:00Z', 1),
('Implement user authentication', 'Add login and registration endpoints', 'IN_PROGRESS', '2025-09-15T11:00:00Z', true, '2025-08-05T12:30:00Z', 1),
('Write unit tests for API', 'Test core API endpoints for reliability', 'TODO', '2025-09-20T10:00:00Z', true, '2025-08-05T12:45:00Z', 1),
('Style navigation bar', NULL, 'IN_PROGRESS', '2025-09-12T15:00:00Z', true, '2025-08-05T13:00:00Z', 1),
('Optimize database queries', 'Improve performance of user data retrieval', 'TODO', '2025-09-25T13:00:00Z', true, '2025-08-05T13:15:00Z', 1),
('Add form validation', 'Implement client-side validation for input forms', 'DONE', '2025-09-08T16:00:00Z', true, '2025-08-05T13:30:00Z', 1),
('Set up CI/CD pipeline', NULL, 'IN_PROGRESS', '2025-09-18T09:00:00Z', true, '2025-08-05T13:45:00Z', 1),
('Create API documentation', 'Document all API endpoints in Swagger', 'TODO', '2025-09-22T14:00:00Z', true, '2025-08-05T14:00:00Z', 1),
('Fix responsive design issues', 'Ensure UI works on mobile devices', 'IN_PROGRESS', '2025-09-17T11:00:00Z', true, '2025-08-05T14:15:00Z', 1),
('Integrate payment gateway', NULL, 'TODO', '2025-09-30T12:00:00Z', true, '2025-08-05T14:30:00Z', 1),
('Conduct security audit', 'Review code for vulnerabilities', 'TODO', '2025-10-01T10:00:00Z', true, '2025-08-05T14:45:00Z', 1),
('Add user profile page', 'Design and code user profile interface', 'DONE', '2025-09-07T13:00:00Z', true, '2025-08-05T15:00:00Z', 1),
('Test cross-browser compatibility', NULL, 'IN_PROGRESS', '2025-09-23T15:00:00Z', true, '2025-08-05T15:15:00Z', 1),
('Implement search functionality', 'Add search bar with autocomplete', 'TODO', '2025-09-27T09:00:00Z', true, '2025-08-05T15:30:00Z', 1),
('Update dependencies', 'Upgrade libraries to latest versions', 'DONE', '2025-09-06T16:00:00Z', true, '2025-08-05T15:45:00Z', 1),
('Create error handling middleware', NULL, 'IN_PROGRESS', '2025-09-19T11:00:00Z', true, '2025-08-05T16:00:00Z', 1),
('Design database schema', 'Define tables for user and transaction data', 'DONE', '2025-09-05T12:00:00Z', true, '2025-08-05T16:15:00Z', 1),
('Add notification system', 'Implement email alerts for user actions', 'TODO', '2025-09-29T14:00:00Z', true, '2025-08-05T16:30:00Z', 1),
('Deploy to staging environment', NULL, 'IN_PROGRESS', '2025-10-02T09:00:00Z', true, '2025-08-05T16:45:00Z', 1);
