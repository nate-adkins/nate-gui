// Tabs.js
import React from 'react';
import './Tabs.css'; // You can create this CSS file for styling the tabs

const Tabs = ({ activeTab, setActiveTab }) => {
  return (
    <div className="tabs">
      <button onClick={() => setActiveTab('ROS')} className={activeTab === 'ROS' ? 'active' : ''}>
        ROS Component
      </button>
      <button onClick={() => setActiveTab('DataGraph')} className={activeTab === 'DataGraph' ? 'active' : ''}>
        Data Graph
      </button>
      <button onClick={() => setActiveTab('Tab3')} className={activeTab === 'Tab3' ? 'active' : ''}>
        Tab 3
      </button>
      <button onClick={() => setActiveTab('Tab4')} className={activeTab === 'Tab4' ? 'active' : ''}>
        Tab 4
      </button>
    </div>
  );
};

export default Tabs;
