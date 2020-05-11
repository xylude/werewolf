import React, {useContext} from 'react';
import {GameStateContext} from "../GameStateProvider";

export function Role({ role_id }) {
    const { game_state } = useContext(GameStateContext);
    const role = game_state.roles[role_id];

    return (
        <div
            style={{
                borderBottom: '1px solid #aaa',
                paddingBottom: 10,
                marginBottom: 10,
            }}
        >
            <div
                style={{
                    marginBottom: 10,
                }}
            >
                <strong>{role.name}</strong>
            </div>
            <div
                style={{
                    fontStyle: 'italic',
                }}
            >
                {role.description}
            </div>
        </div>
    )
}