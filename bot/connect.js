'use strict';

module.exports = function (QUEST, token, agarClient, start, regions) {
	const SPAWN_NORMAL_TIMER = 100;
	const SPAWN_LIGHT_TIMER = 2000;
	const BOT_LIMIT = 100;

	let SPAWN_MODE = 'normal',
		SPAWN_TIMER;

	let connectBots = function() {
		let BOTS_COUNT = Object.keys(QUEST.BOTS).length;
		if (BOTS_COUNT >= BOT_LIMIT && SPAWN_MODE === 'normal') {
			SPAWN_MODE = 'light';
			clearInterval(SPAWN_TIMER);
			SPAWN_TIMER = setInterval(connectBots, SPAWN_LIGHT_TIMER);
			return;
		}
		else if (BOTS_COUNT < BOT_LIMIT && SPAWN_MODE === 'light') {
			SPAWN_MODE = 'normal';
			clearInterval(SPAWN_TIMER);
			SPAWN_TIMER = setInterval(connectBots, SPAWN_NORMAL_TIMER);
			return;
		}

		if (token) {
			agarClient.servers.getFFAServer({region: regions[0]}, function(e) {
				if (!QUEST.SERVERS[e.server]) {
					start(e.server, e.key);
				}
			});
			agarClient.servers.createParty({region: regions[0]}, function(e) {
				if (!QUEST.SERVERS[e.server]) {
					start(e.server, e.key);
				}
			});
		}

	};

	SPAWN_TIMER = setInterval(connectBots, SPAWN_NORMAL_TIMER);
};
