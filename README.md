# SWYNEX Backend Database and CRUD API

## Project Overview

This project is a backend REST API built using Node.js, Express.js, and SQLite.

It implements CRUD operations for a Task resource.

## Technologies Used

- Node.js
- Express.js
- SQLite3
- dotenv
- CORS

## Database

SQLite database is used to store tasks.

Task fields:
- id
- title
- completed

## API Endpoints

### Create Task
POST `/api/tasks`

```json
{
  "title": "Learn Node.js"
}