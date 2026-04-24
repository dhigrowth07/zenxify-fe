/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import WavesurferPlayer from '@wavesurfer/react';

const AudioAction = ({ action }) => {
    const isKept = action.data?.is_kept !== false;
    // Construct full S3 URL from path if needed
    const S3_BASE = 'https://zenxify-user-media.s3.ap-south-1.amazonaws.com';
    let audioUrl = action.data?.src || action.data?.clip_url || action.data?.clip_s3_key;
    if (audioUrl && !audioUrl.startsWith('http')) {
        audioUrl = `${S3_BASE}/${audioUrl}`;
    }

    return (
        <div className={`w-full h-full relative overflow-hidden flex flex-col justify-center transition-opacity duration-300 ${isKept ? 'opacity-100' : 'opacity-30'}`}>
            {/* REAL OR MOCK WAVEFORM */}
            <div className="w-full px-1 pointer-events-none opacity-80">
                {audioUrl ? (
                    <WavesurferPlayer
                        height={38}
                        waveColor="#50E3C2"
                        progressColor="#50E3C2"
                        url={audioUrl}
                        interact={false}
                        barWidth={1}
                        barGap={2}
                        barRadius={2}
                        normalize={true}
                        cursorWidth={0}
                        onReady={() => {}}
                        onError={() => {}}
                    />
                ) : (
                    /* SILENCE HEARTBEAT (Flat line simulation) */
                    <div className="flex items-center h-4 gap-[2px] opacity-20 px-2">
                        {[...Array(40)].map((_, i) => (
                            <div 
                                key={i} 
                                className="flex-1 bg-[#50E3C2] rounded-full" 
                                style={{ height: `${10 + (Math.sin(i * 0.5) * 5)}%` }} 
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* NEON HIGHLIGHT ON TOP */}
            <div className={`absolute top-0 left-0 right-0 h-[1px] ${audioUrl ? 'bg-[#50E3C2]/40' : 'bg-[#50E3C2]/10'}`} />
            
            <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20 pointer-events-none" />
        </div>
    );
};

export default AudioAction;
