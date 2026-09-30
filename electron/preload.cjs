const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  openImages: () => ipcRenderer.invoke('dialog:openImages'),
  openDirectory: () => ipcRenderer.invoke('dialog:openDirectory'),
  saveDocxDialog: (defaultName) => ipcRenderer.invoke('dialog:saveDocx', defaultName),
  platform: process.platform,
});
