import React from 'react';
import {
    PushPin,
    Trash,
    Code,
    EnvelopeSimple,
    Globe,
    FileText,
    Clock,
    Browser
} from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface Clip {
    id: string;
    content_plain: string;
    type: string;
    source_app?: string;
    is_favorite: number;
    created_at: string;
    tags?: string[];
}

interface ClipCardProps {
    clip: Clip;
    isSelected: boolean;
    onSelect: () => void;
    onToggleFavorite: (e: React.MouseEvent) => void;
    onDelete: (e: React.MouseEvent) => void;
    index: number;
}

const ClipCard: React.FC<ClipCardProps> = ({
    clip,
    isSelected,
    onSelect,
    onToggleFavorite,
    onDelete,
    index
}) => {
    const getIcon = () => {
        if (clip.tags?.includes('#link')) return Globe;
        if (clip.tags?.includes('#email')) return EnvelopeSimple;
        if (clip.tags?.includes('#code')) return Code;
        return FileText;
    };

    const Icon = getIcon();

    const getTagStyles = (tag: string) => {
        switch (tag) {
            case '#link': return 'text-primary-400 bg-primary-500/10 border-primary-500/20';
            case '#email': return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
            case '#code': return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
            case '#sensitive': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
            default: return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20';
        }
    };

    return (
        <motion.div
            layout
            id={`clip-${index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            onClick={onSelect}
            className={cn(
                "group relative p-4 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden",
                isSelected
                    ? "bg-white/[0.08] border-white/20 shadow-2xl shadow-black/40 ring-1 ring-white/10"
                    : "bg-transparent border-transparent hover:bg-white/[0.03] hover:border-white/5"
            )}
        >
            <div className="flex items-start gap-4 h-full">
                {/* Icon & App Source */}
                <div className="flex flex-col items-center gap-3">
                    <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300",
                        isSelected ? "bg-primary-600 text-white" : "bg-white/5 text-zinc-500 group-hover:bg-white/10 group-hover:text-zinc-300"
                    )}>
                        <Icon weight="duotone" className="w-6 h-6" />
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 min-w-0 pr-12">
                    <div className="flex items-center gap-2 mb-1.5 overflow-hidden">
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/5">
                            <Browser weight="regular" className="w-3 h-3 text-zinc-500" />
                            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider truncate max-w-[80px]">
                                {clip.source_app || 'System'}
                            </span>
                        </div>
                        <div className="flex items-center gap-1 text-zinc-600">
                            <Clock weight="regular" className="w-3 h-3" />
                            <span className="text-[10px] font-medium">
                                {new Date(clip.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>

                    <p className={cn(
                        "text-sm font-medium leading-relaxed transition-colors line-clamp-2",
                        isSelected ? "text-white" : "text-zinc-400 group-hover:text-zinc-200"
                    )}>
                        {clip.content_plain}
                    </p>

                    {clip.tags && clip.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                            {clip.tags.map(tag => (
                                <span
                                    key={tag}
                                    className={cn(
                                        "text-[9px] px-2 py-0.5 rounded-full border leading-none font-bold uppercase tracking-widest",
                                        getTagStyles(tag)
                                    )}
                                >
                                    {tag.replace('#', '')}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Floating Actions */}
            <div className={cn(
                "absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-1 transition-all duration-300 transform",
                isSelected ? "opacity-100 scale-100" : "opacity-0 scale-90 translate-x-2 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-x-0"
            )}>
                <button
                    onClick={onToggleFavorite}
                    className={cn(
                        "p-2.5 rounded-xl transition-all duration-200 backdrop-blur-md border border-white/5",
                        clip.is_favorite
                            ? "bg-yellow-500/20 text-yellow-500 border-yellow-500/30"
                            : "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
                    )}
                >
                    <PushPin weight={clip.is_favorite ? "duotone" : "regular"} className="w-4 h-4 fill-current" />
                </button>
                <button
                    onClick={onDelete}
                    className="p-2.5 rounded-xl bg-white/5 text-zinc-400 hover:text-rose-500 hover:bg-rose-500/20 hover:border-rose-500/30 backdrop-blur-md border border-white/5 transition-all duration-200"
                >
                    <Trash weight="regular" className="w-4 h-4" />
                </button>
            </div>
        </motion.div>
    );
};

export default ClipCard;
