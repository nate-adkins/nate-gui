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
      setData((prevData) => [...prevData, newDataPoint].slice(-100)); // Keep the last 20 data points
    };

    // Subscribe to the topic
    cmdVelSubscriber.subscribe(handleNewMessage);

    // Clean up on component unmount
    return () => {
      cmdVelSubscriber.unsubscribe(handleNewMessage);
      ros.close();
    };
  }, []);

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
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="name"
          tickFormatter={(value) => value}
          ticks={data.map((_, index) => index)}
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
  );
};

export default LiveLineGraph;
