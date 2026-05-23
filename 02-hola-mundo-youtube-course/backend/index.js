const express = require("express");
const cors = require("cors");
const {
  createTodo,
  getTodos,
  getTodoById,
  updateTodo,
  deleteTodo
} = require("./handlers");
const todoModel = require("./models/todo.model");

const app = express();
const port = 3001;

// In-memory database
const db = {
  users: [
    { id: 1, name: "David" }
  ],
  products: []
};

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
    res.json({status: "ok", db_size: db.users.length});
});

app.get("/api/users", (req, res) => {
    res.json(db.users);
});

app.get("/api/todos", getTodos(todoModel));
app.get("/api/todos/:id", getTodoById(todoModel));
app.post("/api/todos", createTodo(todoModel));
app.put("/api/todos/:id", updateTodo(todoModel));
app.delete("/api/todos/:id", deleteTodo(todoModel));

app.listen(port, () => {
    console.log(`Backend running at http://localhost:${port}`);
});
