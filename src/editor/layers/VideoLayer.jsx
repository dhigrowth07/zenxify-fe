import React, { useEffect, useState } from "react";
import * as glReact from "gl-react";
const { Node, Shaders } = glReact;

/**
 * Passthrough Shader
 * Simply takes a texture and renders it. 
 * Used here to feed the raw video into the grading pipeline.
 */
const passthrough = Shaders.create({
  pass: {
    frag: `
      precision mediump float;
      varying vec2 uv;
      uniform sampler2D t;
      uniform float v_aspect;
      uniform float s_aspect;
      uniform int resizeMode; // 0 for Cover, 1 for Contain

      void main() {
        vec2 newUv = uv;
        float ratio = v_aspect / s_aspect;
        bool outOfBounds = false;
        
        if (resizeMode == 0) {
          // COVER logic with a tiny bleed to fix corner gaps
          float bleed = 1.005; 
          if (ratio > 1.0) {
            newUv.x = (uv.x - 0.5) / (ratio * bleed) + 0.5;
          } else {
            newUv.y = (uv.y - 0.5) * (ratio / bleed) + 0.5;
          }
        } else {
          // CONTAIN logic
          if (ratio > 1.0) {
            newUv.y = (uv.y - 0.5) / ratio + 0.5;
            if (newUv.y < 0.0 || newUv.y > 1.0) outOfBounds = true;
          } else {
            newUv.x = (uv.x - 0.5) * ratio + 0.5;
            if (newUv.x < 0.0 || newUv.x > 1.0) outOfBounds = true;
          }
        }
        
        if (outOfBounds) {
          gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
        } else {
          gl_FragColor = texture2D(t, newUv);
        }
      }
    `
  }
});

/**
 * @param {object} props
 * @param {React.MutableRefObject<HTMLVideoElement>} props.videoRef
 * @param {number} props.surfaceWidth
 * @param {number} props.surfaceHeight
 * @param {number} [props.resizeMode]
 */
export default function VideoLayer({ videoRef, surfaceWidth, surfaceHeight, resizeMode = 0 }) {
  const [, setTick] = useState(0);
  const [vAspect, setVAspect] = useState(1);

  useEffect(() => {
    /** @type {any} */
    let raf = null;
    const loop = () => {
      setTick(t => t + 1);
      if (videoRef && videoRef.current && videoRef.current.videoWidth) {
        setVAspect(videoRef.current.videoWidth / videoRef.current.videoHeight);
      }
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => {
      if (raf) cancelAnimationFrame(raf);
    };
  }, [videoRef]);

  const sAspect = surfaceWidth / surfaceHeight || 1;

  return (
    <Node
      shader={passthrough.pass}
      uniforms={{ 
        t: () => videoRef.current,
        v_aspect: vAspect,
        s_aspect: sAspect,
        resizeMode: resizeMode
      }}
    />
  );
}
