const express = require('express');
const { produce } = require('immer');

const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const { handleGameLogic } = require('./handleGameLogic')

app.use(express.json());

function makeid(length) {
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	const charactersLength = characters.length;
	return new Array(length).fill(null).map(() => characters.charAt(Math.floor(Math.random() * charactersLength))).join('');
}

const defaultRoles = [
	{
		name: 'Villager',
		description: 'A working class hero. Has no special abilities, except their ability to ROCK AND ROLL!',
		count: -1, // fill non-assigned roles with this
		hasOwnChat: false,
	},
	{
		name: 'Werewolf',
		description: 'A murderous being, part wolf and part human and likes skulking. Can conspire with other werewolves to ' +
			'kill one non-werewolf every night.',
		count: 2,
		hasOwnChat: true,
	}
];

const games = {};

app.use(express.static('../client/dist'));

app.get('/is-valid-game', (req, res) => {
	res.json({
		is_valid: !!games[req.query.game_id]
	});
})

app.post('/create-game', (req, res) => {
	const {
		body: {
			name,
			player_name,
		}
	} = req;

	const game_id = makeid(10);
	const socket = io.of(`/${game_id}`);

	const game = produce({
		name,
		started_at: null,
		socket,
		game_id,
		roles: defaultRoles,
		players: [],
		isDay: true,
		day: 1,
	}, () => {});

	games[game_id] = game;

	const cleanup = handleGameLogic(socket, games[game_id]);
	games[game_id].cleanup = cleanup;

	res.json({
		game_id,
	});
});

http.listen(3000, () => {
	console.log('listening on *:3000');
});