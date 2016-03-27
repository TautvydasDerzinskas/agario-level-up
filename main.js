'use strict';

const electron = require('electron');
// Module to control application life

//const ipcMain = electron.ipcMain;

const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

const Menu = require('menu');
const MenuItem = require('menu-item');

// Agario Client
const agarClient = require('agario-client');
const config = require('./bot/config.js');
let token = null;
const account = new agarClient.Account();


var logFn = require('./bot/logs.js'),
  gameplayFn = require('./bot/gameplay.js');

// Getting Facebook Token
account.c_user = config.c_user;
account.datr = config.datr;
account.xs = config.xs;
account.requestFBToken(function(tkn, info) {
  token = tkn;
  mainWindow.webContents.openDevTools();
});

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

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    title: 'Agar.io XP Gainer v1.0',
    width: 800,
    height: 600,
    frame: true,
    icon: __dirname + '/app/icon.png'
  });

  // and load the index.html of the app.
  mainWindow.loadURL('file://' + __dirname + '/app/index.html');

  // Open the DevTools.
  //mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });


  var fileMenu = new Menu();
  fileMenu.append(new MenuItem({ label: "Start collectin XP", accelerator: "Ctrl+S", click: function() {
    startConnecting(QUEST, token, agarClient, start, config.regions);

    console.log('Agar.io XP gain session successfully started:');
    setInterval(function() { logFn(QUEST); }, 1000);
  }}));

  var editMenu = new Menu();
  editMenu.append(new MenuItem({ label: "About", accelerator: "Ctrl+A", click: function() {
      alert('Test... 1');
  }}));
  editMenu.append(new MenuItem({ label: "How to use?", accelerator: "Ctrl+H", click: function() {
      alert('Test... 2');
  }}));

  var menubar = new Menu();
  menubar.append(new MenuItem({ label: "File", submenu: fileMenu }));
  menubar.append(new MenuItem({ label: "Help", submenu: editMenu }));
  mainWindow.setMenu(menubar);
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