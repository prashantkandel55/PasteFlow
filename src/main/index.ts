import { app, shell, BrowserWindow, ipcMain, Tray, Menu, globalShortcut, clipboard, Notification, nativeImage } from 'electron'
import { exec } from 'child_process'
import { join } from 'path'
import { optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import iconWin from '../../resources/icon.ico?asset'
import { initDb } from './db'
import { ClipboardService } from './services/clipboard.service'
import { StorageService } from './services/storage.service'
import { SettingsService } from './services/settings.service'

let tray: Tray | null = null
let mainWindow: BrowserWindow | null = null

const settingsService: SettingsService = new SettingsService()

// Set app user model id for windows as early as possible
if (process.platform === 'win32') {
  app.setAppUserModelId('com.electron.pasteflow')
}

// Select icon based on platform
const appIconPath = process.platform === 'win32' 
  ? nativeImage.createFromPath(iconWin) 
  : icon

function createWindow(): void {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1050,
    height: 700,
    frame: false,
    resizable: false,
    alwaysOnTop: true,
    show: false,
    autoHideMenuBar: true,
    icon: appIconPath,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow!.loadURL(process.env['ELECTRON_RENDERER_URL']!)
  } else {
    mainWindow!.loadFile(join(__dirname, '../renderer/index.html'))
  }

  mainWindow.on('blur', () => {
    mainWindow?.hide()
  })
}

function toggleWindow(): void {
  if (mainWindow?.isVisible()) {
    mainWindow.hide()
  } else {
    mainWindow?.show()
    mainWindow?.focus()
  }
}

async function pasteClipboard(): Promise<void> {
  if (process.platform === 'win32') {
    exec('powershell.exe -command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SendKeys]::SendWait(\'^v\')"')
  } else if (process.platform === 'darwin') {
    exec('osascript -e "tell application \\"System Events\\" to keystroke \\"v\\" using {command down}"')
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Initialize database
  initDb()

  // Start clipboard listener and notify renderer
  ClipboardService.start((clip) => {
    mainWindow?.webContents.send('new-clip', clip)
    
    const settings = settingsService.getSettings()
    if (settings.notificationsEnabled) {
      new Notification({
        title: 'PasteFlow',
        body: 'New clip saved to history',
        icon: appIconPath,
        silent: true
      }).show()
    }
  })

  // Tray Setup
  tray = new Tray(appIconPath)
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Open PasteFlow', click: () => mainWindow?.show() },
    { type: 'separator' },
    { label: 'Quit', click: () => app.quit() }
  ])
  tray.setToolTip('PasteFlow')
  tray.setContextMenu(contextMenu)
  tray.on('click', toggleWindow)

  // Global Shortcut
  globalShortcut.register('Alt+V', toggleWindow)

  // IPC handlers for storage
  ipcMain.handle('get-clips', async () => {
    return StorageService.getClips()
  })

  ipcMain.handle('search-clips', async (_, query: string) => {
    return StorageService.searchClips(query)
  })

  ipcMain.handle('toggle-favorite', async (_, id: string) => {
    StorageService.toggleFavorite(id)
  })

  ipcMain.handle('delete-clip', async (_, id: string) => {
    StorageService.deleteClip(id)
  })

  ipcMain.handle('hide-window', async () => {
    mainWindow?.hide()
  })

  ipcMain.handle('paste-clip', async (_, text: string) => {
    clipboard.writeText(text)
    mainWindow?.hide()
    // Small delay to ensure focus returns to previous app before pasting
    setTimeout(() => {
      pasteClipboard()
    }, 100)
  })

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // Settings IPC
  ipcMain.handle('get-settings', () => settingsService.getSettings())
  ipcMain.handle('update-settings', (_, settings) => settingsService.updateSettings(settings))
  ipcMain.handle('clear-history', () => ClipboardService.clearHistory())

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
