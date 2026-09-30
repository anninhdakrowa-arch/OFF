const { app, BrowserWindow, dialog, ipcMain, shell } = require('electron');
const path = require('path');

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1360,
    height: 860,
    minWidth: 1024,
    minHeight: 700,
    title: 'VN-OCR Desktop - Nhận dạng chữ tiếng Việt Offline',
    backgroundColor: '#0f172a',
    autoHideMenuBar: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      spellcheck: false,
    },
  });

  const devUrl = process.env.VITE_DEV_SERVER_URL;
  if (devUrl) {
    mainWindow.loadURL(devUrl);
    // mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Prevent navigation outside local app
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http:') || url.startsWith('https:')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Native file open dialog handler
ipcMain.handle('dialog:openImages', async () => {
  if (!mainWindow) return { canceled: true, filePaths: [] };
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Chọn ảnh tài liệu cần OCR',
    filters: [
      { name: 'Ảnh tài liệu (*.jpg, *.png, *.webp, *.bmp)', extensions: ['jpg', 'jpeg', 'png', 'webp', 'bmp'] },
      { name: 'Tất cả các tệp', extensions: ['*'] }
    ],
    properties: ['openFile', 'multiSelections']
  });
  return result;
});

// Native folder open dialog handler
ipcMain.handle('dialog:openDirectory', async () => {
  if (!mainWindow) return { canceled: true, filePaths: [] };
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Chọn thư mục chứa ảnh tài liệu',
    properties: ['openDirectory']
  });
  return result;
});

// Native save docx dialog handler
ipcMain.handle('dialog:saveDocx', async (event, defaultName) => {
  if (!mainWindow) return { canceled: true };
  const result = await dialog.showSaveDialog(mainWindow, {
    title: 'Lưu file văn bản Word (.docx)',
    defaultPath: defaultName || 'OCR_TaiLieu.docx',
    filters: [{ name: 'Microsoft Word Document (*.docx)', extensions: ['docx'] }]
  });
  return result;
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
