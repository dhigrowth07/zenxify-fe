# B-Roll Pipeline Stabilization & Implementation Plan

This document outlines the phased approach to integrating the high-fidelity B-roll editor features from the demo architecture into the React production environment.

## Phase 1: Data Integration & UI Clarity
**Objective:** Transition from generic "B-Roll" labels to specific source-aware information.

1.  **Source Type Mapping**
    *   Update `BrollCard.jsx` to map `source_type` from the API.
    *   Replace `(data.type || "B-ROLL")` with a formatted string: 
        *   `ai_generated` -> "AI Image"
        *   `stock_video` -> "Stock Video"
        *   `web_image` -> "Web Search"
2.  **Active Effect Badges**
    *   Add visual badges to each card showing current assigned effects.
    *   Fields: `data.transition` (Fade, None) and `data.animation` (Pan, Zoom, Tilt).
3.  **Animation Picker Implementation**
    *   Create `AnimationPickerModal.jsx` (similar to TransitionPicker).
    *   Allow users to select cinematic motions for specific segments.

## Phase 2: Live Overlay Infrastructure
**Objective:** Enable real-time visualization of B-roll on top of the talking head video.

4.  **Prop Propagation**
    *   Update `VideoPreview.jsx` to accept `segments` (results) as a prop.
    *   Pass these segments down to `PreviewEngine.jsx`.
5.  **BrollOverlay Component**
    *   Develop an HTML/CSS overlay layer that sits on top of the GL Surface.
    *   Include a `<video>` (muted) and `<img>` element for B-roll assets.
6.  **Time-Sync Logic**
    *   Implement an effect that calculates the `activeSegment` based on `previewTime` from Redux.
    *   Ensure the overlay asset toggles visibility exactly at `start_time` and disappears after `duration`.

## Phase 3: Cinematic Simulation (CSS Rendering)
**Objective:** Mimic final FFMPEG renders using high-performance CSS transforms.

7.  **Simulation Engine**
    *   Calculate a `progress` value (0.0 - 1.0) for the active segment using `requestAnimationFrame`.
    *   Apply CSS `transform` styles:
        *   **Zoom In:** `scale(1 + progress * 0.2)`
        *   **Pan Left/Right:** `translateX(...)`
        *   **Ken Burns:** Combined scale and translate.
8.  **Transition Simulation**
    *   Implement 0.4s CSS opacity fades for segments with `transition: "fade"`.
9.  **Drift Correction**
    *   Add logic to sync the overlay video's `currentTime` with the master video if it drifts > 0.3s.

## Phase 4: Advanced Editor Features
**Objective:** Streamline the user workflow and finalize the render chain.

10. **Quick-Select Candidates**
    *   Expose the `stock_clips_json` array directly on the `BrollCard`.
    *   Allow "One-Click Swap" between the top 5 AI-identified stock candidates.
11. **Confirmation Logic**
    *   Ensure `user_confirmed: true` is sent back to the API upon any manual change.
12. **Apply to Editor Hook**
    *   Verify the final JSON payload correctly maps the selected visuals and effects for the backend FFMPEG worker.

---
**Status:** In Progress
**Related Conversations:** 1c167bf5-8ada-4969-b059-2b10f4a083ed
