
module.exports = function(QUEST, isConsole) {
	var totalScore = 0,
		largestBotMass = 0;
	for (var i in QUEST.BOTS) {
		if (QUEST.BOTS[i].score > largestBotMass) {
			largestBotMass = QUEST.BOTS[i].score;
		}
		totalScore += QUEST.BOTS[i].score;
	}

	var totalBots = Object.keys(QUEST.BOTS).length;
	var avgScore = (totalScore / totalBots).toFixed(0);

	// Records
	if (totalBots > QUEST.MAX_BOTS_COUNT) QUEST.MAX_BOTS_COUNT = totalBots;
	if (totalScore > QUEST.MAX_MASS_COUNT) QUEST.MAX_MASS_COUNT = totalScore;
	if (largestBotMass > QUEST.LARGEST_BOT_MASS) QUEST.LARGEST_BOT_MASS = largestBotMass;

	// Converting moves to percentages
	var totalMoves = (QUEST.MOVES.DEFENCE + QUEST.MOVES.ATTACK + QUEST.MOVES.RANDOM + QUEST.MOVES.VIRUS)/100;
	var attackPercentage = (QUEST.MOVES.ATTACK/totalMoves).toFixed(0),
		defencePercentage = (QUEST.MOVES.DEFENCE/totalMoves).toFixed(0),
		otherPercentage = ((QUEST.MOVES.RANDOM + QUEST.MOVES.VIRUS)/totalMoves).toFixed(0);

	// Resetting moves
	if (QUEST.MOVES.ATTACK > 9999 || QUEST.MOVES.DEFENCE > 9999) {
		QUEST.MOVES.ATTACK = 0;
		QUEST.MOVES.DEFENCE = 0;
		QUEST.MOVES.RANDOM = 0;
		QUEST.MOVES.VIRUS = 0;
	}

	if (!isConsole) {
		global.agarioBot = {
			botCount: totalBots,
			totalScore: totalScore,
			xpGained: QUEST.COLLECTED_MASS_TOTAL.toFixed(0),
			largestBotScore: largestBotMass,
			averageBotScore: avgScore,
			attackPercentage: attackPercentage,
			attackSplits: QUEST.ACTIONS.SPLITS,
			defencePercentage: defencePercentage,
			otherPercentage: otherPercentage,
			topBotsCount: QUEST.MAX_BOTS_COUNT,
			topBotsScore: QUEST.MAX_MASS_COUNT,
			topBotScore: QUEST.LARGEST_BOT_MASS
		};
	}
	else {
		process.stdout.clearLine();
		process.stdout.write('Bots: ' + totalBots + ', Mass: ' + totalScore + ', +' + QUEST.COLLECTED_MASS_TOTAL.toFixed(0) + 'XP | Top Bot: ' + largestBotMass + ', Avg Bot: ' + avgScore + ' | Attack: ' + attackPercentage + '% (' + QUEST.ACTIONS.SPLITS + ' splits), Defence: ' + defencePercentage + '%' + (otherPercentage > 0 ? ' , Other: ' + otherPercentage +'% ' : '') + ' | Tops: ' + QUEST.MAX_BOTS_COUNT + ' Bots, ' + QUEST.MAX_MASS_COUNT + ' Mass, ' + QUEST.LARGEST_BOT_MASS + ' Bot\r');
	}
};
