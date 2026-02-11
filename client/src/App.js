import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Login from './pages/login';
import Signup from './pages/signup';
import './App.css';

function Home() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to TalentLink</h1>
        <nav>
          <Link to="/login" className="App-link">Login</Link> | <Link to="/signup" className="App-link">Signup</Link>
        </nav>
      </header>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/chat" element={<Chat />} />
      </Routes>
    </Router>
  );
}

export default App;
