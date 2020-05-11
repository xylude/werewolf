import React, { useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import {GameStateContext} from "../GameStateProvider";

export function Game() {
    const { setGameState, game_state, game_id } = useContext(GameStateContext);

    useEffect(() => {
        const game$ = io(`/${game_id}`);
        console.log('connecting to ', game_id);

        game$.on('connect', () => {
            console.log('connected to game');
            game$.send({
                type: 'join',
                player_name: window.localStorage.getItem('player_name')
            });
        });

        game$.on('game_state', msg => {
            setGameState(msg);
        })
    }, [ game_id, setGameState ]);

    return game_state ? (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <header
                style={{
                    height: 50,
                    flex: '0 0 auto',
                    backgroundColor: '#000',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 20px',
                }}
            >
                <div
                    style={{
                        fontSize: 18,
                        flex: '1 0 auto',
                    }}
                >
                    Werewolf - {game_state.name}
                </div>
                <div>
                    {window.localStorage.getItem('player_name')}
                </div>
            </header>
            <div
                style={{
                    flex: '1 0 auto',
                    display: 'flex',
                }}
            >
                <aside
                    style={{
                        width: 200,
                        flex: '0 0 auto',
                        padding: 10,
                    }}
                >
                    <h2>Players</h2>
                    {
                        game_state.players.map(player => (
                            <div>
                                {player.name} { player.alive ? '(living)' : '(dead)' } { player.is_gm && '- GM'}
                            </div>
                        ))
                    }
                </aside>
                <main
                    style={{
                        flex: '1 0 auto',
                    }}
                >
                    {
                        game_state.started_at ? (
                            <div>Game Started</div>
                        ) : (
                            <div>
                                <div
                                    style={{
                                        width: 400,
                                    }}
                                >
                                    <h2>Roles</h2>
                                    {
                                        game_state.roles.map(role => (
                                            <div
                                                style={{
                                                    borderBottom: '1px solid #aaa',
                                                    paddingBottom: 10,
                                                    marginBottom: 10,
                                                }}
                                            >
                                                <div><strong>{role.name}</strong></div>
                                                <div>
                                                    Count: {role.count > 0 ? role.count : 'fill'} {' '}
                                                    <span style={{ display: 'inline-block', float: 'right'}}>(more / less / fill)</span>
                                                </div>
                                                <div>
                                                    Description: <br/>
                                                    <textarea
                                                        style={{
                                                            width: '100%',
                                                            height: 75,
                                                        }}
                                                        value={role.description}
                                                    />
                                                </div>
                                                <div>
                                                    <input
                                                        type="button"
                                                        value='Remove Role'
                                                    />
                                                </div>
                                            </div>
                                        ))
                                    }
                                    <input
                                        type="button"
                                        value='+ Add Role'
                                    />
                                </div>
                            </div>
                        )
                    }
                </main>
            </div>
        </div>
    ) : (
        <div>Loading...</div>
    )
}