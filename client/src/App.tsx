import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import FormSubmission from './pages/FormSubmission';
import PDFUpload from './pages/PDFUpload';
import Chatbot from './pages/Chatbot';
import Reports from './pages/Reports';
import PrivateRoute from './components/PrivateRoute';
import './App.css';

function App() {
  return (
    <UserProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route 
              path="/dashboard" 
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/form" 
              element={
                <PrivateRoute>
                  <FormSubmission />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/upload" 
              element={
                <PrivateRoute requiredRole="admin">
                  <PDFUpload />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/chatbot" 
              element={
                <PrivateRoute requiredRole="admin">
                  <Chatbot />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/reports" 
              element={
                <PrivateRoute>
                  <Reports />
                </PrivateRoute>
              } 
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </UserProvider>
  );
}

export default App;
