import React, { useState, useEffect, useContext } from "react";
import logo from './logo.svg';
import './App.css';
import Router from './pages/nav/Routes.js';

const App = () => {
  return (
    <div className="App">
      <Router/>
    </div>
  );
}

export default App;
