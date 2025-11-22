# Design Review: CB Website Design

**URL:** https://www.cbwebsitedesign.co.uk/
**Analysis Date:** 2025-11-21
**Target Stack:** Next.js 16 + React 19 + TypeScript + Tailwind CSS 4 + Framer Motion

---

## Executive Summary

CB Website Design showcases premium interactive effects combining custom cursor behavior, canvas-based gradient animations, and sophisticated hover interactions. The site demonstrates how careful attention to micro-interactions and performance optimization can create a memorable, engaging user experience.

**Key Technologies Identified:**
- WordPress + Custom Theme
- Tailwind CSS (utility-first styling)
- Swiper.js (carousels)
- Canvas API (gradient animations)
- CSS mix-blend-mode (reverse color effects)
- Custom cursor tracking system

**Primary Effects to Analyze:**
1. Liquid paint gradient animation (hero section)
2. Custom cursor with reverse color circle
3. Hover-triggered video playback on portfolio cards
4. Animated gradients and transitions throughout

---

## 1. Hero Section: Liquid Paint Gradient Effect

### Visual Description

The hero section features an animated, blob-like gradient background with continuously shifting colors. The effect resembles liquid paint flowing across the canvas, using vibrant colors (hot pink `#FE0168`, purple `#BD06C4`, orange `#FE6637`). The animation is subtle, slow-moving (15-30 second cycles), and creates depth through layered radial gradients.

### Technical Implementation (CB Website)

**Technology:** HTML5 Canvas with CSS variables for color management

```css
.hero .gradient canvas {
  position: absolute;
  width: 100%;
  height: 100%;
  --gradient-color-1: #fe0168;
  --gradient-color-2: #bd06c4;
  --gradient-color-3: #fe6637;
  --gradient-color-4: #fff;
}

@keyframes btnBlob {
  0% { background-position: 0 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0 50%; }
}

.animated-gradient {
  background: linear-gradient(45deg, #fe802d 0%, #fe0048 55%, #ac0bd9 100%);
  background-size: 400% 400%;
  animation: 15s infinite btnBlob;
}
```

**Key Characteristics:**
- Canvas element positioned absolutely to fill container
- Likely uses 2D context with radial gradients
- Colors defined as CSS variables for easy theming
- Smooth interpolation between gradient positions
- No mouse interaction (purely time-based animation)

### Implementation Strategies for Next.js

#### Approach 1: Pure CSS Gradient Animation (Simplest)

**Pros:**
- No JavaScript required
- Excellent performance
- Easy to implement and maintain
- Works everywhere (no canvas support needed)

**Cons:**
- Less organic "liquid" feel
- Limited to CSS gradient capabilities
- Can't create complex blob shapes

**Implementation:**

```tsx
// components/LiquidHero.tsx
import { cn } from '@/lib/utils';

export function LiquidHero({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative h-screen overflow-hidden">
      {/* Animated gradient background */}
      <div
        className={cn(
          "absolute inset-0 -z-10",
          "bg-gradient-to-br from-pink-600 via-purple-600 to-orange-500",
          "animate-gradient-shift"
        )}
        style={{
          backgroundSize: '400% 400%',
        }}
      />
      {/* Content */}
      <div className="relative z-10 flex items-center justify-center h-full">
        {children}
      </div>
    </div>
  );
}
```

```css
/* globals.css or tailwind.config.ts */
@keyframes gradient-shift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.animate-gradient-shift {
  animation: gradient-shift 15s ease infinite;
}
```

**Tailwind Config Addition:**

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      animation: {
        'gradient-shift': 'gradient-shift 15s ease infinite',
      },
      keyframes: {
        'gradient-shift': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
    },
  },
};
```

---

#### Approach 2: Canvas with Noise-Based Gradients (Moderate)

**Pros:**
- More organic, liquid-like movement
- Full control over gradient shapes
- Can add noise/turbulence for realism
- Better visual fidelity

**Cons:**
- Requires JavaScript and canvas
- More complex to maintain
- Potential performance impact on low-end devices

**Implementation:**

```tsx
// components/LiquidCanvas.tsx
'use client';

import { useEffect, useRef } from 'react';

export function LiquidCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Color palette
    const colors = [
      '#fe0168', // Pink
      '#bd06c4', // Purple
      '#fe6637', // Orange
    ];

    // Animation parameters
    let time = 0;
    const speed = 0.001;

    // Simple noise function for organic movement
    const noise = (x: number, y: number) => {
      return Math.sin(x * 0.01 + time) * Math.cos(y * 0.01 + time);
    };

    const animate = () => {
      time += speed;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Create multiple gradient circles with noise-based positions
      for (let i = 0; i < 3; i++) {
        const baseX = (canvas.width / 4) * (i + 1);
        const baseY = canvas.height / 2;

        // Add noise-based movement
        const x = baseX + noise(baseX, time * 1000) * 100;
        const y = baseY + noise(time * 1000, baseY) * 100;

        const gradient = ctx.createRadialGradient(
          x, y, 0,
          x, y, canvas.width / 2
        );

        gradient.addColorStop(0, colors[i] + '80'); // 50% opacity
        gradient.addColorStop(1, colors[i] + '00'); // Transparent

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full -z-10"
      style={{ willChange: 'auto' }}
    />
  );
}

// Usage in page
export default function HeroSection() {
  return (
    <div className="relative h-screen bg-gray-900">
      <LiquidCanvas />
      <div className="relative z-10 flex items-center justify-center h-full">
        <h1 className="text-6xl font-bold text-white">Your Content</h1>
      </div>
    </div>
  );
}
```

---

#### Approach 3: WebGL Shader-Based (Advanced)

**Pros:**
- Highest quality, most realistic liquid effect
- Extremely smooth performance (GPU-accelerated)
- Can add complex effects (turbulence, refraction, etc.)
- Professional-grade visuals

**Cons:**
- Complex implementation
- Requires shader knowledge (GLSL)
- Larger bundle size (Three.js or custom WebGL)
- Potential compatibility issues

**Implementation using Three.js:**

```tsx
// components/WebGLLiquid.tsx
'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export function WebGLLiquid() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Setup scene
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer({ alpha: true });

    renderer.setSize(
      containerRef.current.offsetWidth,
      containerRef.current.offsetHeight
    );
    containerRef.current.appendChild(renderer.domElement);

    // Shader material for liquid gradient
    const material = new THREE.ShaderMaterial({
      uniforms: {
        u_time: { value: 0.0 },
        u_resolution: {
          value: new THREE.Vector2(
            containerRef.current.offsetWidth,
            containerRef.current.offsetHeight
          )
        },
        u_color1: { value: new THREE.Color('#fe0168') },
        u_color2: { value: new THREE.Color('#bd06c4') },
        u_color3: { value: new THREE.Color('#fe6637') },
      },
      vertexShader: `
        void main() {
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float u_time;
        uniform vec2 u_resolution;
        uniform vec3 u_color1;
        uniform vec3 u_color2;
        uniform vec3 u_color3;

        // Simple noise function
        float noise(vec2 st) {
          return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
        }

        void main() {
          vec2 st = gl_FragCoord.xy / u_resolution.xy;

          // Create organic movement
          float n1 = noise(st + u_time * 0.1);
          float n2 = noise(st * 2.0 - u_time * 0.15);
          float n3 = noise(st * 3.0 + u_time * 0.08);

          // Blend colors based on noise
          vec3 color = mix(u_color1, u_color2, n1);
          color = mix(color, u_color3, n2 * 0.5);

          // Add subtle animation
          color *= 0.8 + n3 * 0.2;

          gl_FragColor = vec4(color, 1.0);
        }
      `,
    });

    // Create plane geometry
    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Animation loop
    const animate = () => {
      material.uniforms.u_time.value += 0.01;
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      const width = containerRef.current?.offsetWidth || 0;
      const height = containerRef.current?.offsetHeight || 0;
      renderer.setSize(width, height);
      material.uniforms.u_resolution.value.set(width, height);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={containerRef} className="absolute inset-0 -z-10" />;
}
```

**Package Installation:**

```bash
npm install three
npm install -D @types/three
```

---

#### Approach 4: Framer Motion Gradient Animation (Recommended)

**Pros:**
- Leverages existing Framer Motion dependency
- Good balance of visual quality and simplicity
- Declarative React API
- Built-in performance optimizations

**Cons:**
- Not true liquid effect (more morphing shapes)
- Limited to SVG/DOM animations
- May not match original exactly

**Implementation:**

```tsx
// components/FramerLiquid.tsx
'use client';

import { motion } from 'framer-motion';

export function FramerLiquid() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden bg-gray-900">
      {/* Animated blob 1 */}
      <motion.div
        className="absolute w-[800px] h-[800px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(254,1,104,0.6) 0%, rgba(254,1,104,0) 70%)',
          filter: 'blur(60px)',
        }}
        animate={{
          x: ['10%', '30%', '10%'],
          y: ['20%', '40%', '20%'],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Animated blob 2 */}
      <motion.div
        className="absolute w-[700px] h-[700px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(189,6,196,0.6) 0%, rgba(189,6,196,0) 70%)',
          filter: 'blur(60px)',
        }}
        animate={{
          x: ['60%', '40%', '60%'],
          y: ['10%', '30%', '10%'],
          scale: [1.2, 1, 1.2],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Animated blob 3 */}
      <motion.div
        className="absolute w-[900px] h-[900px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(254,102,55,0.5) 0%, rgba(254,102,55,0) 70%)',
          filter: 'blur(60px)',
        }}
        animate={{
          x: ['30%', '50%', '30%'],
          y: ['50%', '60%', '50%'],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
}
```

---

### Performance Considerations

**Critical Optimizations:**

1. **GPU Acceleration:**
```css
.animated-gradient {
  will-change: auto; /* Not transform/opacity - let browser decide */
  backface-visibility: hidden;
  transform: translate3d(0, 0, 0);
}
```

2. **Responsive Canvas Sizing:**
```typescript
// Use devicePixelRatio for sharp rendering on retina displays
canvas.width = container.offsetWidth * window.devicePixelRatio;
canvas.height = container.offsetHeight * window.devicePixelRatio;
ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
```

3. **Reduce Animation on Low-End Devices:**
```typescript
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (prefersReducedMotion) {
  // Use static gradient or simpler animation
}
```

4. **Intersection Observer (Pause When Not Visible):**
```typescript
useEffect(() => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) {
        // Pause animation
      }
    });
  });
  observer.observe(containerRef.current);
}, []);
```

### Recommendation

**For Ambient Project: Use Approach 4 (Framer Motion) + Approach 1 (CSS Fallback)**

**Why:**
- Already using Framer Motion (zero additional dependencies)
- Good visual quality without Canvas complexity
- CSS fallback for maximum compatibility
- Easy to maintain and customize
- Excellent performance

**Implementation Strategy:**
1. Start with pure CSS gradient (Approach 1)
2. Enhance with Framer Motion blobs (Approach 4) for hero sections
3. Reserve Canvas/WebGL for specific high-impact pages

---

## 2. Custom Cursor with Reverse Color Circle

### Visual Description

The cursor transforms throughout the page, replacing the default system cursor with a custom circular element. When hovering over interactive elements (portfolio cards, CTAs), the cursor expands into a large circle (approximately 5rem diameter) with a **reverse color effect** - it inverts the colors of underlying content, creating a striking "spotlight" appearance. The effect uses CSS `mix-blend-mode: exclusion`.

### Technical Implementation (CB Website)

```css
.cursor-layer {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 99999;
  mix-blend-mode: exclusion; /* Key for reverse color effect */
  will-change: auto;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.cursor-layer-dot {
  position: absolute;
  width: 1rem;
  height: 1rem;
  border: 1px solid #fff;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: width 0.3s, height 0.3s;
}

.cursor-layer-bg {
  position: absolute;
  width: 5rem;
  height: 5rem;
  background: #fff; /* White creates strongest inversion */
  border-radius: 50%;
  transform: translate(-50%, -50%) scale(0);
  transition: transform 0.3s ease;
}

/* Active state when hovering interactive elements */
.cursor-cta-active .cursor-layer-bg {
  transform: translate(-50%, -50%) scale(1);
}
```

**JavaScript (Conceptual):**

```javascript
document.addEventListener('mousemove', (e) => {
  cursorDot.style.left = e.clientX + 'px';
  cursorDot.style.top = e.clientY + 'px';
  cursorBg.style.left = e.clientX + 'px';
  cursorBg.style.top = e.clientY + 'px';
});

document.querySelectorAll('[data-cursor="cta"]').forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursorLayer.classList.add('cursor-cta-active');
  });
  el.addEventListener('mouseleave', () => {
    cursorLayer.classList.remove('cursor-cta-active');
  });
});
```

### How mix-blend-mode: exclusion Works

**The Math Behind It:**

```
Result = (Bottom Color) - (Top Color) OR (Top Color) - (Bottom Color)
         (whichever is positive)
```

**Examples:**
- White (#FFFFFF) over Black (#000000) → White
- White (#FFFFFF) over White (#FFFFFF) → Black (inverted!)
- White (#FFFFFF) over Red (#FF0000) → Cyan (#00FFFF)
- White (#FFFFFF) over Blue (#0000FF) → Yellow (#FFFF00)

This creates the characteristic "reverse color" effect - dark colors become light, light colors become dark.

### Implementation Strategies for Next.js

#### Approach 1: CSS mix-blend-mode (Exact Recreation)

**Pros:**
- Matches original exactly
- Pure CSS (minimal JavaScript)
- Excellent performance
- No external dependencies

**Cons:**
- Can be visually confusing on some backgrounds
- Doesn't work well with complex images
- May not be obvious to all users

**Implementation:**

```tsx
// components/CustomCursor.tsx
'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isActive, setIsActive] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show cursor after mount
    setIsVisible(true);

    // Track mouse position
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    // Handle hover states
    const handleMouseEnter = () => setIsActive(true);
    const handleMouseLeave = () => setIsActive(false);

    // Add event listeners
    window.addEventListener('mousemove', handleMouseMove);

    // Find all interactive elements
    const interactiveElements = document.querySelectorAll(
      'a, button, [data-cursor="active"]'
    );

    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', handleMouseEnter);
      el.addEventListener('mouseleave', handleMouseLeave);
    });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      interactiveElements.forEach(el => {
        el.removeEventListener('mouseenter', handleMouseEnter);
        el.removeEventListener('mouseleave', handleMouseLeave);
      });
    };
  }, []);

  // Hide on touch devices
  useEffect(() => {
    const isTouchDevice = 'ontouchstart' in window;
    if (isTouchDevice) {
      setIsVisible(false);
    }
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 pointer-events-none z-[9999]",
        "mix-blend-exclusion transition-opacity duration-300"
      )}
      style={{ opacity: isVisible ? 1 : 0 }}
    >
      {/* Small dot cursor */}
      <div
        className={cn(
          "absolute w-4 h-4 border border-white rounded-full",
          "transition-all duration-150 ease-out",
          isActive && "scale-50 opacity-50"
        )}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: 'translate(-50%, -50%)',
        }}
      />

      {/* Large circle background */}
      <div
        className={cn(
          "absolute w-20 h-20 bg-white rounded-full",
          "transition-transform duration-300 ease-out",
          isActive ? "scale-100" : "scale-0"
        )}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: `translate(-50%, -50%) scale(${isActive ? 1 : 0})`,
        }}
      />
    </div>
  );
}

// app/layout.tsx
import { CustomCursor } from '@/components/CustomCursor';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="cursor-none"> {/* Hide default cursor */}
        <CustomCursor />
        {children}
      </body>
    </html>
  );
}
```

**Tailwind Config (hide default cursor):**

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      cursor: {
        none: 'none',
      },
    },
  },
};
```

---

#### Approach 2: Spotlight with backdrop-filter (Modern Alternative)

**Pros:**
- More predictable visual result
- Better on complex backgrounds
- Creates clear "spotlight" effect
- Modern CSS feature

**Cons:**
- Different effect than original (not color inversion)
- Limited browser support (good, but not universal)
- Can be performance-intensive

**Implementation:**

```tsx
// components/SpotlightCursor.tsx
'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export function SpotlightCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseEnter = () => setIsActive(true);
    const handleMouseLeave = () => setIsActive(false);

    window.addEventListener('mousemove', handleMouseMove);

    const interactiveElements = document.querySelectorAll(
      'a, button, [data-cursor="active"]'
    );

    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', handleMouseEnter);
      el.addEventListener('mouseleave', handleMouseLeave);
    });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      interactiveElements.forEach(el => {
        el.removeEventListener('mouseenter', handleMouseEnter);
        el.removeEventListener('mouseleave', handleMouseLeave);
      });
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]">
      {/* Spotlight circle with backdrop filter */}
      <div
        className={cn(
          "absolute rounded-full",
          "transition-all duration-300 ease-out",
          isActive ? "w-32 h-32 opacity-100" : "w-8 h-8 opacity-0"
        )}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: 'translate(-50%, -50%)',
          backdropFilter: 'invert(1) hue-rotate(180deg)',
          WebkitBackdropFilter: 'invert(1) hue-rotate(180deg)',
        }}
      />

      {/* Small dot */}
      <div
        className="absolute w-2 h-2 bg-white rounded-full"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: 'translate(-50%, -50%)',
        }}
      />
    </div>
  );
}
```

---

#### Approach 3: Framer Motion Cursor (Smooth Animations)

**Pros:**
- Buttery smooth animations
- Spring physics for natural movement
- Easy to add complex behaviors
- Declarative API

**Cons:**
- Requires Framer Motion
- More complex setup
- Potential performance impact

**Implementation:**

```tsx
// components/MotionCursor.tsx
'use client';

import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export function MotionCursor() {
  const [isActive, setIsActive] = useState(false);

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // Add spring physics for smooth following
  const springConfig = { damping: 25, stiffness: 700 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    const handleMouseEnter = () => setIsActive(true);
    const handleMouseLeave = () => setIsActive(false);

    window.addEventListener('mousemove', handleMouseMove);

    const interactiveElements = document.querySelectorAll(
      'a, button, [data-cursor="active"]'
    );

    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', handleMouseEnter);
      el.addEventListener('mouseleave', handleMouseLeave);
    });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      interactiveElements.forEach(el => {
        el.removeEventListener('mouseenter', handleMouseEnter);
        el.removeEventListener('mouseleave', handleMouseLeave);
      });
    };
  }, [cursorX, cursorY]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] mix-blend-exclusion">
      {/* Large background circle */}
      <motion.div
        className="absolute w-20 h-20 bg-white rounded-full"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          scale: isActive ? 1 : 0,
          opacity: isActive ? 1 : 0,
        }}
        transition={{
          type: 'spring',
          damping: 20,
          stiffness: 300,
        }}
      />

      {/* Small dot */}
      <motion.div
        className="absolute w-2 h-2 border-2 border-white rounded-full"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          scale: isActive ? 0.5 : 1,
        }}
      />
    </div>
  );
}
```

---

#### Approach 4: Magnetic Cursor (Enhanced UX)

**Pros:**
- Guides user attention to interactive elements
- Creates "magnetic" pull toward buttons
- Enhances clickability perception
- Unique, memorable interaction

**Cons:**
- More complex state management
- Requires calculating element positions
- Can be disorienting if too aggressive

**Implementation:**

```tsx
// components/MagneticCursor.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export function MagneticCursor() {
  const [isActive, setIsActive] = useState(false);
  const [hoveredElement, setHoveredElement] = useState<HTMLElement | null>(null);

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 700 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      let targetX = e.clientX;
      let targetY = e.clientY;

      // If hovering an interactive element, apply magnetic effect
      if (hoveredElement) {
        const rect = hoveredElement.getBoundingClientRect();
        const elementCenterX = rect.left + rect.width / 2;
        const elementCenterY = rect.top + rect.height / 2;

        // Calculate distance from center
        const distanceX = elementCenterX - e.clientX;
        const distanceY = elementCenterY - e.clientY;
        const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2);

        // Apply magnetic pull within 100px radius
        const magneticRadius = 100;
        if (distance < magneticRadius) {
          const pull = 0.3; // Adjust strength (0-1)
          targetX += distanceX * pull;
          targetY += distanceY * pull;
        }
      }

      cursorX.set(targetX);
      cursorY.set(targetY);
    };

    const handleMouseEnter = (e: Event) => {
      setIsActive(true);
      setHoveredElement(e.target as HTMLElement);
    };

    const handleMouseLeave = () => {
      setIsActive(false);
      setHoveredElement(null);
    };

    window.addEventListener('mousemove', handleMouseMove);

    const interactiveElements = document.querySelectorAll(
      'a, button, [data-cursor="magnetic"]'
    );

    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', handleMouseEnter);
      el.addEventListener('mouseleave', handleMouseLeave);
    });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      interactiveElements.forEach(el => {
        el.removeEventListener('mouseenter', handleMouseEnter);
        el.removeEventListener('mouseleave', handleMouseLeave);
      });
    };
  }, [cursorX, cursorY, hoveredElement]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] mix-blend-exclusion">
      <motion.div
        className="absolute w-20 h-20 bg-white rounded-full"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          scale: isActive ? 1 : 0,
        }}
      />

      <motion.div
        className="absolute w-2 h-2 border-2 border-white rounded-full"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          translateX: '-50%',
          translateY: '-50%',
        }}
      />
    </div>
  );
}
```

---

### Performance Considerations

**Critical Optimizations:**

1. **Throttle mousemove events:**
```typescript
import { throttle } from 'lodash-es';

const handleMouseMove = throttle((e: MouseEvent) => {
  // Update cursor position
}, 16); // ~60fps
```

2. **Use CSS transform instead of left/top:**
```typescript
// ❌ Bad (triggers layout)
element.style.left = x + 'px';

// ✅ Good (GPU-accelerated)
element.style.transform = `translate(${x}px, ${y}px)`;
```

3. **Hide on touch devices:**
```typescript
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
if (isTouchDevice) return null;
```

4. **Use will-change sparingly:**
```css
.cursor-element {
  will-change: transform; /* Only for actively animated elements */
}
```

5. **Debounce element queries:**
```typescript
// Query interactive elements once on mount, not on every event
const interactiveElementsRef = useRef<NodeListOf<Element>>();

useEffect(() => {
  interactiveElementsRef.current = document.querySelectorAll('a, button');
}, []);
```

### UX Considerations

**Accessibility:**
- Custom cursors can be confusing for some users
- Always provide fallback (standard cursor for touch devices)
- Consider respecting `prefers-reduced-motion`
- Ensure sufficient contrast in all states

**Best Practices:**
- Make cursor changes contextually clear (what will happen on click?)
- Don't make cursor too large (obstructs content)
- Smooth transitions (300ms is good baseline)
- Test on various backgrounds (light, dark, images)

**When to Use:**
- Portfolio sites (creative showcase)
- Product landing pages (high-impact first impression)
- Marketing sites (brand differentiation)

**When NOT to Use:**
- Content-heavy sites (reading interference)
- Web apps with frequent interactions (can be fatiguing)
- Accessibility-critical applications
- Mobile-first experiences (doesn't translate)

### Recommendation

**For Ambient Project: Use Approach 1 (mix-blend-mode) with Approach 3 (Framer Motion smoothness)**

**Why:**
- Matches the original effect exactly
- Leverages existing Framer Motion dependency for smooth animation
- Unique, memorable interaction fitting for creative portfolio
- Good performance with proper optimizations

**Implementation Strategy:**
1. Start with Approach 1 (CSS mix-blend-mode)
2. Add Framer Motion spring physics for smoothness (Approach 3)
3. Add magnetic behavior for key CTAs only (selective use of Approach 4)
4. Hide on touch devices and respect `prefers-reduced-motion`

---

## 3. Portfolio Cards: Hover-Triggered Video Playback

### Visual Description

The "What We Do Best" section displays portfolio cards with static images. On hover, the card subtly scales up, and a video begins playing underneath with a smooth fade-in transition. The video has a blur effect that fades out as it becomes visible, creating a professional reveal effect. The entire interaction feels polished and intentional, with staggered transitions for opacity (300ms), filter (800ms), and transform (800ms).

### Technical Implementation (CB Website)

```css
.work-card {
  position: relative;
  overflow: hidden;
  border-radius: 1.5rem;
  transition: transform 0.3s ease;
}

.work-card:hover {
  transform: scale(1.04);
}

.work-card-media {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
}

.work-card-media video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  visibility: hidden;
  filter: blur(5px);
  transform: scale(1.03);
  transition:
    opacity 0.3s ease,
    visibility 0.3s ease,
    filter 0.8s ease,
    transform 0.8s ease;
}

.work-card:hover .work-card-media video {
  opacity: 1;
  visibility: visible;
  filter: blur(0);
  transform: scale(1.02);
}
```

**HTML Structure:**

```html
<div class="work-card">
  <div class="work-card-media">
    <img src="poster.jpg" alt="Project poster" />
    <video
      src="project-video.mp4"
      loop
      muted
      playsinline
      preload="metadata"
    ></video>
  </div>
  <div class="work-card-content">
    <h3>Project Title</h3>
    <p>Project description</p>
  </div>
</div>
```

**JavaScript (Video Control):**

```javascript
document.querySelectorAll('.work-card').forEach(card => {
  const video = card.querySelector('video');

  card.addEventListener('mouseenter', () => {
    video.play();
  });

  card.addEventListener('mouseleave', () => {
    video.pause();
    video.currentTime = 0; // Reset to beginning
  });
});
```

### Implementation Strategies for Next.js

#### Approach 1: Pure CSS Hover with Video Element (Simplest)

**Pros:**
- Minimal JavaScript
- Excellent browser support
- Easy to implement
- Good performance

**Cons:**
- No programmatic video control
- Can't easily add loading states
- Limited customization

**Implementation:**

```tsx
// components/VideoCard.tsx
import { cn } from '@/lib/utils';

interface VideoCardProps {
  title: string;
  description: string;
  poster: string;
  videoSrc: string;
  tags?: string[];
}

export function VideoCard({
  title,
  description,
  poster,
  videoSrc,
  tags
}: VideoCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-3xl transition-transform duration-300 hover:scale-[1.04]">
      {/* Media container */}
      <div className="relative w-full aspect-video bg-gray-900">
        {/* Poster image (always visible) */}
        <img
          src={poster}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Video (fades in on hover) */}
        <video
          src={videoSrc}
          loop
          muted
          playsInline
          preload="metadata"
          className={cn(
            "absolute inset-0 w-full h-full object-cover",
            "opacity-0 invisible blur-sm scale-[1.03]",
            "transition-all duration-300 ease-out",
            "group-hover:opacity-100 group-hover:visible group-hover:blur-0 group-hover:scale-[1.02]"
          )}
          onMouseEnter={(e) => e.currentTarget.play()}
          onMouseLeave={(e) => {
            e.currentTarget.pause();
            e.currentTarget.currentTime = 0;
          }}
        />
      </div>

      {/* Content */}
      <div className="p-6 bg-white">
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {tags.map((tag, i) => (
              <span
                key={i}
                className="px-3 py-1 text-sm rounded-full bg-gray-100 text-gray-700"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        <h3 className="text-2xl font-bold mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  );
}

// Usage
export default function PortfolioSection() {
  const projects = [
    {
      title: "Brand Campaign",
      description: "Innovative marketing approach",
      poster: "/images/project-1-poster.jpg",
      videoSrc: "/videos/project-1.mp4",
      tags: ["Branding", "Marketing"],
    },
    // ... more projects
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-5xl font-bold mb-12">What We Do Best</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, i) => (
            <VideoCard key={i} {...project} />
          ))}
        </div>
      </div>
    </section>
  );
}
```

**Tailwind Config (for scale-[1.04]):**

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      scale: {
        '102': '1.02',
        '103': '1.03',
        '104': '1.04',
      },
    },
  },
};
```

---

#### Approach 2: React State + useRef (Better Control)

**Pros:**
- Full programmatic control over video
- Can add loading states
- Easy to add analytics
- Better error handling

**Cons:**
- More React boilerplate
- Slightly more complex
- Need to manage refs

**Implementation:**

```tsx
// components/VideoCardControlled.tsx
'use client';

import { useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface VideoCardControlledProps {
  title: string;
  description: string;
  poster: string;
  videoSrc: string;
  tags?: string[];
}

export function VideoCardControlled({
  title,
  description,
  poster,
  videoSrc,
  tags,
}: VideoCardControlledProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        setHasError(true);
      });
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  const handleVideoLoaded = () => {
    setIsLoading(false);
  };

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-3xl",
        "transition-transform duration-300",
        isHovered && "scale-[1.04]"
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Media container */}
      <div className="relative w-full aspect-video bg-gray-900">
        {/* Poster image */}
        <img
          src={poster}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Video */}
        <video
          ref={videoRef}
          src={videoSrc}
          loop
          muted
          playsInline
          preload="metadata"
          onLoadedData={handleVideoLoaded}
          onError={() => setHasError(true)}
          className={cn(
            "absolute inset-0 w-full h-full object-cover",
            "transition-all ease-out",
            isHovered && !hasError
              ? "opacity-100 visible blur-0 scale-[1.02] duration-800"
              : "opacity-0 invisible blur-sm scale-[1.03] duration-300"
          )}
        />

        {/* Loading indicator */}
        {isLoading && isHovered && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Error state */}
        {hasError && isHovered && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
            Video unavailable
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 bg-white">
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {tags.map((tag, i) => (
              <span
                key={i}
                className="px-3 py-1 text-sm rounded-full bg-gray-100 text-gray-700"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        <h3 className="text-2xl font-bold mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  );
}
```

---

#### Approach 3: Framer Motion + Intersection Observer (Advanced)

**Pros:**
- Smooth, physics-based animations
- Only loads videos when in viewport
- Better performance for many cards
- Impressive visual polish

**Cons:**
- Requires Framer Motion
- More complex setup
- Larger bundle size

**Implementation:**

```tsx
// components/VideoCardMotion.tsx
'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { cn } from '@/lib/utils';

interface VideoCardMotionProps {
  title: string;
  description: string;
  poster: string;
  videoSrc: string;
  tags?: string[];
}

export function VideoCardMotion({
  title,
  description,
  poster,
  videoSrc,
  tags,
}: VideoCardMotionProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const videoControls = useAnimation();

  // Intersection Observer to detect when card is in viewport
  useEffect(() => {
    if (!cardRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.2 } // Trigger when 20% visible
    );

    observer.observe(cardRef.current);

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, []);

  const handleMouseEnter = () => {
    setIsHovered(true);

    // Only play if in viewport
    if (isInView && videoRef.current) {
      videoRef.current.play();
    }

    // Animate video in
    videoControls.start({
      opacity: 1,
      scale: 1.02,
      filter: 'blur(0px)',
      transition: {
        opacity: { duration: 0.3 },
        scale: { duration: 0.8, ease: 'easeOut' },
        filter: { duration: 0.8, ease: 'easeOut' },
      },
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);

    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }

    // Animate video out
    videoControls.start({
      opacity: 0,
      scale: 1.03,
      filter: 'blur(5px)',
      transition: {
        duration: 0.3,
      },
    });
  };

  return (
    <motion.div
      ref={cardRef}
      className="relative overflow-hidden rounded-3xl"
      whileHover={{ scale: 1.04 }}
      transition={{ duration: 0.3 }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Media container */}
      <div className="relative w-full aspect-video bg-gray-900">
        {/* Poster image */}
        <motion.img
          src={poster}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Video - only render if in viewport */}
        {isInView && (
          <motion.video
            ref={videoRef}
            src={videoSrc}
            loop
            muted
            playsInline
            preload="metadata"
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ opacity: 0, scale: 1.03, filter: 'blur(5px)' }}
            animate={videoControls}
          />
        )}
      </div>

      {/* Content */}
      <motion.div
        className="p-6 bg-white"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
      >
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {tags.map((tag, i) => (
              <motion.span
                key={i}
                className="px-3 py-1 text-sm rounded-full bg-gray-100 text-gray-700"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.1 }}
              >
                {tag}
              </motion.span>
            ))}
          </div>
        )}
        <h3 className="text-2xl font-bold mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </motion.div>
    </motion.div>
  );
}
```

---

#### Approach 4: Progressive Enhancement with Fallbacks

**Pros:**
- Works on all devices/browsers
- Graceful degradation
- Best accessibility
- SEO-friendly

**Cons:**
- More conditional logic
- Need to test multiple scenarios
- Larger codebase

**Implementation:**

```tsx
// components/VideoCardProgressive.tsx
'use client';

import { useRef, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface VideoCardProgressiveProps {
  title: string;
  description: string;
  poster: string;
  videoSrc: string;
  tags?: string[];
}

export function VideoCardProgressive({
  title,
  description,
  poster,
  videoSrc,
  tags,
}: VideoCardProgressiveProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [supportsVideo, setSupportsVideo] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check for video support
    const video = document.createElement('video');
    setSupportsVideo(!!video.canPlayType);

    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    // Listen for changes
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  const handleMouseEnter = () => {
    setIsHovered(true);

    // Only play video if supported and motion is allowed
    if (supportsVideo && !prefersReducedMotion && videoRef.current) {
      videoRef.current.play().catch(() => {
        // Silently fail if autoplay is blocked
      });
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  // If motion is reduced, just show poster with subtle scale
  if (prefersReducedMotion) {
    return (
      <div className="relative overflow-hidden rounded-3xl transition-transform duration-300 hover:scale-[1.02]">
        <div className="relative w-full aspect-video bg-gray-900">
          <img
            src={poster}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
        <div className="p-6 bg-white">
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.map((tag, i) => (
                <span
                  key={i}
                  className="px-3 py-1 text-sm rounded-full bg-gray-100 text-gray-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          <h3 className="text-2xl font-bold mb-2">{title}</h3>
          <p className="text-gray-600">{description}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl",
        "transition-transform duration-300",
        isHovered && "scale-[1.04]"
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative w-full aspect-video bg-gray-900">
        <img
          src={poster}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {supportsVideo && (
          <video
            ref={videoRef}
            src={videoSrc}
            loop
            muted
            playsInline
            preload="metadata"
            className={cn(
              "absolute inset-0 w-full h-full object-cover",
              "transition-all ease-out",
              isHovered
                ? "opacity-100 visible blur-0 scale-[1.02] duration-800"
                : "opacity-0 invisible blur-sm scale-[1.03] duration-300"
            )}
          />
        )}
      </div>

      <div className="p-6 bg-white">
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {tags.map((tag, i) => (
              <span
                key={i}
                className="px-3 py-1 text-sm rounded-full bg-gray-100 text-gray-700"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        <h3 className="text-2xl font-bold mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  );
}
```

---

### Performance Considerations

**Critical Optimizations:**

1. **Video Preloading Strategy:**

```html
<!-- ❌ Don't preload all videos -->
<video preload="auto" />

<!-- ✅ Preload only metadata -->
<video preload="metadata" />

<!-- ✅ Or load nothing until needed -->
<video preload="none" />
```

2. **Lazy Loading with Intersection Observer:**

```typescript
// Only load video source when card enters viewport
useEffect(() => {
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting && videoRef.current) {
        videoRef.current.src = videoSrc;
      }
    },
    { threshold: 0.1 }
  );

  if (cardRef.current) {
    observer.observe(cardRef.current);
  }

  return () => observer.disconnect();
}, [videoSrc]);
```

3. **Video Compression:**

```bash
# Use efficient formats
# H.264 for broad compatibility
ffmpeg -i input.mp4 -c:v libx264 -crf 23 -preset slow output.mp4

# WebM for modern browsers
ffmpeg -i input.mp4 -c:v libvpx-vp9 -crf 30 output.webm

# Serve multiple formats
```

```html
<video>
  <source src="video.webm" type="video/webm" />
  <source src="video.mp4" type="video/mp4" />
</video>
```

4. **Limit Concurrent Video Playback:**

```typescript
// Pause other videos when one starts
const handleMouseEnter = () => {
  // Pause all other videos first
  document.querySelectorAll('video').forEach(v => {
    if (v !== videoRef.current) {
      v.pause();
    }
  });

  videoRef.current?.play();
};
```

5. **GPU Acceleration:**

```css
.video-card {
  will-change: transform;
  backface-visibility: hidden;
  transform: translate3d(0, 0, 0);
}
```

6. **Aspect Ratio for Layout Stability:**

```css
/* Prevents layout shift when video loads */
.video-container {
  aspect-ratio: 16 / 9;
}
```

### Video Asset Recommendations

**Optimal Specifications:**
- **Duration:** 5-10 seconds (loop seamlessly)
- **Resolution:** 1920x1080 (1080p) maximum
- **Frame Rate:** 30fps (60fps for smooth motion)
- **Bitrate:** 2-5 Mbps (balance quality/size)
- **Format:** MP4 (H.264) primary, WebM (VP9) fallback
- **File Size:** Under 2MB per video ideal, 5MB maximum

**Content Guidelines:**
- Loop-friendly (start and end frames match)
- No audio track (remove for smaller size)
- High motion areas (showcase project dynamics)
- Clear subject focus (recognizable at small size)

### Recommendation

**For Ambient Project: Use Approach 2 (React State) + Approach 4 (Progressive Enhancement)**

**Why:**
- Full control over video playback for analytics
- Respects user preferences (reduced motion)
- Good accessibility and SEO
- Easy to debug and maintain
- Balances sophistication with practicality

**Implementation Strategy:**
1. Start with Approach 1 (CSS-only) for proof of concept
2. Enhance with Approach 2 (React state management)
3. Add progressive enhancement checks (Approach 4)
4. Optimize video assets (compression, lazy loading)
5. Add intersection observer for viewport-based loading

---

## 4. Additional Design Patterns

### Color Scheme

**Primary Palette:**
- Hot Pink: `#FE0048` / `rgb(254, 0, 72)`
- Purple: `#AC0BD9` / `rgb(172, 11, 217)`
- Orange: `#FE802D` / `rgb(254, 128, 45)`

**Gradients:**
```css
.gradient-primary {
  background: linear-gradient(45deg, #fe802d 0%, #fe0048 55%, #ac0bd9 100%);
}

.gradient-radial {
  background: radial-gradient(circle, rgba(254,1,104,0.6) 0%, rgba(254,1,104,0) 70%);
}
```

**Usage:**
- Hero backgrounds
- CTA buttons
- Accent elements
- Animated text

**Tailwind Config:**

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        brand: {
          pink: '#FE0048',
          purple: '#AC0BD9',
          orange: '#FE802D',
        },
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(45deg, #fe802d 0%, #fe0048 55%, #ac0bd9 100%)',
      },
    },
  },
};
```

---

### Typography

**Font Family:** Matter-TRIAL (custom, likely commercial)

**Alternatives for Ambient:**
- **Inter** (free, excellent readability)
- **Manrope** (free, geometric sans-serif)
- **Space Grotesk** (free, modern aesthetic)

**Type Scale:**

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      fontSize: {
        'display': ['5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'h1': ['3.5rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        'h2': ['2.5rem', { lineHeight: '1.3' }],
        'h3': ['1.875rem', { lineHeight: '1.4' }],
        'body': ['1rem', { lineHeight: '1.6' }],
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
};
```

---

### Animations & Transitions

**Key Principles:**
- **Duration:** 300ms for quick UI feedback, 800ms for dramatic reveals
- **Easing:** `ease-out` for natural deceleration
- **Stagger:** Multiple properties with different durations create depth

**Common Patterns:**

```typescript
// Tailwind classes
"transition-all duration-300 ease-out" // Quick feedback
"transition-all duration-800 ease-out" // Dramatic reveal

// Custom timing
"transition-[opacity_0.3s,transform_0.8s,filter_0.8s]"
```

**Framer Motion Variants:**

```typescript
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: 'easeOut' },
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.4, ease: 'easeOut' },
};

const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};
```

---

### Glassmorphism Effects

**Technique:**

```css
.glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
```

**Tailwind Implementation:**

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      backdropBlur: {
        xs: '2px',
      },
    },
  },
};
```

```tsx
<div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
  Glassmorphism content
</div>
```

---

### Scroll Animations

**Pin Scrolling (Sequential Reveals):**

```typescript
// Using Framer Motion's useScroll
import { useScroll, useTransform, motion } from 'framer-motion';

export function PinScrollSection() {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.8, 1, 1, 0.8]);

  return (
    <motion.section
      style={{ opacity, scale }}
      className="h-screen flex items-center justify-center"
    >
      <h2 className="text-6xl font-bold">Pinned Content</h2>
    </motion.section>
  );
}
```

---

### Navigation Patterns

**Characteristics:**
- Fixed header with logo and minimal nav items
- Smooth scroll to anchors
- Mobile hamburger menu
- Scroll-triggered hide/show

**Implementation:**

```tsx
// components/Navigation.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import Link from 'next/link';

export function Navigation() {
  const [hidden, setHidden] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const previous = scrollY.getPrevious();
    if (latest > previous && latest > 150) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

  return (
    <motion.nav
      variants={{
        visible: { y: 0 },
        hidden: { y: '-100%' },
      }}
      animate={hidden ? 'hidden' : 'visible'}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="text-2xl font-bold">
            Ambient
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="#work" className="hover:text-brand-pink transition-colors">
              Work
            </Link>
            <Link href="#about" className="hover:text-brand-pink transition-colors">
              About
            </Link>
            <Link href="#contact" className="hover:text-brand-pink transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
```

---

## 5. Implementation Architecture for Ambient

### Project Structure

```
website/
├── app/
│   ├── layout.tsx                 # Root layout with cursor
│   ├── page.tsx                   # Homepage
│   └── projects/
│       └── [slug]/page.tsx        # Individual project pages
├── components/
│   ├── cursor/
│   │   ├── CustomCursor.tsx       # Main cursor component
│   │   └── useCursor.ts           # Cursor state management
│   ├── hero/
│   │   ├── LiquidHero.tsx         # Hero with gradient
│   │   ├── FramerLiquid.tsx       # Framer Motion blobs
│   │   └── LiquidCanvas.tsx       # Canvas version (optional)
│   ├── portfolio/
│   │   ├── VideoCard.tsx          # Portfolio card component
│   │   └── PortfolioGrid.tsx      # Grid layout
│   ├── navigation/
│   │   └── Navigation.tsx         # Header navigation
│   └── ui/
│       └── ...                    # Shadcn components
├── lib/
│   ├── utils.ts                   # cn() and utilities
│   └── constants.ts               # Colors, LED ranges, etc.
└── public/
    ├── videos/                    # Project preview videos
    └── images/                    # Posters and assets
```

---

### Development Phases

**Phase 1: Foundation (Week 1)**
1. Set up Next.js 16 + React 19 + TypeScript
2. Configure Tailwind CSS 4 + Framer Motion
3. Implement base layout and navigation
4. Set up custom cursor (Approach 1 + 3)

**Phase 2: Hero Section (Week 1-2)**
5. Implement Framer Motion liquid gradient (Approach 4)
6. Add CSS fallback gradient (Approach 1)
7. Test performance and optimize
8. Add scroll indicators and hero content

**Phase 3: Portfolio Section (Week 2)**
9. Build VideoCard component (Approach 2)
10. Add progressive enhancement (Approach 4)
11. Implement grid layout with responsive design
12. Add intersection observer for lazy loading

**Phase 4: Polish & Optimization (Week 3)**
13. Add scroll animations throughout
14. Implement remaining page sections
15. Optimize video assets and compression
16. Test accessibility and performance
17. Add analytics and error tracking

---

### Code Quality Checklist

**Performance:**
- [ ] Videos lazy-load with Intersection Observer
- [ ] Custom cursor hidden on touch devices
- [ ] Respects `prefers-reduced-motion`
- [ ] GPU-accelerated transforms
- [ ] Throttled mousemove events
- [ ] Optimized video compression (<2MB per file)

**Accessibility:**
- [ ] Keyboard navigation works
- [ ] Focus states visible
- [ ] ARIA labels on interactive elements
- [ ] Alt text on all images
- [ ] Color contrast meets WCAG AA
- [ ] Screen reader tested

**Browser Support:**
- [ ] Chrome/Edge (last 2 versions)
- [ ] Firefox (last 2 versions)
- [ ] Safari (last 2 versions)
- [ ] Mobile Safari (iOS 14+)
- [ ] Chrome Android (last version)

**Testing:**
- [ ] Unit tests for utilities
- [ ] Playwright tests for interactions
- [ ] Visual regression tests
- [ ] Performance budget met (<3s FCP)
- [ ] Lighthouse score >90

---

## 6. Potential Challenges & Solutions

### Challenge 1: Video Autoplay Blocked

**Problem:** Browsers block autoplay with sound to prevent annoying users.

**Solution:**
- Always use `muted` attribute
- Add `playsInline` for iOS
- Handle play() promise rejections
- Provide fallback UI if blocked

```typescript
const handlePlay = async () => {
  try {
    await videoRef.current?.play();
  } catch (error) {
    console.warn('Autoplay blocked:', error);
    // Show fallback or user-initiated play button
  }
};
```

---

### Challenge 2: Custom Cursor Performance on Low-End Devices

**Problem:** Tracking every mousemove event can cause janky performance.

**Solution:**
- Throttle mousemove events (16ms / 60fps)
- Use CSS transforms (not left/top)
- Add will-change strategically
- Hide on touch devices

```typescript
import { throttle } from 'lodash-es';

const handleMouseMove = throttle((e: MouseEvent) => {
  cursorX.set(e.clientX);
  cursorY.set(e.clientY);
}, 16); // ~60fps
```

---

### Challenge 3: Large Video Files Slow Initial Load

**Problem:** Many videos on one page = large payload = slow load time.

**Solution:**
- Compress videos aggressively (target <2MB)
- Use Intersection Observer (load when visible)
- Preload metadata only, not entire video
- Consider poster images as fallback

```html
<video preload="metadata" poster="poster.jpg">
  <source src="video-compressed.mp4" type="video/mp4" />
</video>
```

---

### Challenge 4: mix-blend-mode Doesn't Work on All Elements

**Problem:** `mix-blend-mode` requires specific stacking context, may not work with certain layouts.

**Solution:**
- Use fixed positioning for cursor layer
- Ensure high z-index (9999)
- Don't apply to isolated stacking contexts
- Test on various backgrounds

```css
.cursor-layer {
  position: fixed;
  z-index: 9999;
  mix-blend-mode: exclusion;
  isolation: isolate; /* Create stacking context */
}
```

---

### Challenge 5: Gradient Animation Doesn't Feel "Liquid"

**Problem:** Pure CSS gradients feel mechanical, not organic.

**Solution:**
- Use multiple overlapping blobs with different timings
- Add blur filters for soft edges
- Use Framer Motion for physics-based movement
- Consider simplex noise for true liquid feel (Canvas/WebGL)

---

## 7. Key Takeaways

### What Makes This Site Work

1. **Cohesive Motion Design:** Every animation has purpose and consistent timing
2. **Performance First:** Heavy use of GPU acceleration and lazy loading
3. **Attention to Detail:** Staggered transitions create depth (300ms vs 800ms)
4. **Progressive Enhancement:** Works on all devices, enhanced on capable ones
5. **Brand Consistency:** Colors, typography, and motion reinforce brand identity

### What to Replicate for Ambient

1. **Custom Cursor:** Creates immediate "this is different" impression
2. **Liquid Gradients:** Dynamic, energetic feeling perfect for creative portfolio
3. **Video Hover Cards:** Shows project work dynamically without page load
4. **Smooth Animations:** Framer Motion physics make interactions feel premium
5. **Bold Color Palette:** Memorable brand colors with high contrast

### What to Avoid

1. **Over-animation:** Too much motion becomes fatiguing
2. **Forced Creativity:** Custom cursor doesn't work for all contexts
3. **Heavy Payloads:** Videos must be compressed, lazy-loaded
4. **Ignoring Accessibility:** Always respect `prefers-reduced-motion`
5. **Browser Assumptions:** Test on real devices, not just desktop Chrome

---

## 8. Recommended Technology Stack

### For Ambient Website

**Core Framework:**
- Next.js 16 (App Router)
- React 19 (Server Components where possible)
- TypeScript (strict mode)

**Styling:**
- Tailwind CSS 4
- Framer Motion (animations)
- CSS mix-blend-mode (cursor effect)

**Performance:**
- Intersection Observer API (lazy loading)
- Next.js Image & Video optimization
- Vercel Analytics (performance monitoring)

**Testing:**
- Playwright (E2E interactions)
- Vitest (unit tests)
- Axe (accessibility testing)

**Hosting:**
- Vercel (optimal Next.js performance)
- Cloudflare R2 or Vercel Blob (video hosting)

---

## 9. Estimated Implementation Time

**For Experienced Developer:**

| Feature | Time Estimate |
|---------|---------------|
| Custom Cursor | 4-6 hours |
| Liquid Gradient Hero | 6-8 hours |
| Video Portfolio Cards | 8-10 hours |
| Navigation & Layout | 4-6 hours |
| Additional Animations | 6-8 hours |
| Testing & Optimization | 8-12 hours |
| **Total** | **36-50 hours** |

**For Team (Developer + Designer):**

| Phase | Time Estimate |
|-------|---------------|
| Phase 1: Foundation | 1 week |
| Phase 2: Hero Section | 3-4 days |
| Phase 3: Portfolio | 4-5 days |
| Phase 4: Polish | 1 week |
| **Total** | **3-4 weeks** |

---

## 10. Final Recommendations

### Immediate Next Steps

1. **Prototype Custom Cursor First**
   - Quick to implement
   - High impact on first impression
   - Tests technical feasibility

2. **Start with CSS Gradient**
   - Simplest approach
   - Works immediately
   - Can enhance later

3. **Build One Video Card**
   - Perfect component
   - Test video optimization
   - Validate approach before scale

### Long-Term Strategy

1. **Start Simple, Enhance Progressively**
   - Launch with CSS/simple JS
   - Add Framer Motion polish
   - Reserve Canvas/WebGL for v2

2. **Measure Performance Religiously**
   - Set performance budget (<3s FCP)
   - Monitor real user metrics
   - Optimize before adding features

3. **User Test Early**
   - Validate custom cursor doesn't confuse
   - Ensure video hover is discoverable
   - Check accessibility with real users

---

## Conclusion

The CB Website Design site demonstrates how thoughtful micro-interactions and performance optimization create memorable user experiences. For the Ambient project, the recommended approach is:

1. **Custom Cursor:** Framer Motion + mix-blend-mode (Approaches 1 + 3)
2. **Liquid Gradient:** Framer Motion blobs + CSS fallback (Approaches 4 + 1)
3. **Video Cards:** React state + progressive enhancement (Approaches 2 + 4)

This combination provides:
- Excellent visual impact
- Good performance
- Maintainable codebase
- Accessibility compliance
- No unnecessary dependencies

**Estimated time:** 3-4 weeks for full implementation with testing and optimization.

**Key success metric:** Site should feel "smooth" and "premium" without sacrificing performance or accessibility.

---

**Document created:** 2025-11-21
**For project:** Ambient
**Target stack:** Next.js 16 + React 19 + TypeScript + Tailwind CSS 4 + Framer Motion
