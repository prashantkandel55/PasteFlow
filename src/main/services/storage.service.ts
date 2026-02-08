import db from '../db';
import { v4 as uuidv4 } from 'uuid';

export interface Clip {
  id: string;
  content_plain: string;
  content_encrypted?: Buffer;
  type: string;
  source_app?: string;
  is_favorite: number;
  created_at: string;
  tags?: string[];
}

export class StorageService {
  static saveClip(clip: Omit<Clip, 'id' | 'is_favorite' | 'created_at'>, tags: string[] = []): Clip {
    const id = uuidv4();
    const is_favorite = 0;
    const now = new Date().toISOString();
    
    // Use a transaction to ensure atomicity
    const save = db.transaction(() => {
      const clipStmt = db.prepare(`
        INSERT INTO clips (id, content_plain, content_encrypted, type, source_app, is_favorite, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      clipStmt.run(
        id,
        clip.content_plain,
        clip.content_encrypted || null,
        clip.type,
        clip.source_app || null,
        is_favorite,
        now
      );

      for (const tagName of tags) {
        // Ensure tag exists
        const tagId = uuidv4();
        db.prepare('INSERT OR IGNORE INTO tags (id, name) VALUES (?, ?)').run(tagId, tagName);
        
        // Relate tag to clip
        const actualTagIdStmt = db.prepare('SELECT id FROM tags WHERE name = ?');
        const tag = actualTagIdStmt.get(tagName) as { id: string };
        
        db.prepare('INSERT INTO clip_tags (clip_id, tag_id) VALUES (?, ?)').run(id, tag.id);
      }
    });

    save();

    return { ...clip, id, is_favorite, created_at: now, tags };
  }

  static getClips(limit = 100): Clip[] {
    const clipsStmt = db.prepare('SELECT * FROM clips ORDER BY created_at DESC LIMIT ?');
    const clips = clipsStmt.all(limit) as Clip[];

    return clips.map(clip => ({
      ...clip,
      tags: this.getTagsForClip(clip.id)
    }));
  }

  static searchClips(query: string): Clip[] {
    const stmt = db.prepare(`
      SELECT c.* FROM clips c
      JOIN clips_fts f ON c.rowid = f.rowid
      WHERE f.content_plain MATCH ?
      ORDER BY c.created_at DESC
    `);
    const clips = stmt.all(`${query}*`) as Clip[];

    return clips.map(clip => ({
      ...clip,
      tags: this.getTagsForClip(clip.id)
    }));
  }

  private static getTagsForClip(clipId: string): string[] {
    const stmt = db.prepare(`
      SELECT t.name FROM tags t
      JOIN clip_tags ct ON t.id = ct.tag_id
      WHERE ct.clip_id = ?
    `);
    const result = stmt.all(clipId) as { name: string }[];
    return result.map(r => r.name);
  }

  static toggleFavorite(id: string): void {
    const stmt = db.prepare('UPDATE clips SET is_favorite = 1 - is_favorite WHERE id = ?');
    stmt.run(id);
  }

  static deleteClip(id: string): void {
    const deleteOp = db.transaction(() => {
      db.prepare('DELETE FROM clip_tags WHERE clip_id = ?').run(id);
      db.prepare('DELETE FROM clips WHERE id = ?').run(id);
    });
    deleteOp();
  }

  static clearHistory(): void {
    const clearOp = db.transaction(() => {
      db.prepare('DELETE FROM clip_tags').run();
      db.prepare('DELETE FROM clips').run();
      // Also clear FTS if applicable, better to just delete all from clips which cascades if setup or just delete clips
      // Since FTS is a virtual table linked to clips in my setup, deleting clips might be enough or delete fts explicitly
      db.prepare('DELETE FROM clips_fts').run();
    });
    clearOp();
  }
}
