const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const db = require("./database");

dotenv.config();

const authenticate = require("./authMiddleware");

const app = express();

app.use(cors());
app.use(express.json());

// Create tasks table
db.run(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    completed INTEGER DEFAULT 0
  )
`, (err) => {
  if (err) {
    console.error("Table creation failed:", err.message);
  } else {
    console.log("Tasks table ready");
  }
});

const PORT = process.env.PORT || 5000;

// Common error response
function errorResponse(res, status, code, message) {
  return res.status(status).json({
    success: false,
    error: {
      code,
      message
    }
  });
}

// Home route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "SWYNEX Backend API is running"
  });
});

// CREATE - Protected endpoint
app.post("/api/tasks", authenticate, (req, res) => {
  const { title } = req.body;

  // Validation
  if (typeof title !== "string" || !title.trim()) {
    return errorResponse(
      res,
      400,
      "INVALID_TITLE",
      "Title is required and must be a non-empty string"
    );
  }

  if (title.trim().length > 100) {
    return errorResponse(
      res,
      400,
      "TITLE_TOO_LONG",
      "Title must not exceed 100 characters"
    );
  }

  db.run(
    "INSERT INTO tasks (title) VALUES (?)",
    [title.trim()],
    function (err) {
      if (err) {
        return errorResponse(
          res,
          500,
          "CREATE_FAILED",
          "Failed to create task"
        );
      }

      res.status(201).json({
        success: true,
        message: "Task created successfully",
        task: {
          id: this.lastID,
          title: title.trim(),
          completed: 0
        }
      });
    }
  );
});

// READ - Get all tasks
app.get("/api/tasks", (req, res) => {
  db.all("SELECT * FROM tasks", [], (err, rows) => {
    if (err) {
      return errorResponse(
        res,
        500,
        "FETCH_FAILED",
        "Failed to fetch tasks"
      );
    }

    res.status(200).json({
      success: true,
      tasks: rows
    });
  });
});

// UPDATE - Update a task
app.put("/api/tasks/:id", (req, res) => {
  const { title, completed } = req.body;
  const { id } = req.params;

  // ID validation
  if (!/^\d+$/.test(id)) {
    return errorResponse(
      res,
      400,
      "INVALID_ID",
      "Task ID must be a number"
    );
  }

  // Title validation
  if (typeof title !== "string" || !title.trim()) {
    return errorResponse(
      res,
      400,
      "INVALID_TITLE",
      "Title is required and must be a non-empty string"
    );
  }

  if (title.trim().length > 100) {
    return errorResponse(
      res,
      400,
      "TITLE_TOO_LONG",
      "Title must not exceed 100 characters"
    );
  }

  // Completed validation
  if (completed !== undefined && typeof completed !== "boolean") {
    return errorResponse(
      res,
      400,
      "INVALID_COMPLETED",
      "Completed must be true or false"
    );
  }

  db.run(
    "UPDATE tasks SET title = ?, completed = ? WHERE id = ?",
    [title.trim(), completed === true ? 1 : 0, id],
    function (err) {
      if (err) {
        return errorResponse(
          res,
          500,
          "UPDATE_FAILED",
          "Failed to update task"
        );
      }

      if (this.changes === 0) {
        return errorResponse(
          res,
          404,
          "TASK_NOT_FOUND",
          "Task not found"
        );
      }

      res.json({
        success: true,
        message: "Task updated successfully"
      });
    }
  );
});

// DELETE - Delete a task
app.delete("/api/tasks/:id", (req, res) => {
  const { id } = req.params;

  // ID validation
  if (!/^\d+$/.test(id)) {
    return errorResponse(
      res,
      400,
      "INVALID_ID",
      "Task ID must be a number"
    );
  }

  db.run(
    "DELETE FROM tasks WHERE id = ?",
    [id],
    function (err) {
      if (err) {
        return errorResponse(
          res,
          500,
          "DELETE_FAILED",
          "Failed to delete task"
        );
      }

      if (this.changes === 0) {
        return errorResponse(
          res,
          404,
          "TASK_NOT_FOUND",
          "Task not found"
        );
      }

      res.json({
        success: true,
        message: "Task deleted successfully"
      });
    }
  );
});

// Handle unknown routes
app.use((req, res) => {
  return errorResponse(
    res,
    404,
    "ROUTE_NOT_FOUND",
    "Route not found"
  );
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});