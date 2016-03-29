'use strict';

const electron = require('electron');
const fs = require('fs');
const lh = require('./app/localhost.js');
// Module to control application life
const session = require('electron').session;
//const ipcMain = electron.ipcMain;

const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

const Menu = require('menu');

// Agario Client
const agarClient = require('agario-client');
const config = require('./bot/config.js');
let token = null;
const account = new agarClient.Account();

var logFn = require('./bot/logs.js'),
	gameplayFn = require('./bot/gameplay.js');

global.__base = __dirname + '/';
global.getAgarioAccessToken = function () {
	session.defaultSession.cookies.get({}, function(error, cookies) {
		const neededCookies = ['c_user', 'datr', 'xs'];
		for (let i = 0, b = cookies.length; i < b; i++) {
			if (neededCookies.indexOf(cookies[i].name) >= 0) {
				account[cookies[i].name] = cookies[i].value;
			}
		}

		// Getting Facebook Token
		account.requestFBToken(function(tkn, info) {
			console.log('Tokken reveived!', tkn);
			token = tkn;
			mainWindow.webContents.openDevTools();

			for (let i = 0, b = menuBar.items.length; i < b; i++) {
				for (let a in menuBar.items[i].submenu.items) {
					let item = menuBar.items[i].submenu.items[a];
					item.enabled = true;
				}
			}
		});
	});
};

// Core
let QUEST = {
	COLLECTED_MASS_TOTAL: 0,
	MAX_BOTS_COUNT: 0,
	MAX_MASS_COUNT: 0,
	LARGEST_BOT_MASS: 0,
	MOVES: {
		DEFENCE: 0,
		ATTACK: 0,
		VIRUS: 0,
		RANDOM: 0
	},
	ACTIONS: {
		SPLITS: 0
	},
	BOTS: {},
	SERVERS: {}
};

var clientIdCounter = 0;
function start(server, key) {
	var client = new agarClient('Client_' + clientIdCounter++);
	QUEST.SERVERS[server] = true;
	client.debug = 0;
	client.auth_token = token;
	client.on('disconnect', function() {
		if (QUEST.BOTS[client.client_name]) delete QUEST.BOTS[client.client_name];
		if (QUEST.SERVERS[server]) delete QUEST.SERVERS[server];
		clearInterval(client.sendInterval);
		client = null;
	});
	client.on('packetError', function(packet, error, preventCrash) {
		preventCrash();
	});
	client.on('connected', function() {
		QUEST.COLLECTED_MASS_TOTAL += 1;
		QUEST.BOTS[client.client_name] = client;
		client.spawn(config.name());
		client.sendInterval = setInterval(function() {
			gameplayFn(QUEST, config, client);
		}, 40);
	});
	client.on('lostMyBalls', function() {
		client.spawn(config.name());
	});

	client.on('scoreUpdate', function(oldScore, newScore) {
		var currentMass = parseInt(newScore),
			previousMass = parseInt(oldScore);
		if (currentMass > previousMass) {
			QUEST.COLLECTED_MASS_TOTAL += ((currentMass - previousMass)/50);
		}
	});
	client.connect('ws://' + server, key);
}

// Starting connection
var startConnecting = require('./bot/connect.js');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let menuBar;
function createWindow () {
	// Create the browser window.
	mainWindow = new BrowserWindow({
		title: 'Agar.io XP Gainer v1.0',
		width: 1050,
		height: 600,
		frame: true,
		icon: __dirname + '/app/images/icon.png',
		webPreferences: {
			nodeIntegration: true,
			webSecurity: false
		}
	});

	// and load the index.html of the app.
	//mainWindow.loadURL('file://' + __dirname + '/app/index.html');
	mainWindow.loadURL('https://www.facebook.com/dialog/oauth/?client_id=846372892155110&redirect_uri=http://localhost:1988&state=f12c06f46e1407c&scope=public_profile,email');
	// Open the DevTools.
	//mainWindow.webContents.openDevTools();

	// Emitted when the window is closed.
	mainWindow.on('closed', function() {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		mainWindow = null;
	});

	function getRegionsMenuTemplate() {
		const serversObj = JSON.parse(fs.readFileSync(__dirname + '/app/regions.json', 'utf8'));
		let regionsSubmenu = [];
		for (let key in serversObj) {
			regionsSubmenu.push({
				label: key,
				type: 'checkbox',
				checked: serversObj[key],
				enabled: false,
				click: function() {
					updateRegionsMenuTemplate();
				}
			})
		}
		return regionsSubmenu;
	};

	function updateRegionsMenuTemplate() {
		var regions = {};
		for (let i in menuBar.items[1].submenu.items) {
			let item = menuBar.items[1].submenu.items[i];
			regions[item.label] = item.checked;
		}

		fs.writeFile(__dirname + '/app/regions.json', JSON.stringify(regions), function(err) {
			if (err) {
				return console.log(err);
			}
		});
	};

	let logFnTimer;
	let menuBarTemplate = [
		{
			label: 'Actions',
			submenu: [{
				label: 'Start XP gaining session',
				accelerator: 'Ctrl+S',
				enabled: false,
				click: function() {
					startConnecting(QUEST, token, agarClient, start, config.regions);
					mainWindow.webContents.executeJavaScript('showGainStats()');
					logFnTimer = setInterval(function() {
						logFn(QUEST);
					}, 1000);

					menuBar.items[0].submenu.items[0].visible = false;
					menuBar.items[0].submenu.items[1].visible = true;
				}
			},
			{
				label: 'Stop XP gaining session',
				accelerator: 'Ctrl+X',
				visible: false,
				enabled: false,
				click: function() {
					startConnecting(QUEST, token, agarClient, start, config.regions);
					mainWindow.webContents.executeJavaScript('hideGainStats()');
					clearInterval(logFnTimer);

					menuBar.items[0].submenu.items[1].visible = false;
					menuBar.items[0].submenu.items[0].visible = true;
				}
			}]
		},
		{
			label: 'Regions',
			submenu: getRegionsMenuTemplate()
		},
		{
			label: 'Help',
			submenu: [{
				label: "About",
				accelerator: "Ctrl+A",
				enabled: false,
				click: function() {
					// Query all cookies.

				}
			},
			{
				type: 'separator'
			},
			{
				label: "How to use?",
				accelerator: "Ctrl+H",
				enabled: false,
				click: function() {
					alert('Test... 2');
				}
			}]
		}
	];
	menuBar = Menu.buildFromTemplate(menuBarTemplate);
	mainWindow.setMenu(menuBar);
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
	// On OS X it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', function () {
	// On OS X it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (mainWindow === null) {
		createWindow();
	}
});