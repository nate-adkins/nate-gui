// App.js
import React from 'react';
import './App.css';
import ROSComponent from './components/ROSComponent/ROSComponent'
import DataGraph from './components/DataGraph/DataGraph'


function App() {
  return (
    <div className="App">
      <header className="App-header">
        <ROSComponent />
        <DataGraph />
      </header>
    </div>
  );
}

export default App;
