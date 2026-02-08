import React from 'react';
import { motion } from 'framer-motion';
import { Palette, RocketLaunch, Trash, ArrowLeft } from '@phosphor-icons/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface Settings {
    themeColor: string;
    launchAtStartup: boolean;
    notificationsEnabled: boolean;
}

interface SettingsViewProps {
    settings: Settings;
    onUpdate: (newSettings: Partial<Settings>) => void;
    onClearHistory: () => void;
    onClose: () => void;
}

const THEME_COLORS = [
    { name: 'Lavender', color: '#818CF8' }, // Official
    { name: 'Emerald', color: '#10B981' },
    { name: 'Rose', color: '#F43F5E' },
    { name: 'Amber', color: '#F59E0B' },
    { name: 'Sky', color: '#0EA5E9' },
    { name: 'Violet', color: '#8B5CF6' },
];

const SettingsView: React.FC<SettingsViewProps> = ({ settings, onUpdate, onClearHistory, onClose }) => {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute inset-0 bg-[#050505]/95 backdrop-blur-2xl z-50 flex flex-col"
        >
            <header className="p-8 pb-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-white/60" />
                    </button>
                    <h2 className="text-2xl font-bold">Settings</h2>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-8 pt-4 space-y-12 custom-scrollbar">
                {/* Appearance */}
                <section className="space-y-6">
                    <div className="flex items-center gap-2 text-primary-400">
                        <Palette weight="duotone" className="w-5 h-5" />
                        <h3 className="text-sm font-bold uppercase tracking-widest">Appearance</h3>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        {THEME_COLORS.map((theme) => (
                            <button
                                key={theme.color}
                                onClick={() => onUpdate({ themeColor: theme.color })}
                                className={cn(
                                    "p-4 rounded-2xl border transition-all duration-300 text-left group relative overflow-hidden",
                                    settings.themeColor === theme.color
                                        ? "bg-white/10 border-white/20 ring-1 ring-white/10"
                                        : "bg-white/[0.03] border-white/5 hover:bg-white/[0.05]"
                                )}
                            >
                                <div
                                    className="w-8 h-8 rounded-full mb-3 shadow-lg"
                                    style={{ backgroundColor: theme.color }}
                                />
                                <span className="text-sm font-medium text-white/80">{theme.name}</span>
                                {settings.themeColor === theme.color && (
                                    <motion.div
                                        layoutId="active-theme"
                                        className="absolute top-4 right-4 w-2 h-2 rounded-full bg-white shadow-[0_0_10px_white]"
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                </section>

                {/* General */}
                <section className="space-y-6">
                    <div className="flex items-center gap-2 text-primary-400">
                        <RocketLaunch weight="duotone" className="w-5 h-5" />
                        <h3 className="text-sm font-bold uppercase tracking-widest">General</h3>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                            <div className="space-y-1">
                                <span className="text-sm font-medium block">Launch at Startup</span>
                                <span className="text-xs text-white/30">Automatically start PasteFlow when you log in.</span>
                            </div>
                            <button
                                onClick={() => onUpdate({ launchAtStartup: !settings.launchAtStartup })}
                                className={cn(
                                    "w-12 h-6 rounded-full transition-all duration-300 relative",
                                    !settings.launchAtStartup && "bg-white/10"
                                )}
                                style={{ backgroundColor: settings.launchAtStartup ? settings.themeColor : undefined }}
                            >
                                <motion.div
                                    animate={{ x: settings.launchAtStartup ? 26 : 2 }}
                                    className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-md"
                                />
                            </button>
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                            <div className="space-y-1">
                                <span className="text-sm font-medium block">Notifications</span>
                                <span className="text-xs text-white/30">Show alert when a new clip is saved.</span>
                            </div>
                            <button
                                onClick={() => onUpdate({ notificationsEnabled: !settings.notificationsEnabled })}
                                className={cn(
                                    "w-12 h-6 rounded-full transition-all duration-300 relative",
                                    !settings.notificationsEnabled && "bg-white/10"
                                )}
                                style={{ backgroundColor: settings.notificationsEnabled ? settings.themeColor : undefined }}
                            >
                                <motion.div
                                    animate={{ x: settings.notificationsEnabled ? 26 : 2 }}
                                    className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-md"
                                />
                            </button>
                        </div>
                    </div>
                </section>

                {/* Danger Zone */}
                <section className="pt-8 border-t border-white/5">
                    <button
                        onClick={onClearHistory}
                        className="w-full flex items-center justify-between p-4 rounded-2xl bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10 transition-all group"
                    >
                        <div className="flex items-center gap-3">
                            <Trash weight="duotone" className="w-5 h-5 text-rose-500" />
                            <div className="text-left">
                                <span className="text-sm font-medium text-rose-500 block">Clear History</span>
                                <span className="text-xs text-rose-500/40">Permanently delete all clipboard data.</span>
                            </div>
                        </div>
                    </button>
                </section>
            </div>
        </motion.div>
    );
};

export default SettingsView;
