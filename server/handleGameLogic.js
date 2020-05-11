
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
	}
}

function createRole(name, description, count, hasOwnChat) {
	return {
		name,
		description,
		count: count === 'fill' ? -1 : 0,
		hasOwnChat,
	}
}

// side-effecty as hell
module.exports.handleGameLogic = function(io, game_state) {
	io.on('connection', socket => {
		let player_name = null;

		socket.on('message', msg => {
			if(!player_name) {
				if(msg.type === 'join') {
					// create player
					if(!game_state.players.find(player => player.name === msg.player_name)) {
						const is_gm = game_state.players.length === 0;

						game_state = produce(game_state, draft => {
							draft.players.push(createPlayer(msg.player_name, is_gm));
						})
					} else {
						player_name = msg.player_name;
					}

					io.emit('game_state', curateGameState(game_state));
				}
			} else if(!game_state.started_at) {
				// setup phase
				switch(msg.type) {
					case 'add_role': {
						break;
					}
					case 'remove_role': {
						break;
					}
					case 'update_role_count': {
						break;
					}
				}
			} else {
				// game is running
			}
		});
	})

	return () => {
		// cleanup
	}
}