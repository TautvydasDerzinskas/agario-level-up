module.exports = {
	// Config Required
	c_user: '1682682424',
	datr: 'k8VUVkJHHrUcacTERd33EBy2',
	xs: '130%3A5jFM-KBCORKxSA%3A2%3A1459185788%3A3762',
	regions: ['EU-London'],
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
	}
};
