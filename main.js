const { app, BrowserWindow, ipcMain, globalShortcut } = require('electron')
const url = require("url");
const path = require("path");

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, `/dist/spike-electron/index.html`),
      protocol: "file:",
      slashes: true
    })
  );
  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  mainWindow.on('closed', function () {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  if (mainWindow === null) createWindow()
})

function openModal() {
  const { BrowserWindow } = require('electron');
  let modal = new BrowserWindow({
    parent: mainWindow,
    modal: true,
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: true
    }
  })
  modal.loadURL('https://www.sitepoint.com')
  modal.once('ready-to-show', () => {
    modal.show()
  })
}

ipcMain.on('openModal', (event, arg) => {
  openModal()
})

ipcMain.on('request-keyboard-shortcut', (event, shortcut) => {
  globalShortcut.register(shortcut, () => {
    event.sender.send(`keyboard-shortcut-${shortcut}`);
  });
})

ipcMain.on('unregister-keyboard-shortcut', (event, shortcut) => {
  globalShortcut.unregister(shortcut, () => {
    event.sender.send(`keyboard-shortcut-${shortcut}`);
  });
})