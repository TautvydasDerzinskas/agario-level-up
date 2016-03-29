'use strict';

module.exports = function (QUEST, token, agarClient, start, regions) {
	const SPAWN_NORMAL_TIMER = 100;
	const BOT_LIMIT = 100;

	let connectBots = function() {
		let BOTS_COUNT = Object.keys(QUEST.BOTS).length;

		if (token && BOTS_COUNT <= BOT_LIMIT) {
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

	setInterval(connectBots, SPAWN_NORMAL_TIMER);
};
