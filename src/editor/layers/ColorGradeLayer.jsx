import React from "react";
import * as glReact from "gl-react";
const { Node } = glReact;
import { colorGradeShaders } from "../shaders/colorGradeShader";

/**
 * ColorGradeLayer
 * Connects the Redux color grading state to the GLSL shader uniforms.
 * This component is optimized to only re-render the Surface when uniforms change.
 */
export default function ColorGradeLayer({ children, color }) {
  // Defensive check to prevent crash if color is undefined
  if (!color) return children;

  return (
    <Node
      shader={colorGradeShaders.grade}
      uniforms={{
        t:             children,
        
        // Basic Adjustments
        u_exposure:    color.exposure || 0,
        u_contrast:    color.contrast ?? 1,
        u_saturation:  color.saturation ?? 1,
        u_vibrance:    color.vibrance || 0,
        u_temperature: color.temperature || 0,
        u_tint:        color.tint || 0,
        u_highlights:  color.highlights || 0,
        u_shadows:     color.shadows || 0,
        u_whites:      color.whites || 0,
        u_blacks:      color.blacks || 0,
        u_clarity:     color.clarity || 0,
        u_hue:         color.hue || 0,

        // Color Wheel (HSL) Adjustments
        u_wheel_hue:   color.hsl?.hue || 0,
        u_wheel_sat:   color.hsl?.saturation || 0,
        u_wheel_lum:   color.hsl?.luminance || 0
      }}
    />
  );
}
