import { app } from 'electron';
import path from 'path';
import fs from 'fs';

export interface Settings {
  themeColor: string;
  launchAtStartup: boolean;
  notificationsEnabled: boolean;
}

const DEFAULT_SETTINGS: Settings = {
  themeColor: '#818CF8', // Default Indigo/Lavender
  launchAtStartup: false,
  notificationsEnabled: true
};

export class SettingsService {
  private settingsPath: string;
  private settings: Settings;

  constructor() {
    this.settingsPath = path.join(app.getPath('userData'), 'settings.json');
    this.settings = this.loadSettings();
  }

  private loadSettings(): Settings {
    try {
      if (fs.existsSync(this.settingsPath)) {
        const data = fs.readFileSync(this.settingsPath, 'utf8');
        return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
      }
    } catch (e) {
      console.error('Error loading settings:', e);
    }
    return { ...DEFAULT_SETTINGS };
  }

  getSettings(): Settings {
    return this.settings;
  }

  updateSettings(newSettings: Partial<Settings>): Settings {
    this.settings = { ...this.settings, ...newSettings };
    
    try {
      fs.writeFileSync(this.settingsPath, JSON.stringify(this.settings, null, 2));
      
      if (newSettings.launchAtStartup !== undefined) {
        app.setLoginItemSettings({
          openAtLogin: this.settings.launchAtStartup,
          path: app.getPath('exe')
        });
      }
    } catch (e) {
      console.error('Error saving settings:', e);
    }
    
    return this.settings;
  }
}
