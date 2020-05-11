import React from 'react';
import ReactDOM from 'react-dom';

import { CreateGameLock } from './CreateGameLock'
import { Game } from "./components/Game";
import {GameStateProvider} from "./GameStateProvider";

ReactDOM.render((
	<CreateGameLock>
		<GameStateProvider>
			<Game />
		</GameStateProvider>
	</CreateGameLock>
), document.getElementById('app'));