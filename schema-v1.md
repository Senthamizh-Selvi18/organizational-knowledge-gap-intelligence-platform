# Database Schema v1

## Users

| Column | Type |
|---|---|
| id | Long (PK) |
| name | String |
| email | String |
| password | String |
| role_id | Long (FK) |
| created_at | Timestamp |


## Roles

| Column | Type |
|---|---|
| id | Long (PK) |
| role_name | String |


## Auth

| Column | Type |
|---|---|
| id | Long (PK) |
| user_id | Long (FK) |
| provider | String |
| created_at | Timestamp |


---

# ER Diagram v1

## Employee

| Column | Type |
|---|---|
| id | Long (PK) |
| name | String |
| email | String |
| department | String |
| created_at | Timestamp |


## Skill

| Column | Type |
|---|---|
| id | Long (PK) |
| skill_name | String |


## Competency

| Column | Type |
|---|---|
| id | Long (PK) |
| employee_id | Long (FK) |
| skill_id | Long (FK) |
| level | String |
| created_at | Timestamp |


## Relationships

Employee 1 ---- * Competency

Skill 1 ---- * Competency