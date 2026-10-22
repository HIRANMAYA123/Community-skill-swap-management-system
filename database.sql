-- 1. CREATE DATABASE
CREATE DATABASE IF NOT EXISTS community_skill_swap;
USE community_skill_swap;

-- 2. CREATE USERS TABLE
CREATE TABLE Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(15),
    city VARCHAR(50),
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('active','inactive') DEFAULT 'active'
);

-- 3. CREATE SKILLS TABLE
CREATE TABLE Skills (
    skill_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    skill_name VARCHAR(100) NOT NULL,
    skill_level ENUM('beginner','intermediate','advanced')
        DEFAULT 'beginner',
    description TEXT,
    hourly_rate DECIMAL(8,2) DEFAULT 0.00,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
        ON DELETE CASCADE
);

-- 4. CREATE CATEGORIES TABLE
CREATE TABLE Categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
);

-- 5. CREATE SKILL_CATEGORIES TABLE
CREATE TABLE Skill_Categories (
    skill_id INT NOT NULL,
    category_id INT NOT NULL,
    PRIMARY KEY (skill_id, category_id),
    FOREIGN KEY (skill_id) REFERENCES Skills(skill_id)
        ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES Categories(category_id)
        ON DELETE CASCADE
);

-- 6. CREATE SWAP_REQUESTS TABLE
CREATE TABLE Swap_Requests (
    request_id INT AUTO_INCREMENT PRIMARY KEY,
    requester_id INT NOT NULL,
    provider_id INT NOT NULL,
    offered_skill_id INT NOT NULL,
    requested_skill VARCHAR(100) NOT NULL,
    request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    scheduled_date DATE,
    status ENUM('pending','accepted','rejected','completed','cancelled')
        DEFAULT 'pending',
    FOREIGN KEY (requester_id) REFERENCES Users(user_id),
    FOREIGN KEY (provider_id) REFERENCES Users(user_id),
    FOREIGN KEY (offered_skill_id) REFERENCES Skills(skill_id),
    CHECK (requester_id <> provider_id)
);

-- 7. CREATE SESSIONS TABLE
CREATE TABLE Sessions (
    session_id INT AUTO_INCREMENT PRIMARY KEY,
    request_id INT NOT NULL,
    session_date DATE NOT NULL,
    start_time TIME NOT NULL,
    duration_minutes INT NOT NULL DEFAULT 60,
    meeting_mode ENUM('online','offline') DEFAULT 'online',
    meeting_location VARCHAR(255),
    status ENUM('scheduled','completed','cancelled')
        DEFAULT 'scheduled',
    FOREIGN KEY (request_id) REFERENCES Swap_Requests(request_id)
        ON DELETE CASCADE,
    CHECK (duration_minutes > 0)
);

-- 8. CREATE REVIEWS TABLE
CREATE TABLE Reviews (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT NOT NULL,
    reviewer_id INT NOT NULL,
    reviewed_user_id INT NOT NULL,
    rating INT NOT NULL,
    comments TEXT,
    review_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES Sessions(session_id)
        ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES Users(user_id),
    FOREIGN KEY (reviewed_user_id) REFERENCES Users(user_id),
    UNIQUE (session_id, reviewer_id),
    CHECK (rating BETWEEN 1 AND 5),
    CHECK (reviewer_id <> reviewed_user_id)
);

-- ============================================
-- 9. INSERT SAMPLE USERS
-- ============================================

INSERT INTO Users
(full_name,email,password_hash,phone,city)
VALUES
('Aarav Sharma','aarav@example.com','demo_hash1','9876500001','Delhi'),
('Priya Verma','priya@example.com','demo_hash2','9876500002','Gurugram'),
('Rahul Das','rahul@example.com','demo_hash3','9876500003','Noida'),
('Sneha Patel','sneha@example.com','demo_hash4','9876500004','Delhi'),
('Kabir Singh','kabir@example.com','demo_hash5','9876500005','Jaipur');

-- 10. INSERT SKILLS
INSERT INTO Skills
(user_id,skill_name,skill_level,description,hourly_rate)
VALUES
(1,'Python Programming','advanced','Python lessons',0),
(2,'Graphic Design','intermediate','Logo and poster design',0),
(3,'Web Development','advanced','HTML CSS JavaScript React',0),
(4,'Public Speaking','intermediate','Communication skills',0),
(5,'Photography','beginner','Photography basics',0),
(2,'SQL Database','advanced','SQL and database design',0);

-- 11. INSERT CATEGORIES
INSERT INTO Categories (category_name,description)
VALUES
('Programming','Coding and software development'),
('Design','Graphic and creative design'),
('Communication','Speaking and presentation'),
('Photography','Photography and editing');

-- 12. LINK SKILLS TO CATEGORIES
INSERT INTO Skill_Categories (skill_id,category_id)
VALUES
(1,1),(2,2),(3,1),(4,3),(5,4),(6,1);

-- 13. INSERT SWAP REQUESTS
INSERT INTO Swap_Requests
(requester_id,provider_id,offered_skill_id,
 requested_skill,scheduled_date,status)
VALUES
(1,2,2,'Python Programming','2026-11-05','accepted'),
(2,1,1,'Graphic Design','2026-11-06','pending'),
(3,4,4,'Web Development','2026-11-07','completed'),
(5,3,3,'Photography','2026-11-08','rejected');

-- 14. INSERT SESSIONS
INSERT INTO Sessions
(request_id,session_date,start_time,duration_minutes,
 meeting_mode,meeting_location,status)
VALUES
(1,'2026-11-05','10:00:00',60,'online','Google Meet','scheduled'),
(2,'2026-11-06','14:00:00',90,'offline','Community Library','scheduled'),
(3,'2026-11-07','16:00:00',60,'online','Microsoft Teams','completed');

-- 15. INSERT REVIEWS
INSERT INTO Reviews
(session_id,reviewer_id,reviewed_user_id,rating,comments)
VALUES
(3,3,4,5,'Very helpful and clear explanation');

-- ============================================
-- 16. BASIC SELECT QUERIES
-- ============================================

SELECT * FROM Users;
SELECT * FROM Skills;
SELECT * FROM Categories;
SELECT * FROM Skill_Categories;
SELECT * FROM Swap_Requests;
SELECT * FROM Sessions;
SELECT * FROM Reviews;

SELECT full_name,email FROM Users;
SELECT * FROM Users WHERE city='Delhi';
SELECT * FROM Skills WHERE skill_level='advanced';
SELECT * FROM Swap_Requests WHERE status='pending';
SELECT * FROM Users ORDER BY full_name ASC;
SELECT DISTINCT city FROM Users;
SELECT * FROM Skills WHERE skill_name LIKE '%Web%';
SELECT * FROM Skills WHERE hourly_rate BETWEEN 0 AND 500;
SELECT * FROM Users WHERE city IN ('Delhi','Noida','Jaipur');

-- 17. AGGREGATE FUNCTIONS
SELECT COUNT(*) AS total_users FROM Users;
SELECT COUNT(*) AS total_skills FROM Skills;
SELECT AVG(hourly_rate) AS average_rate FROM Skills;
SELECT MAX(hourly_rate) AS highest_rate FROM Skills;
SELECT MIN(hourly_rate) AS lowest_rate FROM Skills;
SELECT SUM(hourly_rate) AS total_rate FROM Skills;

-- 18. GROUP BY AND HAVING
SELECT city,COUNT(*) AS total_members
FROM Users GROUP BY city;

SELECT user_id,COUNT(*) AS total_skills
FROM Skills GROUP BY user_id;

SELECT status,COUNT(*) AS total_requests
FROM Swap_Requests GROUP BY status;

SELECT user_id,COUNT(*) AS skill_count
FROM Skills GROUP BY user_id
HAVING COUNT(*) > 1;

SELECT category_id,COUNT(*) AS total_skills
FROM Skill_Categories GROUP BY category_id
HAVING COUNT(*) >= 1;

-- 19. UPDATE COMMANDS
UPDATE Users SET city='Mumbai' WHERE user_id=5;
UPDATE Skills SET skill_level='advanced' WHERE skill_id=5;
UPDATE Swap_Requests SET status='accepted' WHERE request_id=2;

-- 20. DELETE COMMAND
-- Example only; commented to preserve sample review
-- DELETE FROM Reviews WHERE review_id=1;

-- 21. INNER JOIN
SELECT U.full_name,S.skill_name,S.skill_level
FROM Users U
INNER JOIN Skills S ON U.user_id=S.user_id;

-- 22. LEFT JOIN
SELECT U.full_name,S.skill_name
FROM Users U
LEFT JOIN Skills S ON U.user_id=S.user_id;

-- 23. RIGHT JOIN
SELECT U.full_name,S.skill_name
FROM Users U
RIGHT JOIN Skills S ON U.user_id=S.user_id;

-- 24. MULTIPLE TABLE JOIN
SELECT SR.request_id,
       U1.full_name AS requester,
       U2.full_name AS provider,
       S.skill_name AS offered_skill,
       SR.requested_skill,
       SR.status
FROM Swap_Requests SR
JOIN Users U1 ON SR.requester_id=U1.user_id
JOIN Users U2 ON SR.provider_id=U2.user_id
JOIN Skills S ON SR.offered_skill_id=S.skill_id;

-- 25. SELF JOIN
SELECT A.full_name AS member_one,
       B.full_name AS member_two,A.city
FROM Users A
JOIN Users B ON A.city=B.city
AND A.user_id<B.user_id;

-- 26. SESSION AND REVIEW JOIN
SELECT Se.session_id,Se.session_date,Se.status,R.rating,R.comments
FROM Sessions Se
LEFT JOIN Reviews R ON Se.session_id=R.session_id;

-- ============================================
-- 27. SUBQUERIES
-- ============================================

SELECT full_name FROM Users
WHERE user_id IN (
    SELECT user_id FROM Skills
    WHERE skill_level='advanced'
);

SELECT skill_name,hourly_rate FROM Skills
WHERE hourly_rate > (
    SELECT AVG(hourly_rate) FROM Skills
);

SELECT U.user_id,U.full_name FROM Users U
WHERE NOT EXISTS (
    SELECT 1 FROM Swap_Requests SR
    WHERE SR.requester_id=U.user_id
);

-- 28. ALTER TABLE
ALTER TABLE Users ADD COLUMN bio TEXT;
ALTER TABLE Users MODIFY COLUMN phone VARCHAR(20);
ALTER TABLE Users RENAME COLUMN bio TO about_me;
ALTER TABLE Users DROP COLUMN about_me;

-- 29. CREATE VIEWS
CREATE VIEW Available_Skills AS
SELECT U.full_name,U.city,S.skill_name,S.skill_level
FROM Users U
JOIN Skills S ON U.user_id=S.user_id
WHERE U.status='active';

SELECT * FROM Available_Skills;

CREATE VIEW Pending_Swaps AS
SELECT SR.request_id,
       U1.full_name AS requester,
       U2.full_name AS provider,
       SR.requested_skill,SR.request_date
FROM Swap_Requests SR
JOIN Users U1 ON SR.requester_id=U1.user_id
JOIN Users U2 ON SR.provider_id=U2.user_id
WHERE SR.status='pending';

SELECT * FROM Pending_Swaps;

-- 30. INDEXES
CREATE INDEX idx_users_city ON Users(city);
CREATE INDEX idx_skills_name ON Skills(skill_name);
CREATE INDEX idx_swap_status ON Swap_Requests(status);
CREATE INDEX idx_swap_requester ON Swap_Requests(requester_id);

SHOW INDEX FROM Users;
SHOW INDEX FROM Skills;

-- ============================================
-- 31. STORED PROCEDURE: REGISTER USER
-- ============================================

DELIMITER //

CREATE PROCEDURE RegisterUser(
    IN p_name VARCHAR(100),
    IN p_email VARCHAR(100),
    IN p_password_hash VARCHAR(255),
    IN p_city VARCHAR(50)
)
BEGIN
    INSERT INTO Users(full_name,email,password_hash,city)
    VALUES(p_name,p_email,p_password_hash,p_city);
END //

DELIMITER ;

-- Run this CALL separately when needed:
-- CALL RegisterUser('Riya Mehta','riya@example.com','demo_hash','Pune');

-- 32. STORED PROCEDURE: SEARCH SKILLS
DELIMITER //

CREATE PROCEDURE SearchSkills(IN p_skill_name VARCHAR(100))
BEGIN
    SELECT S.skill_id,S.skill_name,S.skill_level,
           U.full_name AS provider,U.city
    FROM Skills S
    JOIN Users U ON S.user_id=U.user_id
    WHERE S.skill_name LIKE CONCAT('%',p_skill_name,'%')
      AND U.status='active';
END //

DELIMITER ;

-- Example: CALL SearchSkills('Python');

-- 33. STORED FUNCTION
DELIMITER //

CREATE FUNCTION CountMemberSkills(p_user_id INT)
RETURNS INT
READS SQL DATA
BEGIN
    DECLARE total INT;
    SELECT COUNT(*) INTO total
    FROM Skills WHERE user_id=p_user_id;
    RETURN total;
END //

DELIMITER ;

SELECT full_name,CountMemberSkills(user_id) AS total_skills
FROM Users;

-- ============================================
-- 34. TRIGGER: VALIDATE REVIEW RATING
-- ============================================

DELIMITER //

CREATE TRIGGER ValidateReviewRating
BEFORE INSERT ON Reviews
FOR EACH ROW
BEGIN
    IF NEW.rating < 1 OR NEW.rating > 5 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT='Rating must be between 1 and 5';
    END IF;
END //

DELIMITER ;

-- ============================================
-- 35. TRANSACTION COMMANDS
-- Run these individually when testing
-- ============================================

-- START TRANSACTION;
-- UPDATE Swap_Requests SET status='accepted' WHERE request_id=2;
-- COMMIT;

-- START TRANSACTION;
-- UPDATE Swap_Requests SET status='rejected' WHERE request_id=2;
-- ROLLBACK;

-- START TRANSACTION;
-- UPDATE Users SET city='Mumbai' WHERE user_id=1;
-- SAVEPOINT first_update;
-- UPDATE Users SET city='Chennai' WHERE user_id=2;
-- ROLLBACK TO SAVEPOINT first_update;
-- COMMIT;

-- ============================================
-- 36. PROJECT DASHBOARD STATISTICS
-- ============================================

SELECT
    (SELECT COUNT(*) FROM Users WHERE status='active')
        AS active_members,
    (SELECT COUNT(*) FROM Skills)
        AS total_skills,
    (SELECT COUNT(*) FROM Swap_Requests WHERE status='pending')
        AS pending_requests,
    (SELECT COUNT(*) FROM Swap_Requests WHERE status='completed')
        AS completed_swaps,
    (SELECT COUNT(*) FROM Sessions WHERE status='completed')
        AS completed_sessions;

-- ============================================
-- 37. DATABASE INSPECTION
-- ============================================

SHOW DATABASES;
SHOW TABLES;
DESCRIBE Users;
DESCRIBE Skills;
DESCRIBE Swap_Requests;
DESCRIBE Sessions;
DESCRIBE Reviews;
SHOW TRIGGERS;
