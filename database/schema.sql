-- MyanVolunteer Database Schema
-- Create Database
CREATE DATABASE IF NOT EXISTS myanvolunteer CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE myanvolunteer;

-- Users Table
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(50),
  password VARCHAR(255),
  googleId VARCHAR(255) UNIQUE,
  role ENUM('volunteer', 'organization') DEFAULT 'volunteer',
  isVerified BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_googleId (googleId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volunteers Table
CREATE TABLE volunteers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  education ENUM('highSchool', 'undergraduate', 'graduate') NOT NULL,
  skills TEXT,
  teamwork BOOLEAN DEFAULT FALSE,
  motivation TEXT,
  notificationsEnabled BOOLEAN DEFAULT TRUE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_userId (userId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Organizations Table
CREATE TABLE organizations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  contactDetails VARCHAR(255) NOT NULL,
  logo VARCHAR(255),
  isVerified BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_userId (userId),
  INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Opportunities Table
CREATE TABLE opportunities (
  id INT PRIMARY KEY AUTO_INCREMENT,
  organizationId INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category ENUM('environment', 'education', 'healthcare', 'community', 'animals', 'arts') NOT NULL,
  location VARCHAR(255) NOT NULL,
  mode ENUM('onsite', 'remote', 'hybrid') NOT NULL,
  timeCommitment VARCHAR(255) NOT NULL,
  requirements TEXT NOT NULL,
  benefits TEXT,
  deadline DATE NOT NULL,
  status ENUM('active', 'expired', 'closed') DEFAULT 'active',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (organizationId) REFERENCES organizations(id) ON DELETE CASCADE,
  INDEX idx_organizationId (organizationId),
  INDEX idx_category (category),
  INDEX idx_mode (mode),
  INDEX idx_status (status),
  INDEX idx_deadline (deadline)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Applications Table
CREATE TABLE applications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  opportunityId INT NOT NULL,
  volunteerId INT NOT NULL,
  status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
  appliedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (opportunityId) REFERENCES opportunities(id) ON DELETE CASCADE,
  FOREIGN KEY (volunteerId) REFERENCES volunteers(id) ON DELETE CASCADE,
  UNIQUE KEY unique_application (opportunityId, volunteerId),
  INDEX idx_opportunityId (opportunityId),
  INDEX idx_volunteerId (volunteerId),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Saved Opportunities Table
CREATE TABLE saved_opportunities (
  id INT PRIMARY KEY AUTO_INCREMENT,
  opportunityId INT NOT NULL,
  volunteerId INT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (opportunityId) REFERENCES opportunities(id) ON DELETE CASCADE,
  FOREIGN KEY (volunteerId) REFERENCES volunteers(id) ON DELETE CASCADE,
  UNIQUE KEY unique_saved (opportunityId, volunteerId),
  INDEX idx_opportunityId (opportunityId),
  INDEX idx_volunteerId (volunteerId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Notifications Table
CREATE TABLE notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  type ENUM('deadline', 'application', 'acceptance', 'rejection') NOT NULL,
  message TEXT NOT NULL,
  isRead BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_userId (userId),
  INDEX idx_isRead (isRead),
  INDEX idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert Sample Data
-- Sample Users
INSERT INTO users (name, email, phone, password, role) VALUES
('Admin User', 'admin@myanvolunteer.org', '09123456789', '$2a$10$XqZPG.3qKZE7KdLhiJXFXe5YdB7tYZYD.kGBkK0WjVhLfZK7QjMWq', 'volunteer'),
('Green Myanmar', 'contact@greenmyanmar.org', '09987654321', '$2a$10$XqZPG.3qKZE7KdLhiJXFXe5YdB7tYZYD.kGBkK0WjVhLfZK7QjMWq', 'organization');

-- Sample Volunteer
INSERT INTO volunteers (userId, education, skills, teamwork, motivation) VALUES
(1, 'undergraduate', 'Communication, Leadership, Community Organization', TRUE, 'Passionate about environmental conservation and community development');

-- Sample Organization
INSERT INTO organizations (userId, name, description, contactDetails) VALUES
(2, 'Green Myanmar', 'Environmental conservation organization working towards a sustainable future', 'contact@greenmyanmar.org, +95-9-987654321');

-- Sample Opportunities
INSERT INTO opportunities (organizationId, title, description, category, location, mode, timeCommitment, requirements, benefits, deadline) VALUES
(1, 'Community Clean-up Drive', 'Join us in making our community cleaner and greener! We organize monthly clean-up drives in various neighborhoods.', 'environment', 'Yangon', 'onsite', '2 hours/week', 'Enthusiasm, ability to work in a team', 'Certificate of participation, networking opportunities', '2025-12-31'),
(1, 'Environmental Education Program', 'Help teach children about environmental conservation and sustainability', 'education', 'Mandalay', 'hybrid', '3 hours/week', 'Good communication skills, passion for environment', 'Training provided, certificate', '2025-11-30'),
(1, 'Tree Planting Initiative', 'Participate in our tree planting campaigns across Myanmar', 'environment', 'Nationwide', 'onsite', '4 hours/month', 'Physical fitness, outdoor work', 'Meals provided, transportation', '2025-10-30');

-- Create Views for easier querying
CREATE VIEW active_opportunities_view AS
SELECT 
  o.id,
  o.title,
  o.description,
  o.category,
  o.location,
  o.mode,
  o.timeCommitment,
  o.deadline,
  org.name AS organizationName,
  org.logo AS organizationLogo,
  COUNT(DISTINCT a.id) AS applicantCount
FROM opportunities o
JOIN organizations org ON o.organizationId = org.id
LEFT JOIN applications a ON o.id = a.opportunityId
WHERE o.status = 'active' AND o.deadline >= CURDATE()
GROUP BY o.id;

CREATE VIEW organization_stats_view AS
SELECT 
  org.id AS organizationId,
  org.userId,
  COUNT(DISTINCT o.id) AS activeJobs,
  COUNT(DISTINCT a.id) AS totalApplicants,
  COUNT(DISTINCT CASE WHEN a.status = 'accepted' THEN a.id END) AS acceptedApplicants
FROM organizations org
LEFT JOIN opportunities o ON org.id = o.organizationId AND o.status = 'active'
LEFT JOIN applications a ON o.id = a.opportunityId
GROUP BY org.id;

-- Stored Procedure to check and update expired opportunities
DELIMITER //
CREATE PROCEDURE check_expired_opportunities()
BEGIN
  UPDATE opportunities
  SET status = 'expired'
  WHERE deadline < CURDATE() AND status = 'active';
END //
DELIMITER ;

-- Event to run the stored procedure daily
CREATE EVENT IF NOT EXISTS check_deadlines_daily
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_TIMESTAMP
DO CALL check_expired_opportunities();

-- Grant permissions (adjust as needed)
-- GRANT ALL PRIVILEGES ON myanvolunteer.* TO 'myanvolunteer_user'@'localhost' IDENTIFIED BY 'your_password';
-- FLUSH PRIVILEGES;