import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

const EDITOR_STEPS = [
    { name: 'Upload', route: '/video-editor/upload', noId: true },
    { name: 'Trim', route: '/video-editor/vad-triming' },
    { name: 'Colour grade', route: '/video-editor/grade' },
    { name: 'Broll', route: '/video-editor/broll' },
    { name: 'Captions', route: '/video-editor/captions' },
    { name: 'SFX', route: '/video-editor/sfx' },
    { name: 'Bg audio', route: '/video-editor/audio' },
    { name: 'Export', route: '/video-editor/export' },
];

const VideoEditorLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();


    const pathSegments = location.pathname.split('/');
    const currentProjectId = pathSegments.length >= 4 && pathSegments[3] ? pathSegments[3] : null;
    const handleStepClick = (step) => {
        if (step.noId) {
            navigate(step.route);
        } else if (currentProjectId) {
            navigate(`${step.route}/${currentProjectId}`);
        }
    };

    return (
        <div className='bg-zenxify-bg'>
            
        <div className="w-full px-4  lg:px-8 py-6">
            <div className="flex flex-wrap justify-center gap-2 mb-10 lg:mb-14">
                {EDITOR_STEPS.map((step) => {
                    const isActive = location.pathname.startsWith(step.route);
                    const isClickable = step.noId || Boolean(currentProjectId);

                    return (
                        <div
                            key={step.name}
                            onClick={() => handleStepClick(step)}
                            title={!isClickable ? 'Upload a video first to unlock this step' : undefined}
                            className={`
                                px-6 py-2 rounded-full font-bold text-xs uppercase tracking-wider transition-all
                                ${isActive
                                    ? 'bg-brand-gradient text-white shadow-lg shadow-primary/20'
                                    : 'bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
                                }
                                ${isClickable
                                    ? 'cursor-pointer hover:opacity-80'
                                    : 'cursor-not-allowed opacity-50'
                                }
                            `}
                        >
                            {step.name}
                        </div>
                    );
                })}
            </div>

            <main>
                <>
                    <Outlet />
                </>
            </main>
        </div>
        </div>
    );
};

export default VideoEditorLayout;
