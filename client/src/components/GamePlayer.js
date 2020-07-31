import React, { useContext } from 'react';
import { GameStateContext } from '../GameStateProvider';
import { Chat } from './Chat';

export function GamePlayer() {
	const { game_state, game$, self } = useContext(GameStateContext);
	const player_role = game_state.roles[self.role];

	return (
		<div
			style={{
				display: 'flex',
			}}
		>
			<Chat />
			<div
				style={{
					width: 400,
					paddingLeft: 30,
				}}
			>
				<h2>{game_state.isDay ? 'Day' : 'Night'}</h2>
				<p>
					{game_state.isDay
						? 'It is day time, and you know what that means! Time to accuse your fellow villagers of treachery!!'
						: 'It is night time, you hear noises outside. Probably giant squirrels or something.'}
				</p>
				<p>Days Passed: {game_state.day}</p>
				<p>
					Villagers left:{' '}
					{
						game_state.players.filter(player => player.alive && !player.is_gm)
							.length
					}
				</p>
				{!self.is_gm && (
					<p>
						You are a {player_role.name} <br />
						<span
							style={{
								fontSize: 13,
							}}
						>
							{player_role.description}
						</span>
					</p>
				)}
				{self.is_gm && (
					<>
						<div>GM Controls</div>
						<div>
							<input
								style={{
									marginRight: 10,
								}}
								type="button"
								value='Clear Votes'
								onClick={() => {
									game$.send({
										type: 'clear_votes'
									})
								}}
							/>
							<input
								style={{
									marginRight: 10,
								}}
								type="button"
								value={game_state.isDay ? 'Go to night' : 'Go to morning'}
								onClick={() => {
									game$.send({
										type: 'advance'
									})
								}}
							/>
							<input
								style={{
									marginRight: 10,
								}}
								type="button"
								value={'End Game'}
								onClick={() => {
									if(confirm('Are you sure you want to end this game?')) {
										game$.send({
											type: 'end_game'
										});
									}
								}}
							/>
						</div>
					</>
				)}
			</div>
		</div>
	);
}
