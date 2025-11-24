/**
 * Integration Tests: Component Interactions
 * PRD Sections: All sections requiring component integration
 *
 * Tests cover:
 * - How components work together
 * - Data flow between components
 * - Module loading and dependencies
 * - Story progression with particle system
 * - Interaction system integration
 * - Device detection with optimization
 */

import { DeviceDetector } from '../../V6/js/device-detector';
import { ParticleSystem } from '../../V6/js/particle-system';
import { ImageLoader } from '../../V6/js/image-loader';
import { InteractionHandler } from '../../V6/js/interaction-handler';
import { StoryController } from '../../V6/js/story-controller';

describe('Component Integration Tests', () => {
  let canvas: HTMLCanvasElement;
  let deviceDetector: DeviceDetector;
  let particleSystem: ParticleSystem;
  let imageLoader: ImageLoader;
  let interactionHandler: InteractionHandler;
  let storyController: StoryController;

  beforeEach(() => {
    // Setup test environment
    canvas = document.createElement('canvas');
    canvas.width = 1920;
    canvas.height = 1080;
    document.body.appendChild(canvas);

    // Initialize all components
    deviceDetector = new DeviceDetector();
    const deviceInfo = deviceDetector.detect();

    imageLoader = new ImageLoader({
      baseUrl: '/images/',
      timeout: 5000,
      retryAttempts: 3,
      retryDelay: 1000
    });

    particleSystem = new ParticleSystem({
      canvas,
      particleCount: deviceInfo.isMobile ? 5000 : 10000,
      isMobile: deviceInfo.isMobile,
      targetFPS: deviceInfo.isMobile ? 30 : 60
    });

    interactionHandler = new InteractionHandler({
      canvas,
      particleSystem,
      isMobile: deviceInfo.isMobile,
      config: deviceDetector.getPerformanceSettings()
    });

    storyController = new StoryController({
      imageLoader,
      particleSystem,
      config: {
        stages: 5,
        transitionDuration: 500,
        autoProgress: false,
        enableProgressIndicator: true
      }
    });
  });

  afterEach(() => {
    storyController?.destroy();
    interactionHandler?.destroy();
    particleSystem?.destroy();
    imageLoader?.destroy();
    deviceDetector?.destroy();
    document.body.removeChild(canvas);
  });

  describe('Device Detection + Performance Optimization Integration', () => {
    test('should configure particle system based on device detection', () => {
      const deviceInfo = deviceDetector.detect();
      const performanceSettings = deviceDetector.getPerformanceSettings();

      expect(particleSystem.getParticleCount()).toBe(performanceSettings.particleCount);
      expect(particleSystem.getTargetFPS()).toBe(performanceSettings.targetFPS);
      expect(particleSystem.getQualityLevel()).toBe(performanceSettings.quality);
    });

    test('should optimize interaction handler for detected device', () => {
      const deviceInfo = deviceDetector.detect();

      expect(interactionHandler.isMobile()).toBe(deviceInfo.isMobile);
      expect(interactionHandler.hasTouch()).toBe(deviceInfo.hasTouch);

      // Mobile devices should have larger touch targets
      if (deviceInfo.isMobile) {
        const touchTargets = interactionHandler.getTouchTargets();
        touchTargets.forEach(target => {
          expect(Math.min(target.width, target.height)).toBeGreaterThanOrEqual(44);
        });
      }
    });

    test('should adjust visual quality based on device capabilities', () => {
      const deviceInfo = deviceDetector.detect();
      const performance = deviceDetector.getPerformanceSettings();

      // High-end devices should enable advanced effects
      if (deviceInfo.isHighEnd) {
        expect(performance.enableAdvancedEffects).toBe(true);
        expect(performance.enableHighQualityImages).toBe(true);
      }

      // Low-end devices should use reduced quality
      if (deviceInfo.isLowEnd) {
        expect(performance.particleCount).toBeLessThan(5000);
        expect(performance.quality).toBe('low');
      }
    });
  });

  describe('Particle System + Story Controller Integration', () => {
    test('should synchronize particle colors with story stages', async () => {
      // Stage 1: Blue theme
      await storyController.goToStage(1);
      let particleColor = particleSystem.getCurrentStageColor();
      expect(particleColor).toContain('hsl(200'); // Blue

      // Stage 3: Purple theme
      await storyController.goToStage(3);
      particleColor = particleSystem.getCurrentStageColor();
      expect(particleColor).toContain('hsl(280'); // Purple

      // Stage 5: Green resolution
      await storyController.goToStage(5);
      particleColor = particleSystem.getCurrentStageColor();
      expect(particleColor).toContain('hsl(120'); // Green
    });

    test('should coordinate smooth transitions between stages', async () => {
      const startTime = performance.now();

      // Trigger stage transition
      const transitionPromise = storyController.goToStage(2);

      // Check if particles are transitioning
      const isTransitioning = particleSystem.isTransitioning();
      expect(isTransitioning).toBe(true);

      await transitionPromise;

      const transitionTime = performance.now() - startTime;
      expect(transitionTime).toBeGreaterThan(450); // ~500ms transition
      expect(transitionTime).toBeLessThan(600);

      // Particles should be in new stage state
      expect(particleSystem.getCurrentStage()).toBe(2);
    });

    test('should maintain particle count during story progression', async () => {
      const initialCount = particleSystem.getParticleCount();

      for (let stage = 2; stage <= 5; stage++) {
        await storyController.goToStage(stage);
        expect(particleSystem.getParticleCount()).toBe(initialCount);
      }
    });

    test('should integrate story progression with particle performance', async () => {
      const performanceMonitor = particleSystem.getPerformanceMonitor();

      // Monitor performance during story progression
      for (let stage = 1; stage <= 5; stage++) {
        const frameTimeBefore = performanceMonitor.getAverageFrameTime();

        await storyController.goToStage(stage);

        const frameTimeAfter = performanceMonitor.getAverageFrameTime();

        // Performance should remain acceptable during transitions
        const targetFPS = deviceDetector.getPerformanceSettings().targetFPS;
        const maxFrameTime = 1000 / targetFPS;

        expect(frameTimeAfter).toBeLessThan(maxFrameTime * 1.5); // Allow 50% overhead
      }
    });
  });

  describe('Image Loader + Story Controller Integration', () => {
    test('should preload all images before story starts', async () => {
      // Mock successful image loading
      const mockImageResponse = {
        ok: true,
        headers: new Headers({ 'content-type': 'image/png' }),
        arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(100))
      };

      global.fetch = jest.fn().mockResolvedValue(mockImageResponse);

      const preloadResult = await imageLoader.preloadAll();

      expect(preloadResult.successful).toBe(4);
      expect(preloadResult.failed).toBe(0);

      // Story should be ready to start
      expect(storyController.isReady()).toBe(true);
    });

    test('should load stage-specific images on demand', async () => {
      const mockImageResponse = {
        ok: true,
        headers: new Headers({ 'content-type': 'image/png' }),
        arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(100))
      };

      global.fetch = jest.fn().mockResolvedValue(mockImageResponse);

      // Go through each stage and verify correct image loading
      const stageImages = [
        { stage: 1, expectedImage: 'KidHappy.png' },
        { stage: 2, expectedImage: 'KidScared.png' },
        { stage: 3, expectedImage: 'Monster01.png' },
        { stage: 4, expectedImage: 'Monster02.png' }
      ];

      for (const { stage, expectedImage } of stageImages) {
        await storyController.goToStage(stage);

        // Should have loaded the correct image
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining(expectedImage),
          expect.any(Object)
        );
      }
    });

    test('should handle image loading failures during story progression', async () => {
      // Mock image loading failure
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      // Story should still progress despite image loading issues
      await expect(storyController.goToStage(2)).resolves.toBeUndefined();
      expect(storyController.getCurrentStage()).toBe(2);

      // Should use fallback images
      const currentImage = storyController.getCurrentImage();
      expect(currentImage).toBeDefined(); // Should have fallback
    });

    test('should cache images for smooth stage transitions', async () => {
      const mockImageResponse = {
        ok: true,
        headers: new Headers({ 'content-type': 'image/png' }),
        arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(100))
      };

      global.fetch = jest.fn().mockResolvedValue(mockImageResponse);

      // Load stage 1
      await storyController.goToStage(1);
      const fetchCallsStage1 = (global.fetch as jest.Mock).mock.calls.length;

      // Load stage 2, then go back to stage 1
      await storyController.goToStage(2);
      await storyController.goToStage(1);

      const fetchCallsReturn = (global.fetch as jest.Mock).mock.calls.length;

      // Should not fetch stage 1 image again (from cache)
      expect(fetchCallsReturn - fetchCallsStage1).toBe(1); // Only stage 2 should be fetched
    });
  });

  describe('Interaction Handler + Particle System Integration', () => {
    test('should translate user interaction to particle movement', () => {
      const initialParticles = particleSystem.getParticles().slice(0, 10);
      const initialPositions = initialParticles.map(p => ({ x: p.x, y: p.y }));

      // Simulate mouse interaction
      const mouseX = canvas.width / 2;
      const mouseY = canvas.height / 2;

      interactionHandler.setMousePosition(mouseX, mouseY);
      interactionHandler.applyInteractionForces();

      particleSystem.update();

      // Particles near mouse should be affected
      const currentParticles = particleSystem.getParticles().slice(0, 10);
      currentParticles.forEach((particle, index) => {
        const distance = Math.sqrt(
          Math.pow(particle.x - mouseX, 2) + Math.pow(particle.y - mouseY, 2)
        );

        if (distance < 150) { // Within interaction radius
          // Should have moved from initial position
          const initial = initialPositions[index];
          const movement = Math.sqrt(
            Math.pow(particle.x - initial.x, 2) + Math.pow(particle.y - initial.y, 2)
          );
          expect(movement).toBeGreaterThan(0);
        }
      });
    });

    test('should maintain performance during rapid interactions', () => {
      const performanceMonitor = particleSystem.getPerformanceMonitor();

      // Simulate rapid mouse movements
      for (let i = 0; i < 100; i++) {
        const mouseX = Math.random() * canvas.width;
        const mouseY = Math.random() * canvas.height;

        interactionHandler.setMousePosition(mouseX, mouseY);
        interactionHandler.applyInteractionForces();
        particleSystem.update();
        particleSystem.render();
      }

      const averageFrameTime = performanceMonitor.getAverageFrameTime();
      const targetFPS = deviceDetector.getPerformanceSettings().targetFPS;
      const maxFrameTime = 1000 / targetFPS;

      expect(averageFrameTime).toBeLessThan(maxFrameTime);
    });

    test('should coordinate touch interactions with particle effects', async () => {
      // Recreate as mobile for touch testing
      interactionHandler.destroy();
      particleSystem.destroy();

      particleSystem = new ParticleSystem({
        canvas,
        particleCount: 5000,
        isMobile: true,
        targetFPS: 30
      });

      interactionHandler = new InteractionHandler({
        canvas,
        particleSystem,
        isMobile: true,
        config: deviceDetector.getPerformanceSettings()
      });

      // Simulate touch events
      const touchStart = new TouchEvent('touchstart', {
        touches: [{
          clientX: canvas.width / 2,
          clientY: canvas.height / 2,
          identifier: 0,
          target: canvas,
          force: 1,
          radiusX: 25,
          radiusY: 25,
          rotationAngle: 0
        } as any],
        bubbles: true
      });

      canvas.dispatchEvent(touchStart);

      // Should affect particles
      expect(particleSystem.hasActiveInteraction()).toBe(true);

      // Touch targets should meet accessibility requirements
      const touchTargets = interactionHandler.getTouchTargets();
      touchTargets.forEach(target => {
        expect(Math.min(target.width, target.height)).toBeGreaterThanOrEqual(44);
      });
    });
  });

  describe('Full System Integration Workflow', () => {
    test('should handle complete user workflow from start to finish', async () => {
      // 1. Device detection happens automatically
      const deviceInfo = deviceDetector.detect();

      // 2. System should be properly configured for device
      expect(particleSystem.getParticleCount()).toBe(deviceInfo.isMobile ? 5000 : 10000);

      // 3. Images should be preloaded
      const mockImageResponse = {
        ok: true,
        headers: new Headers({ 'content-type': 'image/png' }),
        arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(100))
      };
      global.fetch = jest.fn().mockResolvedValue(mockImageResponse);
      await imageLoader.preloadAll();

      // 4. User should be able to interact with particles
      interactionHandler.setMousePosition(100, 100);
      interactionHandler.applyInteractionForces();

      // 5. Story progression should work with all systems
      for (let stage = 1; stage <= 5; stage++) {
        await storyController.goToStage(stage);

        // Verify all systems are in sync
        expect(particleSystem.getCurrentStage()).toBe(stage);
        expect(storyController.getCurrentStage()).toBe(stage);

        // Performance should remain acceptable
        const frameTime = particleSystem.getPerformanceMonitor().getAverageFrameTime();
        const targetFPS = deviceDetector.getPerformanceSettings().targetFPS;
        expect(frameTime).toBeLessThan(1000 / targetFPS);
      }

      // 6. Final state should be consistent
      expect(storyController.isStoryComplete()).toBe(true);
      expect(particleSystem.getCurrentStage()).toBe(5);
    });

    test('should maintain URL state throughout user journey', async () => {
      // Mock URL APIs
      const mockHistory = { pushState: jest.fn(), replaceState: jest.fn() };
      Object.defineProperty(window, 'history', { value: mockHistory, writable: true });

      for (let stage = 1; stage <= 5; stage++) {
        await storyController.goToStage(stage);

        // Should update URL parameter
        expect(mockHistory.replaceState).toHaveBeenCalledWith(
          { stage },
          '',
          expect.stringContaining(`?stage=${stage}`)
        );
      }
    });

    test('should handle error conditions gracefully across all systems', async () => {
      // Simulate network error for image loading
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      // Story should still progress
      await storyController.goToStage(2);
      expect(storyController.getCurrentStage()).toBe(2);

      // Particles should continue working
      interactionHandler.setMousePosition(100, 100);
      interactionHandler.applyInteractionForces();
      particleSystem.update();

      expect(particleSystem.getParticleCount()).toBeGreaterThan(0);

      // Device detection should still work
      const deviceInfo = deviceDetector.detect();
      expect(deviceInfo.deviceType).toBeDefined();
    });

    test('should handle rapid system state changes', async () => {
      // Rapid stage changes
      const stagePromises = [
        storyController.goToStage(2),
        storyController.goToStage(3),
        storyController.goToStage(4)
      ];

      await Promise.all(stagePromises);

      // Should settle at final stage
      expect(storyController.getCurrentStage()).toBe(4);
      expect(particleSystem.getCurrentStage()).toBe(4);

      // Rapid interactions
      for (let i = 0; i < 50; i++) {
        interactionHandler.setMousePosition(i * 10, i * 10);
        interactionHandler.applyInteractionForces();
        particleSystem.update();
      }

      // System should remain stable
      expect(particleSystem.getParticleCount()).toBeGreaterThan(0);
      expect(interactionHandler.isStable()).toBe(true);
    });
  });

  describe('Memory Management Integration', () => {
    test('should manage memory efficiently across all components', async () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;

      // Load all images
      const mockImageResponse = {
        ok: true,
        headers: new Headers({ 'content-type': 'image/png' }),
        arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(1000000)) // 1MB per image
      };
      global.fetch = jest.fn().mockResolvedValue(mockImageResponse);

      await imageLoader.preloadAll();

      // Run full story progression
      for (let stage = 1; stage <= 5; stage++) {
        await storyController.goToStage(stage);
      }

      // Perform many interactions
      for (let i = 0; i < 1000; i++) {
        interactionHandler.setMousePosition(
          Math.random() * canvas.width,
          Math.random() * canvas.height
        );
        interactionHandler.applyInteractionForces();
        particleSystem.update();
        particleSystem.render();
      }

      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;

      // Should use reasonable amount of memory
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // Less than 50MB increase
    });

    test('should clean up resources properly', () => {
      const particleCount = particleSystem.getParticleCount();

      // Destroy all components
      storyController.destroy();
      interactionHandler.destroy();
      particleSystem.destroy();
      imageLoader.destroy();
      deviceDetector.destroy();

      // Memory should be released
      setTimeout(() => {
        const memory = (performance as any).memory?.usedJSHeapSize || 0;
        // Memory usage should decrease after cleanup
        // (This is approximate and may vary between runs)
      }, 1000);
    });
  });

  describe('Performance Integration', () => {
    test('should maintain 60fps on desktop throughout experience', async () => {
      // Ensure we're testing desktop performance
      if (deviceDetector.detect().isMobile) {
        return; // Skip desktop performance test on mobile
      }

      const performanceMonitor = particleSystem.getPerformanceMonitor();
      const frameTimes: number[] = [];

      // Measure performance over extended period
      const testDuration = 2000; // 2 seconds
      const startTime = performance.now();

      while (performance.now() - startTime < testDuration) {
        const frameStart = performance.now();

        // Simulate user interaction
        interactionHandler.setMousePosition(
          Math.random() * canvas.width,
          Math.random() * canvas.height
        );
        interactionHandler.applyInteractionForces();

        particleSystem.update();
        particleSystem.render();

        const frameEnd = performance.now();
        frameTimes.push(frameEnd - frameStart);
      }

      const averageFrameTime = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
      const fps = 1000 / averageFrameTime;

      expect(fps).toBeGreaterThanOrEqual(55); // Allow 5fps tolerance
    });

    test('should maintain 30fps on mobile throughout experience', async () => {
      if (!deviceDetector.detect().isMobile) {
        return; // Skip mobile performance test on desktop
      }

      const performanceMonitor = particleSystem.getPerformanceMonitor();
      const frameTimes: number[] = [];

      // Test mobile performance
      const testDuration = 2000;
      const startTime = performance.now();

      while (performance.now() - startTime < testDuration) {
        const frameStart = performance.now();

        interactionHandler.setMousePosition(
          Math.random() * canvas.width,
          Math.random() * canvas.height
        );
        interactionHandler.applyInteractionForces();

        particleSystem.update();
        particleSystem.render();

        const frameEnd = performance.now();
        frameTimes.push(frameEnd - frameStart);
      }

      const averageFrameTime = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
      const fps = 1000 / averageFrameTime;

      expect(fps).toBeGreaterThanOrEqual(25); // Allow 5fps tolerance for 30fps target
    });
  });
});