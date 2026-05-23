const createTodo = (todoModel) => (req, res) => {
    const { title, description, completed = false } = req.body;

    if (!title || title.trim() === "") {
        return res.status(400).json({ error: "El título es requerido" });
    }

    const newTodo = todoModel.add({ title, description, completed });
    
    res.status(201).json(newTodo);
};

const getTodos = (todoModel) => (req, res) => {
    const { q } = req.query;
    if (q) {
        return res.json(todoModel.search(q));
    }
    res.json(todoModel.getAll());
};

const getTodoById = (todoModel) => (req, res) => {
    const todo = todoModel.getById(req.params.id);
    if (!todo) {
        return res.status(404).json({ error: "Tarea no encontrada" });
    }
    res.json(todo);
};

const updateTodo = (todoModel) => (req, res) => {
    const { title, description, completed } = req.body;
    
    if (title !== undefined && title.trim() === "") {
        return res.status(400).json({ error: "El título no puede estar vacío" });
    }

    const updatedTodo = todoModel.update(req.params.id, { title, description, completed });
    if (!updatedTodo) {
        return res.status(404).json({ error: "Tarea no encontrada" });
    }
    res.json(updatedTodo);
};

const deleteTodo = (todoModel) => (req, res) => {
    const deleted = todoModel.delete(req.params.id);
    if (!deleted) {
        return res.status(404).json({ error: "Tarea no encontrada" });
    }
    res.status(200).json({ message: "Tarea eliminada correctamente" });
};

module.exports = {
    createTodo,
    getTodos,
    getTodoById,
    updateTodo,
    deleteTodo
};
