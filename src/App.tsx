import './App.css'
import { Link, Route, Routes } from 'react-router-dom'

import About from './pages/About'
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
          </div>
        }
      />
      <Route path="/about" element={<About />} />
      <Route path="/tbd" element={<Tbd />} />
    </Routes>
  );
}

export default App
