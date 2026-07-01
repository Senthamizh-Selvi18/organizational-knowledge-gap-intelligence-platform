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