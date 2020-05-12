import React, {useContext, useState} from 'react';
import {EditableRole} from "./EditableRole";
import {Role} from "./Role";
import {roles} from "../data/roles";
import {GameStateContext} from "../GameStateProvider";

export function GameSetup() {
    const { game_state, self, game$ } = useContext(GameStateContext);
    const player_name = window.localStorage.getItem('player_name');
    const [selected_role, setSelectedRole] = useState('custom');

    return (
        <div>
            <div
                style={{
                    width: 400,
                }}
            >
                <h2>Roles</h2>
                {
                    Object.keys(game_state.roles).map(k => game_state.roles[k]).map(role => (
                        self.is_gm ? (
                            <EditableRole
                                role_id={role.id}
                                onRoleChange={(role) => {
                                    game$.send({
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
                   self.is_gm && (
                        <>
                            <div
                                style={{
                                    marginBottom: 20,
                                }}
                            >
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

                                        game$.send({
                                            type: 'add_role',
                                            ...role,
                                        })
                                    }}
                                />
                            </div>
                            <div>
                                <input onClick={() => game$.send({ type: 'start_game' })} type="button" value='Start Game'/>
                            </div>
                        </>
                    )
                }
            </div>
        </div>
    )
}