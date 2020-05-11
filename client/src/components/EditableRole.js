import React, { useContext, useState } from 'react';
import { GameStateContext } from '../GameStateProvider';

export function EditableRole({ role_id, onRoleChange }) {
	const { game_state } = useContext(GameStateContext);
	const role = game_state.roles[role_id];

	const [name, setName] = useState(role.name);
	const [description, setDescription] = useState(role.description);
	const [count, setCount] = useState(role.count);
	const [has_own_chat, setHasOwnChat] = useState(role.has_own_chat);

	function save() {
		onRoleChange({
			id: role.id,
			name,
			description,
			count,
			has_own_chat,
		});
	}

	const disable_save =
		name === role.name &&
		description === role.description &&
		count === role.count &&
		has_own_chat === role.has_own_chat;

	return (
		<div>
			<div
				style={{
					borderBottom: '1px solid #aaa',
					paddingBottom: 10,
					marginBottom: 10,
				}}
			>
				<div>
					Name:{' '}
					<input
						type="text"
						value={name}
						placeholder="Role Name"
						onChange={e => {
							setName(e.target.value);
						}}
					/>
				</div>
				<div>
					Count:{' '}
					{role.locked ? (
						'FILL'
					) : (
						<input
							type="number"
							value={count}
							onChange={e => {
								if (e.target.value > 0) {
									setCount(e.target.value);
								}
							}}
						/>
					)}
				</div>
				<div>
					Description: <br />
					<textarea
						style={{
							width: '100%',
							height: 75,
						}}
						value={description}
						onChange={e => {
							setDescription(e.target.value);
						}}
					/>
				</div>
				<div>
					<input
						value={has_own_chat}
						onChange={() => {
							setHasOwnChat(v => !v);
						}}
						type="checkbox"
					/>{' '}
					Can chat with other players with this role?{' '}
					(GM and players with this role will be able to chat with each other)
				</div>
				<div>
					<input type="button" value={ disable_save ? 'Saved' : 'Save' } onClick={save} disabled={disable_save} />
					{!role.locked && <input type="button" value="Remove Role" />}
				</div>
			</div>
		</div>
	);
}
