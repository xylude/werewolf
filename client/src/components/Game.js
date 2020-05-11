import React, { useContext, useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import {GameStateContext} from "../GameStateProvider";
import {EditableRole} from "./EditableRole";
import {Role} from "./Role";
import {roles} from "../data/roles";

function getSelf(game_state, player_name) {
    return game_state.players.find(p => p.name === player_name);
}

export function Game() {
    const { setGameState, game_state, game_id } = useContext(GameStateContext);
    const player_name = window.localStorage.getItem('player_name');
    const send = useRef(null);
    const [selected_role, setSelectedRole] = useState('custom');

    useEffect(() => {
        const game$ = io(`/${game_id}`);
        console.log('connecting to ', game_id);

        send.current = msg => {
            console.log('sending', msg);
            game$.send(msg);
        };

        game$.on('connect', () => {
            console.log('connected to game');
            game$.send({
                type: 'join',
                player_name,
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
                                {player.name} { player.is_gm ? '- GM' : player.alive ? '(living)' : '(dead)' }
                            </div>
                        ))
                    }
                </aside>
                <main
                    style={{
                        flex: '1 0 auto',
                        paddingBottom: 30,
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
                                        Object.keys(game_state.roles).map(k => game_state.roles[k]).map(role => (
                                            getSelf(game_state, player_name).is_gm ? (
                                                <EditableRole
                                                    role_id={role.id}
                                                    onRoleChange={(role) => {
                                                        send.current({
                                                            type: 'update_role',
                                                            ...role,
                                                        })
                                                    }}
                                                />
                                            ) : (
                                                <Role role_id={role.id} />
                                            )
                                        ))
                                    }
                                    {
                                        getSelf(game_state, player_name).is_gm && (
                                            <>
                                                <select
                                                    value={selected_role}
                                                    onChange={e => setSelectedRole(e.target.value)}
                                                >
                                                    <option value="custom">Custom</option>
                                                    {
                                                        roles.map(role => (
                                                            <option key={role.id} value={role.id}>{role.name}</option>
                                                        ))
                                                    }
                                                </select>
                                                <input
                                                    type="button"
                                                    value='+ Add Role'
                                                    onClick={() => {
                                                        const role = selected_role === 'custom' ? {
                                                            name: 'New Role',
                                                            description: 'New Role Description',
                                                            count: 1,
                                                            has_own_chat: false,
                                                        } : {
                                                            ...roles.find(r => r.id === selected_role),
                                                            has_own_chat: false,
                                                            count: 1,
                                                        };

                                                        send.current({
                                                            type: 'add_role',
                                                            ...role,
                                                        })
                                                    }}
                                                />
                                            </>
                                        )
                                    }
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