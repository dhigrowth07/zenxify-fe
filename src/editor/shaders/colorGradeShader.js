import * as glReact from "gl-react";
const { Shaders } = glReact;

/**
 * Zenxify High-Fidelity Color Grading Shader
 * Raw string version for maximum compatibility with Vite.
 */
export const colorGradeShaders = Shaders.create({
  grade: {
    frag: `
      precision mediump float;
      varying vec2 uv;
      uniform sampler2D t;

      uniform float u_exposure;
      uniform float u_contrast;
      uniform float u_saturation;
      uniform float u_vibrance;
      uniform float u_temperature;
      uniform float u_tint;
      uniform float u_highlights;
      uniform float u_shadows;
      uniform float u_whites;
      uniform float u_blacks;
      uniform float u_clarity;
      uniform float u_hue;
      uniform float u_wheel_hue;
      uniform float u_wheel_sat;
      uniform float u_wheel_lum;

      vec3 applyHue(vec3 col, float hueShift) {
        float angle = hueShift * 3.14159265 / 180.0;
        float s = sin(angle);
        float c = cos(angle);
        vec3 k = vec3(0.57735, 0.57735, 0.57735);
        return col * c + cross(k, col) * s + k * dot(k, col) * (1.0 - c);
      }

      vec3 hsv2rgb(vec3 c) {
          vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
          vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
          return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
      }

      void main() {
        vec4 color = texture2D(t, uv);
        vec3 rgb = color.rgb;

        // 1. Exposure
        rgb = rgb * pow(2.0, u_exposure);

        // 2. Contrast
        rgb = (rgb - 0.5) * u_contrast + 0.5;

        // 3. Highlights & Shadows
        float luma = dot(rgb, vec3(0.299, 0.587, 0.114));
        float hMask = smoothstep(0.4, 0.8, luma);
        float sMask = 1.0 - smoothstep(0.2, 0.6, luma);
        rgb += hMask * (u_highlights / 100.0) * 0.2;
        rgb += sMask * (u_shadows    / 100.0) * 0.2;

        // 4. White & Black points
        rgb += (u_whites / 100.0) * 0.1 * step(0.8, rgb);
        rgb += (u_blacks / 100.0) * 0.1 * (1.0 - step(0.2, rgb));

        // 5. Global Saturation & Vibrance
        float gray = dot(rgb, vec3(0.299, 0.587, 0.114));
        rgb = mix(vec3(gray), rgb, u_saturation);

        float maxC = max(rgb.r, max(rgb.g, rgb.b));
        float minC = min(rgb.r, min(rgb.g, rgb.b));
        float vibSat = maxC - minC;
        rgb = mix(vec3(gray), rgb, 1.0 + (1.0 - vibSat) * u_vibrance);
        
        // 6. HSL Wheel (NEW: Tint Strength implementation)
        float tintStrength = u_wheel_sat / 100.0;
        if (tintStrength > 0.0) {
            float hueNorm = u_wheel_hue / 360.0;
            vec3 tintColor = hsv2rgb(vec3(hueNorm, 1.0, 1.0));
            
            // Mix original with tinted version based on strength (opacity)
            vec3 tinted = rgb * tintColor * 1.5;
            rgb = mix(rgb, tinted, tintStrength);
            
            // Additive Luminance from the wheel
            rgb += (u_wheel_lum / 100.0) * 0.2;
        }

        // 7. Temperature & Tint
        rgb.r += (u_temperature / 100.0) * 0.1;
        rgb.b -= (u_temperature / 100.0) * 0.1;
        rgb.g += (u_tint / 100.0) * 0.05;

        // 8. Global Hue Rotation
        rgb = applyHue(rgb, u_hue);

        // 9. Clarity (Sharpness/Local Contrast)
        vec2 offset = vec2(1.0 / 1920.0, 1.0 / 1080.0);
        vec3 blur = (
          texture2D(t, uv + offset).rgb +
          texture2D(t, uv - offset).rgb +
          texture2D(t, uv + vec2(offset.x, -offset.y)).rgb +
          texture2D(t, uv + vec2(-offset.x, offset.y)).rgb
        ) * 0.25;
        rgb += (rgb - blur) * (u_clarity / 100.0);

        gl_FragColor = vec4(clamp(rgb, 0.0, 1.0), color.a);
      }
    `
  }
});
