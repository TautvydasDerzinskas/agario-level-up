module.exports = {
	// Config Required
	c_user: '1682682424',
	datr: 'k8VUVkJHHrUcacTERd33EBy2',
	xs: '165%3A1eP1mTgl56NIzw%3A2%3A1459038719%3A3762',
	
	name: function() {
		var namesList = [
			'Jumbo',
			'Lithuania',
			'c=8',
			'W = 100% TEAM',
			'W = TEAM',
			'PRO | Team',
			'TψT | Syrius',
			'TψT | Team',
			'TψT | +PRO',
			'TψT | Hero',
			'Poland',
			'Polaki = W',
			'TψT | Admin',
			'BE MY TEAM!',
			'Pr0 Team'
		];

		return namesList[Math.floor(Math.random()*namesList.length)];
	},
	
	// Config Advanced
	botLimit: 5000,
	regions: ['EU-London']
};
