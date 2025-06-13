-- Add admin flag to users table
ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;

-- Create page visits table for analytics
CREATE TABLE IF NOT EXISTS page_visits (
  id VARCHAR(36) PRIMARY KEY,
  page_path VARCHAR(255) NOT NULL,
  user_id VARCHAR(36),
  visit_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  referrer VARCHAR(255),
  user_agent TEXT,
  ip_address VARCHAR(45),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Create daily visit stats table for aggregated analytics
CREATE TABLE IF NOT EXISTS daily_stats (
  id VARCHAR(36) PRIMARY KEY,
  date DATE NOT NULL,
  total_visits INT DEFAULT 0,
  unique_visitors INT DEFAULT 0,
  new_users INT DEFAULT 0,
  returning_users INT DEFAULT 0,
  UNIQUE KEY (date)
);

-- Make the first user an admin (for testing purposes)
UPDATE users SET is_admin = TRUE LIMIT 1;
