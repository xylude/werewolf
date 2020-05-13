import React, {useState, createContext, useEffect} from 'react';
import qs from 'query-string'
import io from "socket.io-client";

export const GameStateContext = createContext({
    game_state: null,
    player_name: window.localStorage.getItem('player_name'),
    game_id: qs.parse(window.location.search).game_id,
});

function getSelf(game_state, player_name) {
    return game_state.players.find(p => p.name === player_name);
}

export function GameStateProvider({ children }) {
    const [game_state, setGameState] = useState(null);
    const [game$, setGame$] = useState(null);
    const game_id = qs.parse(window.location.search).game_id;
    const player_name = window.localStorage.getItem('player_name');

    useEffect(() => {
        const game$ = io(`/${game_id}`);
        console.log('connecting to ', game_id);

        game$.on('connect', () => {
            console.log('connected to game');
            game$.send({
                type: 'join',
                player_name,
            });

            setGame$(game$);
        });

        game$.on('game_state', msg => {
            if(msg.ended) {
                game$.disconnect();
                window.location.href = '/';
            } else {
                setGameState(msg);
            }
        });

        return () => game$.disconnect();
    }, [ game_id, setGameState ]);

    return game_id && game$ ? (
        <GameStateContext.Provider
            value={{
                game_state,
                player_name,
                game_id,
                setGameState,
                game$,
                self: game_state && getSelf(game_state, player_name),
            }}
        >
            { children }
        </GameStateContext.Provider>
    ) : (
        <div>
            Please enter a game id.
        </div>
    )
}