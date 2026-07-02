# Database Schema v1

## Users

| Column | Type |
|---|---|
| id | Long (PK) |
| name | String |
| email | String (Unique) |
| password | String |
| role_id | Long (FK) |
| created_at | Timestamp |

---

## Roles

| Column | Type |
|---|---|
| id | Long (PK) |
| role_name | String |

### Default Roles

| id | role_name |
|---|---|
| 1 | Employee |
| 2 | Team Lead / Manager |
| 3 | HR Specialist |
| 4 | Department Head |
| 5 | Learning & Development Admin |
| 6 | System Administrator |

---

## Employee

| Column | Type |
|---|---|
| id | Long (PK) |
| user_id | Long (FK) |
| department | String |
| designation | String |
| created_at | Timestamp |

---

## Skill

| Column | Type |
|---|---|
| id | Long (PK) |
| skill_name | String |

---

## Competency

| Column | Type |
|---|---|
| id | Long (PK) |
| employee_id | Long (FK) |
| skill_id | Long (FK) |
| level | String |
| created_at | Timestamp |

---

## Auth

| Column | Type |
|---|---|
| id | Long (PK) |
| user_id | Long (FK) |
| provider | String |
| created_at | Timestamp |

---

# Relationships

Users (1) -------- (1) Employee

Roles (1) -------- (*) Users

Employee (1) -------- (*) Competency

Skill (1) -------- (*) Competency

Users (1) -------- (*) Auth