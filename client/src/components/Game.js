import React, { useContext } from 'react';
import { GameStateContext } from '../GameStateProvider';
import { GameSetup } from './GameSetup';
import { PlayerPresence } from './PlayerPresence';
import { GamePlayer } from './GamePlayer';

// todo - when setting up game - need to make sure that role count isn't more than the number of players
// break out game creation into it's own component
// break out game play into it's own component

export function Game() {
	const { game_state, game_id } = useContext(GameStateContext);

	return game_state ? (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				backgroundColor: game_state.isDay ? '#1770a1' : '#04133e',
				color: '#eee',
				minHeight: '100%',
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
					Werewolf - {game_state.name} ({game_id})
				</div>
				<div>{window.localStorage.getItem('player_name')}</div>
			</header>
			<div
				style={{
					flex: '1 0 auto',
					display: 'flex',
				}}
			>
				<aside
					style={{
						width: 300,
						flex: '0 0 auto',
						padding: 10,
					}}
				>
					<h2>GM</h2>
					{game_state.players
						.filter(player => player.is_gm)
						.map(player => (
							<PlayerPresence name={player.name} key={player.name} />
						))}

					<h2>Living Players</h2>
					{game_state.players
						.filter(player => player.alive && !player.is_gm)
						.map(player => (
							<PlayerPresence name={player.name} key={player.name} />
						))}

					<h2>Dead Players</h2>
					{game_state.players
						.filter(player => !player.alive && !player.is_gm)
						.map(player => (
							<PlayerPresence name={player.name} key={player.name} />
						))}
				</aside>
				<main
					style={{
						flex: '1 0 auto',
						paddingBottom: 30,
					}}
				>
					{game_state.started_at ? <GamePlayer /> : <GameSetup />}
				</main>
			</div>
		</div>
	) : (
		<div>Loading...</div>
	);
}
