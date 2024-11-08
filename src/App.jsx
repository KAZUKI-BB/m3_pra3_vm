import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login/Login';
import Select from './components/Select/Select';
import Profile from './components/Profile/Profile';
import Game from './components/Game/Game';
import Clear from './components/Clear/Clear';

const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/select" element={<Select />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/game" element={<Game />} />
      <Route path="/clear" element={<Clear />} />
    </Routes>
  </Router>
);

export default App;
