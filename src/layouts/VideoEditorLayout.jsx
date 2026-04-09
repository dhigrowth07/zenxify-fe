import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';

const EDITOR_STEPS = [
    { name: 'Upload', route: '/video-editor/upload' },
    { name: 'Trim', route: '/video-editor/trim' },
    { name: 'Colour grade', route: '/video-editor/grade' },
    { name: 'Broll', route: '/video-editor/broll' },
    { name: 'Captions', route: '/video-editor/captions' },
    { name: 'SFX', route: '/video-editor/sfx' },
    { name: 'Bg audio', route: '/video-editor/audio' },
    { name: 'Export', route: '/video-editor/export' }
];

const VideoEditorLayout = () => {
    const location = useLocation();

    return (
        <div className="max-w-7xl mx-auto px-4 py-6 min-h-screen">
            {/* Horizontal Navigation / Stepper */}
            <div className="flex flex-wrap justify-center gap-2 mb-10 lg:mb-14">
                {EDITOR_STEPS.map((step) => {
                    const isActive = location.pathname === step.route;
                    // In a real app, you'd also check if a step is "completed" based on project state
                    return (
                        <div
                            key={step.name}
                            className={`px-6 py-2 rounded-full font-bold text-xs uppercase tracking-wider transition-all cursor-default ${isActive
                                    ? 'bg-brand-gradient text-white shadow-lg shadow-primary/20'
                                    : 'bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
                                }`}
                        >
                            {step.name}
                        </div>
                    );
                })}
            </div>

            {/* Content Area */}
            <main>
                <Outlet />
            </main>
        </div>
    );
};

export default VideoEditorLayout;
