BEGIN;

UPDATE roles SET role_name = 'ARCHIVED_Employee_24'
WHERE id = 24 AND role_name <> 'ARCHIVED_Employee_24';

UPDATE roles SET role_name = 'ARCHIVED_Intern_27'
WHERE id = 27 AND role_name <> 'ARCHIVED_Intern_27';

UPDATE roles SET role_name = 'ARCHIVED_TeamManager_21'
WHERE id = 21 AND role_name <> 'ARCHIVED_TeamManager_21';

UPDATE roles SET role_name = 'ARCHIVED_TeamLead_22'
WHERE id = 22 AND role_name <> 'ARCHIVED_TeamLead_22';

UPDATE roles SET role_name = 'ARCHIVED_LeadDeveloper_35'
WHERE id = 35 AND role_name <> 'ARCHIVED_LeadDeveloper_35';

UPDATE roles SET role_name = 'Employee',
                 description = 'Standard employee role. Can view their own skill profile, complete self-assessments, and receive personalized learning recommendations.',
                 active = true
WHERE id = 41;

UPDATE roles SET role_name = 'HR Specialist',
                 description = 'Manages HR operations, employee records, certifications, and organization-wide skill and competency policies.',
                 active = true
WHERE id = 20;

UPDATE roles SET role_name = 'System Admin',
                 description = 'Full administrative access to the platform, including role management, user accounts, and system-wide configuration.',
                 active = true
WHERE id = 19;

UPDATE roles SET role_name = 'Manager',
                 description = 'Manages a team, reviews team skill gaps, approves training requests, and evaluates direct reports.',
                 active = true
WHERE id = 38;

UPDATE roles SET role_name = 'L&D Admin',
                 description = 'Manages the internal training catalog, external course library, and learning recommendations across the organization.',
                 active = true
WHERE id = 40;

INSERT INTO roles (role_name, description, active, created_at)
SELECT 'Department Head',
       'Oversees a department''s overall skill strategy, competency frameworks, and cross-team resource planning.',
       true, now()
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE role_name = 'Department Head');

INSERT INTO user_roles (user_id, role_id)
SELECT DISTINCT ur.user_id, 41
FROM user_roles ur
WHERE ur.role_id IN (24, 27)
  AND NOT EXISTS (
        SELECT 1 FROM user_roles ur2
        WHERE ur2.user_id = ur.user_id AND ur2.role_id = 41
  );

DELETE FROM user_roles WHERE role_id IN (24, 27);

INSERT INTO user_roles (user_id, role_id)
SELECT DISTINCT ur.user_id, 38
FROM user_roles ur
WHERE ur.role_id = 35
  AND NOT EXISTS (
        SELECT 1 FROM user_roles ur2
        WHERE ur2.user_id = ur.user_id AND ur2.role_id = 38
  );

DELETE FROM user_roles WHERE role_id = 35;

DELETE FROM user_roles WHERE role_id IN (21, 22);

INSERT INTO role_skill_requirement (role_id, skill_id, required_proficiency_level)
SELECT 41, rsr.skill_id, rsr.required_proficiency_level
FROM role_skill_requirement rsr
WHERE rsr.role_id IN (24, 27)
ON CONFLICT (role_id, skill_id)
DO UPDATE SET required_proficiency_level =
    GREATEST(role_skill_requirement.required_proficiency_level, EXCLUDED.required_proficiency_level);

DELETE FROM role_skill_requirement WHERE role_id IN (24, 27);

INSERT INTO role_skill_requirement (role_id, skill_id, required_proficiency_level)
SELECT 38, rsr.skill_id, rsr.required_proficiency_level
FROM role_skill_requirement rsr
WHERE rsr.role_id IN (21, 22, 35)
ON CONFLICT (role_id, skill_id)
DO UPDATE SET required_proficiency_level =
    GREATEST(role_skill_requirement.required_proficiency_level, EXCLUDED.required_proficiency_level);

DELETE FROM role_skill_requirement WHERE role_id IN (21, 22, 35);

INSERT INTO role_skill (role_id, skill_id)
SELECT DISTINCT 41, rs.skill_id
FROM role_skill rs
WHERE rs.role_id IN (24, 27)
  AND NOT EXISTS (
        SELECT 1 FROM role_skill rs2
        WHERE rs2.role_id = 41 AND rs2.skill_id = rs.skill_id
  );

DELETE FROM role_skill WHERE role_id IN (24, 27);

INSERT INTO role_skill (role_id, skill_id)
SELECT DISTINCT 38, rs.skill_id
FROM role_skill rs
WHERE rs.role_id IN (21, 22, 35)
  AND NOT EXISTS (
        SELECT 1 FROM role_skill rs2
        WHERE rs2.role_id = 38 AND rs2.skill_id = rs.skill_id
  );

DELETE FROM role_skill WHERE role_id IN (21, 22, 35);

UPDATE roles SET active = false WHERE id IN (24, 27, 21, 22, 35);

SELECT id, role_name, active, description FROM roles ORDER BY id;
SELECT role_id, count(*) FROM user_roles GROUP BY role_id ORDER BY role_id;

COMMIT;