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

// side-effecty as hell
module.exports.handleGameLogic = function(io, game_state) {
	io.on('connection', socket => {
		let player_name = null;

		socket.on('disconnect', () => {
			// set player status to offline
		});

		socket.on('message', msg => {
			if (!player_name) {
				if (msg.type === 'join') {
					// create player
					console.log('player', msg.player_name, 'joining');
					player_name = msg.player_name;
					if (
						!game_state.players.find(player => player.name === msg.player_name)
					) {
						const is_gm = game_state.players.length === 0;

						game_state = produce(game_state, draft => {
							draft.players.push(createPlayer(msg.player_name, is_gm));
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
						console.log('updating role', msg);
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
						// set started_at

						break;
					}
				}
			} else {
				// game is running
			}

			io.emit('game_state', curateGameState(game_state));
		});
	});

	return () => {
		// cleanup
	};
};
