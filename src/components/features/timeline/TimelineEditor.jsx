/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Undo2, Redo2, Scissors, Trash2, Split, Plus,
    Volume2, VolumeX, Minus, Eye, EyeOff, Sparkles, Play, Pause, 
    SkipBack, SkipForward, AlertTriangle, RotateCcw
} from 'lucide-react';
import { formatTimecode } from './timelineUtils';
import { setIsPlaying, setPreviewTime } from '../../../redux/editor/editorSlice';
import { setVadSegments, bulkToggleSilences, updateSegment } from '../../../redux/editor/parts/vadSlice';
import { updateSegments } from '../../../services/vadServices';
import AudioAction from './AudioAction';
import ConfirmationModal from '../../shared/ConfirmationModal';

const SCALE = 30; // pixels per second
const THEME = {
    teal: '#50E3C2',
    bg: '#111214',
    header: '#1E1F22',
    row: '#1E1F23',
    border: '#000000',
    text: '#868A91'
};

const TimelineEditor = ({ data: externalData, projectId: propProjectId }) => {
    const dispatch = useDispatch();
    const isPlaying = useSelector((state) => state.editor.isPlaying);
    const previewTime = useSelector((state) => state.editor.previewTime);
    const project = useSelector((state) => state.editor.project);
    const totalDuration = project?.total_duration || 0;
    const projectId = propProjectId || project?.id;

    // [INTERNAL STATE]

    const [data, setData] = useState(externalData || []);
    const [zoom, setZoom] = useState(2); 
    const [selectedActionId, setSelectedActionId] = useState(null);
    const [hideCuts, setHideCuts] = useState(false);
    
    // CALCULATE DYNAMIC VISUAL DURATION
    const visualTotalDuration = useMemo(() => {
        const masterSegments = data[0]?.actions || [];
        if (!hideCuts) {
            let max = 0;
            masterSegments.forEach(a => { if (a.end > max) max = a.end; });
            return Math.max(totalDuration, max, 30);
        }
        
        let sum = 0;
        masterSegments.forEach(action => {
            if (action.data?.is_kept !== false) {
                sum += (action.end - action.start);
            }
        });
        return Math.max(sum, 1);
    }, [data, hideCuts, totalDuration]);
    const [history, setHistory] = useState([externalData || []]);
    const [historyIndex, setHistoryIndex] = useState(0);

    const [isDragging, setIsDragging] = useState(false);
    const [dragData, setDragData] = useState(null);
    const [showResetConfirm, setShowResetConfirm] = useState(false);

    const timelineContainerRef = useRef(null);
    const pixelsPerSecond = SCALE * zoom;
    const isRestoredRef = useRef(false);

    // [LOCAL PERSISTENCE ENGINE - SAVING]
    useEffect(() => {
        // Prevent saving until we've had a chance to restore the draft
        if (!isRestoredRef.current || !projectId || data.length === 0) return;
        
        const draftKey = `vad_draft_${projectId}`;
        const total = data[0]?.actions?.length || 0;
        const kept = data[0]?.actions?.filter(a => a.data?.is_kept !== false).length || 0;
        
        console.log(`[DRAFT] Auto-saving: ${total} total, ${kept} kept.`);
        localStorage.setItem(draftKey, JSON.stringify(data));
    }, [data, projectId]);

    // [LOCAL PERSISTENCE ENGINE - RESTORATION]
    useEffect(() => {
        if (!projectId || isRestoredRef.current) return;
        
        const draftKey = `vad_draft_${projectId}`;
        const savedDraft = localStorage.getItem(draftKey);
        
        if (savedDraft) {
            try {
                const parsed = JSON.parse(savedDraft);
                const keptCount = parsed[0]?.actions?.filter(a => a.data?.is_kept !== false).length || 0;
                console.log(`[DRAFT] Found local draft for ${projectId} (${keptCount} kept segments). Restoring...`);
                setData(parsed);
                dispatch(setVadSegments(parsed));
            } catch (e) {
                console.error("[DRAFT] Recovery failed", e);
                if (externalData?.length > 0) setData(externalData);
            }
        } else if (externalData?.length > 0) {
            console.log(`[DRAFT] No local draft for ${projectId}. Using initial server data.`);
            setData(externalData);
        }
        
        // Mark as ready for future saves
        isRestoredRef.current = true;
    }, [projectId, externalData, dispatch]);

    // [GAPLESS PLAYBACK SKIP LOGIC - VERSION 2 (GAP-AWARE)]
    useEffect(() => {
        if (!isPlaying || !hideCuts) return;
        
        const keptSegments = data[0]?.actions.filter(a => a.data?.is_kept !== false).sort((a, b) => a.start - b.start) || [];
        
        // Check if we are currently outside all kept segments
        const currentSegment = keptSegments.find(a => previewTime >= a.start && previewTime < a.end);
        
        if (!currentSegment) {
            // We are in a gap (either trimmed out or a removed segment). 
            // Find the next kept segment to jump to.
            const nextSegment = keptSegments.find(a => a.start > previewTime);
            
            if (nextSegment) {
                dispatch(setPreviewTime(nextSegment.start));
            } else if (keptSegments.length > 0) {
                // If we're past the last segment, stop.
                const lastEnd = keptSegments[keptSegments.length - 1].end;
                if (previewTime >= lastEnd) {
                    dispatch(setIsPlaying(false));
                }
            }
        }
    }, [previewTime, isPlaying, hideCuts, data, dispatch]);

    const handleDataChange = useCallback((newData) => {
        setData(newData);
        dispatch(setVadSegments(newData));
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(newData);
        
        // Limit history to 50 steps to preserve memory
        if (newHistory.length > 50) {
            newHistory.shift();
            setHistory(newHistory);
            setHistoryIndex(newHistory.length - 1);
        } else {
            setHistory(newHistory);
            setHistoryIndex(newHistory.length - 1);
        }
    }, [history, historyIndex]);

    const performUndo = useCallback(() => {
        if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            setHistoryIndex(newIndex);
            setData(history[newIndex]);
        }
    }, [history, historyIndex]);

    const performRedo = useCallback(() => {
        if (historyIndex < history.length - 1) {
            const newIndex = historyIndex + 1;
            setHistoryIndex(newIndex);
            setData(history[newIndex]);
        }
    }, [history, historyIndex]);

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            const key = e.key.toLowerCase();
            const isCtrl = e.ctrlKey || e.metaKey;

            if (isCtrl && key === 'z') {
                e.preventDefault();
                if (e.shiftKey) {
                    console.log("[SHORTCUT] Redo (Ctrl+Shift+Z)");
                    performRedo();
                } else {
                    console.log("[SHORTCUT] Undo (Ctrl+Z)");
                    performUndo();
                }
            } else if (isCtrl && key === 'y') {
                e.preventDefault();
                console.log("[SHORTCUT] Redo (Ctrl+Y)");
                performRedo();
            } else if (key === 'delete' || key === 'backspace') {
                if (selectedActionId) {
                    console.log("[SHORTCUT] Delete Segment", selectedActionId);
                    handleDataChange(data.map(t => ({...t, actions: t.actions.filter(a => a.id !== selectedActionId)})));
                    setSelectedActionId(null);
                }
            } else if (key === ' ') {
                e.preventDefault();
                dispatch(setIsPlaying(!isPlaying));
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [performUndo, performRedo, selectedActionId, data, handleDataChange, isPlaying, dispatch]);

    // Resize functionality
    const startTrim = (e, actionId, side) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
        setDragData({ id: actionId, side: side, startX: e.clientX, originalData: JSON.parse(JSON.stringify(data)) });
    };

    const onMouseMove = (e) => {
        if (!isDragging || !dragData) return;
        const deltaX = e.clientX - dragData.startX;
        const deltaSec = deltaX / pixelsPerSecond;
        
        // Find the original target to get its original time range
        let targetRange = null;
        dragData.originalData.forEach(t => {
            const found = t.actions.find(a => a.id === dragData.id);
            if (found) targetRange = { start: found.start, end: found.end };
        });

        if (!targetRange) return;

        const newData = dragData.originalData.map(track => ({
            ...track,
            actions: track.actions.map(action => {
                // If it's the target OR it perfectly matched the target's original range (with tolerance)
                const isTarget = action.id === dragData.id;
                const matchesRange = Math.abs(action.start - targetRange.start) < 0.01 && 
                                     Math.abs(action.end - targetRange.end) < 0.01;

                if (isTarget || matchesRange) {
                    if (dragData.side === 'left') {
                        const newStart = Math.max(0, action.start + deltaSec);
                        if (newStart < action.end - 0.1) return { ...action, start: newStart };
                    } else {
                        const newEnd = action.end + deltaSec;
                        if (newEnd > action.start + 0.1) return { ...action, end: newEnd };
                    }
                }
                return action;
            })
        }));
        setData(newData);
    };

    const stopTrim = () => { if (isDragging) { handleDataChange(data); setIsDragging(false); setDragData(null); } };

    const toggleAllSilences = () => {
        const isCurrentlyHiding = data.some(t => t.actions?.some(a => {
            const label = (a.text || a.data?.review_note || '').toLowerCase();
            const id = (a.id || '').toLowerCase();
            const isActuallySilence = label.includes('silence') || label.includes('breath') || label.includes('filler') || label.includes('short') || id.includes('silence');
            return isActuallySilence && a.data?.is_kept !== false;
        }));

        const nextState = !isCurrentlyHiding;

        const newData = data.map(track => ({
            ...track,
            actions: track.actions.map(a => {
                const label = (a.text || a.data?.review_note || '').toLowerCase();
                const id = (a.id || '').toLowerCase();
                const isActuallySilence = label.includes('silence') || label.includes('breath') || label.includes('filler') || label.includes('short') || id.includes('silence');
                if (isActuallySilence) {
                    return { ...a, data: { ...a.data, is_kept: nextState } };
                }
                return a;
            })
        }));

        handleDataChange(newData);
    };

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', stopTrim);
            return () => { window.removeEventListener('mousemove', onMouseMove); window.removeEventListener('mouseup', stopTrim); };
        }
    }, [isDragging, dragData, data]);

    const toggleSegment = (id, kept) => {
        // Find the target action to get its time range
        let targetAction = null;
        data.forEach(t => {
            const found = t.actions.find(a => a.id === id);
            if (found) targetAction = found;
        });

        if (!targetAction) return;

        const newData = data.map(track => ({
            ...track,
            actions: track.actions.map(a => {
                // If ID matches, or if it overlaps precisely with the master target (with tolerance)
                const matchesId = a.id === id;
                const overlapsTarget = Math.abs(a.start - targetAction.start) < 0.01 && 
                                       Math.abs(a.end - targetAction.end) < 0.01;
                
                if (matchesId || overlapsTarget) {
                    return { ...a, data: { ...a.data, is_kept: kept } };
                }
                return a;
            })
        }));
        handleDataChange(newData);
    };

    const handleSplit = () => {
        const newData = data.map(track => {
            const index = track.actions.findIndex(a => previewTime > a.start && previewTime < a.end);
            if (index === -1) return track;
            
            const action = track.actions[index];
            const part1 = { ...action, end: previewTime };
            const part2 = { ...action, id: `${action.id}-split-${Date.now()}`, start: previewTime, end: action.end };
            
            const newActions = [...track.actions];
            newActions.splice(index, 1, part1, part2);
            return { ...track, actions: newActions };
        });
        handleDataChange(newData);
    };

    const handleSeek = (e) => {
        if (isDragging) return;
        const container = timelineContainerRef.current;
        if (!container) return;
        
        const rect = container.getBoundingClientRect();
        const clickX = e.clientX - rect.left + container.scrollLeft;
        
        let time = 0;
        const visualPos = clickX / pixelsPerSecond;

        if (hideCuts) {
            // Convert visual position back to absolute time
            let visualAcc = 0;
            const keptSegments = data[0]?.actions.filter(a => a.data?.is_kept !== false).sort((a,b) => a.start - b.start) || [];
            for (const a of keptSegments) {
                const dur = a.end - a.start;
                if (visualPos >= visualAcc && visualPos < visualAcc + dur) {
                    time = a.start + (visualPos - visualAcc);
                    break;
                }
                visualAcc += dur;
                time = a.end; // Default to end of last segment
            }
        } else {
            time = visualPos;
        }

        dispatch(setPreviewTime(Math.max(0, Math.min(time, visualTotalDuration))));
        setSelectedActionId(null);
    };

    // Calculates where a time should appear visually on the timeline
    const getVisualTime = useCallback((time) => {
        if (!hideCuts) return time;
        
        let visualTime = 0;
        const masterSegments = data[0]?.actions.filter(a => a.data?.is_kept !== false).sort((a,b) => a.start - b.start) || [];
        
        for (const action of masterSegments) {
            if (time >= action.end) {
                visualTime += (action.end - action.start);
            } else if (time >= action.start && time < action.end) {
                visualTime += (time - action.start);
                return visualTime;
            } else if (time < action.start) {
                // Time is in a gap BEFORE this segment
                return visualTime; 
            }
        }
        return visualTime;
    }, [data, hideCuts]);

    return (
        <div className="flex flex-col flex-1 min-h-0 bg-[#111214] select-none text-[#868A91] font-['Outfit'] overflow-hidden">
            {/* ROW 1: MASTER TOOLS */}
            <div className="h-[32px] flex items-center justify-between px-3 bg-[#111214] border-b border-black">
                <div className="flex items-center gap-0.5">
                    <ToolbarButton icon={<Undo2 size={11} />} title="Undo" onClick={performUndo} disabled={historyIndex === 0} showLabel />
                    <ToolbarButton icon={<Redo2 size={11} />} title="Redo" onClick={performRedo} disabled={historyIndex === history.length - 1} showLabel />
                    <ToolbarButton 
                        icon={<RotateCcw size={11} />} 
                        title="Reset" 
                        onClick={() => setShowResetConfirm(true)} 
                        showLabel 
                    />
                </div>

                <div className="flex items-center gap-0.5 absolute left-1/2 -translate-x-1/2">
                    <ToolbarButton icon={<Scissors size={11} />} title="Cut" showLabel onClick={() => selectedActionId && toggleSegment(selectedActionId, false)} />
                    <ToolbarButton icon={<Split size={11} />} title="Split" showLabel onClick={handleSplit} />
                    <ToolbarButton icon={<Trash2 size={11} />} title="Delete" showLabel onClick={() => selectedActionId && handleDataChange(data.map(t => ({...t, actions: t.actions.filter(a => a.id !== selectedActionId)})))} disabled={!selectedActionId} />
                </div>

                <div className="flex items-center gap-0.5">
                    <ToolbarButton 
                        icon={<Scissors size={11} />} 
                        title="Silence" 
                        showLabel 
                        onClick={toggleAllSilences} 
                        active={data.some(t => t.actions?.some(a => {
                            const label = (a.text || a.data?.review_note || '').toLowerCase();
                            const id = (a.id || '').toLowerCase();
                            const isActuallySilence = label.includes('silence') || label.includes('breath') || label.includes('filler') || label.includes('short') || id.includes('silence');
                            return isActuallySilence && a.data?.is_kept !== false;
                        }))} 
                    />
                    <ToolbarButton icon={<Eye size={11} />} title="Cuts" showLabel onClick={() => setHideCuts(!hideCuts)} active={hideCuts} />
                </div>
            </div>

            {/* ROW 2: TRANSPORT & ZOOM */}
            <div className="h-[48px] flex items-center justify-between px-3 bg-[#1E1F22] border-b border-black">
                {/* TIMECODE BOX */}
                <div className="flex items-center bg-black/40 px-5 py-2.5 rounded-xl border border-white/5 backdrop-blur-md shadow-inner">
                    <TimeIndicator data={data} hideCuts={hideCuts} totalDuration={visualTotalDuration} />
                </div>

                {/* CENTER TRANSPORT */}
                <div className="flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
                    <button onClick={() => dispatch(setPreviewTime(Math.max(0, previewTime - 10)))} className="text-[#868A91] hover:text-white transition-all"><SkipBack size={18} fill="currentColor" /></button>
                    <button onClick={() => dispatch(setIsPlaying(!isPlaying))} className="w-8 h-8 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg">
                        {isPlaying ? <Pause size={16} fill="black" /> : <Play size={16} fill="black" className="ml-0.5" />}
                    </button>
                    <button onClick={() => dispatch(setPreviewTime(previewTime + 10))} className="text-[#868A91] hover:text-white transition-all"><SkipForward size={18} fill="currentColor" /></button>
                </div>

                {/* ZOOM SLIDER AREA */}
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => {
                            const container = timelineContainerRef.current;
                            if (container) {
                                const fitZoom = (container.clientWidth - 100) / (SCALE * visualTotalDuration);
                                setZoom(Math.max(0.5, Math.min(5, fitZoom)));
                            }
                        }}
                        className="p-1.5 hover:bg-white/5 rounded-md text-[#868A91] hover:text-[#50E3C2] transition-colors"
                        title="Zoom to Fit"
                    >
                        <Sparkles size={13} />
                    </button>
                    <button onClick={() => setZoom(z => Math.max(0.5, z - 0.25))} className="text-[#868A91] hover:text-white"><Minus size={13} /></button>
                    <div className="relative w-24 h-1 flex items-center group">
                        <input type="range" min="0.5" max="5" step="0.1" value={zoom} onChange={(e) => setZoom(parseFloat(e.target.value))} className="w-full h-1 bg-white/5 rounded-full appearance-none cursor-pointer accent-[#50E3C2]" />
                    </div>
                    <button onClick={() => setZoom(z => Math.min(5, z + 0.25))} className="text-[#868A91] hover:text-white"><Plus size={13} /></button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* SIDEBAR */}
                <div className="w-[140px] flex flex-col bg-[#111214] border-r border-[#1E1F22] z-40">
                    <div className="h-8 border-b border-[#1E1F22]" />
                    <div className="flex-1">
                        {data.map(track => (
                            <div key={track.id} className="h-15 border-b border-[#1E1F22] bg-[#111214] flex items-center justify-between px-3 group">
                                <span className="text-[10px] font-bold text-slate-400 tracking-tight group-hover:text-[#50E3C2] transition-colors">{track.name}</span>
                                <button className="opacity-30 group-hover:opacity-100 transition-all hover:text-orange-500">
                                    {track.id === 'audio-track' ? <VolumeX size={12} className="text-orange-600" /> : <Volume2 size={12} />}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* GRID Area */}
                <div 
                    ref={timelineContainerRef} 
                    className="flex-1 overflow-x-auto bg-[#18191B] relative pt-8 select-none custom-scroll overflow-y-hidden" 
                    onClick={handleSeek}
                >
                    {/* RULER WITH DYNAMIC PRECISION */}
                    <div 
                        className="absolute top-0 left-0 h-8 border-b border-black/40 bg-[#1E1F22] z-[150] cursor-pointer" 
                        style={{ width: visualTotalDuration * pixelsPerSecond }}
                        onClick={(e) => { e.stopPropagation(); handleSeek(e); }}
                    >
                        {(() => {
                            const interval = pixelsPerSecond < 40 ? 5 : pixelsPerSecond < 120 ? 1 : pixelsPerSecond < 300 ? 0.5 : 0.1;
                            
                            // Calculate Visual Total Duration
                            let visualTotalDuration = 0;
                            const keptSegments = data[0]?.actions.filter(a => a.data?.is_kept !== false).sort((a,b) => a.start - b.start) || [];
                            keptSegments.forEach(a => { visualTotalDuration += (a.end - a.start); });

                            const count = Math.ceil(visualTotalDuration / interval);
                            const ticks = [];
                            
                            for (let i = 0; i <= count; i++) {
                                const relTime = i * interval;
                                const isMajor = (Math.abs(relTime % (interval * 5)) < 0.001) || relTime === 0;
                                
                                ticks.push(
                                    <div key={relTime} className="absolute bottom-0 flex flex-col items-center" style={{ left: relTime * pixelsPerSecond }}>
                                        {isMajor && (
                                            <span className="text-[7px] font-black text-slate-300 mb-1 transform -translate-x-1/2 whitespace-nowrap">
                                                {formatTimecode(relTime)}
                                            </span>
                                        )}
                                        <div className={`w-[1px] bg-white/${isMajor ? '40' : '15'} ${isMajor ? 'h-3.5' : 'h-2'}`} />
                                    </div>
                                );
                            }
                            return ticks;
                        })()}
                    </div>

                    {/* PLAYHEAD */}
                    <Playhead containerRef={timelineContainerRef} pixelsPerSecond={pixelsPerSecond} isPlaying={isPlaying} getVisualTime={getVisualTime} />

                    {/* TRACKS GRID */}
                    <div className="relative min-w-max" style={{ width: visualTotalDuration * pixelsPerSecond }}>
                        {data.map((track, tIdx) => {
                            return (
                                <div key={track.id} className="h-15 border-b border-black/30 relative flex items-center">
                                    {track.actions?.map((action, idx) => {
                                        if (hideCuts && action.data?.is_kept === false) return null;
                                        return (
                                            <SegmentBlock key={action.id} action={action} pps={pixelsPerSecond} index={idx + 1}
                                                isSelected={selectedActionId === action.id} onSelect={() => setSelectedActionId(action.id)}
                                                onTrimStart={startTrim} onToggle={toggleSegment} onSeek={(t) => dispatch(setPreviewTime(t))}
                                                getVisualTime={getVisualTime} hideCuts={hideCuts} />
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scroll::-webkit-scrollbar { height: 10px; }
                .custom-scroll::-webkit-scrollbar-track { background: transparent; }
                .custom-scroll::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
                .diagonal-texture {
                    background-image: repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.05) 10px, rgba(0,0,0,0.05) 20px);
                }
            `}} />

            <ConfirmationModal
                isOpen={showResetConfirm}
                onClose={() => setShowResetConfirm(false)}
                onConfirm={() => {
                    localStorage.removeItem(`vad_draft_${projectId}`);
                    window.location.reload();
                }}
                title="Discard Changes?"
                description="This will permanently delete your local draft and revert to the server's version. This action cannot be undone."
                confirmLabel="Reset to Original"
                variant="danger"
            />
        </div>
    );
};

const SegmentBlock = ({ action, pps, index, isSelected, onSelect, onTrimStart, onToggle, onSeek, getVisualTime, hideCuts }) => {
    const isVoice = action.effectId === 'audio';
    const isKept = action.data?.is_kept !== false;
    
    if (hideCuts && !isKept) return null;
    
    const visualStart = getVisualTime(action.start);
    const leftPx = visualStart * pps;
    const widthPx = (action.end - action.start) * pps;

    return (
        <div 
            className={`absolute h-[85%] border-2 flex flex-col justify-between rounded-md transition-all cursor-pointer group z-[100]
                ${isSelected ? 'ring-2 ring-white z-[200] shadow-[0_0_20px_rgba(255,255,255,0.5)]' : ''} 
                ${!isKept ? 'bg-rose-600/80 border-rose-400 diagonal-texture' : (isVoice ? 'bg-indigo-950/40' : 'bg-indigo-600/80 border-indigo-400 diagonal-texture')}`}
            style={{ 
                left: leftPx, 
                width: Math.max(widthPx, 2), 
                top: '7.5%' 
            }}
            onClick={(e) => { e.stopPropagation(); onSelect(); onSeek(action.start); }}
        >
            {/* CONTENT RENDERER */}
            <div className="absolute inset-0 pointer-events-none z-10">
                {isVoice ? (
                    <AudioAction action={action} />
                ) : (
                    <div className="flex items-center gap-1.5 p-1.5">
                        <span className="text-[10px] font-black text-white px-1 bg-black/40 rounded-sm">{index}</span>
                    </div>
                )}
            </div>

            {/* HANDLES */}
            <div className="absolute left-0 top-0 bottom-0 w-1.5 cursor-ew-resize hover:bg-white/10 z-20" onMouseDown={(e) => onTrimStart(e, action.id, 'left')} />
            <div className="absolute right-0 top-0 bottom-0 w-1.5 cursor-ew-resize hover:bg-white/10 z-20" onMouseDown={(e) => onTrimStart(e, action.id, 'right')} />

            {/* QUICK ACTIONS - ONLY FOR VIDEO TRACK */}
            {!isVoice && (
                <div className="absolute inset-x-0 bottom-0 p-0.5 opacity-0 group-hover:opacity-100 transition-all z-30">
                    <button onClick={(e) => { e.stopPropagation(); onToggle(action.id, !isKept); }} className={`w-full py-0.5 rounded-[2px] text-[6px] font-black uppercase text-white ${isKept ? 'bg-rose-500/80' : 'bg-[#50E3C2]/80 text-black'}`}>
                        {isKept ? 'Remove' : 'Restore'}
                    </button>
                </div>
            )}
        </div>
    );
};

const Playhead = ({ pixelsPerSecond, isPlaying, containerRef, getVisualTime }) => {
    const time = useSelector((state) => state.editor.previewTime);
    const visualTime = getVisualTime(time);
    const pos = visualTime * pixelsPerSecond;
    
    // Self-contained Auto-Scroll logic
    useEffect(() => {
        if (isPlaying && containerRef.current) {
            const container = containerRef.current;
            const scrollThreshold = 400; // threshold to trigger scroll
            if (pos > container.scrollLeft + scrollThreshold) {
                container.scrollLeft = pos - 200; // Center playhead slightly
            }
        }
    }, [pos, isPlaying, containerRef]);

    return (
        <div 
            className="absolute top-0 bottom-0 w-[1px] bg-[#EF4444] z-[200] pointer-events-none" 
            style={{ left: pos }}
        >
            <div className="w-[10px] h-[10px] bg-[#EF4444] rounded-sm transform rotate-45 -ml-[5px] -mt-[5px] shadow-[0_0_10px_#EF4444]" />
            <div className="w-[1px] h-full bg-[#EF4444] shadow-[0_0_15px_#EF4444]" />
        </div>
    );
};

// DYNAMIC TIME INDICATOR
const TimeIndicator = ({ data, hideCuts, totalDuration }) => {
    const previewTime = useSelector((state) => state.editor.previewTime);
    
    // Calculate accurate visual total duration (sum of kept segments)
    const visualTotalDuration = useMemo(() => {
        const masterSegments = data[0]?.actions || [];
        const kept = masterSegments.filter(a => a.data?.is_kept !== false);
        
        if (!hideCuts) return totalDuration;
        
        let sum = 0;
        kept.forEach(action => {
            sum += (action.end - action.start);
        });
        
        return sum;
    }, [data, hideCuts, totalDuration]);

    // Calculate accurate visual current time
    const visualCurrentTime = useMemo(() => {
        if (!hideCuts) return previewTime;
        
        let visualTime = 0;
        const masterSegments = data[0]?.actions || [];
        for (const action of masterSegments) {
            const isKept = action.data?.is_kept !== false;
            
            if (previewTime >= action.end) {
                if (isKept) visualTime += (action.end - action.start);
            } else if (previewTime >= action.start && previewTime < action.end) {
                if (isKept) visualTime += (previewTime - action.start);
                break;
            }
        }
        return visualTime;
    }, [data, hideCuts, previewTime]);

    return (
        <div className="flex items-center gap-3 font-mono">
            <span className="text-[#50E3C2] text-[11px] font-black tracking-widest">
                {formatTimecode(visualCurrentTime)}
            </span>
            <span className="opacity-20 text-[9px]">—</span>
            <span className="text-white/40 text-[11px] tracking-widest">
                {formatTimecode(visualTotalDuration)}
            </span>
        </div>
    );
};

const ToolbarButton = ({ icon, title, onClick, active = false, showLabel = true, disabled = false }) => (
    <button 
        onClick={onClick} 
        disabled={disabled} 
        className={`px-2 py-1.5 flex items-center gap-1.5 transition-all group disabled:opacity-20 ${active ? 'text-[#50E3C2]' : 'text-[#868A91] hover:text-white'}`}
    >
        <span className="opacity-70 group-hover:opacity-100">{icon}</span>
        {showLabel && <span className="text-[8px] font-black uppercase tracking-[0.1em]">{title}</span>}
    </button>
);

export default TimelineEditor;
