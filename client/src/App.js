import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Login from './pages/login';
import Signup from './pages/signup';
import Chat from './pages/chat';
import './App.css';

function Home() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to TalentLink</h1>
      </header>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chat" element={<Chat />} />
      </Routes>
    </Router>
  );
}

export default App;
