import { createSlice } from "@reduxjs/toolkit";
import { defaultEditorState } from "./editorSchema";
import { vadInitialState } from "./parts/vadSlice";

const editorSlice = createSlice({
  name: "editor",

  initialState: {
    editor: defaultEditorState,
    projectId: null,
    sourceUrl: null, // The absolute URL of the source video
    isDirty: false,
    previewTime: 0,
    isPlaying: false,
    isLoading: false,
    error: null,
    // VAD specific state node
    vad: vadInitialState
  },

  reducers: {
    /**
     * Loads a project into the editor. 
     * Resets dirtiness and initializes the editor state.
     */
    loadProject: (state, action) => {
      state.editor = { ...defaultEditorState, ...action.payload.editor };
      state.projectId = action.payload.projectId;
      state.sourceUrl = action.payload.sourceUrl || null;
      state.isDirty = false;
      state.isLoading = false;
    },

    setSourceUrl: (state, action) => {
      state.sourceUrl = action.payload;
    },

    setEditorLoading: (state, action) => {
      state.isLoading = action.payload;
    },

    setEditorError: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    /**
     * Updates specific color grading properties.
     * Marks the state as dirty to trigger auto-save.
     */
    setColor: (state, action) => {
      state.editor.color = {
        ...state.editor.color,
        ...action.payload
      };
      state.isDirty = true;
    },

    /**
     * Specifically handles HSL (Color Wheel) adjustments.
     */
    setHsl: (state, action) => {
      if (!state.editor.color.hsl) {
        state.editor.color.hsl = { hue: 0, saturation: 0, luminance: 0 };
      }
      state.editor.color.hsl = {
        ...state.editor.color.hsl,
        ...action.payload
      };
      state.isDirty = true;
    },

    setTrim: (state, action) => {
      state.editor.trim = action.payload;
      state.isDirty = true;
    },

    setCaptions: (state, action) => {
      state.editor.captions = action.payload;
      state.isDirty = true;
    },

    setBroll: (state, action) => {
      state.editor.broll = action.payload;
      state.isDirty = true;
    },

    setTransitions: (state, action) => {
      state.editor.transitions = action.payload;
      state.isDirty = true;
    },

    setAudio: (state, action) => {
      state.editor.audio = { ...state.editor.audio, ...action.payload };
      state.isDirty = true;
    },

    setProjectJson: (state, action) => {
      state.editor.projectJson = action.payload;
      state.isDirty = true;
    },

    setPreviewTime: (state, action) => {
      state.previewTime = action.payload;
    },

    setIsPlaying: (state, action) => {
      state.isPlaying = action.payload;
    },

    setVadSegments: (state, action) => {
      state.vad.segments = action.payload;
      state.vad.status = "success";
    },

    updateVadConfig: (state, action) => {
      state.vad.config = { ...state.vad.config, ...action.payload };
    },

    setVadStatus: (state, action) => {
      state.vad.status = action.payload;
    },

    setVadError: (state, action) => {
      state.vad.error = action.payload;
      state.vad.status = "failed";
    },

    setVadStats: (state, action) => {
      state.vad.stats = { ...state.vad.stats, ...action.payload };
    },

    /**
     * Resets the persistent "isDirty" flag after a successful auto-save.
     */
    markSaved: (state) => {
      state.isDirty = false;
    }
  }
});

export const {
  loadProject,
  setEditorLoading,
  setEditorError,
  setColor,
  setHsl,
  setTrim,
  setCaptions,
  setBroll,
  setTransitions,
  setAudio,
  setProjectJson,
  setSourceUrl,
  setPreviewTime,
  setIsPlaying,
  setVadSegments,
  updateVadConfig,
  setVadStatus,
  setVadError,
  setVadStats,
  markSaved
} = editorSlice.actions;

export default editorSlice.reducer;
