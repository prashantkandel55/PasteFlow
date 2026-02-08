import React from 'react';
import {
    ClockCounterClockwise,
    Heart,
    Hash,
    GearSix,
    Lightning
} from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    tags: string[];
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, tags }) => {
    const menuItems = [
        { id: 'all', label: 'All Clips', icon: ClockCounterClockwise },
        { id: 'favorites', label: 'Favorites', icon: Heart },
        { id: 'smart', label: 'Smart Tags', icon: Lightning },
    ];

    return (
        <div className="w-[260px] h-full flex flex-col border-r border-white/5 bg-black/20 backdrop-blur-3xl overflow-hidden">
            {/* Brand */}
            <div className="p-6 flex items-center gap-3">
                <div className="relative w-10 h-10 flex items-center justify-center bg-white/5 rounded-lg"> {/* Changed to a neutral background color */}
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-lg">
                        {/* Bottom Layer */}
                        <path d="M6 18L16 23L26 18V21L16 26L6 21V18Z" fill="#A5B4FC" fillOpacity="0.8" />
                        {/* Middle Layer */}
                        <path d="M6 13L16 18L26 13V16L16 21L6 16V13Z" fill="#C7D2FE" fillOpacity="0.9" />
                        {/* Top Layer */}
                        <path d="M16 5L6 10L16 15L26 10L16 5Z" fill="white" />
                    </svg>
                </div>
                <div>
                    <span className="font-bold text-xl tracking-tight block leading-none text-white">PasteFlow</span>
                    <span className="text-[10px] font-semibold text-white/40 tracking-tight mt-0.5 block">Never lose a copy again.</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-2 space-y-1 custom-scrollbar overflow-y-auto">
                <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-3 mb-2">Navigation</div>
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={cn(
                            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
                            activeTab === item.id
                                ? "bg-white/10 text-white shadow-[0_0_20px_rgba(255,255,255,0.05)]"
                                : "text-white/50 hover:text-white hover:bg-white/5"
                        )}
                    >
                        <item.icon
                            weight={activeTab === item.id ? "duotone" : "regular"}
                            className="w-5 h-5 transition-colors"
                            style={{ color: activeTab === item.id ? 'var(--color-primary-400)' : 'inherit' }}
                        />
                        <span className="text-sm font-medium">{item.label}</span>
                        {activeTab === item.id && (
                            <motion.div
                                layoutId="active-pill"
                                className="absolute left-0 w-1 h-5 rounded-r-full"
                                style={{ backgroundColor: 'var(--color-primary-500)' }}
                            />
                        )}
                    </button>
                ))}

                <div className="pt-6 mb-2">
                    <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-3 mb-2">Tags</div>
                    <div className="space-y-1">
                        {tags.map((tag) => (
                            <button
                                key={tag}
                                onClick={() => setActiveTab(`tag - ${tag} `)}
                                className={cn(
                                    "w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 text-white/40 hover:text-white hover:bg-white/5 group",
                                    activeTab === `tag - ${tag} ` && "text-white bg-white/5"
                                )}
                            >
                                <Hash weight="duotone" className="w-4 h-4 text-white/20 group-hover:text-primary-400" />
                                <span className="text-xs font-medium uppercase tracking-tight">{tag.replace('#', '')}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </nav>

            {/* Footer Actions */}
            <div className="p-4 border-t border-white/5 space-y-2">
                <button
                    onClick={() => setActiveTab('settings')}
                    className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all text-sm group",
                        activeTab === 'settings' && "text-white bg-white/5"
                    )}
                >
                    <GearSix
                        weight={activeTab === 'settings' ? "duotone" : "regular"}
                        className={cn(
                            "w-4 h-4 transition-transform",
                            activeTab === 'settings' ? "text-primary-400" : "group-hover:rotate-45"
                        )}
                    />
                    Settings
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
