import React, { useContext } from 'react';
import { GameStateContext } from '../GameStateProvider';

function countVotes(game_state, player_name) {
	return Object.keys(game_state.votes)
		.map(voter => {
			return {
				voter,
				vote: game_state.votes[voter],
			};
		})
		.reduce((acc, curr) => {
			if (curr.vote === player_name) {
				acc += 1;
			}
			return acc;
		}, 0);
}

export function PlayerPresence({ name }) {
	const { game_state, game$, self } = useContext(GameStateContext);
	const player = game_state.players.find(player => player.name === name);

	return (
		<div
			style={{
				marginBottom: 10,
				paddingBottom: 10,
				borderBottom: '1px solid #eee',
				opacity: player.connected ? 1 : 0.7,
			}}
		>
			<div>
				{player.name}
				{game_state.started_at && !player.is_gm && player.alive && (
					<div
						style={{
							float: 'right',
						}}
					>
						<strong>Votes: {countVotes(game_state, player.name)}</strong>
					</div>
				)}
			</div>
			{!player.is_gm &&
				!self.is_gm &&
				self.alive &&
				player.alive &&
				game_state.started_at && (
					<div
						style={{
							marginTop: 5,
							fontSize: 13,
						}}
					>
						<strong>
							<span
								style={{
									cursor: 'pointer',
								}}
								onClick={() => {
									game$.send({
										type: 'vote',
										name: player.name,
									});
								}}
							>
								Vote
							</span>
						</strong>
					</div>
				)}
			{self.is_gm && game_state.started_at && !player.is_gm && (
				<div
					style={{
						marginTop: 5,
						fontSize: 13,
					}}
				>
					<div>
						<strong>
							{game_state.roles[player.role].name} -{' '}
							{player.alive ? (
								<span
									style={{ cursor: 'pointer' }}
									onClick={() => {
										game$.send({
											type: 'update_player',
											alive: false,
											name: player.name,
										});
									}}
								>
									Kill
								</span>
							) : (
								<span
									style={{ cursor: 'pointer' }}
									onClick={() => {
										game$.send({
											type: 'update_player',
											alive: true,
											name: player.name,
										});
									}}
								>
									Revive
								</span>
							)}
						</strong>
					</div>
				</div>
			)}
		</div>
	);
}
