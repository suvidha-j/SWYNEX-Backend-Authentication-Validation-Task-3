const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const db = require("./database");

dotenv.config();

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

// Home route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "SWYNEX Backend API is running"
  });
});

// CREATE - Create a new task
app.post("/api/tasks", (req, res) => {
  const { title } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({
      success: false,
      message: "Title is required"
    });
  }

  db.run(
    "INSERT INTO tasks (title) VALUES (?)",
    [title.trim()],
    function (err) {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Failed to create task"
        });
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
      return res.status(500).json({
        success: false,
        message: "Failed to fetch tasks"
      });
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

  if (!title || !title.trim()) {
    return res.status(400).json({
      success: false,
      message: "Title is required"
    });
  }

  db.run(
    "UPDATE tasks SET title = ?, completed = ? WHERE id = ?",
    [title.trim(), completed ? 1 : 0, id],
    function (err) {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Failed to update task"
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          success: false,
          message: "Task not found"
        });
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

  db.run(
    "DELETE FROM tasks WHERE id = ?",
    [id],
    function (err) {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Failed to delete task"
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          success: false,
          message: "Task not found"
        });
      }

      res.json({
        success: true,
        message: "Task deleted successfully"
      });
    }
  );
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});