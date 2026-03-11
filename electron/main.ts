// main.ts - Electron Main Process

import { app, BrowserWindow } from 'electron';

function createWindow() {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    // Load the index.html of the app.
    mainWindow.loadFile('index.html');
}

// This method will be called when Electron has finished initialization.
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    // Quit when all windows are closed.
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the dock icon is clicked.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});