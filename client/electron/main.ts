import { app, BrowserWindow } from 'electron';
import { fileURLToPath } from 'node:url';
import * as path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let win: BrowserWindow | null = null;

function createWindow() {
	win = new BrowserWindow({
		width: 1200,
		height: 800,
		title: 'DocStral',
		webPreferences: {
			contextIsolation: true,
			sandbox: true,
			nodeIntegration: false,
			preload: path.join(__dirname, 'preload.js'),
		},
	});

	const devUrl = process.env.VITE_DEV_SERVER_URL;
	if (devUrl) {
		win.loadURL(devUrl);
		win.webContents.openDevTools();
	} else {
		win.loadFile(path.join(__dirname, '../dist/index.html'));
	}
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });