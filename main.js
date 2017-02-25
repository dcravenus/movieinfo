const {app, BrowserWindow} = require('electron');

let win;

function createWindow () {
  win = new BrowserWindow();
  win.loadURL(`file://${__dirname}/index.html`)
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  app.quit();
});
