// App.js
import React, { useState } from 'react';
import './App.css';
import ROSComponent from './components/ROSComponent/ROSComponent';
import DataGraph from './components/DataGraph/DataGraph';
import Tabs from './components/Tabs/Tabs'; // Import the new Tabs component

function App() {
  const [activeTab, setActiveTab] = useState('ROS'); // State to track active tab

  return (
    <div className="App">
      <header className="App-header">
        <Tabs activeTab={activeTab} setActiveTab={setActiveTab} /> {/* Render the Tabs component */}
      </header>
      <main>
        {activeTab === 'ROS' && <ROSComponent />}
        {activeTab === 'DataGraph' && <DataGraph />}
        {activeTab === 'Tab3' && <div>Content for Tab 3</div>} {/* Placeholder for Tab 3 */}
        {activeTab === 'Tab4' && <div>Content for Tab 4</div>} {/* Placeholder for Tab 4 */}
      </main>
    </div>
  );
}

export default App;
