import React, { useContext, useEffect, useState } from 'react';
import { GameStateContext } from '../GameStateProvider';

export function Chat({ style }) {
	const { game_state, self } = useContext(GameStateContext);
	const [current_tab, setCurrentTab] = useState('All');

	const available_tabs = [
		'All',
		...Object.keys(game_state.roles)
			.map(k => game_state.roles[k])
			.filter(role => {
				if ((self.role === role.id || self.is_gm) && role.has_own_chat) {
					return true;
				}

				return false;
			})
			.map(role => role.name),
		...(!self.alive || self.is_gm ? ['Graveyard'] : []),
	];

	return (
		<div
			style={style}
		>
			<h2>Chat</h2>
			<div>
				{available_tabs.map(tab_name => (
					<span
						style={{
							cursor: 'pointer',
							display: 'inline-block',
							padding: '5px 10px',
							fontWeight: current_tab === tab_name ? 'bold' : 'normal',
						}}
						onClick={() => setCurrentTab(tab_name)}
						key={tab_name}
					>
						{tab_name}
					</span>
				))}
				{available_tabs.map(tab_name => (
					<div
						style={{
							display: current_tab === tab_name ? 'block' : 'none',
						}}
					>
						<ChatRoom room_id={tab_name} />
					</div>
				))}
			</div>
		</div>
	);
}

function ChatRoom({ room_id }) {
	const { game$, player_name } = useContext(GameStateContext);

	const [messages, setMessages] = useState([]);
	const [message, setMessage] = useState('');

	function addMessage(message) {
		setMessage('');
		game$.send({
			type: 'chat_message',
			player_name,
			message,
			room_id,
		});
	}

	useEffect(() => {
		const handleChatMessage = msg => {
			if (msg.room_id === room_id) {
				setMessages(messages => [
					...messages,
					{ name: msg.player_name, message: msg.message },
				]);
			}
		};

		game$.on('chat_message', handleChatMessage);

		return () => game$.off('chat_message', handleChatMessage);
	}, [game$, room_id]);

	return (
		<div
			style={{
				display: 'inline-block',
				width: 400,
				border: '1px solid #eee',
				padding: 10,
				textAlign: 'left',
			}}
		>
			<div
				style={{
					height: 500,
					overflowY: 'scroll',
				}}
			>
				{messages.map(({ name, message }, idx) => (
					<div key={idx}>
						<strong>{name}</strong>: {message}
					</div>
				))}
			</div>
			<div>
				<form
					onSubmit={e => {
						e.preventDefault();
						addMessage(message);
					}}
				>
					<input
						type="text"
						value={message}
						onChange={e => setMessage(e.target.value)}
					/>
					<input type="submit" value="Send" />
				</form>
			</div>
		</div>
	);
}
