import React, { useContext, useState } from 'react';
import { EditableRole } from './EditableRole';
import { Role } from './Role';
import { roles } from '../data/roles';
import { GameStateContext } from '../GameStateProvider';

export function GameSetup() {
	const { game_state, self, game$ } = useContext(GameStateContext);
	const [selected_role, setSelectedRole] = useState('custom');

	const can_start = Object.keys(game_state.roles)
            .map(k => game_state.roles[k])
            .reduce((acc, curr) => {
                if (curr.count > 0) {
                    acc += curr.count;
                }
                return acc;
            }, 1) <=
        game_state.players.length - 1

    console.log('role ct', Object.keys(game_state.roles)
        .map(k => game_state.roles[k])
        .reduce((acc, curr) => {
            if (curr.count > 0) {
                acc += curr.count;
            }
            return acc;
        }, 1));

	console.log('players', game_state.players.length - 1);

	return (
		<div>
			<div
				style={{
					width: 400,
				}}
			>
				<div
					style={{
						display: 'flex',
                        alignItems: 'center',
					}}
				>
					<h2 style={{ margin: '10px 20px 10px 0', padding: 0 }}>Roles</h2>
					<input
						disabled={!can_start}
						onClick={() => game$.send({ type: 'start_game' })}
						type="button"
						value={can_start ? "Start Game" : "Cannot Start!"}
					/>
				</div>
                {
                    !can_start && self.is_gm && (
                        <div
                            style={{
                                color: '#820000',
                                marginBottom: 20,
                                fontWeight: 'bold',
                            }}
                        >
                            You currently have more roles than players. Try reducing the count on roles to start a game.
                            Or...you could find more people to play with!
                        </div>
                    )
                }

				{Object.keys(game_state.roles)
					.map(k => game_state.roles[k])
					.map(role =>
						self.is_gm ? (
							<EditableRole
								role_id={role.id}
								onRoleChange={role => {
									game$.send({
										type: 'update_role',
										...role,
									});
								}}
							/>
						) : (
							<Role role_id={role.id} />
						)
					)}
				{self.is_gm && (
					<>
						<div
							style={{
								marginBottom: 20,
							}}
						>
							<div style={{ fontSize: 18, marginBottom: 20 }}>Add a role</div>
							<select
								value={selected_role}
								onChange={e => setSelectedRole(e.target.value)}
								style={{
									marginRight: 10,
								}}
							>
								<option value="custom">Custom</option>
								{roles.map(role => (
									<option key={role.id} value={role.id}>
										{role.name}
									</option>
								))}
							</select>
							<input
								type="button"
								value="+ Add Role"
								onClick={() => {
									const role =
										selected_role === 'custom'
											? {
													name: 'New Role',
													description: 'New Role Description',
													count: 1,
													has_own_chat: false,
											  }
											: {
													...roles.find(r => r.id === selected_role),
													has_own_chat: false,
													count: 1,
											  };

									game$.send({
										type: 'add_role',
										...role,
									});
								}}
							/>
						</div>
					</>
				)}
			</div>
		</div>
	);
}
