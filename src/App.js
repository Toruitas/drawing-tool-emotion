import React from 'react';
import { Drawer } from './features/drawer/Drawer';
import { Navbar } from './features/navbar/Navbar';
import './App.scss';

function App() {
  return (
    <div className="App">
      <Navbar />
      <Drawer /> 
      
    </div>
  );
}

export default App;
