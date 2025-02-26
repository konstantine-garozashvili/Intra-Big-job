import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Register from './pages/Register'
import './index.css'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={<Register />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App