import React from 'react'
import { Routes, Route } from 'react-router-dom'
import UpsosHomepage from './components/UpsosHomepage'
import LoginPage from './components/LoginPage'
import StudentView from './components/StudentView'
import ProfView from './components/ProfView'
import FAQPage from './components/FAQPage'
import MapPage from './components/MapPage'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<UpsosHomepage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/student" element={<StudentView />} />
      <Route path="/teacher" element={<ProfView />} />
      <Route path="/faq" element={<FAQPage />} />
      <Route path="/map" element={<MapPage />} />
    </Routes>
  )
}

export default App
