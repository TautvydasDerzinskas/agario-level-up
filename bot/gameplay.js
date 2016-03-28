const BIG_BALL_SIZE = 1000;
const SPLIT_ATTACK_DISTANCE = 710 - 10; // Less precision for bots
const SPLIT_SIZE_RATIO = 1.25;

function getDistance (cell1, cell2) {
	return Math.sqrt(Math.pow(cell1.x - cell2.x, 2) + Math.pow(cell2.y - cell1.y, 2));
}
function getOppositeCoords (x, y) {
	return {
		x: (0 - x),
		y: (0 - y)
	};
}
function getRandomCoords () {
	var max = 7071,
		min = -7071;
	return {
		x:  Math.random() * (max - min) + min,
		y: Math.random() * (max - min) + min
	};
}

function compareSizes (player1, player2) {
    return player1.size * player1.size * SPLIT_SIZE_RATIO < player2.size * player2.size;
}

module.exports = function(QUEST, config, client) {
	var BOT_BALL = client.balls[client.my_balls[0]];

	var AREA_REGISTRY = {
		VIRUS: {
			DISTANCE: 1000,
			ENTITY: null
		},
		ENEMY: {
			DISTANCE: 1000,
			ENTITY: null
		},
		FOOD: {
			DISTANCE: 1000,
			ENTITY: null
		}
	};

	if (BOT_BALL) {
		// Looking for nearest enemies to run from them (oposite direction)
		for (var id in client.balls) {
			if (client.my_balls.indexOf(id) != -1) continue;

			var entity = client.balls[id];
			if (entity.mine) continue;

			var distance = getDistance(entity, BOT_BALL);
			if (distance !== 0) {
				var entity_type = entity.virus ? 'VIRUS' : (entity.size > BOT_BALL.size ? 'ENEMY' : 'FOOD');

				// Registering close by viruses
				if (AREA_REGISTRY[entity_type].DISTANCE > distance) {
					AREA_REGISTRY[entity_type].DISTANCE = distance;
					AREA_REGISTRY[entity_type].ENTITY = entity;
					continue;
				}
			}
		}

		if (BOT_BALL.size < BIG_BALL_SIZE) { // Small bot, defencive hunter

			// Movement if enemies exist in area - moving opposit from nearest enemy
			if (AREA_REGISTRY.ENEMY.ENTITY && AREA_REGISTRY.ENEMY.DISTANCE < SPLIT_ATTACK_DISTANCE && AREA_REGISTRY.ENEMY.DISTANCE > 50) {
				QUEST.MOVES.DEFENCE += 1;

				// If distance to neares virus is close move there
				if (AREA_REGISTRY.VIRUS.ENTITY && AREA_REGISTRY.VIRUS.DISTANCE < 100 && BOT_BALL.size < 130) {
					client.moveTo(AREA_REGISTRY.VIRUS.ENTITY.x, AREA_REGISTRY.VIRUS.ENTITY.y);
				}
				else {
					var opositeCoords = getOppositeCoords(AREA_REGISTRY.ENEMY.ENTITY.x, AREA_REGISTRY.ENEMY.ENTITY.y);
					client.moveTo(opositeCoords.x, opositeCoords.y);
				}
				/*
				if (AREA_REGISTRY.ENEMY.DISTANCE < 350) {
					client.split();
					QUEST.ACTIONS.SPLITS += 1;
				}
				*/
			}

			// No enemies - hunting time
			else if (AREA_REGISTRY.FOOD.ENTITY) {
				client.moveTo(AREA_REGISTRY.FOOD.ENTITY.x, AREA_REGISTRY.FOOD.ENTITY.y);
				// Splitting power!
				if (compareSizes(BOT_BALL, AREA_REGISTRY.FOOD.ENTITY) && AREA_REGISTRY.FOOD.DISTANCE <= SPLIT_ATTACK_DISTANCE) {
					client.split();
					QUEST.ACTIONS.SPLITS += 1;
				}
				QUEST.MOVES.ATTACK += 1;
			}

			// No food, no enemies, but we have virus - lets hide here & wait for better times :-)
			else if (AREA_REGISTRY.VIRUS.ENTITY && BOT_BALL.size < 130) {
				client.moveTo(AREA_REGISTRY.VIRUS.ENTITY.x, AREA_REGISTRY.VIRUS.ENTITY.y);
				QUEST.MOVES.VIRUS += 1;
			}

			// If we are in empty map lets do some random movement
			else {
				var randomCoords = getRandomCoords();
				client.moveTo(randomCoords.x, randomCoords.y);
				QUEST.MOVES.RANDOM += 1;
			}
		}
		else { // Big bot - defence mode

			// If we have both enemies and viruses arround
			if (AREA_REGISTRY.ENEMY.ENTITY && AREA_REGISTRY.VIRUS.ENTITY) {

				// Chossing the better from both of these
				var runningFrom = AREA_REGISTRY.ENEMY.DISTANCE > AREA_REGISTRY.VIRUS.DISTANCE ? 'ENEMY' : 'VIRUS',
					opositeCoords = getOppositeCoords(AREA_REGISTRY[runningFrom].ENTITY.x, AREA_REGISTRY[runningFrom].ENTITY.y);
				client.moveTo(opositeCoords.x, opositeCoords.y);
				QUEST.MOVES.DEFENCE += 1;
			}
			else if (AREA_REGISTRY.ENEMY.ENTITY || AREA_REGISTRY.VIRUS.ENTITY) {
				var runningFrom = AREA_REGISTRY.ENEMY.ENTITY ? 'ENEMY' : 'VIRUS',
					opositeCoords = getOppositeCoords(AREA_REGISTRY[runningFrom].ENTITY.x, AREA_REGISTRY[runningFrom].ENTITY.y);
				client.moveTo(opositeCoords.x, opositeCoords.y);
				QUEST.MOVES.DEFENCE += 1;
			}
			else {
				if (AREA_REGISTRY.FOOD.ENTITY) {
					client.moveTo(AREA_REGISTRY.FOOD.ENTITY.x, AREA_REGISTRY.FOOD.ENTITY.y);
					// Splitting power!
					if (compareSizes(BOT_BALL, AREA_REGISTRY.FOOD.ENTITY) && AREA_REGISTRY.FOOD.DISTANCE <= SPLIT_ATTACK_DISTANCE) {
						client.split();
						QUEST.ACTIONS.SPLITS += 1;
					}
					QUEST.MOVES.ATTACK += 1;
				}
				else {
					var randomCoords = getRandomCoords();
					client.moveTo(randomCoords.x, randomCoords.y);
					QUEST.MOVES.RANDOM += 1;
				}		
			}

		}
	}
};