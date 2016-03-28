const express = require('express'),
	app = express(),
	port = 5000;
app.use(express.static(__dirname));
app.listen(port);