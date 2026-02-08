import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  getClips: () => ipcRenderer.invoke('get-clips'),
  searchClips: (query: string) => ipcRenderer.invoke('search-clips', query),
  toggleFavorite: (id: string) => ipcRenderer.invoke('toggle-favorite', id),
  deleteClip: (id: string) => ipcRenderer.invoke('delete-clip', id),
  pasteClip: (text: string) => ipcRenderer.invoke('paste-clip', text),
  hideWindow: () => ipcRenderer.invoke('hide-window'),
  getSettings: () => ipcRenderer.invoke('get-settings'),
  updateSettings: (settings: any) => ipcRenderer.invoke('update-settings', settings),
  clearHistory: () => ipcRenderer.invoke('clear-history'),
  onNewClip: (callback: (clip: any) => void) => {
    const listener = (_event, clip): void => callback(clip);
    ipcRenderer.on('new-clip', listener);
    return () => {
      ipcRenderer.removeListener('new-clip', listener);
    };
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
