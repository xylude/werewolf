import React, { useContext, useState } from 'react';
import { GameStateContext } from '../GameStateProvider';

export function EditableRole({ role_id, onRoleChange }) {
	const { game_state, game$ } = useContext(GameStateContext);
	const role = game_state.roles[role_id];

	const [name, setName] = useState(role.name);
	const [description, setDescription] = useState(role.description);
	const [count, setCount] = useState(role.count.toString());
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
		parseInt(count, 10) === role.count &&
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
				<div
					style={{
						marginBottom: 10,
					}}
				>
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
				<div
					style={{
						marginBottom: 10,
					}}
				>
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
				<div
					style={{
						marginBottom: 10,
					}}
				>
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
				{
					role.id !== 'villager' && (
						<div
							style={{
								marginBottom: 10,
							}}
						>
							<input
								checked={has_own_chat}
								onChange={() => {
									setHasOwnChat(v => !v);
								}}
								type="checkbox"
							/>{' '}
							Can chat with other players with this role? (GM and players with this
							role will be able to chat with each other)
						</div>
					)
				}
				<div>
					<input
						type="button"
						value={disable_save ? 'Saved' : 'Save'}
						onClick={save}
						disabled={disable_save}
						style={{
							marginRight: 10,
						}}
					/>
					{!role.locked && (
						<input
							onClick={() => {
								game$.send({
									type: 'remove_role',
									id: role_id,
								});
							}}
							type="button"
							value="Remove Role"
						/>
					)}
				</div>
			</div>
		</div>
	);
}
