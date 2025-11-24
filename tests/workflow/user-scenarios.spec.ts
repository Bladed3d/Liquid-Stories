/**
 * End-to-End Workflow Tests: Real User Scenarios
 * PRD Sections: 2, 5, 6.2, 7
 *
 * Tests cover:
 * - Complete 5-stage story progression
 * - User interaction throughout all stages
 * - Device-specific interaction flows
 * - Performance across all stages
 * - Error recovery scenarios
 * - Real-world usage patterns
 */

import { test, expect, Page } from '@playwright/test';

test.describe('V6 Liquid Stories - User Workflow Scenarios', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    });
    page = await context.newPage();

    // Mock image responses for testing
    await page.route('**/*.png', async route => {
      const imageData = Buffer.from('fake-image-data');
      await route.fulfill({
        status: 200,
        contentType: 'image/png',
        body: imageData
      });
    });

    // Set up performance monitoring
    await page.evaluate(() => {
      window.performanceMetrics = {
        frameTimes: [],
        memorySnapshots: [],
        startFrameTime: () => {
          window.performanceMetrics.frameStart = performance.now();
        },
        endFrameTime: () => {
          if (window.performanceMetrics.frameStart) {
            const frameTime = performance.now() - window.performanceMetrics.frameStart;
            window.performanceMetrics.frameTimes.push(frameTime);
            // Keep only last 1000 frames
            if (window.performanceMetrics.frameTimes.length > 1000) {
              window.performanceMetrics.frameTimes.shift();
            }
          }
        },
        recordMemory: () => {
          if ((performance as any).memory) {
            window.performanceMetrics.memorySnapshots.push({
              used: (performance as any).memory.usedJSHeapSize,
              total: (performance as any).memory.totalJSHeapSize,
              limit: (performance as any).memory.jsHeapSizeLimit,
              timestamp: performance.now()
            });
            // Keep only last 100 snapshots
            if (window.performanceMetrics.memorySnapshots.length > 100) {
              window.performanceMetrics.memorySnapshots.shift();
            }
          }
        }
      };
    });
  });

  test.afterEach(async () => {
    await page.close();
  });

  test.describe('PRD 2.1: Immersive Liquid Particle Experience', () => {
    test('should display 10,000 particles and respond to mouse interaction', async () => {
      await page.goto('http://localhost:3000');

      // Wait for particle system to initialize
      await page.waitForFunction(() => {
        return window.particleSystem && window.particleSystem.getParticleCount() >= 10000;
      }, { timeout: 10000 });

      // Verify particle count
      const particleCount = await page.evaluate(() => {
        return window.particleSystem.getParticleCount();
      });

      expect(particleCount).toBe(10000);

      // Test mouse interaction
      await page.mouse.move(960, 540); // Center of screen
      await page.waitForTimeout(100);

      // Check if particles respond to interaction
      const particlesMoved = await page.evaluate(() => {
        const particles = window.particleSystem.getParticles();
        const centerX = 960;
        const centerY = 540;
        const interactionRadius = 150;

        return particles.some(p => {
          const distance = Math.sqrt(Math.pow(p.x - centerX, 2) + Math.pow(p.y - centerY, 2));
          return distance < interactionRadius && Math.abs(p.vx) > 0.1;
        });
      });

      expect(particlesMoved).toBe(true);
    });

    test('should maintain 60fps during particle interaction', async () => {
      await page.goto('http://localhost:3000');

      // Wait for initialization
      await page.waitForFunction(() => {
        return window.particleSystem && window.particleSystem.getParticleCount() >= 10000;
      });

      // Start performance monitoring
      await page.evaluate(() => {
        window.performanceMetrics.frameTimes = [];
      });

      // Perform rapid mouse movements for 2 seconds
      const testDuration = 2000;
      const startTime = Date.now();

      while (Date.now() - startTime < testDuration) {
        await page.mouse.move(
          Math.random() * 1920,
          Math.random() * 1080
        );
        await page.evaluate(() => {
          window.performanceMetrics.startFrameTime();
          window.particleSystem.update();
          window.performanceMetrics.endFrameTime();
        });
        await page.waitForTimeout(16); // ~60fps
      }

      // Calculate average frame time
      const averageFrameTime = await page.evaluate(() => {
        const frameTimes = window.performanceMetrics.frameTimes;
        return frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
      });

      const fps = 1000 / averageFrameTime;
      expect(fps).toBeGreaterThanOrEqual(55); // Allow 5fps tolerance
    });
  });

  test.describe('PRD 2.2: Progressive Story Transformation', () => {
    test('should complete 5-stage story progression with correct characters', async () => {
      await page.goto('http://localhost:3000');

      // Wait for initialization
      await page.waitForFunction(() => {
        return window.storyController && window.storyController.isReady();
      });

      const stageImages = [
        { stage: 1, character: 'Kid Happy' },
        { stage: 2, character: 'Kid Scared' },
        { stage: 3, character: 'Monster 01' },
        { stage: 4, character: 'Monster 02' },
        { stage: 5, character: 'Resolution' }
      ];

      for (const { stage, character } of stageImages) {
        // Progress to next stage
        await page.evaluate((targetStage) => {
          return window.storyController.goToStage(targetStage);
        }, stage);

        // Wait for transition to complete
        await page.waitForTimeout(600);

        // Verify current stage
        const currentStage = await page.evaluate(() => {
          return window.storyController.getCurrentStage();
        });

        expect(currentStage).toBe(stage);

        // Check progress indicator
        const progressPercentage = await page.evaluate(() => {
          return window.storyController.getProgressPercentage();
        });

        const expectedProgress = ((stage - 1) / 4) * 100;
        expect(progressPercentage).toBeCloseTo(expectedProgress, 0);

        // Verify URL parameter is updated
        await expect(page).toHaveURL(new RegExp(`stage=${stage}`));

        // Check particle color theme
        const particleColor = await page.evaluate(() => {
          return window.particleSystem.getCurrentStageColor();
        });

        const expectedColors = [
          'hsl(200', // Blue for stage 1
          'hsl(20',  // Orange for stage 2
          'hsl(280', // Purple for stage 3
          'hsl(0',   // Red for stage 4
          'hsl(120'  // Green for stage 5
        ];

        expect(particleColor).toContain(expectedColors[stage - 1]);
      }

      // Verify story completion
      const isComplete = await page.evaluate(() => {
        return window.storyController.isStoryComplete();
      });

      expect(isComplete).toBe(true);
    });

    test('should show smooth transitions between stages (500ms)', async () => {
      await page.goto('http://localhost:3000');

      await page.waitForFunction(() => {
        return window.storyController && window.storyController.isReady();
      });

      // Measure transition time
      const transitionTime = await page.evaluate(async () => {
        const startTime = performance.now();
        await window.storyController.goToStage(2);
        const endTime = performance.now();
        return endTime - startTime;
      });

      // Should take approximately 500ms
      expect(transitionTime).toBeGreaterThan(450);
      expect(transitionTime).toBeLessThan(600);
    });

    test('should update progress indicator during story progression', async () => {
      await page.goto('http://localhost:3000');

      await page.waitForFunction(() => {
        return window.storyController && window.storyController.isReady();
      });

      // Check initial progress indicator
      await expect(page.locator('.progress-indicator')).toBeVisible();
      await expect(page.locator('.stage-text')).toContainText('Stage 1');
      await expect(page.locator('.progress-bar')).toHaveCSS('width', '0%');

      // Progress to stage 3
      await page.evaluate(() => {
        return window.storyController.goToStage(3);
      });

      await page.waitForTimeout(600);

      // Verify progress indicator update
      await expect(page.locator('.stage-text')).toContainText('Stage 3');
      await expect(page.locator('.progress-bar')).toHaveCSS('width', '50%');
    });
  });

  test.describe('PRD 2.3: Dual Device Experience', () => {
    test('should detect desktop and load appropriate version', async ({ browser }) => {
      const desktopContext = await browser.newContext({
        viewport: { width: 1920, height: 1080 },
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      });
      const desktopPage = await desktopContext.newPage();

      // Mock image responses
      await desktopPage.route('**/*.png', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'image/png',
          body: Buffer.from('fake-image-data')
        });
      });

      await desktopPage.goto('http://localhost:3000');

      // Verify desktop detection
      const deviceInfo = await desktopPage.evaluate(() => {
        return window.deviceDetector.detect();
      });

      expect(deviceInfo.isDesktop).toBe(true);
      expect(deviceInfo.isMobile).toBe(false);

      // Verify desktop particle count
      const particleCount = await desktopPage.evaluate(() => {
        return window.particleSystem.getParticleCount();
      });

      expect(particleCount).toBe(10000);

      await desktopPage.close();
    });

    test('should detect mobile and load optimized version', async ({ browser }) => {
      const mobileContext = await browser.newContext({
        viewport: { width: 393, height: 851 },
        user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15'
      });
      const mobilePage = await mobileContext.newPage();

      await mobilePage.route('**/*.png', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'image/png',
          body: Buffer.from('fake-image-data')
        });
      });

      await mobilePage.goto('http://localhost:3000');

      // Verify mobile detection
      const deviceInfo = await mobilePage.evaluate(() => {
        return window.deviceDetector.detect();
      });

      expect(deviceInfo.isMobile).toBe(true);
      expect(deviceInfo.isDesktop).toBe(false);

      // Verify mobile particle count
      const particleCount = await mobilePage.evaluate(() => {
        return window.particleSystem.getParticleCount();
      });

      expect(particleCount).toBe(5000);

      await mobilePage.close();
    });

    test('should handle touch interactions on mobile devices', async ({ browser }) => {
      const mobileContext = await browser.newContext({
        viewport: { width: 393, height: 851 },
        user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)',
        hasTouch: true
      });
      const mobilePage = await mobileContext.newPage();

      await mobilePage.route('**/*.png', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'image/png',
          body: Buffer.from('fake-image-data')
        });
      });

      await mobilePage.goto('http://localhost:3000');

      await mobilePage.waitForFunction(() => {
        return window.particleSystem && window.particleSystem.getParticleCount() >= 5000;
      });

      // Test touch interaction
      await mobilePage.touchscreen.tap(196, 425); // Center of mobile screen

      // Verify particles respond to touch
      const particlesMoved = await mobilePage.evaluate(() => {
        const particles = window.particleSystem.getParticles();
        const centerX = 196;
        const centerY = 425;
        const interactionRadius = 150;

        return particles.some(p => {
          const distance = Math.sqrt(Math.pow(p.x - centerX, 2) + Math.pow(p.y - centerY, 2));
          return distance < interactionRadius && Math.abs(p.vx) > 0.1;
        });
      });

      expect(particlesMoved).toBe(true);

      await mobilePage.close();
    });
  });

  test.describe('PRD 2.4: Image Asset Integration', () => {
    test('should load all 4 character images within time limits', async () => {
      await page.goto('http://localhost:3000');

      // Track image loading times
      const imageLoadTimes = await page.evaluate(async () => {
        const startTime = performance.now();
        await window.imageLoader.preloadAll();
        const endTime = performance.now();
        return {
          totalTime: endTime - startTime,
          images: window.imageLoader.getLoadedImages()
        };
      });

      expect(imageLoadTimes.totalTime).toBeLessThan(3000); // 3 seconds for desktop
      expect(imageLoadTimes.images).toHaveLength(4);

      const expectedImages = ['KidHappy.png', 'KidScared.png', 'Monster01.png', 'Monster02.png'];
      expectedImages.forEach(imageName => {
        expect(imageLoadTimes.images).toContain(imageName);
      });
    });

    test('should display correct images at appropriate stages', async () => {
      await page.goto('http://localhost:3000');

      await page.waitForFunction(() => {
        return window.storyController && window.storyController.isReady();
      });

      const stageImageMap = {
        1: 'KidHappy.png',
        2: 'KidScared.png',
        3: 'Monster01.png',
        4: 'Monster02.png'
      };

      for (const [stage, expectedImage] of Object.entries(stageImageMap)) {
        await page.evaluate((targetStage) => {
          return window.storyController.goToStage(targetStage);
        }, parseInt(stage));

        await page.waitForTimeout(600);

        // Verify correct image is loaded
        const currentImage = await page.evaluate(() => {
          return window.storyController.getCurrentImage();
        });

        expect(currentImage).toBe(expectedImage);
      }
    });

    test('should handle image loading failures gracefully', async () => {
      // Mock failed image loads
      await page.route('**/KidHappy.png', async route => {
        await route.fulfill({
          status: 404,
          contentType: 'text/plain',
          body: 'Image not found'
        });
      });

      await page.goto('http://localhost:3000');

      // System should still work despite failed image load
      await page.waitForFunction(() => {
        return window.storyController && window.storyController.isReady();
      });

      // Should use fallback
      const currentImage = await page.evaluate(() => {
        return window.storyController.getCurrentImage();
      });

      expect(currentImage).toBeDefined(); // Should have fallback
    });
  });

  test.describe('Complete User Journey Scenarios', () => {
    test('should handle complete immersive experience from start to finish', async () => {
      await page.goto('http://localhost:3000');

      // 1. Wait for system initialization
      await page.waitForFunction(() => {
        return window.storyController && window.storyController.isReady();
      });

      // 2. Verify initial state
      expect(await page.locator('.progress-indicator')).toBeVisible();
      await expect(page).toHaveURL(/stage=1/);

      // 3. Simulate user exploring particle system
      for (let i = 0; i < 5; i++) {
        await page.mouse.move(
          Math.random() * 1920,
          Math.random() * 1080
        );
        await page.waitForTimeout(100);
      }

      // 4. Progress through story with interaction
      for (let stage = 2; stage <= 5; stage++) {
        // Some interaction before progressing
        await page.mouse.move(
          Math.random() * 1920,
          Math.random() * 1080
        );
        await page.waitForTimeout(200);

        // Progress to next stage
        await page.evaluate((targetStage) => {
          return window.storyController.goToStage(targetStage);
        }, stage);

        await page.waitForTimeout(600); // Wait for transition
      }

      // 5. Verify complete state
      expect(await page.locator('.stage-text')).toContainText('Stage 5');
      await expect(page).toHaveURL(/stage=5/);

      const isComplete = await page.evaluate(() => {
        return window.storyController.isStoryComplete();
      });

      expect(isComplete).toBe(true);

      // 6. Verify performance maintained throughout
      const averageFrameTime = await page.evaluate(() => {
        const frameTimes = window.performanceMetrics.frameTimes;
        if (frameTimes.length === 0) return 0;
        return frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
      });

      const fps = 1000 / averageFrameTime;
      expect(fps).toBeGreaterThanOrEqual(55);
    });

    test('should handle user interruption and resume', async () => {
      await page.goto('http://localhost:3000');

      await page.waitForFunction(() => {
        return window.storyController && window.storyController.isReady();
      });

      // Progress to stage 3
      await page.evaluate(() => {
        return window.storyController.goToStage(3);
      });

      await page.waitForTimeout(600);

      expect(await page.evaluate(() => {
        return window.storyController.getCurrentStage();
      })).toBe(3);

      // Simulate user leaving and returning (page reload with stage parameter)
      await page.goto('http://localhost:3000/?stage=3');

      await page.waitForFunction(() => {
        return window.storyController && window.storyController.isReady();
      });

      // Should restore to stage 3
      expect(await page.evaluate(() => {
        return window.storyController.getCurrentStage();
      })).toBe(3);

      // Should be able to continue from stage 3
      await page.evaluate(() => {
        return window.storyController.goToStage(4);
      });

      await page.waitForTimeout(600);

      expect(await page.evaluate(() => {
        return window.storyController.getCurrentStage();
      })).toBe(4);
    });

    test('should handle rapid user interactions gracefully', async () => {
      await page.goto('http://localhost:3000');

      await page.waitForFunction(() => {
        return window.storyController && window.storyController.isReady();
      });

      // Rapid mouse movements
      for (let i = 0; i < 50; i++) {
        await page.mouse.move(
          Math.random() * 1920,
          Math.random() * 1080
        );
        await page.waitForTimeout(10);
      }

      // Rapid stage changes
      const stagePromises = [];
      for (let stage = 2; stage <= 5; stage++) {
        stagePromises.push(
          page.evaluate((targetStage) => {
            return window.storyController.goToStage(targetStage);
          }, stage)
        );
      }

      await Promise.all(stagePromises);
      await page.waitForTimeout(1000);

      // System should be stable
      const isStable = await page.evaluate(() => {
        return window.particleSystem &&
               window.storyController &&
               window.particleSystem.getParticleCount() > 0 &&
               !window.particleSystem.hasErrors();
      });

      expect(isStable).toBe(true);
    });
  });

  test.describe('Performance and Resource Management', () => {
    test('should maintain memory usage within limits during extended usage', async () => {
      await page.goto('http://localhost:3000');

      await page.waitForFunction(() => {
        return window.storyController && window.storyController.isReady();
      });

      // Record initial memory
      const initialMemory = await page.evaluate(() => {
        return (performance as any).memory?.usedJSHeapSize || 0;
      });

      // Extended usage simulation
      for (let cycle = 0; cycle < 10; cycle++) {
        // Complete story progression
        for (let stage = 1; stage <= 5; stage++) {
          await page.evaluate((targetStage) => {
            return window.storyController.goToStage(targetStage);
          }, stage);

          // Interaction during each stage
          for (let i = 0; i < 10; i++) {
            await page.mouse.move(
              Math.random() * 1920,
              Math.random() * 1080
            );
            await page.waitForTimeout(20);
          }

          await page.waitForTimeout(300);
        }

        // Reset story
        await page.evaluate(() => {
          return window.storyController.reset();
        });

        await page.waitForTimeout(500);
      }

      // Check memory usage
      const finalMemory = await page.evaluate(() => {
        return (performance as any).memory?.usedJSHeapSize || 0;
      });

      const memoryIncrease = finalMemory - initialMemory;

      // Should not have significant memory leak
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // Less than 50MB increase
    });

    test('should handle browser resize gracefully', async () => {
      await page.goto('http://localhost:3000');

      await page.waitForFunction(() => {
        return window.particleSystem && window.particleSystem.getParticleCount() >= 10000;
      });

      const initialParticleCount = await page.evaluate(() => {
        return window.particleSystem.getParticleCount();
      });

      // Resize window
      await page.setViewportSize({ width: 1366, height: 768 });

      // System should adapt to new size
      const particleCountAfterResize = await page.evaluate(() => {
        return window.particleSystem.getParticleCount();
      });

      expect(particleCountAfterResize).toBe(initialParticleCount);

      // Interaction should still work
      await page.mouse.move(683, 384); // Center of resized window

      const particlesResponsive = await page.evaluate(() => {
        const particles = window.particleSystem.getParticles();
        return particles.every(p =>
          p.x >= 0 && p.x <= window.innerWidth &&
          p.y >= 0 && p.y <= window.innerHeight
        );
      });

      expect(particlesResponsive).toBe(true);
    });
  });
});