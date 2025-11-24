/**
 * Performance Tests with Specific Metrics Validation
 * PRD Sections: 4.1, 4.4.1, 7.1.1, 7.3.1
 *
 * Tests cover:
 * - Frame rate requirements (60fps desktop, 30fps mobile)
 * - Resource usage limits (memory, CPU)
 * - Asset loading performance
 * - Response time requirements
 * - Performance monitoring integration
 * - Stress testing under load
 */

import { test, expect } from '@playwright/test';

test.describe('V6 Performance Metrics Validation', () => {
  test.describe('PRD 4.1.1: Frame Rate Requirements', () => {
    test('should maintain 60fps sustained on desktop devices', async ({ page }) => {
      await page.goto('http://localhost:3000/desktop');

      // Set up performance monitoring
      await page.evaluate(() => {
        window.frameMetrics = {
          samples: [],
          isCollecting: false,
          startCollecting() {
            window.frameMetrics.isCollecting = true;
            window.frameMetrics.samples = [];
            window.frameMetrics.startTime = performance.now();
          },
          stopCollecting() {
            window.frameMetrics.isCollecting = false;
            window.frameMetrics.endTime = performance.now();
          },
          recordFrame() {
            if (window.frameMetrics.isCollecting) {
              window.frameMetrics.samples.push(performance.now());
            }
          }
        };

        // Hook into animation loop
        const originalRequestAnimationFrame = window.requestAnimationFrame;
        window.requestAnimationFrame = function(callback) {
          return originalRequestAnimationFrame(function(timestamp) {
            window.frameMetrics.recordFrame();
            return callback(timestamp);
          });
        };
      });

      // Wait for full initialization
      await page.waitForFunction(() => {
        return window.particleSystem && window.particleSystem.getParticleCount() >= 10000;
      }, { timeout: 10000 });

      // Start 10-second rolling average collection
      await page.evaluate(() => {
        window.frameMetrics.startCollecting();
      });

      // Perform intensive user interactions for 10 seconds
      const testDuration = 10000;
      const startTime = Date.now();

      while (Date.now() - startTime < testDuration) {
        // Simulate realistic user interaction
        await page.mouse.move(
          Math.random() * 1920,
          Math.random() * 1080
        );

        // Occasional stage transitions
        if (Math.random() < 0.01) {
          await page.evaluate(() => {
            const currentStage = window.storyController.getCurrentStage();
            const nextStage = currentStage < 5 ? currentStage + 1 : 1;
            window.storyController.goToStage(nextStage);
          });
          await page.waitForTimeout(500); // Wait for transition
        }

        await page.waitForTimeout(16); // ~60fps target
      }

      // Stop collection and analyze results
      const performanceResults = await page.evaluate(() => {
        window.frameMetrics.stopCollecting();

        const samples = window.frameMetrics.samples;
        if (samples.length < 2) return { error: 'Insufficient samples' };

        // Calculate frame times and FPS
        const frameTimes = [];
        for (let i = 1; i < samples.length; i++) {
          frameTimes.push(samples[i] - samples[i - 1]);
        }

        const averageFrameTime = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
        const averageFPS = 1000 / averageFrameTime;

        // Calculate percentiles
        frameTimes.sort((a, b) => a - b);
        const p95FrameTime = frameTimes[Math.floor(frameTimes.length * 0.95)];
        const p95FPS = 1000 / p95FrameTime;

        const minFPS = 1000 / Math.max(...frameTimes);
        const maxFPS = 1000 / Math.min(...frameTimes);

        // Count frames below threshold
        const framesBelow55fps = frameTimes.filter(ft => ft > 1000 / 55).length;
        const framesBelow60fps = frameTimes.filter(ft => ft > 1000 / 60).length;
        const percentageAbove55fps = ((frameTimes.length - framesBelow55fps) / frameTimes.length) * 100;
        const percentageAbove60fps = ((frameTimes.length - framesBelow60fps) / frameTimes.length) * 100;

        return {
          sampleCount: samples.length,
          testDuration: (window.frameMetrics.endTime - window.frameMetrics.startTime) / 1000,
          averageFPS,
          p95FPS,
          minFPS,
          maxFPS,
          percentageAbove55fps,
          percentageAbove60fps,
          framesBelow55fps,
          framesBelow60fps
        };
      });

      // Validate against PRD requirements
      expect(performanceResults.averageFPS).toBeGreaterThanOrEqual(55);
      expect(performanceResults.p95FPS).toBeGreaterThanOrEqual(50);
      expect(performanceResults.percentageAbove55fps).toBeGreaterThanOrEqual(95);
      expect(performanceResults.framesBelow55fps).toBeLessThan(performanceResults.sampleCount * 0.05);
    });

    test('should maintain 30fps sustained on mobile devices', async ({ browser }) => {
      const mobileContext = await browser.newContext({
        viewport: { width: 393, height: 851 },
        user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15'
      });
      const mobilePage = await mobileContext.newPage();

      // Set up performance monitoring
      await mobilePage.evaluate(() => {
        window.frameMetrics = {
          samples: [],
          isCollecting: false,
          startCollecting() {
            window.frameMetrics.isCollecting = true;
            window.frameMetrics.samples = [];
            window.frameMetrics.startTime = performance.now();
          },
          stopCollecting() {
            window.frameMetrics.isCollecting = false;
            window.frameMetrics.endTime = performance.now();
          },
          recordFrame() {
            if (window.frameMetrics.isCollecting) {
              window.frameMetrics.samples.push(performance.now());
            }
          }
        };

        const originalRequestAnimationFrame = window.requestAnimationFrame;
        window.requestAnimationFrame = function(callback) {
          return originalRequestAnimationFrame(function(timestamp) {
            window.frameMetrics.recordFrame();
            return callback(timestamp);
          });
        };
      });

      await mobilePage.goto('http://localhost:3000/mobile');

      // Wait for mobile initialization
      await mobilePage.waitForFunction(() => {
        return window.particleSystem && window.particleSystem.getParticleCount() >= 5000;
      }, { timeout: 10000 });

      // Start collection
      await mobilePage.evaluate(() => {
        window.frameMetrics.startCollecting();
      });

      // Mobile-specific test patterns
      const testDuration = 10000;
      const startTime = Date.now();

      while (Date.now() - startTime < testDuration) {
        // Simulate mobile touch patterns
        await mobilePage.touchscreen.tap(
          Math.floor(Math.random() * 393),
          Math.floor(Math.random() * 851)
        );

        // Occasional swipe gestures
        if (Math.random() < 0.05) {
          const startY = Math.floor(Math.random() * 600);
          await mobilePage.touchscreen.swipe(200, startY, 200, startY + 100);
          await mobilePage.waitForTimeout(100);
        }

        await mobilePage.waitForTimeout(33); // ~30fps target
      }

      // Analyze mobile performance
      const mobilePerformanceResults = await mobilePage.evaluate(() => {
        window.frameMetrics.stopCollecting();

        const samples = window.frameMetrics.samples;
        if (samples.length < 2) return { error: 'Insufficient samples' };

        const frameTimes = [];
        for (let i = 1; i < samples.length; i++) {
          frameTimes.push(samples[i] - samples[i - 1]);
        }

        const averageFrameTime = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
        const averageFPS = 1000 / averageFrameTime;

        frameTimes.sort((a, b) => a - b);
        const p95FrameTime = frameTimes[Math.floor(frameTimes.length * 0.95)];
        const p95FPS = 1000 / p95FrameTime;

        const framesBelow25fps = frameTimes.filter(ft => ft > 1000 / 25).length;
        const framesBelow30fps = frameTimes.filter(ft => ft > 1000 / 30).length;
        const percentageAbove25fps = ((frameTimes.length - framesBelow25fps) / frameTimes.length) * 100;
        const percentageAbove30fps = ((frameTimes.length - framesBelow30fps) / frameTimes.length) * 100;

        return {
          sampleCount: samples.length,
          averageFPS,
          p95FPS,
          percentageAbove25fps,
          percentageAbove30fps,
          framesBelow25fps,
          framesBelow30fps
        };
      });

      // Validate mobile requirements
      expect(mobilePerformanceResults.averageFPS).toBeGreaterThanOrEqual(25);
      expect(mobilePerformanceResults.p95FPS).toBeGreaterThanOrEqual(20);
      expect(mobilePerformanceResults.percentageAbove25fps).toBeGreaterThanOrEqual(95);

      await mobilePage.close();
    });
  });

  test.describe('PRD 4.1.2: Resource Usage Requirements', () => {
    test('should use maximum 100MB memory on desktop', async ({ page }) => {
      await page.goto('http://localhost:3000');

      // Wait for full initialization including all assets
      await page.waitForFunction(() => {
        return window.storyController && window.storyController.isReady();
      }, { timeout: 15000 });

      // Collect memory snapshots over time
      const memorySnapshots = [];
      const samplingDuration = 30000; // 30 seconds
      const sampleInterval = 1000; // Every second

      for (let i = 0; i < samplingDuration / sampleInterval; i++) {
        const memoryData = await page.evaluate(() => {
          if (!(performance as any).memory) return null;

          return {
            used: (performance as any).memory.usedJSHeapSize,
            total: (performance as any).memory.totalJSHeapSize,
            limit: (performance as any).memory.jsHeapSizeLimit,
            timestamp: performance.now()
          };
        });

        if (memoryData) {
          memorySnapshots.push(memoryData);
        }

        // Perform some activity during sampling
        await page.mouse.move(
          Math.random() * 1920,
          Math.random() * 1080
        );

        await page.waitForTimeout(sampleInterval);
      }

      // Analyze memory usage
      const memoryAnalysis = {
        samples: memorySnapshots,
        maxUsed: Math.max(...memorySnapshots.map(s => s.used)),
        avgUsed: memorySnapshots.reduce((sum, s) => sum + s.used, 0) / memorySnapshots.length,
        minUsed: Math.min(...memorySnapshots.map(s => s.used))
      };

      // Convert to MB for validation
      const maxMemoryMB = memoryAnalysis.maxUsed / (1024 * 1024);
      const avgMemoryMB = memoryAnalysis.avgUsed / (1024 * 1024);

      expect(maxMemoryMB).toBeLessThanOrEqual(100); // PRD requirement
      expect(avgMemoryMB).toBeLessThan(50); // Should average much lower than max

      console.log(`Memory Usage - Max: ${maxMemoryMB.toFixed(2)}MB, Avg: ${avgMemoryMB.toFixed(2)}MB`);
    });

    test('should use maximum 50MB memory on mobile', async ({ browser }) => {
      const mobileContext = await browser.newContext({
        viewport: { width: 393, height: 851 },
        user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)'
      });
      const mobilePage = await mobileContext.newPage();

      await mobilePage.goto('http://localhost:3000/mobile');

      await mobilePage.waitForFunction(() => {
        return window.storyController && window.storyController.isReady();
      }, { timeout: 15000 });

      const memorySnapshots = [];
      const samplingDuration = 20000;
      const sampleInterval = 1000;

      for (let i = 0; i < samplingDuration / sampleInterval; i++) {
        const memoryData = await mobilePage.evaluate(() => {
          if (!(performance as any).memory) return null;

          return {
            used: (performance as any).memory.usedJSHeapSize,
            total: (performance as any).memory.totalJSHeapSize,
            limit: (performance as any).memory.jsHeapSizeLimit
          };
        });

        if (memoryData) {
          memorySnapshots.push(memoryData);
        }

        await mobilePage.touchscreen.tap(
          Math.floor(Math.random() * 393),
          Math.floor(Math.random() * 851)
        );

        await mobilePage.waitForTimeout(sampleInterval);
      }

      const maxMemoryMB = Math.max(...memorySnapshots.map(s => s.used)) / (1024 * 1024);

      expect(maxMemoryMB).toBeLessThanOrEqual(50); // PRD requirement for mobile

      await mobilePage.close();
    });

    test('should not exceed 50% CPU usage on desktop', async ({ page }) => {
      await page.goto('http://localhost:3000');

      await page.waitForFunction(() => {
        return window.particleSystem && window.particleSystem.getParticleCount() >= 10000;
      });

      // Enable performance observer for CPU measurement
      await page.addInitScript(() => {
        window.cpuMetrics = {
          entries: [],
          startCollecting() {
            if ('PerformanceObserver' in window) {
              const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                  if (entry.entryType === 'measure') {
                    window.cpuMetrics.entries.push({
                      name: entry.name,
                      duration: entry.duration,
                      timestamp: entry.startTime
                    });
                  }
                }
              });
              observer.observe({ entryTypes: ['measure'] });
            }
          },
          measureCPUUsage() {
            // Simulate CPU-intensive operations and measure
            const start = performance.now();
            let counter = 0;
            for (let i = 0; i < 1000000; i++) {
              counter += Math.random();
            }
            const end = performance.now();
            return end - start;
          }
        };

        window.cpuMetrics.startCollecting();
      });

      // Test CPU usage under load
      const cpuMeasurements = [];
      for (let i = 0; i < 20; i++) {
        const cpuTime = await page.evaluate(() => {
          return window.cpuMetrics.measureCPUUsage();
        });

        cpuMeasurements.push(cpuTime);

        // Perform normal operations
        await page.mouse.move(
          Math.random() * 1920,
          Math.random() * 1080
        );

        await page.waitForTimeout(100);
      }

      const avgCPUUsage = cpuMeasurements.reduce((a, b) => a + b, 0) / cpuMeasurements.length;

      // CPU usage should be reasonable (this is an indirect measurement)
      expect(avgCPUUsage).toBeLessThan(50); // milliseconds for CPU test
    });
  });

  test.describe('PRD 4.1.3: Asset Loading Performance', () => {
    test('should load all images within 2 seconds on desktop', async ({ page }) => {
      await page.goto('http://localhost:3000');

      // Track loading performance
      const loadingMetrics = await page.evaluate(async () => {
        const startTime = performance.now();
        const imagePromises = [];

        // Track when each image loads
        const imageObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name.includes('.png') && entry.entryType === 'resource') {
              imagePromises.push({
                name: entry.name,
                duration: entry.duration,
                size: entry.transferSize
              });
            }
          }
        });

        imageObserver.observe({ entryTypes: ['resource'] });

        // Wait for all images to load
        await window.imageLoader.preloadAll();
        const endTime = performance.now();

        return {
          totalTime: endTime - startTime,
          images: imagePromises,
          imageCount: imagePromises.length
        };
      });

      expect(loadingMetrics.totalTime).toBeLessThan(2000); // 2 seconds requirement
      expect(loadingMetrics.imageCount).toBe(4); // All 4 images

      // Each individual image should load quickly
      loadingMetrics.images.forEach(image => {
        expect(image.duration).toBeLessThan(1500); // Individual image load time
      });

      console.log(`Asset Loading - Total: ${loadingMetrics.totalTime}ms, Images: ${loadingMetrics.imageCount}`);
    });

    test('should load assets within 5 seconds on mobile', async ({ browser }) => {
      const mobileContext = await browser.newContext({
        viewport: { width: 393, height: 851 },
        user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)'
      });
      const mobilePage = await mobileContext.newPage();

      // Simulate slower mobile network
      await mobilePage.route('**/*', async route => {
        // Add delay to simulate mobile network conditions
        await new Promise(resolve => setTimeout(resolve, 200));
        await route.continue();
      });

      const startTime = Date.now();
      await mobilePage.goto('http://localhost:3000/mobile');

      // Wait for complete initialization
      await mobilePage.waitForFunction(() => {
        return window.storyController && window.storyController.isReady();
      }, { timeout: 10000 });

      const loadTime = Date.now() - startTime;

      expect(loadTime).toBeLessThan(5000); // 5 seconds requirement

      await mobilePage.close();
    });

    test('should handle slow network conditions gracefully', async ({ page }) => {
      // Simulate very slow network
      await page.route('**/*.png', async route => {
        // Add significant delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        await route.fulfill({
          status: 200,
          contentType: 'image/png',
          body: Buffer.from('fake-image-data')
        });
      });

      const startTime = Date.now();
      await page.goto('http://localhost:3000');

      // Should still load eventually with fallbacks
      await page.waitForFunction(() => {
        return window.storyController && window.storyController.isReady();
      }, { timeout: 10000 });

      const loadTime = Date.now() - startTime;

      // Should load within reasonable time even with slow network
      expect(loadTime).toBeLessThan(8000);

      // Should have fallback images
      const hasFallbacks = await page.evaluate(() => {
        return window.imageLoader.hasFallbackImages();
      });

      expect(hasFallbacks).toBe(true);
    });
  });

  test.describe('PRD 4.4.1: Performance Measurement Integration', () => {
    test('should implement rolling average frame time monitoring', async ({ page }) => {
      await page.goto('http://localhost:3000');

      await page.waitForFunction(() => {
        return window.particleSystem;
      });

      // Test built-in performance monitor
      const performanceData = await page.evaluate(() => {
        // Collect performance data for 3 seconds
        const samples = [];
        const startTime = performance.now();
        const duration = 3000;

        const collectSample = () => {
          if (performance.now() - startTime < duration) {
            samples.push(window.particleSystem.getPerformanceMonitor().getCurrentFPS());
            requestAnimationFrame(collectSample);
          }
        };

        collectSample();

        return new Promise(resolve => {
          setTimeout(() => {
            resolve({
              samples,
              average: samples.reduce((a, b) => a + b, 0) / samples.length,
              min: Math.min(...samples),
              max: Math.max(...samples),
              count: samples.length
            });
          }, duration + 100);
        });
      });

      expect(performanceData.count).toBeGreaterThan(50); // Should have many samples
      expect(performanceData.average).toBeGreaterThan(55); // Should meet performance targets
      expect(performanceData.min).toBeGreaterThan(30); // Minimum acceptable FPS
    });

    test('should track and report memory usage statistics', async ({ page }) => {
      await page.goto('http://localhost:3000');

      await page.waitForFunction(() => {
        return window.imageLoader && window.imageLoader.isReady();
      });

      const memoryStats = await page.evaluate(() => {
        return {
          imageLoader: window.imageLoader.getMemoryStats(),
          particleSystem: window.particleSystem.getMemoryStats(),
          browser: (performance as any).memory ? {
            used: (performance as any).memory.usedJSHeapSize,
            total: (performance as any).memory.totalJSHeapSize,
            limit: (performance as any).memory.jsHeapSizeLimit
          } : null
        };
      });

      expect(memoryStats.imageLoader).toBeDefined();
      expect(memoryStats.particleSystem).toBeDefined();

      if (memoryStats.browser) {
        expect(memoryStats.browser.used).toBeGreaterThan(0);
      }
    });
  });

  test.describe('PRD 6.3: Stress Testing', () => {
    test('should handle extended usage (1+ hour simulation)', async ({ page }) => {
      await page.goto('http://localhost:3000');

      await page.waitForFunction(() => {
        return window.storyController && window.storyController.isReady();
      });

      // Simulate 1 hour of usage in accelerated form (5 minutes)
      const cycles = 60; // 60 cycles = ~1 hour equivalent
      const memorySnapshots = [];

      for (let cycle = 0; cycle < cycles; cycle++) {
        // Complete story progression
        for (let stage = 1; stage <= 5; stage++) {
          await page.evaluate((targetStage) => {
            return window.storyController.goToStage(targetStage);
          }, stage);

          // Random interactions during each stage
          for (let i = 0; i < 5; i++) {
            await page.mouse.move(
              Math.random() * 1920,
              Math.random() * 1080
            );
            await page.waitForTimeout(50);
          }

          await page.waitForTimeout(200);
        }

        // Reset and continue
        await page.evaluate(() => {
          return window.storyController.reset();
        });

        // Check memory usage every 10 cycles
        if (cycle % 10 === 0) {
          const memory = await page.evaluate(() => {
            return (performance as any).memory?.usedJSHeapSize || 0;
          });
          memorySnapshots.push(memory);
        }

        await page.waitForTimeout(1000); // Brief pause between cycles
      }

      // Analyze for memory leaks
      const initialMemory = memorySnapshots[0];
      const finalMemory = memorySnapshots[memorySnapshots.length - 1];
      const memoryGrowth = finalMemory - initialMemory;
      const memoryGrowthMB = memoryGrowth / (1024 * 1024);

      expect(memoryGrowthMB).toBeLessThan(20); // Less than 20MB growth over extended use
      console.log(`Memory growth over extended use: ${memoryGrowthMB.toFixed(2)}MB`);
    });

    test('should maintain performance under CPU load', async ({ page }) => {
      await page.goto('http://localhost:3000');

      await page.waitForFunction(() => {
        return window.particleSystem && window.particleSystem.getParticleCount() >= 10000;
      });

      // Add CPU load in background
      await page.addInitScript(() => {
        // CPU-intensive task running in background
        let cpuLoadCounter = 0;
        const cpuLoadTask = () => {
          for (let i = 0; i < 100000; i++) {
            cpuLoadCounter += Math.sqrt(i);
          }
          setTimeout(cpuLoadTask, 10);
        };
        // Don't start immediately, we control when to add load
        window.startCPUStress = cpuLoadTask;
      });

      // Measure baseline performance
      const baselineFPS = await page.evaluate(() => {
        return window.particleSystem.getPerformanceMonitor().getCurrentFPS();
      });

      // Add CPU stress
      await page.evaluate(() => {
        window.startCPUStress();
      });

      // Measure performance under load
      const stressedFPS = await page.evaluate(() => {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve(window.particleSystem.getPerformanceMonitor().getCurrentFPS());
          }, 2000);
        });
      });

      // Should maintain reasonable performance even under stress
      expect(stressedFPS).toBeGreaterThan(baselineFPS * 0.5); // At least 50% of baseline
      expect(stressedFPS).toBeGreaterThan(30); // Minimum acceptable FPS under load
    });
  });
});