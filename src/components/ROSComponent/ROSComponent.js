import React, { useEffect, useState, useRef } from 'react';
import { Joystick } from 'react-joystick-component';
import ROSLIB from 'roslib'; 

const ROSComponent = () => {
    const ros = useRef(new ROSLIB.Ros());
    const [status, setStatus] = useState('Disconnected');
    const cmdVel = useRef(new ROSLIB.Topic({
        ros: ros.current,
        name: '/cmd_vel',
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

    // useEffect(() => {
    //     return () => {
    //         disconnectFromROS();
    //     };
    // }, []);

    const handleMove = (data) => {
        console.log('Joystick moved:', data);

        const yaw = -1 * Math.atan2(data.x, data.y);
        const distance = Math.sqrt(data.x ** 2 + data.y ** 2); 

        const twist = new ROSLIB.Message({
            linear: {x: distance,y: 0,z: 0,},
            angular: {x: 0,y: 0,z: yaw}
        });

        cmdVel.current.publish(twist);
    };

    const handleStop = () => {
        const twist = new ROSLIB.Message({
            linear: {x: 0 ,y: 0,z: 0,},
            angular: {x: 0,y: 0,z: 0}
        });

        cmdVel.current.publish(twist);
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
