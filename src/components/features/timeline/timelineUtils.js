/**
 * Utility to transform VAD API response data into the format expected by @xzdarcy/react-timeline-editor
 */

/**
 * Maps segments and sound effects from the API to timeline tracks and actions.
 * @param {Object} apiData - The 'data' object from the VAD segments API response
 * @param {Object} options - Configuration for formatting (e.g., showHidden)
 * @returns {Array} - Array of track objects for the timeline editor
 */
export const transformVadToTimeline = (apiData, options = { showHidden: true }) => {
    if (!apiData) return [];

    const segments = apiData.segments || [];
    const sfx_segments = apiData.sfx_segments || [];

    // Map segments to a standard format for actions
    const mapSegmentToAction = (seg, effectId) => ({
        // Ensure unique IDs across tracks by appending the effectId
        id: seg.id ? `${seg.id}-${effectId}` : `seg-${seg.segment_index}-${effectId}`,
        start: parseFloat(seg.start_sec || 0),
        end: parseFloat(seg.end_sec || 0),
        effectId: effectId,
        text: seg.review_note || (seg.is_kept ? "Speech" : "Silence"),
        data: {
            ...seg,
            is_kept: !!seg.is_kept,
            waveform_color: seg.waveform_color
        }
    });

    return [
        // 1. Primary Video Track
        {
            id: "video-track",
            name: "Main Video",
            actions: (options.showHidden ? segments : segments.filter(s => s.is_kept))
                .map(seg => mapSegmentToAction(seg, "video"))
        },

        // 2. Audio/SFX Track (Populate with Voice if SFX is empty)
        {
            id: "audio-track",
            name: sfx_segments.length > 0 ? "Sound Effects" : "Main Voice",
            actions: sfx_segments.length > 0
                ? sfx_segments.map(sfx => ({
                    id: sfx.id || `sfx-${Math.random()}`,
                    start: parseFloat(sfx.start_sec || sfx.start_time || 0),
                    end: parseFloat(sfx.end_sec || (parseFloat(sfx.start_sec) + 5)),
                    effectId: "audio",
                    text: sfx.label || "SFX",
                    color: "#27AE60",
                    data: { ...sfx }
                }))
                : (options.showHidden ? segments : segments.filter(s => s.is_kept))
                    .map(seg => mapSegmentToAction(seg, "audio"))
        }
    ];
};

/**
 * Formats seconds into a professional HH:MM:SS:FF timecode
 * @param {number} time - Time in seconds
 * @param {number} fps - Frames per second (default 30)
 * @returns {string} - Formatted timecode
 */
export const formatTimecode = (time, fps = 30) => {
    if (isNaN(time)) return "0:00:00:00";

    // Round to avoid precision issues
    const totalSeconds = Math.round(time * 1000) / 1000;

    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = Math.floor(totalSeconds % 60);
    const f = Math.floor(Math.round(((totalSeconds % 1) * fps)));

    const pad = (num) => num.toString().padStart(2, '0');

    return `${h}:${pad(m)}:${pad(s)}:${pad(pad(f))}`;
};
