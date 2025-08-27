-- Create app_submissions table
CREATE TABLE app_submissions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'flagged')),
  submitted_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  developer_id TEXT NOT NULL,
  developer_name TEXT NOT NULL,
  developer_email TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('social', 'productivity', 'entertainment', 'education', 'business')),
  version TEXT NOT NULL,
  downloads INTEGER NOT NULL DEFAULT 0,
  rating REAL NOT NULL DEFAULT 0.0,
  file_size INTEGER NOT NULL DEFAULT 0,
  UNIQUE(name, developer_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_app_status ON app_submissions(status);
CREATE INDEX idx_app_category ON app_submissions(category);
CREATE INDEX idx_app_submitted_at ON app_submissions(submitted_at);
CREATE INDEX idx_app_rating ON app_submissions(rating);
CREATE INDEX idx_app_name_search ON app_submissions(name);