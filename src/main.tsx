import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom'
import './styles.css'

type Todo = { id: string; text: string; completed: boolean; createdAt: number }
type TodoPageProps = { todos: Todo[]; onAdd: (text: string) => void; onToggle: (id: string) => void }
const STORAGE_KEY = 'personal-site-todos'

function loadTodos(): Todo[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? (JSON.parse(stored) as Todo[]) : []
  } catch {
    return []
  }
}

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="page">
      <header className="hero">
        <div className="hero-top">
          <h1 className="eyebrow">Welcome to my website</h1>
          <nav className="nav" aria-label="Main navigation">
            <a href="/">Home</a>
            <a href="/posts/">Posts</a>
            <a href="/updates/">Updates</a>
            <a href="/books/">Books</a>
            <Link to="/todos/">Todos</Link>
            <a href="/login/">Login</a>
          </nav>
        </div>
      </header>
      {children}
    </main>
  )
}

function TodoList({ todos, emptyMessage, onToggle }: {
  todos: Todo[]
  emptyMessage: string
  onToggle: (id: string) => void
}) {
  if (todos.length === 0) return <p className="todo-empty">{emptyMessage}</p>
  return (
    <ul className="todo-list">
      {todos.map((todo) => (
        <li key={todo.id} className="todo-item">
          <label>
            <input type="checkbox" checked={todo.completed} onChange={() => onToggle(todo.id)} />
            <span>{todo.text}</span>
          </label>
        </li>
      ))}
    </ul>
  )
}

function ActiveTodos({ todos, onAdd, onToggle }: TodoPageProps) {
  const [newTodo, setNewTodo] = useState('')
  const activeTodos = todos.filter((todo) => !todo.completed)

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const text = newTodo.trim()
    if (!text) return
    onAdd(text)
    setNewTodo('')
  }

  return (
    <section className="todo-section" aria-labelledby="todo-heading">
      <div className="todo-heading-row">
        <div><h2 id="todo-heading">Todos</h2><p>Things I still need to do.</p></div>
        <Link className="todo-page-link" to="/todos/completed/">
          Completed ({todos.length - activeTodos.length})
        </Link>
      </div>
      <form className="todo-form" onSubmit={handleSubmit}>
        <label htmlFor="new-todo">Add a todo</label>
        <div className="todo-form-row">
          <input id="new-todo" type="text" value={newTodo}
            onChange={(event) => setNewTodo(event.target.value)}
            placeholder="What needs doing?" maxLength={200} autoComplete="off" />
          <button type="submit">Add</button>
        </div>
      </form>
      <TodoList todos={activeTodos} emptyMessage="Nothing to do right now." onToggle={onToggle} />
    </section>
  )
}

function CompletedTodos({ todos, onToggle }: TodoPageProps) {
  const completedTodos = todos.filter((todo) => todo.completed)
  return (
    <section className="todo-section" aria-labelledby="completed-heading">
      <div className="todo-heading-row">
        <div><h2 id="completed-heading">Completed todos</h2><p>All the things I have finished.</p></div>
        <Link className="todo-page-link" to="/todos/">Back to todos</Link>
      </div>
      <TodoList todos={completedTodos} emptyMessage="No completed todos yet." onToggle={onToggle} />
      {completedTodos.length > 0 && <p className="todo-help">Uncheck a todo to move it back to your list.</p>}
    </section>
  )
}

export function HomePage() { return null }

export function App() {
  const [todos, setTodos] = useState<Todo[]>(loadTodos)
  useEffect(() => localStorage.setItem(STORAGE_KEY, JSON.stringify(todos)), [todos])

  function addTodo(text: string) {
    setTodos((current) => [...current, {
      id: crypto.randomUUID(), text, completed: false, createdAt: Date.now(),
    }])
  }

  function toggleTodo(id: string) {
    setTodos((current) => current.map((todo) =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo,
    ))
  }

  const todoPageProps = { todos, onAdd: addTodo, onToggle: toggleTodo }
  return (
    <Shell>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/todos" element={<ActiveTodos {...todoPageProps} />} />
        <Route path="/todos/completed" element={<CompletedTodos {...todoPageProps} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Shell>
  )
}

const root = document.getElementById('root')
if (!root) throw new Error('Missing #root element in index.html')
ReactDOM.createRoot(root).render(
  <React.StrictMode><BrowserRouter><App /></BrowserRouter></React.StrictMode>,
)
