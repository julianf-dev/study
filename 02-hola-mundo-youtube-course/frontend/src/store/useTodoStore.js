import { create } from 'zustand'

const API_URL = 'http://localhost:3001/api/todos'

export const useTodoStore = create((set, get) => ({
  todos: [],
  searchTerm: '',
  loading: false,

  setSearchTerm: (term) => {
    set({ searchTerm: term })
    get().fetchTodos(term)
  },

  fetchTodos: async (query = '') => {
    set({ loading: true })
    try {
      const url = query ? `${API_URL}?q=${query}` : API_URL
      const res = await fetch(url)
      const data = await res.json()
      set({ todos: data })
    } catch (error) {
      console.error('Error fetching todos:', error)
    } finally {
      set({ loading: false })
    }
  },

  addTodo: async (title) => {
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title })
      })
      if (res.ok) {
        get().fetchTodos(get().searchTerm)
      }
    } catch (error) {
      console.error('Error creating todo:', error)
    }
  },

  deleteTodo: async (id) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' })
      if (res.ok) {
        get().fetchTodos(get().searchTerm)
      }
    } catch (error) {
      console.error('Error deleting todo:', error)
    }
  },

  toggleTodo: async (id, completed) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !completed })
      })
      if (res.ok) {
        get().fetchTodos(get().searchTerm)
      }
    } catch (error) {
      console.error('Error updating todo:', error)
    }
  },

  updateTodo: async (id, title) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title })
      })
      if (res.ok) {
        get().fetchTodos(get().searchTerm)
      }
    } catch (error) {
      console.error('Error updating todo:', error)
    }
  }
}))
