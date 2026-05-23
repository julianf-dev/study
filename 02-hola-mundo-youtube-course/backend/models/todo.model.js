class TodoModel {
  constructor() {
    this.todos = [];
  }

  getAll() {
    return this.todos;
  }

  search(query) {
    const lowerQuery = query.toLowerCase();
    return this.todos.filter(todo => 
      todo.title.toLowerCase().includes(lowerQuery) || 
      (todo.description && todo.description.toLowerCase().includes(lowerQuery))
    );
  }

  getById(id) {
    return this.todos.find(todo => todo.id === parseInt(id));
  }

  add({ title, description, completed = false }) {
    const newTodo = {
      id: this.todos.length + 1,
      title,
      description: description || "",
      completed
    };
    this.todos.push(newTodo);
    return newTodo;
  }

  update(id, { title, description, completed }) {
    const todoIndex = this.todos.findIndex(todo => todo.id === parseInt(id));
    if (todoIndex === -1) return null;

    const updatedTodo = {
      ...this.todos[todoIndex],
      title: title !== undefined ? title : this.todos[todoIndex].title,
      description: description !== undefined ? description : this.todos[todoIndex].description,
      completed: completed !== undefined ? completed : this.todos[todoIndex].completed
    };

    this.todos[todoIndex] = updatedTodo;
    return updatedTodo;
  }

  delete(id) {
    const todoIndex = this.todos.findIndex(todo => todo.id === parseInt(id));
    if (todoIndex === -1) return false;

    this.todos.splice(todoIndex, 1);
    return true;
  }
}

module.exports = new TodoModel();