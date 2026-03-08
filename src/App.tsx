import './App.css'
import { Link, Route, Routes } from 'react-router-dom'
import { Button } from './components/button'
import About from './pages/About'

function App() {
  const handleClick = () => {
    alert('Good job');
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          <div>
            <h1>Welcome to my website</h1>
            <Button title="Click me" onClick={handleClick} />
            <Link to="/about">About</Link>
          </div>
        }
      />
      <Route path="/about" element={<About />} />
    </Routes>
  );
}

export default App
