const express = require('express'),
	app = express(),
	port = 1988;
app.use(express.static(__dirname));
app.listen(port);