import React, { useState, useEffect, useRef } from 'react';
import { MagnifyingGlass, Sparkle } from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './components/Sidebar';
import ClipCard from './components/ClipCard';
import SettingsView from './components/SettingsView';

interface Clip {
  id: string;
  content_plain: string;
  type: string;
  source_app?: string;
  is_favorite: number;
  created_at: string;
  tags?: string[];
}

const App: React.FC = () => {
  const [clips, setClips] = useState<Clip[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [settings, setSettings] = useState({
    themeColor: '#818CF8',
    launchAtStartup: false,
    notificationsEnabled: true
  });
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const clipsRef = useRef<Clip[]>([]);
  clipsRef.current = clips;
  const selectedIndexRef = useRef(0);
  selectedIndexRef.current = selectedIndex;

  useEffect(() => {
    loadClips();
    loadSettings();

    const unsubscribe = window.api.onNewClip((clip: Clip) => {
      setClips(prev => {
        // Prevent duplicates and only add if we are on 'all' tab
        if (activeTab === 'all' && !prev.find(c => c.id === clip.id)) {
          return [clip, ...prev];
        }
        return prev;
      });
    });

    return () => unsubscribe();
  }, [activeTab]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, clipsRef.current.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        const currentClip = clipsRef.current[selectedIndexRef.current];
        if (currentClip) {
          handlePaste(currentClip.content_plain);
        }
      } else if (e.key === 'Escape') {
        window.api.hideWindow();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []); // Rebind-free event listener

  useEffect(() => {
    const activeElement = document.getElementById(`clip-${selectedIndex}`);
    if (activeElement && scrollContainerRef.current) {
      activeElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [selectedIndex]);

  const loadClips = async () => {
    let data: Clip[] = [];
    if (activeTab === 'all') {
      data = await window.api.getClips();
    } else if (activeTab === 'favorites') {
      const all = await window.api.getClips();
      data = all.filter((c: Clip) => c.is_favorite);
    } else if (activeTab.startsWith('tag-')) {
      const tag = activeTab.replace('tag-', '');
      data = await window.api.searchClips(tag);
    }
    setClips(data);
  };

  useEffect(() => {
    loadClips();
    setSelectedIndex(0);
  }, [activeTab]);

  const loadSettings = async () => {
    const data = await window.api.getSettings();
    setSettings(data);
    applyTheme(data.themeColor);
  };

  const applyTheme = (color: string) => {
    const root = document.documentElement;
    root.style.setProperty('--color-primary-500', color);
    root.style.setProperty('--color-primary-400', color + 'CC');
    root.style.setProperty('--color-primary-600', color + 'E6');
    root.style.setProperty('--color-primary-300', color + '99');
    root.style.setProperty('--accent-color', color);
  };

  const updateSettings = async (newSettings: any) => {
    const updated = await window.api.updateSettings(newSettings);
    setSettings(updated);
    if (newSettings.themeColor) {
      applyTheme(newSettings.themeColor);
    }
  };

  const handleClearHistory = async () => {
    if (confirm('Are you sure you want to clear all history? This cannot be undone.')) {
      await window.api.clearHistory();
      setClips([]);
    }
  };

  // Search Debouncing logic
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearch = (val: string) => {
    setSearch(val);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    searchTimeoutRef.current = setTimeout(async () => {
      setSelectedIndex(0);
      if (val.trim()) {
        const data = await window.api.searchClips(val);
        setClips(data);
      } else {
        loadClips();
      }
    }, 150); // 150ms debounce for responsiveness
  };

  const toggleFavorite = async (id: string) => {
    await window.api.toggleFavorite(id);
    setClips(prev => prev.map(c => c.id === id ? { ...c, is_favorite: c.is_favorite ? 0 : 1 } : c));
  };

  const deleteClip = async (id: string) => {
    await window.api.deleteClip(id);
    setClips(prev => prev.filter(c => c.id !== id));
  };

  const handlePaste = async (text: string) => {
    await window.api.pasteClip(text);
  };


  return (
    <div className="w-full h-screen text-white flex overflow-hidden relative">
      <div className="mesh-gradient" />

      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        tags={['#code', '#link', '#email', '#data']}
      />

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Header Section */}
        <header className="px-8 pt-8 pb-4 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: settings.themeColor }}
              />
              <h1 className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">
                {activeTab === 'all' ? 'All History' : activeTab.replace('tag-', '').toUpperCase()}
              </h1>
            </div>
            <div className="flex items-center gap-4 bg-white/5 border border-white/5 px-3 py-1.5 rounded-full backdrop-blur-md">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-white/30">
                <Sparkle weight="duotone" className="w-3 h-3 text-primary-400" />
                <span>{clips.length} RESULTS</span>
              </div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <MagnifyingGlass weight="bold" className="w-5 h-5 text-white/20 group-focus-within:text-primary-400 transition-colors" />
            </div>
            <input
              autoFocus
              className="w-full bg-white/[0.03] hover:bg-white/[0.05] focus:bg-white/[0.08] border border-white/5 outline-none p-4 pl-12 rounded-2xl text-lg placeholder:text-white/10 transition-all backdrop-blur-xl shadow-2xl"
              style={{ borderColor: search ? settings.themeColor + '33' : undefined }} // Subtle border if searching
              placeholder="Search anything... (#code, #link, application name)"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
            />
            <div className="absolute inset-y-0 right-4 flex items-center gap-2 pointer-events-none">
              <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/5 text-[9px] font-bold text-white/20">CTRL + K</span>
            </div>
          </div>
        </header>

        {/* Content Section */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto px-6 py-2 pb-24 custom-scrollbar"
        >
          <div className="grid grid-cols-1 gap-2">
            <AnimatePresence initial={false} mode="popLayout">
              {clips.map((clip, index) => (
                <ClipCard
                  key={clip.id}
                  clip={clip}
                  index={index}
                  isSelected={selectedIndex === index}
                  onSelect={() => {
                    setSelectedIndex(index);
                    handlePaste(clip.content_plain);
                  }}
                  onToggleFavorite={(e) => {
                    e.stopPropagation();
                    toggleFavorite(clip.id);
                  }}
                  onDelete={(e) => {
                    e.stopPropagation();
                    deleteClip(clip.id);
                  }}
                />
              ))}
            </AnimatePresence>
          </div>

          {clips.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full flex flex-col items-center justify-center text-center p-12"
            >
              <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center mb-6">
                <MagnifyingGlass weight="duotone" className="w-8 h-8 text-white/10" />
              </div>
              <h3 className="text-xl font-medium text-white/60 mb-2">No clips found</h3>
              <p className="text-sm text-white/30 max-w-[240px]">Try searching for something else or copy some text to get started.</p>
            </motion.div>
          )}
        </div>

        {/* Footer Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 pointer-events-none">
          <div className="max-w-fit mx-auto bg-[#0a0a0a]/80 backdrop-blur-2xl border border-white/5 px-6 py-3 rounded-full flex items-center gap-6 pointer-events-auto shadow-2xl">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-white/5 flex items-center justify-center text-[10px] font-bold text-white/40 border border-white/5">↵</span>
              <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Paste</span>
            </div>
            <div className="w-px h-3 bg-white/10" />
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-white/5 flex items-center justify-center text-[10px] font-bold text-white/40 border border-white/5">↑↓</span>
              <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Navigate</span>
            </div>
            <div className="w-px h-3 bg-white/10" />
            <div className="flex items-center gap-2">
              <span className="w-8 h-5 rounded-md bg-white/5 flex items-center justify-center text-[10px] font-bold text-white/40 border border-white/5">ESC</span>
              <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Hide</span>
            </div>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {activeTab === 'settings' && (
          <SettingsView
            settings={settings}
            onUpdate={updateSettings}
            onClearHistory={handleClearHistory}
            onClose={() => setActiveTab('all')}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
