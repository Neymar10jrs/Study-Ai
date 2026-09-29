import React, { useEffect, useRef, useState } from "react";

const VERTEX_SHADER_SOURCE = `
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER_SOURCE = `
precision highp float;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

// Simplex-style noise helper
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

void main() {
  vec2 st = gl_FragCoord.xy / u_resolution.xy;
  st.x *= u_resolution.x / u_resolution.y;

  vec2 mouse = u_mouse / u_resolution.xy;
  float distToMouse = length(st - mouse);

  float t = u_time * 0.18;

  // Layered noise waves with warm orange/amber palettes
  float n1 = snoise(st * 1.5 + vec2(t * 0.5, t * 0.3));
  float n2 = snoise(st * 2.8 - vec2(t * 0.4, -t * 0.6) + n1 * 0.6);
  float n3 = snoise(st * 4.2 + vec2(-t * 0.2, t * 0.5) + n2 * 0.4);

  float combined = (n1 * 0.5 + n2 * 0.35 + n3 * 0.15) * 0.5 + 0.5;

  // Add mouse interaction ripple
  float mouseGlow = smoothstep(0.8, 0.0, distToMouse) * 0.15;
  combined += mouseGlow;

  // Color gradient definitions: Deep background into glowing warm amber and gold
  vec3 bgColor = vec3(0.035, 0.04, 0.06); // deep dark blue-black #090a0f
  vec3 darkAmber = vec3(0.55, 0.22, 0.03); // deep rust orange
  vec3 brightOrange = vec3(0.97, 0.45, 0.08); // #f97316
  vec3 warmYellow = vec3(0.98, 0.75, 0.12); // #fbbf24
  vec3 subtleGlow = vec3(1.0, 0.92, 0.7);

  // Gradient mixing based on combined noise
  vec3 col = bgColor;
  col = mix(col, darkAmber, smoothstep(0.2, 0.65, combined) * 0.85);
  col = mix(col, brightOrange, smoothstep(0.48, 0.85, combined) * 0.7);
  col = mix(col, warmYellow, smoothstep(0.72, 0.96, combined) * 0.5);
  col = mix(col, subtleGlow, smoothstep(0.90, 1.15, combined) * 0.25);

  // Vignette to keep edges darker and content readable
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  float vignette = uv.x * uv.y * (1.0 - uv.x) * (1.0 - uv.y);
  vignette = clamp(pow(16.0 * vignette, 0.35), 0.0, 1.0);
  col *= vignette;

  gl_FragColor = vec4(col, 0.75);
}
`;

export function ShaderCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [hasWebGL, setHasWebGL] = useState(true);

  useEffect(() => {
    // Check reduced motion
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(motionQuery.matches);
    const motionListener = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    motionQuery.addEventListener("change", motionListener);

    return () => motionQuery.removeEventListener("change", motionListener);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    let gl: WebGLRenderingContext | null =
      canvas.getContext("webgl2") as WebGLRenderingContext ||
      canvas.getContext("webgl") ||
      (canvas.getContext("experimental-webgl") as WebGLRenderingContext);

    if (!gl) {
      setHasWebGL(false);
      return;
    }

    const compileShader = (type: number, source: string) => {
      const shader = gl!.createShader(type);
      if (!shader) return null;
      gl!.shaderSource(shader, source);
      gl!.compileShader(shader);
      if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS)) {
        console.warn("Shader compile error:", gl!.getShaderInfoLog(shader));
        gl!.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertShader = compileShader(gl.VERTEX_SHADER, VERTEX_SHADER_SOURCE);
    const fragShader = compileShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SOURCE);

    if (!vertShader || !fragShader) {
      setHasWebGL(false);
      return;
    }

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn("Program link error:", gl.getProgramInfoLog(program));
      setHasWebGL(false);
      return;
    }

    gl.useProgram(program);

    // Full screen quad buffer
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const posAttr = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(posAttr);
    gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);

    const resUniform = gl.getUniformLocation(program, "u_resolution");
    const timeUniform = gl.getUniformLocation(program, "u_time");
    const mouseUniform = gl.getUniformLocation(program, "u_mouse");

    let animationFrameId: number;
    let startTime = performance.now();
    let isVisible = true;
    let mouseX = 0;
    let mouseY = 0;

    const handleResize = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.max(rect.width * dpr, 300);
      canvas.height = Math.max(rect.height * dpr, 200);
      gl?.viewport(0, 0, canvas.width, canvas.height);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      mouseX = (e.clientX - rect.left) * dpr;
      mouseY = (rect.height - (e.clientY - rect.top)) * dpr;
    };
    window.addEventListener("mousemove", handleMouseMove);

    // Pause rendering when canvas is scrolled off-screen
    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    });
    observer.observe(canvas);

    const render = (now: number) => {
      if (isVisible && gl) {
        const elapsed = (now - startTime) * 0.001;
        gl.uniform2f(resUniform, canvas.width, canvas.height);
        gl.uniform1f(timeUniform, elapsed);
        gl.uniform2f(mouseUniform, mouseX, mouseY);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
      }
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      observer.disconnect();
      cancelAnimationFrame(animationFrameId);
      if (gl) {
        gl.deleteProgram(program);
        gl.deleteShader(vertShader);
        gl.deleteShader(fragShader);
      }
    };
  }, [reducedMotion]);

  if (reducedMotion || !hasWebGL) {
    return (
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-600/20 via-orange-950/20 to-[#090a0f] pointer-events-none" />
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-85 transition-opacity duration-1000"
      aria-hidden="true"
    />
  );
}
