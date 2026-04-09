import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { markSaved } from "../redux/editor/editorSlice";
import api from "../services/api";

/**
 * useAutoSave hook
 * Automatically persists the editor state to the backend when changes occur.
 * Uses a debounce timer to prevent excessive API calls.
 */
export function useAutoSave() {
  const dispatch = useDispatch();
  const editor = useSelector((state) => state.editor.editor);
  const projectId = useSelector((state) => state.editor.projectId);
  const isDirty = useSelector((state) => state.editor.isDirty);
  const timer = useRef(null);

  useEffect(() => {
    // Only save if the data has changed and we have a valid project
    if (!isDirty || !projectId) return;

    // Clear existing timer if any
    if (timer.current) {
        clearTimeout(timer.current);
    }

    // Set a new timer to save after 1.5 seconds of inactivity
    timer.current = window.setTimeout(async () => {
      try {
        // Persist the entire editor JSON to the project Draft
        await api.patch(`/api/projects/${projectId}`, { 
            editor_json: editor 
        });
        
        // Mark as saved in Redux once the backend confirms
        dispatch(markSaved());
        console.log("Zenxify: Auto-save successful.");
      } catch (err) {
        console.error("Zenxify: Auto-save failed", err);
      }
    }, 1500);

    // Cleanup timer on unmount
    return () => {
        if (timer.current) clearTimeout(timer.current);
    };
  }, [editor, isDirty, projectId, dispatch]);
}
