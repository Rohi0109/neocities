import React, { useEffect, useRef, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom'
import './styles.css'

type Todo = { id: string; text: string; completed: boolean; createdAt: string | number }
type TodoPageProps = {
  todos: Todo[]
  loading: boolean
  onAdd: (text: string) => Promise<void>
  onToggle: (id: string) => Promise<void>
}
const STORAGE_KEY = 'personal-site-todos'

function loadLocalTodos(): Todo[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? (JSON.parse(stored) as Todo[]) : []
  } catch {
    return []
  }
}

function requireLogin(response: Response) {
  if (response.status === 401) {
    const returnPath = `${window.location.pathname}${window.location.search}`
    window.location.assign(`/login/?next=${encodeURIComponent(returnPath)}`)
    throw new Error('Login required.')
  }
  return response
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

function ActiveTodos({ todos, loading, onAdd, onToggle }: TodoPageProps) {
  const [newTodo, setNewTodo] = useState('')
  const activeTodos = todos.filter((todo) => !todo.completed)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const text = newTodo.trim()
    if (!text) return
    await onAdd(text)
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
      <TodoList
        todos={activeTodos}
        emptyMessage={loading ? "Loading todos..." : "Nothing to do right now."}
        onToggle={onToggle}
      />
    </section>
  )
}

function CompletedTodos({ todos, loading, onToggle }: TodoPageProps) {
  const completedTodos = todos.filter((todo) => todo.completed)
  return (
    <section className="todo-section" aria-labelledby="completed-heading">
      <div className="todo-heading-row">
        <div><h2 id="completed-heading">Completed todos</h2><p>All the things I have finished.</p></div>
        <Link className="todo-page-link" to="/todos/">Back to todos</Link>
      </div>
      <TodoList
        todos={completedTodos}
        emptyMessage={loading ? "Loading todos..." : "No completed todos yet."}
        onToggle={onToggle}
      />
      {completedTodos.length > 0 && <p className="todo-help">Uncheck a todo to move it back to your list.</p>}
    </section>
  )
}

export function HomePage() { return null }

export function App() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const syncStarted = useRef(false)

  useEffect(() => {
    if (syncStarted.current) return
    syncStarted.current = true

    async function loadTodos() {
      try {
        const response = requireLogin(await fetch('/api/todos', { credentials: 'include' }))
        if (!response.ok) throw new Error('Unable to load todos.')
        const serverTodos = (await response.json()) as Todo[]
        const localTodos = loadLocalTodos()
        const mergedTodos = [...serverTodos]

        for (const localTodo of localTodos) {
          const alreadySynced = mergedTodos.some(
            (todo) => todo.text === localTodo.text && todo.completed === localTodo.completed,
          )
          if (alreadySynced) continue

          const migratedResponse = requireLogin(await fetch('/api/todos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ text: localTodo.text, completed: localTodo.completed }),
          }))
          if (!migratedResponse.ok) throw new Error('Unable to migrate local todos.')
          mergedTodos.push((await migratedResponse.json()) as Todo)
        }

        localStorage.removeItem(STORAGE_KEY)
        setTodos(mergedTodos)
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : 'Unable to load todos.')
      } finally {
        setLoading(false)
      }
    }

    void loadTodos()
  }, [])

  async function addTodo(text: string) {
    setError('')
    const response = requireLogin(await fetch('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ text }),
    }))
    if (!response.ok) {
      setError('Unable to add the todo.')
      return
    }
    const todo = (await response.json()) as Todo
    setTodos((current) => [...current, todo])
  }

  async function toggleTodo(id: string) {
    const currentTodo = todos.find((todo) => todo.id === id)
    if (!currentTodo) return

    setError('')
    const response = requireLogin(await fetch(`/api/todos/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ completed: !currentTodo.completed }),
    }))
    if (!response.ok) {
      setError('Unable to update the todo.')
      return
    }
    const updatedTodo = (await response.json()) as Todo
    setTodos((current) => current.map((todo) => todo.id === id ? updatedTodo : todo))
  }

  const todoPageProps = { todos, loading, onAdd: addTodo, onToggle: toggleTodo }
  return (
    <Shell>
      {error && <p className="todo-error" role="alert">{error}</p>}
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
