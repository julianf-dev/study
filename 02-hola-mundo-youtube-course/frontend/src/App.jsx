import { useState, useEffect } from 'react'
import { useTodoStore } from './store/useTodoStore'

function App() {
  const { 
    todos, 
    searchTerm, 
    loading, 
    fetchTodos, 
    addTodo, 
    deleteTodo, 
    toggleTodo, 
    updateTodo,
    setSearchTerm 
  } = useTodoStore()

  const [newTodoTitle, setNewTodoTitle] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editingTitle, setEditingTitle] = useState('')

  useEffect(() => {
    fetchTodos()
  }, [fetchTodos])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!newTodoTitle.trim()) return
    await addTodo(newTodoTitle)
    setNewTodoTitle('')
  }

  const startEditing = (todo) => {
    setEditingId(todo.id)
    setEditingTitle(todo.title)
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    if (!editingTitle.trim()) return
    await updateTodo(editingId, editingTitle)
    setEditingId(null)
    setEditingTitle('')
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', fontFamily: 'Arial' }}>
      <h1>Mis Tareas (Zustand)</h1>

      {/* Formulario para agregar */}
      <form onSubmit={handleCreate} style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Nueva tarea..."
          value={newTodoTitle}
          onChange={(e) => setNewTodoTitle(e.target.value)}
          style={{ padding: '8px', width: '70%', marginRight: '10px' }}
        />
        <button type="submit" style={{ padding: '8px 16px' }}>Agregar</button>
      </form>

      {/* Buscador */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Buscar tareas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: '8px', width: '100%', boxSizing: 'border-box' }}
        />
      </div>

      {/* Lista de tareas */}
      {loading ? <p>Cargando...</p> : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {todos.map(todo => (
            <li key={todo.id} style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '10px',
              borderBottom: '1px solid #eee',
              background: editingId === todo.id ? '#f9f9f9' : 'transparent'
            }}>
              {editingId === todo.id ? (
                <form onSubmit={handleUpdate} style={{ flexGrow: 1, display: 'flex' }}>
                  <input
                    type="text"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    autoFocus
                    style={{ padding: '4px', flexGrow: 1, marginRight: '10px' }}
                  />
                  <button type="submit" style={{ marginRight: '5px' }}>Guardar</button>
                  <button type="button" onClick={() => setEditingId(null)}>Cancelar</button>
                </form>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                    <input 
                      type="checkbox" 
                      checked={todo.completed} 
                      onChange={() => toggleTodo(todo.id, todo.completed)}
                      style={{ marginRight: '10px' }}
                    />
                    <span 
                      onClick={() => toggleTodo(todo.id, todo.completed)}
                      style={{ 
                        textDecoration: todo.completed ? 'line-through' : 'none',
                        color: todo.completed ? '#888' : '#000',
                        cursor: 'pointer',
                        flexGrow: 1
                      }}
                    >
                      {todo.title}
                    </span>
                  </div>
                  <div>
                    <button 
                      onClick={() => startEditing(todo)}
                      style={{ marginLeft: '10px', color: 'blue', border: 'none', background: 'none', cursor: 'pointer' }}
                    >
                      Editar
                    </button>
                    <button 
                      onClick={() => deleteTodo(todo.id)}
                      style={{ marginLeft: '10px', color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}
                    >
                      Eliminar
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
          {todos.length === 0 && !loading && <p>No hay tareas encontradas.</p>}
        </ul>
      )}
    </div>
  )
}

export default App
