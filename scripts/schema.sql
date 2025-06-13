-- Users table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE NOT NULL,
  image VARCHAR(255),
  provider VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_sign_in TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Accounts table (for OAuth)
CREATE TABLE IF NOT EXISTS accounts (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  provider VARCHAR(50) NOT NULL,
  provider_account_id VARCHAR(255) NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at BIGINT,
  token_type VARCHAR(50),
  scope VARCHAR(255),
  id_token TEXT,
  session_state VARCHAR(255),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY provider_account_id_provider (provider_account_id, provider)
);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  expires TIMESTAMP NOT NULL,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Verification tokens table
CREATE TABLE IF NOT EXISTS verification_tokens (
  identifier VARCHAR(255) NOT NULL,
  token VARCHAR(255) NOT NULL,
  expires TIMESTAMP NOT NULL,
  PRIMARY KEY (identifier, token)
);

-- Blogs table
CREATE TABLE IF NOT EXISTS blogs (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  author_id VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Blog likes table
CREATE TABLE IF NOT EXISTS blog_likes (
  id VARCHAR(36) PRIMARY KEY,
  blog_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (blog_id) REFERENCES blogs(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY blog_user (blog_id, user_id)
);

-- Blog comments table
CREATE TABLE IF NOT EXISTS blog_comments (
  id VARCHAR(36) PRIMARY KEY,
  blog_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (blog_id) REFERENCES blogs(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Community posts table
CREATE TABLE IF NOT EXISTS community_posts (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  author_id VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Community post likes table
CREATE TABLE IF NOT EXISTS community_post_likes (
  id VARCHAR(36) PRIMARY KEY,
  post_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES community_posts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY post_user (post_id, user_id)
);

-- Community post comments table
CREATE TABLE IF NOT EXISTS community_post_comments (
  id VARCHAR(36) PRIMARY KEY,
  post_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES community_posts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Practice problems table
CREATE TABLE IF NOT EXISTS practice_problems (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  difficulty ENUM('Easy', 'Medium', 'Hard') NOT NULL,
  topic VARCHAR(100) NOT NULL,
  url VARCHAR(255)
);

-- User progress table
CREATE TABLE IF NOT EXISTS user_progress (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  problem_id VARCHAR(36) NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (problem_id) REFERENCES practice_problems(id) ON DELETE CASCADE,
  UNIQUE KEY user_problem (user_id, problem_id)
);

-- Seed some practice problems (Striver's DSA Sheet)
INSERT IGNORE INTO practice_problems (id, title, description, difficulty, topic, url) VALUES
(UUID(), 'Set Matrix Zeros', 'Given an m x n integer matrix, if an element is 0, set its entire row and column to 0s.', 'Medium', 'Arrays', 'https://leetcode.com/problems/set-matrix-zeroes/'),
(UUID(), 'Pascal\'s Triangle', 'Given an integer numRows, return the first numRows of Pascal\'s triangle.', 'Easy', 'Arrays', 'https://leetcode.com/problems/pascals-triangle/'),
(UUID(), 'Next Permutation', 'Implement next permutation, which rearranges numbers into the lexicographically next greater permutation of numbers.', 'Medium', 'Arrays', 'https://leetcode.com/problems/next-permutation/'),
(UUID(), 'Kadane\'s Algorithm', 'Given an integer array nums, find the contiguous subarray which has the largest sum and return its sum.', 'Medium', 'Arrays', 'https://leetcode.com/problems/maximum-subarray/'),
(UUID(), 'Sort an array of 0\'s 1\'s 2\'s', 'Given an array nums with n objects colored red, white, or blue, sort them in-place.', 'Medium', 'Arrays', 'https://leetcode.com/problems/sort-colors/'),
(UUID(), 'Stock buy and Sell', 'You are given an array prices where prices[i] is the price of a given stock on the ith day.', 'Easy', 'Arrays', 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/'),
(UUID(), 'Rotate Matrix', 'You are given an n x n 2D matrix representing an image, rotate the image by 90 degrees (clockwise).', 'Medium', 'Arrays', 'https://leetcode.com/problems/rotate-image/'),
(UUID(), 'Merge Overlapping Subintervals', 'Given an array of intervals where intervals[i] = [starti, endi], merge all overlapping intervals.', 'Medium', 'Arrays', 'https://leetcode.com/problems/merge-intervals/'),
(UUID(), 'Merge two sorted Arrays without extra space', 'Given two sorted arrays arr1[] and arr2[] of sizes n and m in non-decreasing order. Merge them in sorted order.', 'Hard', 'Arrays', 'https://leetcode.com/problems/merge-sorted-array/'),
(UUID(), 'Find the duplicate in an array of N+1 integers', 'Given an array of integers nums containing n + 1 integers where each integer is in the range [1, n].', 'Medium', 'Arrays', 'https://leetcode.com/problems/find-the-duplicate-number/');
