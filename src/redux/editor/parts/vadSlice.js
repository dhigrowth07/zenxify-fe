import { createSlice } from "@reduxjs/toolkit";

/**
 * VAD (Voice Activity Detection) Slice
 * Manages segment state, configuration, and analysis status.
 */
export const vadInitialState = {
  segments: [],
  config: {
    spoken_language: "english",
    caption_language: "english",
    sensitivity: "default",
    autoCutBreaths: false,
    autoCutFillers: false,
    silence_threshold: -30,
    speech_padding: 100
  },
  status: "idle", // 'idle' | 'running' | 'success' | 'failed'
  error: null,
  stats: {
    total_segments: 0,
    kept_segments: 0,
    total_duration: "0.00",
    kept_duration: "0.00",
    saved_duration: "0.00"
  }
};

const vadSlice = createSlice({
  name: "vad",
  initialState: vadInitialState,
  reducers: {
    setVadSegments: (state, action) => {
      state.segments = action.payload;
      state.status = "success";
    },
    updateSegment: (state, action) => {
      const { id, changes } = action.payload;
      state.segments.forEach(track => {
        if (track.actions) {
          const index = track.actions.findIndex(a => a.id === id);
          if (index !== -1) {
            track.actions[index] = { 
              ...track.actions[index], 
              ...changes,
              data: { ...(track.actions[index].data || {}), ...changes }
            };
          }
        }
      });
    },
    bulkUpdateSegments: (state, action) => {
      const changes = action.payload; // Array of { id, changes }
      state.segments.forEach(track => {
        if (track.actions) {
          changes.forEach(({ id, changes: segmentChanges }) => {
            const index = track.actions.findIndex(a => a.id === id);
            if (index !== -1) {
              track.actions[index] = { 
                ...track.actions[index], 
                ...segmentChanges,
                data: { ...(track.actions[index].data || {}), ...segmentChanges }
              };
            }
          });
        }
      });
    },
    bulkToggleSilences: (state, action) => {
      const { shouldKeep } = action.payload;
      
      const isSilence = (seg) => {
        const text = seg.text || (seg.data?.review_note) || "";
        const label = text.toLowerCase();
        const color = (seg.waveform_color || seg.data?.waveform_color || "").toLowerCase();
        
        return (
          label.includes("silence") ||
          label.includes("breath") ||
          label.includes("filler") ||
          label.includes("short") ||
          color === 'red' ||
          color === 'yellow'
        );
      };

      state.segments.forEach(track => {
        if (track.actions) {
          track.actions = track.actions.map(seg => {
            if (isSilence(seg)) {
              return { 
                ...seg, 
                is_kept: shouldKeep,
                data: { ...(seg.data || {}), is_kept: shouldKeep }
              };
            }
            return seg;
          });
        }
      });
    },
    updateVadConfig: (state, action) => {
      state.config = { ...state.config, ...action.payload };
    },
    setVadStatus: (state, action) => {
      state.status = action.payload;
    },
    setVadError: (state, action) => {
      state.error = action.payload;
      state.status = "failed";
    },
    setVadStats: (state, action) => {
      state.stats = { ...state.stats, ...action.payload };
    },
    resetVad: (state) => {
      return vadInitialState;
    }
  }
});

export const {
  setVadSegments,
  updateSegment,
  bulkUpdateSegments,
  bulkToggleSilences,
  updateVadConfig,
  setVadStatus,
  setVadError,
  setVadStats,
  resetVad
} = vadSlice.actions;

export default vadSlice.reducer;
