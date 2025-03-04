import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './views/Home'
import Login from './components/Login'
import Register from './components/Register'
import FoodSchedule from './views/FoodSchedule'
import 'bootstrap/dist/css/bootstrap.min.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/foodschedule" element={<FoodSchedule />} />
      </Routes>
    </Router>
  )
}

export default App
