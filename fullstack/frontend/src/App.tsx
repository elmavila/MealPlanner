import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './views/Home';
import Login from './components/Login';
import Register from './components/Register';
import FoodSchedule from './views/FoodSchedule';
import "bootstrap/dist/css/bootstrap.min.css";


function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/home" />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/foodschedule" element={<FoodSchedule />} />
      </Routes>
   </Router>
  )
}

export default App
