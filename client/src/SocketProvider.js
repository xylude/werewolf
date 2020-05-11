import React, { useState, useEffect, createContext } from 'react';
import io from 'socket.io-client'

export const SocketContext = createContext({
    io: null,
    connected: false,
})

export function SocketProvider({ children }) {
    const socket = io('http://localhost:3000');
    // const [ socket, setSocket ] = useState(null);
    const [ connected, setConnected ] = useState(false);

    socket.on('disconnect', () => {
        setConnected(false);
        // // try and reconnect
        // setSocket(io('http://localhost:3000'));
    });

    socket.on('connect', () => {
        setConnected(true);
    });

    return connected ? (
        <div>Connecting...</div>
    ) : (
        <SocketContext.Provider
            value={{
                socket,
                connected,
            }}
        >
            { children }
        </SocketContext.Provider>
    )
}