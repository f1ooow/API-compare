const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs').promises;

let mainWindow;

const isDev = !app.isPackaged;
const dataPath = path.join(app.getPath('userData'), 'data');
const dataFile = path.join(dataPath, 'providers.json');

// 确保数据目录存在
async function ensureDataDir() {
  try {
    await fs.mkdir(dataPath, { recursive: true });

    // 如果数据文件不存在，创建空数据
    try {
      await fs.access(dataFile);
    } catch {
      await fs.writeFile(dataFile, JSON.stringify({ providers: [] }, null, 2));
    }
  } catch (error) {
    console.error('Error creating data directory:', error);
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

// IPC handlers for data operations
ipcMain.handle('load-data', async () => {
  try {
    const data = await fs.readFile(dataFile, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading data:', error);
    return { providers: [] };
  }
});

ipcMain.handle('save-data', async (event, data) => {
  try {
    await fs.writeFile(dataFile, JSON.stringify(data, null, 2));
    return { success: true };
  } catch (error) {
    console.error('Error saving data:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('export-data', async () => {
  try {
    const data = await fs.readFile(dataFile, 'utf-8');
    return { success: true, data: data };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('import-data', async (event, jsonData) => {
  try {
    // 验证数据格式
    const data = JSON.parse(jsonData);
    await fs.writeFile(dataFile, JSON.stringify(data, null, 2));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

app.whenReady().then(async () => {
  await ensureDataDir();
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
