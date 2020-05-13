import React, { useContext } from 'react';
import { GameStateContext } from '../GameStateProvider';

export function PlayerPresence({ name }) {
	const { game_state, game$, self } = useContext(GameStateContext);
	const player = game_state.players.find(player => player.name === name);

	return (
		<div
			style={{
				marginBottom: 10,
				paddingBottom: 10,
				borderBottom: '1px solid #eee',
				opacity: player.connected ? 1 : .7,
			}}
		>
			<div>
				{player.name} ({player.is_gm ? 'GM' : player.alive ? 'living' : 'dead'})
			</div>
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
