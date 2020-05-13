const { produce } = require('immer');
const { makeid } = require('./util/makeid');

function curateGameState(game_state) {
	return produce(game_state, draft => {
		delete draft.socket;
		delete draft.cleanup;
	});
}

function createPlayer(name, is_gm) {
	return {
		name,
		is_gm,
		alive: true,
		role: null,
		connected: true,
	};
}

function createRole(name, description, count, hasOwnChat) {
	return {
		id: makeid(15),
		name,
		description,
		count: count === 'fill' ? -1 : count,
		hasOwnChat,
	};
}

function rand(min, max) {
	return Math.floor(Math.random() * max + min);
}

function assignRole(game_state, role_id) {
	// can we even start this:
	if (!game_state.players.find(p => p.role === null && !p.is_gm)) {
		// console.log('Assign role ended because no players found to assign to.');
		return game_state;
	}

	const idx = rand(1, game_state.players.length) - 1;
	const possiblePlayer = game_state.players[idx];

	if (possiblePlayer.role === null && !possiblePlayer.is_gm) {
		// console.log(`Assigning ${role_id} to ${possiblePlayer.name}`)
		return produce(game_state, draft => {
			draft.players[idx].role = role_id;
		});
	}

	// if we didn't find it on the first try, try again.
	// console.log('Retrying assign role');
	return assignRole(game_state, role_id);
}


module.exports.handleGameLogic = function(io, game_state, onUpdate) {
	// weirdly the game_state is not actually mutating it's parent from here. I'm sure it's something dumb
	// that I'm not getting right now. I just added a callback that will sync the actual games object with this
	// seemingly internal game_state in this function.
	const update = (game_state) => {
		io.emit('game_state', curateGameState(game_state));
		onUpdate(game_state);
	}

	const handleConnection = socket => {
		let player_name = null;

		socket.on('disconnect', () => {
			// set player status to offline
			if(player_name) {
				// console.log(`Player ${player_name} left.`);
				game_state = produce(game_state, draft => {
					draft.players = draft.players.map(player => {
						if(player.name === player_name) {
							player.connected = false;
						}
						return player;
					});
				});

				update(game_state);
			}
		});

		socket.on('message', msg => {

			if(msg.type === 'chat_message') {
				// console.log('sending chat msg', msg);
				io.emit('chat_message', msg);
			}

			if (!player_name) {
				if (msg.type === 'join') {
					// create player
					// console.log('player', msg.player_name, 'joining');
					player_name = msg.player_name;
					if (
						!game_state.players.find(player => player.name === msg.player_name)
					) {
						const is_gm = game_state.players.length === 0;

						game_state = produce(game_state, draft => {
							draft.players.push(createPlayer(msg.player_name, is_gm));
						});
					} else {
						game_state = produce(game_state, draft => {
							draft.players = draft.players.map(player => {
								if(player.name === player_name) {
									player.connected = true;
								}
								return player;
							});
						});
					}
				}
			} else if (!game_state.started_at) {
				// setup phase
				switch (msg.type) {
					case 'add_role': {
						const { name, description, count, has_own_chat } = msg;

						const role = createRole(
							name,
							description,
							parseInt(count, 10),
							has_own_chat
						);

						game_state = produce(game_state, draft => {
							draft.roles[role.id] = role;
						});

						break;
					}
					case 'remove_role': {
						const { id } = msg;

						game_state = produce(game_state, draft => {
							delete draft.roles[id];
						});

						break;
					}
					case 'update_role': {
						const { count, name, description, has_own_chat, id } = msg;
						// console.log('updating role', msg);
						game_state = produce(game_state, draft => {
							draft.roles[id].name = name;
							draft.roles[id].description = description;
							draft.roles[id].has_own_chat = has_own_chat;

							const num_count = parseInt(count, 10);
							if (num_count > -1) {
								draft.roles[id].count = num_count;
							}
						});

						break;
					}
					case 'start_game': {
						// assign player roles
						Object.keys(game_state.roles)
							.map(k => game_state.roles[k])
							.filter(role => role.count > 0)
							.forEach(role => {
								new Array(role.count).fill(null).forEach(() => {
									game_state = assignRole(game_state, role.id);
								});
							});

						game_state = produce(game_state, draft => {
							draft.players = draft.players.map(player => {
								if (!player.role && !player.is_gm) {
									// console.log(`Assigning villager role to ${player.name}`)
									player.role = 'villager';
								}
								return player;
							});

							draft.started_at = Date.now();
						});

						break;
					}
				}
			} else {
				// game is running
				switch(msg.type) {
					case 'update_player': {
						const { alive, name } = msg;

						game_state = produce(game_state, draft => {
							draft.players = draft.players.map(player => {
								if(player.name === name) {
									player.alive = alive;
								}
								return player;
							});
						});

						break;
					}
					case 'advance': {
						game_state = produce(game_state, draft => {
							if(!draft.isDay) {
								draft.day++;
							}
							draft.isDay = !draft.isDay;
						})

						break;
					}
					case 'end_game': {
						game_state = produce(game_state, draft => {
							draft.ended = true;
						});
						break;
					}
				}
			}

			update(game_state);
		});
	};

	io.on('connection', handleConnection);

	return () => {
		// cleanup
		io.off('connection', handleConnection);
	};
};
