import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import Welcome from './pages/Welcome'
import './index.css'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={<Welcome />} />
        
        </Routes>
      </div>
    </Router>
  )
}

export default App