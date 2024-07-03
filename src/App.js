import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import ClassroomPlanner from './ClassroomPlanner';
import Login from './components/ui/Login'; // Assurez-vous que le chemin est correct
import './App.css';

function App() {
  const [authenticated, setAuthenticated] = useState(false);

  return (
    <div className="App">
      <Router>
        <Routes>
          <Route
            path="/login"
            element={<Login setAuthenticated={setAuthenticated} />}
          />
          <Route
            path="/"
            element={authenticated ? <ClassroomPlanner /> : <Navigate to="/login" />}
          />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
