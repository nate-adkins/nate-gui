import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import roslib from "roslib";

// Constant to define the number of data points kept in memory
const SCROLLABLE_DATA_LENGTH = 100;
const VISIBLE_DATA_LENGTH = 50;  // Visible portion of data on the chart

const LiveDataChart = () => {
  const [data, setData] = useState([]); // Initial empty data
  const [visibleData, setVisibleData] = useState([]); // Show the last VISIBLE_DATA_LENGTH data points
  const [isLive, setIsLive] = useState(true);
  const [startIndex, setStartIndex] = useState(0);

  useEffect(() => {
    // Initialize ROS connection
    const ros = new roslib.Ros({
      url: 'ws://localhost:9090', // Replace with your ROS bridge WebSocket URL
    });

    // Create a subscriber for the /cmd_vel topic
    const cmdVelSubscriber = new roslib.Topic({
      ros: ros,
      name: '/cmd_vel',
      messageType: 'geometry_msgs/Twist',
    });

    // Function to handle incoming messages
    const handleNewMessage = (message) => {
      const newDataPoint = {
        time: new Date().toLocaleTimeString(),
        value: message.linear.x, // Use the linear.x component
      };

      // Add the new data point and update the visible data
      setData((prevData) => {
        const updatedData = [...prevData, newDataPoint].slice(-SCROLLABLE_DATA_LENGTH); // Keep the last SCROLLABLE_DATA_LENGTH data points
        if (isLive) {
          setVisibleData(updatedData.slice(-VISIBLE_DATA_LENGTH)); // Show only the last VISIBLE_DATA_LENGTH data points
          setStartIndex(updatedData.length - VISIBLE_DATA_LENGTH);
        }
        return updatedData;
      });
    };

    // Subscribe to the /cmd_vel topic
    cmdVelSubscriber.subscribe(handleNewMessage);

    // Clean up the subscription on component unmount
    return () => {
      cmdVelSubscriber.unsubscribe(handleNewMessage);
      ros.close();
    };
  }, [isLive]);

  const handleScroll = (event) => {
    const newStartIndex = Number(event.target.value);

    // Automatically switch to live view if the scroll bar is at the maximum (rightmost)
    if (newStartIndex >= Math.max(data.length - VISIBLE_DATA_LENGTH, 0)) {
      handleBackToLive();
    } else {
      setVisibleData(data.slice(newStartIndex, newStartIndex + VISIBLE_DATA_LENGTH));
      setStartIndex(newStartIndex);
      setIsLive(false);
    }
  };

  const handleBackToLive = () => {
    setVisibleData(data.slice(-VISIBLE_DATA_LENGTH)); // Show the last VISIBLE_DATA_LENGTH data points
    setStartIndex(data.length - VISIBLE_DATA_LENGTH);
    setIsLive(true);
  };

  // Calculate dynamic Y-axis domain based on visible data
  const getYDomain = (data) => {
    if (data.length === 0) return [0, 1]; // Default domain if no data
    const min = Math.min(...data.map((d) => d.value));
    const max = Math.max(...data.map((d) => d.value));
    return [min - (max - min) * 0.1, max + (max - min) * 0.1]; // Add 10% padding
  };

  return (
    <div style={{ padding: "20px" }}>
      <h3>Live /cmd_vel Data (Linear X)</h3>
      <LineChart
        width={800}
        height={400}
        data={visibleData}
        margin={{ top: 20, right: 20, bottom: 20, left: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" />
        <YAxis domain={getYDomain(visibleData)} /> {/* Dynamic Y-axis scaling */}
        <Tooltip />
        <Line type="monotone" dataKey="value" stroke="#8884d8" isAnimationActive={false} />
      </LineChart>

      <div style={{ marginTop: "20px" }}>
        <input
          type="range"
          min="0"
          max={Math.max(data.length - VISIBLE_DATA_LENGTH, 0)} // Max value is the maximum starting index
          value={startIndex}
          onChange={handleScroll}
          style={{ width: "100%" }}
        />
      </div>

      <div style={{ marginTop: "20px" }}>
        <button onClick={handleBackToLive}>Back to Live Data</button>
      </div>
    </div>
  );
};

export default LiveDataChart;
