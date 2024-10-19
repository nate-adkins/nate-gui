import React, { useEffect, useState, useRef } from 'react';
import { Joystick } from 'react-joystick-component';
import ROSLIB from 'roslib'; // Ensure ROSLIB is correctly imported

const ROSComponent = () => {
    const ros = useRef(new ROSLIB.Ros());
    const [status, setStatus] = useState('Disconnected');
    const cmdVel = useRef(new ROSLIB.Topic({
        ros: ros.current,
        name: '/turtle1/cmd_vel',
        messageType: 'geometry_msgs/Twist'
    }));

    const connectToROS = () => {
        ros.current.connect('ws://localhost:9090');

        ros.current.on('connection', () => {
            console.log('Connected to ROS!');
            setStatus('Connected!');
        });

        ros.current.on('error', (error) => {
            console.error('Connection error:', error);
            setStatus('Error');
        });

        ros.current.on('close', () => {
            console.log('Connection closed');
            setStatus('Connection closed');
        });
    };

    const disconnectFromROS = () => {
        if (ros.current) {
            ros.current.close();
            setStatus('Disconnected');
        }
    };

    useEffect(() => {
        return () => {
            disconnectFromROS(); // Cleanup on component unmount
        };
    }, []);

    const handleMove = (data) => {
        console.log('Joystick moved:', data);

        // Calculate yaw angle (direction) and distance (magnitude)
        const yaw = -1 * Math.atan2(data.x, data.y); // Yaw in radians
        const distance = Math.sqrt(data.x ** 2 + data.y ** 2); // Distance from center

        const twist = new ROSLIB.Message({
            linear: {
                x: distance, // No linear movement
                y: 0,
                z: 0,
            },
            angular: {
                x: 0,
                y: 0,
                z: yaw // Set yaw angle based on joystick direction
            }
        });

        // Publish the message
        cmdVel.current.publish(twist);
        console.log('Published message:', twist);
    };

    const handleStop = () => {
        const twist = new ROSLIB.Message({
            linear: {x: 0 ,y: 0,z: 0,},
            angular: {x: 0,y: 0,z: 0}
        });

        // Publish stop command
        cmdVel.current.publish(twist);
        console.log('Published stop message:', twist);
    };

    return (
        <div>
            <h1>ROS Status: {status}</h1>
            <button onClick={connectToROS}>Connect</button>
            <button onClick={disconnectFromROS}>Disconnect</button>
            <Joystick 
                size={100} 
                baseColor="blue" 
                stickColor="cyan" 
                move={handleMove} 
                stop={handleStop} 
            />
        </div>
    );
};

export default ROSComponent;
