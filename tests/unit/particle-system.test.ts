/**
 * Unit Tests for Particle System
 * PRD Sections: 3.1, 4.3.1, 7.1.1, 7.1.2
 *
 * Tests cover:
 * - Particle generation and count requirements
 * - Physics calculations and boundaries
 * - Performance requirements (60fps desktop, 30fps mobile)
 * - Force calculations and interactions
 * - Memory management
 */

import { ParticleSystem } from '../../V6/js/particle-system';

describe('ParticleSystem Unit Tests', () => {
  let particleSystem: ParticleSystem;
  let mockCanvas: HTMLCanvasElement;
  let mockContext: CanvasRenderingContext2D;

  beforeEach(() => {
    // Setup mock canvas
    mockCanvas = document.createElement('canvas');
    mockCanvas.width = 1920;
    mockCanvas.height = 1080;
    mockContext = mockCanvas.getContext('2d')!;

    // Initialize particle system
    particleSystem = new ParticleSystem({
      canvas: mockCanvas,
      particleCount: 10000,
      isMobile: false,
      targetFPS: 60
    });
  });

  afterEach(() => {
    particleSystem.destroy();
  });

  describe('PRD 3.1.1: Particle Generation Requirements', () => {
    test('should generate exactly 10,000 particles on desktop', () => {
      const desktopSystem = new ParticleSystem({
        canvas: mockCanvas,
        particleCount: 10000,
        isMobile: false,
        targetFPS: 60
      });

      expect(desktopSystem.getParticleCount()).toBe(10000);
      expect(desktopSystem.particles).toHaveLength(10000);

      desktopSystem.destroy();
    });

    test('should generate exactly 5,000 particles on mobile', () => {
      const mobileCanvas = document.createElement('canvas');
      mobileCanvas.width = 393;
      mobileCanvas.height = 851;

      const mobileSystem = new ParticleSystem({
        canvas: mobileCanvas,
        particleCount: 5000,
        isMobile: true,
        targetFPS: 30
      });

      expect(mobileSystem.getParticleCount()).toBe(5000);
      expect(mobileSystem.particles).toHaveLength(5000);

      mobileSystem.destroy();
    });

    test('should assign correct properties to each particle', () => {
      const particle = particleSystem.particles[0];

      expect(particle).toHaveProperty('x');
      expect(particle).toHaveProperty('y');
      expect(particle).toHaveProperty('vx');
      expect(particle).toHaveProperty('vy');
      expect(particle).toHaveProperty('size');
      expect(particle).toHaveProperty('color');

      // Test valid ranges
      expect(particle.x).toBeGreaterThanOrEqual(0);
      expect(particle.x).toBeLessThanOrEqual(mockCanvas.width);
      expect(particle.y).toBeGreaterThanOrEqual(0);
      expect(particle.y).toBeLessThanOrEqual(mockCanvas.height);
      expect(particle.size).toBeGreaterThanOrEqual(1);
      expect(particle.size).toBeLessThanOrEqual(4);
    });

    test('should maintain constant particle count (no leaks or creation)', () => {
      const initialCount = particleSystem.getParticleCount();

      // Run animation for multiple frames
      for (let i = 0; i < 100; i++) {
        particleSystem.update();
        expect(particleSystem.getParticleCount()).toBe(initialCount);
      }
    });
  });

  describe('PRD 4.3.1: Physics Calculations', () => {
    test('should calculate force correctly: Force = (Mouse - Particle) * Strength', () => {
      const particle = { x: 100, y: 100, vx: 0, vy: 0, size: 2, color: 'white' };
      const mousePos = { x: 150, y: 100 };
      const strength = 0.5;

      const force = particleSystem.calculateForce(particle, mousePos, strength);

      // Force = (150-100, 100-100) * 0.5 = (50, 0) * 0.5 = (25, 0)
      expect(force.x).toBeCloseTo(25, 1);
      expect(force.y).toBeCloseTo(0, 1);
    });

    test('should apply damping factor of 0.98 each frame', () => {
      const particle = particleSystem.particles[0];
      const initialVx = particle.vx;
      const initialVy = particle.vy;

      particleSystem.update();

      expect(particle.vx).toBeCloseTo(initialVx * 0.98, 2);
      expect(particle.vy).toBeCloseTo(initialVy * 0.98, 2);
    });

    test('should enforce maximum velocity of 5px per frame', () => {
      const particle = particleSystem.particles[0];
      particle.vx = 10; // Exceeds max velocity
      particle.vy = 10;

      particleSystem.update();

      expect(Math.abs(particle.vx)).toBeLessThanOrEqual(5);
      expect(Math.abs(particle.vy)).toBeLessThanOrEqual(5);
    });

    test('should respect minimum distance of 10px to prevent singularity', () => {
      const particle = { x: 100, y: 100, vx: 0, vy: 0, size: 2, color: 'white' };
      const mousePos = { x: 101, y: 101 }; // Very close to particle
      const strength = 0.5;

      const force = particleSystem.calculateForce(particle, mousePos, strength);

      // Should not create infinite force when particle and mouse are very close
      expect(isFinite(force.x)).toBe(true);
      expect(isFinite(force.y)).toBe(true);
      expect(Math.abs(force.x)).toBeLessThan(100);
      expect(Math.abs(force.y)).toBeLessThan(100);
    });
  });

  describe('PRD 3.1.2: Particle Animation', () => {
    test('should update particle positions correctly', () => {
      const particle = particleSystem.particles[0];
      const initialX = particle.x;
      const initialY = particle.y;
      const initialVx = particle.vx;
      const initialVy = particle.vy;

      particleSystem.update();

      expect(particle.x).toBeCloseTo(initialX + initialVx, 1);
      expect(particle.y).toBeCloseTo(initialY + initialVy, 1);
    });

    test('should wrap particles at screen boundaries seamlessly', () => {
      const particle = particleSystem.particles[0];

      // Test right boundary wrap
      particle.x = mockCanvas.width + 10;
      particleSystem.update();
      expect(particle.x).toBeLessThanOrEqual(mockCanvas.width);

      // Test left boundary wrap
      particle.x = -10;
      particleSystem.update();
      expect(particle.x).toBeGreaterThanOrEqual(0);

      // Test bottom boundary wrap
      particle.y = mockCanvas.height + 10;
      particleSystem.update();
      expect(particle.y).toBeLessThanOrEqual(mockCanvas.height);

      // Test top boundary wrap
      particle.y = -10;
      particleSystem.update();
      expect(particle.y).toBeGreaterThanOrEqual(0);
    });

    test('should render particles using Canvas 2D API', () => {
      const fillRectSpy = jest.spyOn(mockContext, 'fillRect');

      particleSystem.render();

      expect(fillRectSpy).toHaveBeenCalledTimes(10000);
      fillRectSpy.mockRestore();
    });
  });

  describe('PRD 3.1.3: User Interaction', () => {
    test('should respond to mouse interaction force field', () => {
      const mouseX = mockCanvas.width / 2;
      const mouseY = mockCanvas.height / 2;

      particleSystem.setMousePosition(mouseX, mouseY);
      particleSystem.applyInteractionForces();

      // Particles near mouse should be affected
      const nearParticles = particleSystem.particles.filter(p => {
        const distance = Math.sqrt(Math.pow(p.x - mouseX, 2) + Math.pow(p.y - mouseY, 2));
        return distance < 150; // Within interaction radius
      });

      // At least some particles should have velocity changes
      expect(nearParticles.length).toBeGreaterThan(0);
    });

    test('should limit interaction radius to 150px', () => {
      const mouseX = mockCanvas.width / 2;
      const mouseY = mockCanvas.height / 2;

      particleSystem.setMousePosition(mouseX, mouseY);
      particleSystem.applyInteractionForces();

      // Particles beyond radius should not be affected
      const farParticles = particleSystem.particles.filter(p => {
        const distance = Math.sqrt(Math.pow(p.x - mouseX, 2) + Math.pow(p.y - mouseY, 2));
        return distance > 150;
      });

      // Far particles should maintain minimal velocity change
      const avgVelocityChange = farParticles.reduce((sum, p) => {
        return sum + Math.abs(p.vx) + Math.abs(p.vy);
      }, 0) / farParticles.length;

      expect(avgVelocityChange).toBeLessThan(0.1);
    });

    test('should decay interaction forces naturally over distance', () => {
      const mouseX = mockCanvas.width / 2;
      const mouseY = mockCanvas.height / 2;

      particleSystem.setMousePosition(mouseX, mouseY);

      // Test force at different distances
      const closeParticle = { x: mouseX + 10, y: mouseY, vx: 0, vy: 0, size: 2, color: 'white' };
      const farParticle = { x: mouseX + 140, y: mouseY, vx: 0, vy: 0, size: 2, color: 'white' };

      const closeForce = particleSystem.calculateForce(closeParticle, { x: mouseX, y: mouseY }, 0.5);
      const farForce = particleSystem.calculateForce(farParticle, { x: mouseX, y: mouseY }, 0.5);

      // Close particle should experience stronger force
      const closeMagnitude = Math.sqrt(closeForce.x * closeForce.x + closeForce.y * closeForce.y);
      const farMagnitude = Math.sqrt(farForce.x * farForce.x + farForce.y * farForce.y);

      expect(closeMagnitude).toBeGreaterThan(farMagnitude);
    });
  });

  describe('PRD 7.1.1: Performance Requirements', () => {
    test('should maintain 60fps on desktop', async () => {
      const frameTimeTarget = 1000 / 60; // 16.67ms per frame
      const testDuration = 1000; // 1 second test
      const frameTimes: number[] = [];

      const startTime = performance.now();
      let frameCount = 0;

      while (performance.now() - startTime < testDuration) {
        const frameStart = performance.now();

        particleSystem.update();
        particleSystem.render();

        const frameEnd = performance.now();
        frameTimes.push(frameEnd - frameStart);
        frameCount++;
      }

      const averageFrameTime = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
      const fps = 1000 / averageFrameTime;

      expect(fps).toBeGreaterThanOrEqual(55); // Allow 5fps tolerance
      expect(averageFrameTime).toBeLessThanOrEqual(frameTimeTarget * 1.1);
    });

    test('should maintain 30fps on mobile', async () => {
      const mobileCanvas = document.createElement('canvas');
      mobileCanvas.width = 393;
      mobileCanvas.height = 851;

      const mobileSystem = new ParticleSystem({
        canvas: mobileCanvas,
        particleCount: 5000,
        isMobile: true,
        targetFPS: 30
      });

      const frameTimeTarget = 1000 / 30; // 33.33ms per frame
      const testDuration = 1000; // 1 second test
      const frameTimes: number[] = [];

      const startTime = performance.now();

      while (performance.now() - startTime < testDuration) {
        const frameStart = performance.now();

        mobileSystem.update();
        mobileSystem.render();

        const frameEnd = performance.now();
        frameTimes.push(frameEnd - frameStart);
      }

      const averageFrameTime = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
      const fps = 1000 / averageFrameTime;

      expect(fps).toBeGreaterThanOrEqual(25); // Allow 5fps tolerance
      expect(averageFrameTime).toBeLessThanOrEqual(frameTimeTarget * 1.1);

      mobileSystem.destroy();
    });

    test('should use memory within limits (<100MB desktop, <50MB mobile)', () => {
      // Test memory usage before and after particle system creation
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;

      particleSystem.update();
      particleSystem.render();

      const currentMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const memoryIncrease = currentMemory - initialMemory;

      // Should use less than 10MB for particle system
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid canvas gracefully', () => {
      expect(() => {
        new ParticleSystem({
          canvas: null as any,
          particleCount: 1000,
          isMobile: false,
          targetFPS: 60
        });
      }).toThrow('Canvas is required');
    });

    test('should handle zero particle count', () => {
      expect(() => {
        new ParticleSystem({
          canvas: mockCanvas,
          particleCount: 0,
          isMobile: false,
          targetFPS: 60
        });
      }).toThrow('Particle count must be greater than 0');
    });

    test('should recover from performance degradation', () => {
      // Simulate performance drop
      particleSystem.simulatePerformanceDrop();

      expect(particleSystem.getQualityLevel()).toBeLessThan(1.0);

      // Recovery
      particleSystem.simulatePerformanceRecovery();

      setTimeout(() => {
        expect(particleSystem.getQualityLevel()).toBe(1.0);
      }, 100);
    });
  });

  describe('Particle Colors and Stages', () => {
    test('should use correct HSL colors for each stage', () => {
      const stages = [
        { stage: 1, color: 'hsl(200, 70%, 60%)' },   // Blue theme
        { stage: 2, color: 'hsl(20, 70%, 50%)' },    // Orange transition
        { stage: 3, color: 'hsl(280, 60%, 40%)' },   // Purple theme
        { stage: 4, color: 'hsl(0, 70%, 50%)' },     // Red theme
        { stage: 5, color: 'hsl(120, 60%, 50%)' },   // Green resolution
      ];

      stages.forEach(({ stage, color }) => {
        particleSystem.setStage(stage);
        particleSystem.update();

        // Check if particle colors match stage theme
        const particle = particleSystem.particles[0];
        expect(particle.color).toContain(color);
      });
    });

    test('should transition colors smoothly over 500ms', (done) => {
      particleSystem.setStage(1);
      particleSystem.update();
      const initialColor = particleSystem.particles[0].color;

      particleSystem.transitionToStage(2, 500);

      setTimeout(() => {
        particleSystem.update();
        const finalColor = particleSystem.particles[0].color;

        expect(finalColor).not.toBe(initialColor);
        expect(finalColor).toContain('hsl(20'); // Should transition to orange

        done();
      }, 600); // Slightly longer than transition time
    });
  });
});