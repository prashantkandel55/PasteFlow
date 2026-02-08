import { clipboard } from 'electron';
import { StorageService } from './storage.service';
import { TaggerService } from './tagger.service';
import { CryptoService } from './crypto.service';

export class ClipboardService {
  private static lastText: string = "";
  private static pollInterval: number = 500;
  private static timer: NodeJS.Timeout | null = null;

  private static onNewClipCallback: ((clip: any) => void) | null = null;

  static start(callback?: (clip: any) => void) {
    if (callback) this.onNewClipCallback = callback;
    if (this.timer) return;
    this.timer = setInterval(() => this.checkClipboard(), this.pollInterval);
  }

  static stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private static checkClipboard() {
    const currentText = clipboard.readText().trim();
    if (currentText && currentText !== this.lastText) {
      this.lastText = currentText;
      this.processNewClip(currentText);
    }
  }

  private static processNewClip(text: string) {
    const tags = TaggerService.analyze(text);
    const isSensitive = tags.includes('#sensitive');
    
    const clip = StorageService.saveClip({
      content_plain: isSensitive ? '[REDACTED SENSITIVE DATA]' : text,
      content_encrypted: isSensitive ? CryptoService.encrypt(text) : undefined,
      type: 'text',
      source_app: 'Unknown'
    }, tags);

    if (this.onNewClipCallback) {
      this.onNewClipCallback(clip);
    }
  }

  static clearHistory() {
    StorageService.clearHistory();
    this.lastText = "";
  }
}
