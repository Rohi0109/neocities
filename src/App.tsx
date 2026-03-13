import './App.css'
import { Link, Route, Routes } from 'react-router-dom'

import About from './pages/About'
import Block from './pages/block'
import Blog from './pages/Blog'
import Books from './pages/books'
import Tbd from './pages/Tbd'

function App() {


  return (
    <Routes>
      <Route
        path="/"
        element={
          <div>
            <h1>Welcome to my website</h1>
            <Link to="/about">About</Link>
            <br />
            <Link to="/books">Bookshelf</Link>
            <br />
            <Link to="/updates">Site Updates</Link>
            <br />
            <Link to="/blog">Blog</Link>
          </div>
        }
      />
      <Route path="/about" element={<About />} />
      <Route path="/updates" element={<Block />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/blog/:slug" element={<Blog />} />
      <Route path="/books" element={<Books />} />
      <Route path="/tbd" element={<Tbd />} />
    </Routes>
  );
}

export default App
