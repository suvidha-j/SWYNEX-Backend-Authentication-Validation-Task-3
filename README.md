# SWYNEX Backend Authentication, Validation and Integration - Task 3

## Project Overview

This project extends the backend API with API key authentication, input validation, and consistent error responses.

## Technologies Used

- Node.js
- Express.js
- SQLite
- dotenv
- CORS

## Authentication

The `POST /api/tasks` endpoint is protected using an API key.

The API key must be sent using the following request header:

`x-api-key`

The API key is stored securely in the `.env` file and is not committed to GitHub.

## Protected Endpoint

### POST /api/tasks

Creates a new task.

### Required Header

```text
x-api-key: YOUR_API_KEY