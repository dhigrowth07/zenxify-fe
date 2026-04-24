/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

const VideoAction = ({ action }) => {
    return (
        <div
            className="w-full h-full flex items-center overflow-hidden rounded-sm border border-black/30 shadow-lg relative group transition-transform"
            style={{ backgroundColor: action.color || 'var(--tl-action-video-bg)' }}
        >
            {action.thumbnail && (
                <div className="h-full aspect-video flex-shrink-0 bg-black/50 overflow-hidden relative border-r border-black/20">
                    <img
                        src={action.thumbnail}
                        alt=""
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                        referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-[2px] border border-white/20 shadow-inner">
                            <div className="w-0 h-0 border-l-[8px] border-l-white/90 border-y-[5px] border-y-transparent ml-1" />
                        </div>
                    </div>
                </div>
            )}

            <span className="px-2.5 text-[10px] text-white/95 truncate font-medium z-10 select-none tracking-tight">
                {action.text}
            </span>

            {/* Resize Handles simulation */}
            <div className="absolute right-0 top-0 bottom-0 w-1.5 cursor-ew-resize hover:bg-white/40 transition-colors z-20 group-hover:bg-white/10" />
            <div className="absolute left-0 top-0 bottom-0 w-1.5 cursor-ew-resize hover:bg-white/40 transition-colors z-20 group-hover:bg-white/10" />

            {/* Selection highlight border */}
            {action.selected && (
                <div className="absolute inset-0 border-[1.5px] border-[#50E3C2] pointer-events-none z-30" />
            )}
        </div>
    );
};

export default VideoAction;
