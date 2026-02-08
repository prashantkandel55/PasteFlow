/// <reference types="vite/client" />

interface Window {
  api: {
    getClips: () => Promise<any[]>;
    searchClips: (query: string) => Promise<any[]>;
    toggleFavorite: (id: string) => Promise<void>;
    deleteClip: (id: string) => Promise<void>;
    pasteClip: (text: string) => Promise<void>;
    hideWindow: () => Promise<void>;
    getSettings: () => Promise<any>;
    updateSettings: (settings: any) => Promise<any>;
    clearHistory: () => Promise<void>;
    onNewClip: (callback: (clip: any) => void) => void;
  }
}
