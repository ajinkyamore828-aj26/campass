import React, { useEffect, useRef } from 'react';
import {
  ShaderMount as ShaderMountVanilla,
  neuroNoiseFragmentShader,
  getShaderColorFromString,
  ShaderFitOptions,
} from '@paper-design/shaders';

export interface DynamicNeuroNoiseProps {
  className?: string;
  style?: React.CSSProperties;
  speed?: number;
  scale?: number;
  colorFront?: string;
  colorMid?: string;
  colorBack?: string;
  brightness?: number;
  contrast?: number;
}

export const DynamicNeuroNoise: React.FC<DynamicNeuroNoiseProps> = ({
  className = "absolute inset-0 pointer-events-none",
  style,
  speed = 1.0,
  scale = 0.65,
  colorFront = "rgba(255, 255, 255, 0.35)",
  colorMid = "rgba(255, 255, 255, 0.9)",
  colorBack = "#09090b",
  brightness = 0.02,
  contrast = 0.95,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mountRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const uniforms = {
      u_colorFront: getShaderColorFromString(colorFront),
      u_colorMid: getShaderColorFromString(colorMid),
      u_colorBack: getShaderColorFromString(colorBack),
      u_brightness: brightness,
      u_contrast: contrast,
      u_fit: ShaderFitOptions['none'],
      u_scale: scale,
      u_rotation: 0,
      u_offsetX: 0,
      u_offsetY: 0,
      u_originX: 0.5,
      u_originY: 0.5,
      u_worldWidth: 0,
      u_worldHeight: 0,
    };

    try {
      const mount = new ShaderMountVanilla(
        containerRef.current,
        neuroNoiseFragmentShader,
        uniforms,
        { preserveDrawingBuffer: false, alpha: true },
        speed
      );
      mountRef.current = mount;

      // Force canvas styling so it is NEVER hidden behind container or squished
      if (mount.canvasElement) {
        const cvs = mount.canvasElement as HTMLCanvasElement;
        cvs.style.position = 'absolute';
        cvs.style.top = '0';
        cvs.style.left = '0';
        cvs.style.width = '100%';
        cvs.style.height = '100%';
        cvs.style.display = 'block';
        cvs.style.objectFit = 'cover';
        cvs.style.zIndex = '0';
        cvs.style.pointerEvents = 'none';
      }

      // Ensure viewport & speed are always running live
      (mount as any).isInViewport = true;
      mount.setSpeed(speed);

      // Trigger initial resize & render frame
      requestAnimationFrame(() => {
        if (mountRef.current && !mountRef.current.hasBeenDisposed) {
          mountRef.current.handleResize();
          mountRef.current.render(performance.now());
        }
      });
    } catch (err) {
      console.warn("Shader init error:", err);
    }

    return () => {
      try {
        mountRef.current?.dispose();
      } catch (e) {}
      mountRef.current = null;
    };
  }, [speed, scale, colorFront, colorMid, colorBack, brightness, contrast]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
        ...style,
      }}
    />
  );
};

export default DynamicNeuroNoise;

