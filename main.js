const { app, Menu, Tray, BrowserWindow, session } = require('electron');
const path = require('path');
const host = "10.0.21.230";

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

let parentWindow = undefined

const start = async function() {
  const filter = {
    urls: [`http://${host}:9090/*`]
  }

  session.defaultSession.webRequest.onBeforeSendHeaders(filter, (details, callback) => {
    details.requestHeaders['Authorization'] = 'Bearer Y29yZQ=='
    callback({ requestHeaders: details.requestHeaders })
  });
}

openCockpit = function() {
  // open with 'ready-to-show'
  const childWindow = new BrowserWindow(
    {
      show: false,
      backgroundColor: '#ffffff',
      webPreferences: {
      }
    });
  childWindow.setMenuBarVisibility(false);
  console.log("open");
  var url = `http://${host}:9090/cockpit/@localhost/podman/index.html`;
  console.log(url);
  childWindow.loadURL(url)

  childWindow.webContents.on('did-finish-load', function() {
    childWindow.show();
  });
}

createTrayMenu = function() {

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open Cockpit',
      click() { openCockpit(); }
    },
    {
      label: 'Exit',
      click() { app.quit(); },
      accelerator: 'CommandOrControl+Q'
    }
  ]);

  tray.setContextMenu(contextMenu);
}

app.commandLine.appendSwitch('ignore-certificate-errors');
app.whenReady().then(() => {
  // Parent window to prevent app closing
  parentWindow = new BrowserWindow({ show: false })

  // Setup tray
  tray = new Tray(path.join(app.getAppPath(), 'assets', 'podman.png'))
  tray.setToolTip('Podman Desktop');
  createTrayMenu();
  tray.on('click', () => {
    tray.popUpContextMenu()
  });
  start();
});

app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
  if (url.startsWith(`https://${host}:9090/`)) {
    event.preventDefault()
    callback(true)
  } else {
    callback(false)
  }
})