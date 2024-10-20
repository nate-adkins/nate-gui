import React, { useEffect, useState } from 'react';
import roslib from 'roslib';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const LiveLineGraph = () => {
  const [data, setData] = useState([]);
  const [visibleData, setVisibleData] = useState([]);
  const [startIndex, setStartIndex] = useState(0);
  const windowSize = 20; // Number of data points visible at a time

  useEffect(() => {
    // Initialize ROS connection
    const ros = new roslib.Ros({
      url: 'ws://localhost:9090', // Replace with your ROS bridge WebSocket URL
    });

    // Create a subscriber for /cmd_vel topic
    const cmdVelSubscriber = new roslib.Topic({
      ros: ros,
      name: 'turtle1/cmd_vel',
      messageType: 'geometry_msgs/Twist',
    });

    // Function to handle incoming messages
    const handleNewMessage = (message) => {
      const newDataPoint = {
        name: new Date().toLocaleTimeString(),
        value: message.linear.x, // Plotting the x.linear value
      };
      setData((prevData) => {
        const updatedData = [...prevData, newDataPoint].slice(-100); // Keep the last 100 data points
        setVisibleData(updatedData.slice(startIndex, startIndex + windowSize)); // Adjust visible data on new point
        return updatedData;
      });
    };

    // Subscribe to the topic
    cmdVelSubscriber.subscribe(handleNewMessage);

    // Clean up on component unmount
    return () => {
      cmdVelSubscriber.unsubscribe(handleNewMessage);
      ros.close();
    };
  }, [startIndex]);

  // Scroll left
  const handleScrollLeft = () => {
    if (startIndex > 0) {
      const newStartIndex = Math.max(startIndex - 5, 0); // Move left by 5 points
      setStartIndex(newStartIndex);
      setVisibleData(data.slice(newStartIndex, newStartIndex + windowSize));
    }
  };

  // Scroll right
  const handleScrollRight = () => {
    if (startIndex < data.length - windowSize) {
      const newStartIndex = Math.min(startIndex + 5, data.length - windowSize); // Move right by 5 points
      setStartIndex(newStartIndex);
      setVisibleData(data.slice(newStartIndex, newStartIndex + windowSize));
    }
  };

  // Scroll back to live data
  const handleBackToLive = () => {
    const newStartIndex = Math.max(data.length - windowSize, 0);
    setStartIndex(newStartIndex);
    setVisibleData(data.slice(newStartIndex, newStartIndex + windowSize));
  };

  // Custom tick formatter for X-axis
  const CustomXAxisTick = ({ x, y, payload }) => {
    return (
      <g transform={`translate(${x},${y})`}>
        <text fill="#666" fontSize={12} textAnchor="middle">
          {payload.value}
        </text>
      </g>
    );
  };

  const getTickCount = (width) => {
    const maxTicks = 10; // Maximum number of ticks you want
    const tickSize = 50; // Size of each tick in pixels
    return Math.min(Math.floor(width / tickSize), maxTicks);
  };

  return (
    <div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={visibleData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            tickFormatter={(value) => value}
            ticks={visibleData.map((_, index) => index)}
            tickCount={getTickCount(400)} // Adjust this based on your graph size
            tick={<CustomXAxisTick />}
          />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#8884d8"
            activeDot={{ r: 8 }}
            animationDuration={0} // Disable animation for a sliding effect
          />
        </LineChart>
      </ResponsiveContainer>
      
      <div style={{ marginTop: '20px' }}>
        <button onClick={handleScrollLeft} style={{ marginRight: '10px' }}>
          Scroll Left
        </button>
        <button onClick={handleScrollRight} style={{ marginRight: '10px' }}>
          Scroll Right
        </button>
        <button onClick={handleBackToLive}>Back to Live Data</button>
      </div>
    </div>
  );
};

export default LiveLineGraph;
