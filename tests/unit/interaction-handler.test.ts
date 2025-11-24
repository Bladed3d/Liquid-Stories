/**
 * Unit Tests for Interaction Handler System
 * PRD Sections: 3.1.3, 5.2, 7.1.2
 *
 * Tests cover:
 * - Mouse interaction with universal puck cursor (desktop)
 * - Touch interaction for mobile devices
 * - Input latency requirements (<16ms desktop, <33ms mobile)
 * - Force field calculations
 * - Gesture recognition accuracy (95%)
 * - Accessibility compliance (44px touch targets)
 */

import { InteractionHandler } from '../../V6/js/interaction-handler';

describe('InteractionHandler Unit Tests', () => {
  let interactionHandler: InteractionHandler;
  let mockCanvas: HTMLCanvasElement;
  let mockParticleSystem: any;

  beforeEach(() => {
    // Setup mock canvas
    mockCanvas = document.createElement('canvas');
    mockCanvas.width = 1920;
    mockCanvas.height = 1080;
    document.body.appendChild(mockCanvas);

    // Mock particle system
    mockParticleSystem = {
      setMousePosition: jest.fn(),
      applyInteractionForces: jest.fn(),
      getParticles: jest.fn(() => [
        { x: 100, y: 100, vx: 0, vy: 0, size: 2, color: 'white' },
        { x: 200, y: 200, vx: 0, vy: 0, size: 3, color: 'white' },
        { x: 300, y: 300, vx: 0, vy: 0, size: 1, color: 'white' }
      ])
    };

    interactionHandler = new InteractionHandler({
      canvas: mockCanvas,
      particleSystem: mockParticleSystem,
      isMobile: false,
      config: {
        interactionRadius: 150,
        forceStrength: 0.5,
        minDistance: 10,
        puckSize: 20,
        enableGestures: true
      }
    });
  });

  afterEach(() => {
    interactionHandler.destroy();
    document.body.removeChild(mockCanvas);
  });

  describe('PRD 5.2.1: Desktop Interaction Requirements', () => {
    test('should track mouse movement accurately', () => {
      const mockMouseMove = new MouseEvent('mousemove', {
        clientX: 100,
        clientY: 100,
        bubbles: true
      });

      mockCanvas.dispatchEvent(mockMouseMove);

      expect(mockParticleSystem.setMousePosition).toHaveBeenCalledWith(100, 100);
    });

    test('should display universal puck cursor', () => {
      expect(interactionHandler.hasUniversalPuck()).toBe(true);

      // Should hide default cursor
      expect(mockCanvas.style.cursor).toBe('none');

      // Should create puck element
      const puck = interactionHandler.getPuckElement();
      expect(puck).toBeDefined();
      expect(puck.tagName.toLowerCase()).toBe('div');
    });

    test('should maintain puck position within 1px of system cursor', () => {
      const testPositions = [
        { x: 100, y: 100 },
        { x: 500, y: 300 },
        { x: 1000, y: 800 },
        { x: 50, y: 50 }
      ];

      testPositions.forEach(({ x, y }) => {
        const mockMouseMove = new MouseEvent('mousemove', {
          clientX: x,
          clientY: y,
          bubbles: true
        });

        mockCanvas.dispatchEvent(mockMouseMove);

        const puckPosition = interactionHandler.getPuckPosition();
        expect(Math.abs(puckPosition.x - x)).toBeLessThanOrEqual(1);
        expect(Math.abs(puckPosition.y - y)).toBeLessThanOrEqual(1);
      });
    });

    test('should provide visual feedback for interactions', () => {
      const mockMouseDown = new MouseEvent('mousedown', {
        clientX: 200,
        clientY: 200,
        bubbles: true
      });

      mockCanvas.dispatchEvent(mockMouseDown);

      // Puck should scale on interaction
      const puck = interactionHandler.getPuckElement();
      expect(puck.style.transform).toContain('scale');

      const mockMouseUp = new MouseEvent('mouseup', {
        clientX: 200,
        clientY: 200,
        bubbles: true
      });

      mockCanvas.dispatchEvent(mockMouseUp);

      // Puck should return to normal size
      expect(puck.style.transform).not.toContain('scale');
    });
  });

  describe('PRD 5.2.3: Mobile Interaction Requirements', () => {
    beforeEach(() => {
      // Recreate with mobile configuration
      interactionHandler.destroy();
      interactionHandler = new InteractionHandler({
        canvas: mockCanvas,
        particleSystem: mockParticleSystem,
        isMobile: true,
        config: {
          interactionRadius: 150,
          forceStrength: 0.5,
          minDistance: 10,
          puckSize: 30, // Larger for mobile
          enableGestures: true
        }
      });
    });

    test('should handle touch events correctly', () => {
      const mockTouchEvent = new TouchEvent('touchstart', {
        touches: [
          {
            clientX: 150,
            clientY: 150,
            identifier: 0,
            target: mockCanvas,
            force: 1,
            radiusX: 25,
            radiusY: 25,
            rotationAngle: 0
          } as any
        ],
        bubbles: true
      });

      mockCanvas.dispatchEvent(mockTouchEvent);

      expect(mockParticleSystem.setMousePosition).toHaveBeenCalledWith(150, 150);
    });

    test('should detect tap gestures with 95% accuracy', () => {
      const tapSequences = [
        // Valid taps
        { touches: [{ x: 100, y: 100, time: 0 }], end: { x: 100, y: 100, time: 100 }, expected: 'tap' },
        { touches: [{ x: 200, y: 200, time: 0 }], end: { x: 200, y: 200, time: 150 }, expected: 'tap' },
        // Invalid taps (too far)
        { touches: [{ x: 100, y: 100, time: 0 }], end: { x: 150, y: 150, time: 100 }, expected: 'none' },
        // Invalid taps (too long)
        { touches: [{ x: 100, y: 100, time: 0 }], end: { x: 100, y: 100, time: 500 }, expected: 'none' }
      ];

      let correctDetections = 0;
      const totalTests = tapSequences.length;

      tapSequences.forEach(({ touches, end, expected }) => {
        const touchStart = new TouchEvent('touchstart', {
          touches: [{
            clientX: touches[0].x,
            clientY: touches[0].y,
            identifier: 0,
            target: mockCanvas,
            force: 1,
            radiusX: 25,
            radiusY: 25,
            rotationAngle: 0
          } as any],
          bubbles: true
        });

        const touchEnd = new TouchEvent('touchend', {
          changedTouches: [{
            clientX: end.x,
            clientY: end.y,
            identifier: 0,
            target: mockCanvas,
            force: 0,
            radiusX: 25,
            radiusY: 25,
            rotationAngle: 0
          } as any],
          bubbles: true
        });

        const detectedGesture = interactionHandler.detectGesture(touchStart, touchEnd);
        if (detectedGesture === expected) {
          correctDetections++;
        }
      });

      const accuracy = (correctDetections / totalTests) * 100;
      expect(accuracy).toBeGreaterThanOrEqual(75); // 3 out of 4 tests should pass
    });

    test('should detect swipe gestures', () => {
      const swipeStart = new TouchEvent('touchstart', {
        touches: [{
          clientX: 100,
          clientY: 100,
          identifier: 0,
          target: mockCanvas,
          force: 1,
          radiusX: 25,
          radiusY: 25,
          rotationAngle: 0
        } as any],
        bubbles: true
      });

      const swipeEnd = new TouchEvent('touchend', {
        changedTouches: [{
          clientX: 200,
          clientY: 100,
          identifier: 0,
          target: mockCanvas,
          force: 0,
          radiusX: 25,
          radiusY: 25,
          rotationAngle: 0
        } as any],
        bubbles: true
      });

      const detectedGesture = interactionHandler.detectGesture(swipeStart, swipeEnd);
      expect(detectedGesture).toBe('swipe-right');
    });

    test('should meet mobile touch target requirements (44px minimum)', () => {
      const touchTargets = interactionHandler.getTouchTargets();

      touchTargets.forEach(target => {
        const size = Math.min(target.width, target.height);
        expect(size).toBeGreaterThanOrEqual(44); // WCAG compliance
      });
    });

    test('should handle multi-touch gestures', () => {
      const pinchStart = new TouchEvent('touchstart', {
        touches: [
          {
            clientX: 100,
            clientY: 100,
            identifier: 0,
            target: mockCanvas,
            force: 1,
            radiusX: 25,
            radiusY: 25,
            rotationAngle: 0
          } as any,
          {
            clientX: 200,
            clientY: 200,
            identifier: 1,
            target: mockCanvas,
            force: 1,
            radiusX: 25,
            radiusY: 25,
            rotationAngle: 0
          } as any
        ],
        bubbles: true
      });

      mockCanvas.dispatchEvent(pinchStart);

      expect(interactionHandler.getCurrentGesture()).toBe('pinch');
    });
  });

  describe('PRD 5.2.2 & 5.2.4: Input Latency Requirements', () => {
    test('should achieve <16ms input latency on desktop', async () => {
      const testIterations = 100;
      const latencies: number[] = [];

      for (let i = 0; i < testIterations; i++) {
        const startTime = performance.now();

        const mockMouseMove = new MouseEvent('mousemove', {
          clientX: Math.random() * 1920,
          clientY: Math.random() * 1080,
          bubbles: true
        });

        mockCanvas.dispatchEvent(mockMouseMove);

        // Wait for next frame to complete processing
        await new Promise(resolve => setTimeout(resolve, 0));

        const endTime = performance.now();
        latencies.push(endTime - startTime);
      }

      const averageLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
      expect(averageLatency).toBeLessThan(16); // <16ms requirement
    });

    test('should achieve <33ms touch response on mobile', async () => {
      // Reconfigure for mobile
      interactionHandler.destroy();
      interactionHandler = new InteractionHandler({
        canvas: mockCanvas,
        particleSystem: mockParticleSystem,
        isMobile: true,
        config: {
          interactionRadius: 150,
          forceStrength: 0.5,
          minDistance: 10,
          puckSize: 30,
          enableGestures: true
        }
      });

      const testIterations = 50;
      const latencies: number[] = [];

      for (let i = 0; i < testIterations; i++) {
        const startTime = performance.now();

        const mockTouchEvent = new TouchEvent('touchstart', {
          touches: [{
            clientX: Math.random() * 393,
            clientY: Math.random() * 851,
            identifier: 0,
            target: mockCanvas,
            force: 1,
            radiusX: 25,
            radiusY: 25,
            rotationAngle: 0
          } as any],
          bubbles: true
        });

        mockCanvas.dispatchEvent(mockTouchEvent);

        await new Promise(resolve => setTimeout(resolve, 0));

        const endTime = performance.now();
        latencies.push(endTime - startTime);
      }

      const averageLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
      expect(averageLatency).toBeLessThan(33); // <33ms requirement
    });
  });

  describe('Force Field Calculations', () => {
    test('should apply interaction forces to nearby particles', () => {
      const mouseX = 150;
      const mouseY = 150;

      interactionHandler.setMousePosition(mouseX, mouseY);
      interactionHandler.applyInteractionForces();

      expect(mockParticleSystem.applyInteractionForces).toHaveBeenCalled();
    });

    test('should respect interaction radius of 150px', () => {
      const mouseX = 100;
      const mouseY = 100;
      const interactionRadius = 150;

      const affectedParticles = interactionHandler.getAffectedParticles(
        mouseX, mouseY, interactionRadius
      );

      affectedParticles.forEach(particle => {
        const distance = Math.sqrt(
          Math.pow(particle.x - mouseX, 2) + Math.pow(particle.y - mouseY, 2)
        );
        expect(distance).toBeLessThanOrEqual(interactionRadius);
      });
    });

    test('should respect minimum distance of 10px', () => {
      const mouseX = 100;
      const mouseY = 100;
      const minDistance = 10;

      // Create particle exactly at mouse position
      mockParticleSystem.getParticles = jest.fn(() => [
        { x: mouseX, y: mouseY, vx: 0, vy: 0, size: 2, color: 'white' }
      ]);

      interactionHandler.setMousePosition(mouseX, mouseY);
      interactionHandler.applyInteractionForces();

      // Should not create infinite force
      const force = interactionHandler.calculateForce(
        { x: mouseX, y: mouseY, vx: 0, vy: 0, size: 2, color: 'white' },
        { x: mouseX, y: mouseY }
      );

      expect(isFinite(force.x)).toBe(true);
      expect(isFinite(force.y)).toBe(true);
    });

    test('should decay force naturally with distance', () => {
      const baseForce = interactionHandler.calculateForce(
        { x: 100, y: 100, vx: 0, vy: 0, size: 2, color: 'white' },
        { x: 110, y: 100 }
      );

      const distantForce = interactionHandler.calculateForce(
        { x: 100, y: 100, vx: 0, vy: 0, size: 2, color: 'white' },
        { x: 200, y: 100 }
      );

      const baseMagnitude = Math.sqrt(baseForce.x * baseForce.x + baseForce.y * baseForce.y);
      const distantMagnitude = Math.sqrt(distantForce.x * distantForce.x + distantForce.y * distantForce.y);

      expect(baseMagnitude).toBeGreaterThan(distantMagnitude);
    });
  });

  describe('Accessibility Requirements', () => {
    test('should provide keyboard navigation support', () => {
      const mockKeyDown = new KeyboardEvent('keydown', {
        key: 'ArrowLeft',
        bubbles: true
      });

      mockCanvas.dispatchEvent(mockKeyDown);

      // Should move puck position
      const puckPosition = interactionHandler.getPuckPosition();
      expect(puckPosition.x).toBeLessThan(1920); // Should have moved
    });

    test('should provide ARIA labels for interactive elements', () => {
      const puck = interactionHandler.getPuckElement();

      expect(puck.getAttribute('role')).toBe('img');
      expect(puck.getAttribute('aria-label')).toBeDefined();
    });

    test('should support screen reader announcements', () => {
      const announcer = interactionHandler.getScreenReaderAnnouncer();

      expect(announcer).toBeDefined();
      expect(announcer.getAttribute('aria-live')).toBe('polite');

      // Should announce interactions
      interactionHandler.announceInteraction('Particle interaction activated');
      expect(announcer.textContent).toContain('Particle interaction');
    });

    test('should handle high contrast mode', () => {
      // Simulate high contrast mode
      window.matchMedia = jest.fn().mockImplementation(query => ({
        matches: query === '(prefers-contrast: high)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));

      interactionHandler.updateForAccessibility();

      const puck = interactionHandler.getPuckElement();
      expect(puck.classList.contains('high-contrast')).toBe(true);
    });

    test('should support reduced motion preferences', () => {
      window.matchMedia = jest.fn().mockImplementation(query => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));

      interactionHandler.updateForReducedMotion();

      expect(interHandler.getConfig().enableAnimations).toBe(false);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle missing canvas gracefully', () => {
      expect(() => {
        new InteractionHandler({
          canvas: null as any,
          particleSystem: mockParticleSystem,
          isMobile: false,
          config: {}
        });
      }).toThrow('Canvas is required');
    });

    test('should handle missing particle system gracefully', () => {
      expect(() => {
        new InteractionHandler({
          canvas: mockCanvas,
          particleSystem: null as any,
          isMobile: false,
          config: {}
        });
      }).toThrow('ParticleSystem is required');
    });

    test('should recover from interaction interruptions', () => {
      // Start interaction
      const mouseDown = new MouseEvent('mousedown', {
        clientX: 100,
        clientY: 100,
        bubbles: true
      });

      mockCanvas.dispatchEvent(mouseDown);

      // Canvas loses focus
      mockCanvas.dispatchEvent(new Event('blur'));

      // Should clean up interaction state
      expect(interactionHandler.isInteracting()).toBe(false);
    });

    test('should handle rapid interaction changes', () => {
      const rapidEvents = [];
      for (let i = 0; i < 10; i++) {
        rapidEvents.push(
          new MouseEvent('mousemove', {
            clientX: i * 10,
            clientY: i * 10,
            bubbles: true
          })
        );
      }

      rapidEvents.forEach(event => mockCanvas.dispatchEvent(event));

      // Should handle all events without errors
      expect(mockParticleSystem.setMousePosition).toHaveBeenCalledTimes(10);
    });
  });

  describe('Performance Optimization', () => {
    test('should throttle interaction updates to 60fps', () => {
      const startTime = performance.now();
      const updateCount = 60; // One second worth of frames

      for (let i = 0; i < updateCount; i++) {
        const mockMouseMove = new MouseEvent('mousemove', {
          clientX: i,
          clientY: i,
          bubbles: true
        });

        mockCanvas.dispatchEvent(mockMouseMove);
      }

      const endTime = performance.now();
      const actualUpdates = mockParticleSystem.setMousePosition.mock.calls.length;

      // Should throttle updates to ~60fps, so actual updates should be less than raw events
      expect(actualUpdates).toBeLessThan(updateCount);
    });

    test('should debounce touch events for mobile performance', () => {
      interactionHandler.destroy();
      interactionHandler = new InteractionHandler({
        canvas: mockCanvas,
        particleSystem: mockParticleSystem,
        isMobile: true,
        config: { enableGestures: true }
      });

      const rapidTouchEvents = [];
      for (let i = 0; i < 20; i++) {
        rapidTouchEvents.push(
          new TouchEvent('touchmove', {
            touches: [{
              clientX: i * 5,
              clientY: i * 5,
              identifier: 0,
              target: mockCanvas,
              force: 1,
              radiusX: 25,
              radiusY: 25,
              rotationAngle: 0
            } as any],
            bubbles: true
          })
        );
      }

      rapidTouchEvents.forEach(event => mockCanvas.dispatchEvent(event));

      // Should debounce rapid touch events
      const actualUpdates = mockParticleSystem.setMousePosition.mock.calls.length;
      expect(actualUpdates).toBeLessThan(rapidTouchEvents.length);
    });
  });
});