import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
// import logo from './logo.svg';
import './App.css';
import Register from './Register';
import Login from './Login';

function Home() {
  return (
    <div>
      <h1>YouTube Clone Frontend</h1>
      <p>This is a React frontend connected to your backend.</p>
      <nav>
        <Link to="/register">Register</Link> | <Link to="/login">Login</Link>
      </nav>
    </div>
  );
}

function App() {
  const [apiResult, setApiResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Example: Fetching from backend API (adjust endpoint as needed)
    fetch('/api/v1/users')
      .then((res) => {
        if (!res.ok) throw new Error('API error');
        return res.json();
      })
      .then((data) => setApiResult(data))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
      </Routes>
      <div className="App">
        <h1>YouTube Clone Frontend</h1>
        <p>This is a React frontend connected to your backend.</p>
        <div>
          <h2>API Test Result:</h2>
          {error && <p style={{ color: 'red' }}>Error: {error}</p>}
          <pre>{apiResult ? JSON.stringify(apiResult, null, 2) : 'Loading...'}</pre>
        </div>
      </div>
    </Router>
  );
}

export default App;
