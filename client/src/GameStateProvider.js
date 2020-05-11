import React, { useState, createContext } from 'react';
import qs from 'query-string'

export const GameStateContext = createContext({
    game_state: null,
    player_name: window.localStorage.getItem('player_name'),
    game_id: qs.parse(window.location.search).game_id,
});

export function GameStateProvider({ children }) {
    const [game_state, setGameState] = useState(null);

    return (
        <GameStateContext.Provider
            value={{
                game_state,
                player_name: window.localStorage.getItem('player_name'),
                game_id: qs.parse(window.location.search).game_id,
                setGameState,
            }}
        >
            { children }
        </GameStateContext.Provider>
    )
}