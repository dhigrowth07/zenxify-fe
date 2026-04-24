/**
 * ZENXIFY EDITOR JSON SCHEMA
 * This schema is the single source of truth for the video editor.
 * It is consumed by the React Frontend (Preview) and the Python Backend (FFmpeg).
 */

export const defaultEditorState = {
  // Trim settings: defines what parts of the source video are kept
  trim: {
    segments: []
    // Format: { start: number, end: number }
  },

  // Color grading settings: values match GLSL shader and FFmpeg filters
  color: {
    exposure: 0,    // -1 to 1
    contrast: 1,    // 0.5 to 2
    saturation: 1,    // 0 to 3
    vibrance: 0,    // -1 to 1
    temperature: 0,    // -100 to 100
    tint: 0,    // -100 to 100
    highlights: 0,    // -100 to 100
    shadows: 0,    // -100 to 100
    whites: 0,    // -100 to 100
    blacks: 0,    // -100 to 100
    clarity: 0,    // -100 to 100
    hue: 0,     // -180 to 180
    hsl: {
      hue: 0,
      saturation: 0,
      luminance: 0
    }
  },

  // Captions: text overlays with simple styling
  captions: [],
  // Example: { id, text, start, end, style, position, color, fontSize }

  // B-Roll: secondary media overlays
  broll: [],
  // Example: { id, src, start, end, layout, position: { x, y, w, h } }

  // Transitions: effects between segments
  transitions: [],
  // Example: { id, between: index, type: "fade", duration: 0.3 }

  // Audio settings
  audio: {
    bgm: null,
    volume: 1,
    duck: true
  },

  // Twick SDK Project Model (Added for timeline support)
  // This will be populated by transformZenxifyToTwick utility
  projectJson: {
    version: 1,
    tracks: [
      { id: 'track-video-1', type: 'video', name: 'Main Video', elements: [] }
    ]
  }
};
