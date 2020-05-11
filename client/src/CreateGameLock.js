import React, { useState } from 'react';
import request from 'superagent';
import qs from 'query-string';

export function CreateGameLock({ children }) {
	const { game_id } = qs.parse(location.search);

	const [game_id_input, setGameIdInput] = useState('');
	const [game_name_input, setGameNameInput] = useState('');
	const [player_name_input, setPlayerNameInput] = useState(window.localStorage.getItem('player_name') || 'no name');

	if(!game_id) {
		return (
			<div>
				<h1>Werewolf</h1>
				<p>
					Player Name:{' '}
					<input
						type="text"
						value={player_name_input}
						onChange={e => {
							setPlayerNameInput(e.target.value);
							window.localStorage.setItem('player_name', e.target.value);
						}}
					/>
				</p>
				<h2>Create a new game</h2>
				<p>Name your game:</p>
				<p>
					<input
						type="text"
						onChange={e => setGameNameInput(e.target.value)}
						value={game_name_input}
					/>
				</p>
				<p>
					<input
						type="button"
						value='Create'
						onClick={async () => {
							const { body } = await request
								.post('/create-game')
								.send({
									player_name: player_name_input,
									name: game_name_input,
								});

							setGameIdInput(body.game_id);
						}}
					/>
				</p>
				<h2>Or join an existing game (enter game id):</h2>
				<p>
					<input
						type="text"
						onChange={e => setGameIdInput(e.target.value)}
						value={game_id_input}
					/>
				</p>
				<input
					type="button"
					value='Join Game'
					onClick={async () => {
						const { body } = await request
							.get('/is-valid-game')
							.query({
								game_id: game_id_input
							});

						if(body.is_valid) {
							window.location.href = `/?game_id=${game_id_input}`;
						} else {
							alert('That is not a valid game id');
						}
					}}
				/>
			</div>
		)
	}

	return children;
}