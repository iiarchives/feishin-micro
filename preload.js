// Copyright (c) 2024 iiPython

// Modules
const { contextBridge, ipcRenderer } = require("electron/renderer");

// Setup bridge
contextBridge.exposeInMainWorld("api", {
    getStoreValue: (key) => ipcRenderer.invoke("get-value", key)
});
