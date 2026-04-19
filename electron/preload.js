const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  getDesktopIcons: () => ipcRenderer.invoke('get-desktop-icons'),
  quitApp: () => ipcRenderer.send('quit-app'),
  setIgnoreMouse: (ignore) => ipcRenderer.send('set-ignore-mouse', ignore),
});
