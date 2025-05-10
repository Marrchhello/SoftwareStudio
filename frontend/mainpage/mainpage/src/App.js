import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import UpsosHomepage from './UpsosHomepage';
import Login from './components/Login/idex';
import Dashboard from './components/Dashboard.jsx/dashboard';
import ProtectedRoute from './components/ProtectedRoot/index';
import Register from './components/Register/index';
import './UpsosHomepage.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<UpsosHomepage />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/register" element={<Register />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;