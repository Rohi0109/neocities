import React from 'react'
import ReactDOM from 'react-dom/client'
import './styles.css'

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="page">
      <header className="hero">
        <div className="hero-top">
          <p className="eyebrow">hello welcome me!</p>
          <nav className="nav">
            <a href="/">Home</a>
            <a href="/posts/">Posts</a>
            <a href="/updates/">Updates</a>
            <a href="/books/">Books</a>
            <a href="/login/">Login</a>
          </nav>
        </div>
      </header>
      {children}
    </main>
  )
}

export function HomePage() {
  return null
}

export function App() {
  return <Shell>{<HomePage />}</Shell>
}

const root = document.getElementById('root')

if (!root) {
  throw new Error('Missing #root element in index.html')
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
