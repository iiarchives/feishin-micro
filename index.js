// Copyright (c) 2024 iiPython

// Modules
import { join } from "node:path";
import { app, BrowserWindow, ipcMain } from "electron";

import Store from "electron-store";

// Initialization
const store = new Store();
const launch_app = () => {
    const window = new BrowserWindow({
        frame: false,
        width: 462,
        height: 190,
        transparent: true,
        webPreferences: {
            preload: join(import.meta.dirname, "preload.js")
        }
    });
    window.setSkipTaskbar(true);
    window.setAlwaysOnTop(true, "screen");
    window.loadFile(join(import.meta.dirname, "src/index.html"));
    window.webContents.setAudioMuted(true);
}

app.whenReady().then(() => {
    ipcMain.handle("get-value", (_, key) => store.get(key));
    launch_app();
});
app.on("window-all-closed", app.quit);
