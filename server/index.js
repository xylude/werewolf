const express = require('express');
const { produce } = require('immer');
const { makeid } = require('./util/makeid');

const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const { handleGameLogic } = require('./handleGameLogic');

app.use(express.json());

const defaultRoles = {
	villager: {
		id: 'villager',
		name: 'Villager',
		description:
			'A working class hero. Has no special abilities, except their ability to ROCK AND ROLL!',
		count: -1, // fill non-assigned roles with this
		has_own_chat: false,
		locked: true, // cannot be deleted, only edited
	},
	werewolf: {
		id: 'werewolf',
		name: 'Werewolf',
		description:
			'A murderous being, part wolf and part human and likes skulking. Can conspire with other werewolves to ' +
			'kill one non-werewolf every night.',
		count: 2,
		has_own_chat: true,
	},
};

const games = {};

// this is smelly, but idc bc it's my fuckin birthday
const cleanups = {};

if(process.env.NODE_ENV === 'production') {
	app.use(express.static('../client/build'));
} else {
	app.use(express.static('../client/dist'));
}

setInterval(() => {
	// console.log('Clean up, Clean up, Everybody Everywhere!');
	Object.keys(games)
		.map(k => games[k])
		.forEach(game => {
			if (
				game.ended ||
				(game.players.filter(player => player.connected).length === 0 &&
					game.created_at + 60000 * 60 * 3 < Date.now()
				)
			) {
				// console.log('deleting game', game.game_id, game.name);
				cleanups[game.game_id]();

				delete cleanups[game.game_id];
				delete games[game.game_id];
			}
		});
}, 60000);

app.get('/admin', (req, res) => {
	res.json({
		games: Object.keys(games).map(k => games[k]).map(game => {
			return produce(game, draft => {
				delete draft.socket;
				delete draft.cleanup;
			});
		})
	})
});

app.get('/is-valid-game', (req, res) => {
	res.json({
		is_valid: !!games[req.query.game_id],
	});
});

app.post('/create-game', (req, res) => {
	const {
		body: { name },
	} = req;

	const game_id = makeid(10);
	const socket = io.of(`/${game_id}`);

	const game = produce(
		{
			name,
			started_at: null,
			created_at: Date.now(),
			socket,
			game_id,
			roles: defaultRoles,
			players: [],
			isDay: true,
			day: 1,
		},
		() => {}
	);

	games[game_id] = game;

	const cleanup = handleGameLogic(socket, game, (game_state) => games[game_id] = game_state);
	cleanups[game_id] = cleanup;

	res.json({
		game_id,
	});
});

http.listen(process.env.NODE_ENV === 'production' ? 80 : 3000, () => {
	console.log('listening', process.env.NODE_ENV);
});
