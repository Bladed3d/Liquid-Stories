/**
 * Unit Tests for Image Loader System
 * PRD Sections: 3.2, 4.3.3.1, 7.1.2
 *
 * Tests cover:
 * - Asset loading for all 4 character images
 * - Loading time requirements (2s desktop, 5s mobile)
 * - Error handling and retry logic
 * - Image display and scaling
 * - Caching mechanisms
 */

import { ImageLoader } from '../../V6/js/image-loader';

// Mock global fetch for image loading tests
global.fetch = jest.fn();

describe('ImageLoader Unit Tests', () => {
  let imageLoader: ImageLoader;

  beforeEach(() => {
    imageLoader = new ImageLoader({
      baseUrl: '/images/',
      timeout: 5000,
      retryAttempts: 3,
      retryDelay: 1000
    });

    // Clear all mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    imageLoader.destroy();
  });

  describe('PRD 3.2.1: Asset Loading Requirements', () => {
    test('should load all 4 required PNG assets', async () => {
      const mockImageResponse = {
        ok: true,
        headers: new Headers({
          'content-type': 'image/png'
        }),
        arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(100))
      };

      // Mock successful fetch for all images
      (global.fetch as jest.Mock).mockResolvedValue(mockImageResponse);

      const images = [
        'KidHappy.png',
        'KidScared.png',
        'Monster01.png',
        'Monster02.png'
      ];

      const results = await Promise.all(
        images.map(image => imageLoader.loadImage(image))
      );

      expect(results).toHaveLength(4);
      results.forEach(result => {
        expect(result.success).toBe(true);
        expect(result.image).toBeDefined();
      });

      // Verify fetch was called for each image
      expect(global.fetch).toHaveBeenCalledTimes(4);
      images.forEach(image => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining(image),
          expect.any(Object)
        );
      });
    });

    test('should load images within 2 seconds on desktop', async () => {
      imageLoader = new ImageLoader({
        baseUrl: '/images/',
        timeout: 2000, // 2 seconds for desktop
        retryAttempts: 3,
        retryDelay: 1000
      });

      const mockImageResponse = {
        ok: true,
        headers: new Headers({
          'content-type': 'image/png'
        }),
        arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(100))
      };

      // Simulate quick loading
      (global.fetch as jest.Mock).mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve(mockImageResponse), 100))
      );

      const startTime = performance.now();
      const result = await imageLoader.loadImage('KidHappy.png');
      const loadTime = performance.now() - startTime;

      expect(result.success).toBe(true);
      expect(loadTime).toBeLessThan(2000);
    });

    test('should load images within 5 seconds on mobile', async () => {
      imageLoader = new ImageLoader({
        baseUrl: '/images/',
        timeout: 5000, // 5 seconds for mobile
        retryAttempts: 3,
        retryDelay: 1000
      });

      const mockImageResponse = {
        ok: true,
        headers: new Headers({
          'content-type': 'image/png'
        }),
        arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(100))
      };

      // Simulate slower mobile loading
      (global.fetch as jest.Mock).mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve(mockImageResponse), 1000))
      );

      const startTime = performance.now();
      const result = await imageLoader.loadImage('Monster01.png');
      const loadTime = performance.now() - startTime;

      expect(result.success).toBe(true);
      expect(loadTime).toBeLessThan(5000);
    });

    test('should preload all assets before experience starts', async () => {
      const mockImageResponse = {
        ok: true,
        headers: new Headers({
          'content-type': 'image/png'
        }),
        arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(100))
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockImageResponse);

      const preloadPromise = imageLoader.preloadAll();

      // Should return promise immediately
      expect(preloadPromise).toBeInstanceOf(Promise);

      const results = await preloadPromise;

      expect(results.successful).toBe(4);
      expect(results.failed).toBe(0);
      expect(results.total).toBe(4);
    });
  });

  describe('PRD 4.3.3.1: Error Handling and Retry Logic', () => {
    test('should implement 3 retry attempts with exponential backoff', async () => {
      let attemptCount = 0;
      const mockErrorResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      };

      (global.fetch as jest.Mock).mockImplementation(() => {
        attemptCount++;
        return Promise.resolve(mockErrorResponse);
      });

      const startTime = performance.now();
      const result = await imageLoader.loadImage('KidHappy.png');
      const totalTime = performance.now() - startTime;

      // Should have attempted 3 times
      expect(global.fetch).toHaveBeenCalledTimes(3);
      expect(attemptCount).toBe(3);

      // Total time should include exponential backoff: 1s + 2s + 4s
      expect(totalTime).toBeGreaterThan(7000); // At least 7 seconds

      // Final result should be failure
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('should show error message after 2 failed attempts', (done) => {
      let attemptCount = 0;
      const mockErrorResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found'
      };

      (global.fetch as jest.Mock).mockImplementation(() => {
        attemptCount++;
        return Promise.resolve(mockErrorResponse);
      });

      // Mock error notification
      const originalAlert = window.alert;
      window.alert = jest.fn();

      imageLoader.loadImage('MissingImage.png').then(result => {
        expect(window.alert).toHaveBeenCalledWith(
          expect.stringContaining('Failed to load image after multiple attempts')
        );

        // Restore original alert
        window.alert = originalAlert;
        done();
      });
    });

    test('should provide fallback graphics for failed images', async () => {
      const mockErrorResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found'
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockErrorResponse);

      const result = await imageLoader.loadImage('MissingImage.png');

      expect(result.success).toBe(false);
      expect(result.fallback).toBeDefined();
      expect(result.fallback.type).toBe('placeholder');
    });

    test('should log errors with context and timing', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const mockErrorResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockErrorResponse);

      await imageLoader.loadImage('KidHappy.png');

      // Should log error with context
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Image load failed'),
        expect.objectContaining({
          image: 'KidHappy.png',
          attempts: expect.any(Number),
          totalTime: expect.any(Number)
        })
      );

      consoleSpy.mockRestore();
    });
  });

  describe('PRD 3.2.2: Image Display and Scaling', () => {
    test('should scale images appropriately for device size', async () => {
      const mockImageResponse = {
        ok: true,
        headers: new Headers({
          'content-type': 'image/png'
        }),
        arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(100))
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockImageResponse);

      const result = await imageLoader.loadImage('KidHappy.png');

      // Test desktop scaling
      const desktopSize = imageLoader.getScaledSize(result.image!, {
        width: 1920,
        height: 1080,
        isMobile: false
      });

      expect(desktopSize.width).toBeLessThanOrEqual(600);
      expect(desktopSize.height).toBeLessThanOrEqual(600);

      // Test mobile scaling
      const mobileSize = imageLoader.getScaledSize(result.image!, {
        width: 393,
        height: 851,
        isMobile: true
      });

      expect(mobileSize.width).toBeLessThanOrEqual(200);
      expect(mobileSize.height).toBeLessThanOrEqual(200);
    });

    test('should maintain aspect ratio during scaling', async () => {
      const mockImageResponse = {
        ok: true,
        headers: new Headers({
          'content-type': 'image/png'
        }),
        arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(100))
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockImageResponse);

      const result = await imageLoader.loadImage('KidHappy.png');

      // Mock image with known aspect ratio
      result.image.width = 400;
      result.image.height = 600; // 2:3 aspect ratio

      const scaledSize = imageLoader.getScaledSize(result.image!, {
        width: 1920,
        height: 1080,
        isMobile: false
      });

      const originalRatio = 400 / 600;
      const scaledRatio = scaledSize.width / scaledSize.height;

      expect(Math.abs(originalRatio - scaledRatio)).toBeLessThan(0.01);
    });

    test('should display images at appropriate story stages', () => {
      const stageImageMap = {
        1: 'KidHappy.png',
        2: 'KidScared.png',
        3: 'Monster01.png',
        4: 'Monster02.png'
      };

      Object.entries(stageImageMap).forEach(([stage, expectedImage]) => {
        const image = imageLoader.getStageImage(parseInt(stage));
        expect(image).toBe(expectedImage);
      });
    });
  });

  describe('PRD 3.2.3: Caching Mechanisms', () => {
    test('should cache loaded images to prevent reloads', async () => {
      const mockImageResponse = {
        ok: true,
        headers: new Headers({
          'content-type': 'image/png'
        }),
        arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(100))
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockImageResponse);

      // First load
      const result1 = await imageLoader.loadImage('KidHappy.png');
      expect(global.fetch).toHaveBeenCalledTimes(1);

      // Second load should use cache
      const result2 = await imageLoader.loadImage('KidHappy.png');
      expect(global.fetch).toHaveBeenCalledTimes(1); // No additional fetch

      expect(result1.image).toBe(result2.image);
    });

    test('should clear cache when requested', async () => {
      const mockImageResponse = {
        ok: true,
        headers: new Headers({
          'content-type': 'image/png'
        }),
        arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(100))
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockImageResponse);

      // Load image
      await imageLoader.loadImage('KidHappy.png');
      expect(imageLoader.getCacheSize()).toBe(1);

      // Clear cache
      imageLoader.clearCache();
      expect(imageLoader.getCacheSize()).toBe(0);

      // Should fetch again
      await imageLoader.loadImage('KidHappy.png');
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    test('should respect cache memory limits', async () => {
      const mockImageResponse = {
        ok: true,
        headers: new Headers({
          'content-type': 'image/png'
        }),
        arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(100))
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockImageResponse);

      // Create small cache limit
      const smallCacheLoader = new ImageLoader({
        baseUrl: '/images/',
        timeout: 5000,
        retryAttempts: 3,
        retryDelay: 1000,
        maxCacheSize: 2 // Only cache 2 images
      });

      // Load 4 images
      await smallCacheLoader.loadImage('KidHappy.png');
      await smallCacheLoader.loadImage('KidScared.png');
      await smallCacheLoader.loadImage('Monster01.png');
      await smallCacheLoader.loadImage('Monster02.png');

      // Cache should only contain 2 most recent images
      expect(smallCacheLoader.getCacheSize()).toBeLessThanOrEqual(2);

      smallCacheLoader.destroy();
    });
  });

  describe('Performance Monitoring', () => {
    test('should track loading statistics', async () => {
      const mockImageResponse = {
        ok: true,
        headers: new Headers({
          'content-type': 'image/png'
        }),
        arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(100))
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockImageResponse);

      const startTime = performance.now();
      await imageLoader.loadImage('KidHappy.png');
      const loadTime = performance.now() - startTime;

      const stats = imageLoader.getLoadingStats();

      expect(stats.totalLoaded).toBe(1);
      expect(stats.successfulLoads).toBe(1);
      expect(stats.failedLoads).toBe(0);
      expect(stats.averageLoadTime).toBe(loadTime);
    });

    test('should monitor memory usage of cached images', async () => {
      const mockImageResponse = {
        ok: true,
        headers: new Headers({
          'content-type': 'image/png'
        }),
        arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(1000000)) // 1MB image
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockImageResponse);

      await imageLoader.loadImage('KidHappy.png');

      const memoryStats = imageLoader.getMemoryStats();

      expect(memoryStats.totalMemoryUsed).toBeGreaterThan(0);
      expect(memoryStats.imageCount).toBe(1);
      expect(memoryStats.averageImageSize).toBeGreaterThan(0);
    });
  });

  describe('Error Recovery', () => {
    test('should handle network errors gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await imageLoader.loadImage('KidHappy.png');

      expect(result.success).toBe(false);
      expect(result.error.message).toContain('Network error');
    });

    test('should handle corrupted image files', async () => {
      const mockCorruptedResponse = {
        ok: true,
        headers: new Headers({
          'content-type': 'image/png'
        }),
        arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(0)) // Empty file
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockCorruptedResponse);

      const result = await imageLoader.loadImage('KidHappy.png');

      expect(result.success).toBe(false);
      expect(result.error.message).toContain('Corrupted image');
    });

    test('should provide offline support for cached images', async () => {
      // Load image while online
      const mockImageResponse = {
        ok: true,
        headers: new Headers({
          'content-type': 'image/png'
        }),
        arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(100))
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockImageResponse);
      await imageLoader.loadImage('KidHappy.png');

      // Simulate offline
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Offline'));

      // Should still get cached image
      const result = await imageLoader.loadImage('KidHappy.png');

      expect(result.success).toBe(true);
      expect(result.fromCache).toBe(true);
    });
  });
});