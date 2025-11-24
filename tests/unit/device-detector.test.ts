/**
 * Unit Tests for Device Detection System
 * PRD Sections: 3.3, 4.3.3.3, 7.1.2
 *
 * Tests cover:
 * - Automatic device detection (mobile vs desktop)
 * - Multiple detection methods (user agent, touch capabilities, screen size)
 * - Detection completion within 100ms
 * - Redirection to appropriate versions
 * - Fallback handling for unknown devices
 */

import { DeviceDetector } from '../../V6/js/device-detector';

// Mock navigator properties
Object.defineProperty(window, 'navigator', {
  value: {
    userAgent: '',
    maxTouchPoints: 0,
    msMaxTouchPoints: 0
  },
  writable: true
});

// Mock screen properties
Object.defineProperty(window, 'screen', {
  value: {
    width: 1920,
    height: 1080,
    availWidth: 1920,
    availHeight: 1080
  },
  writable: true
});

describe('DeviceDetector Unit Tests', () => {
  let deviceDetector: DeviceDetector;

  beforeEach(() => {
    deviceDetector = new DeviceDetector();
  });

  afterEach(() => {
    deviceDetector.destroy();
  });

  describe('PRD 3.3.1: Automatic Detection Requirements', () => {
    test('should detect mobile devices correctly', () => {
      // Mock mobile user agent
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15',
        writable: true
      });

      // Mock touch capabilities
      Object.defineProperty(navigator, 'maxTouchPoints', {
        value: 5,
        writable: true
      });

      // Mock mobile screen size
      Object.defineProperty(screen, 'width', {
        value: 390,
        writable: true
      });

      Object.defineProperty(screen, 'height', {
        value: 844,
        writable: true
      });

      const deviceInfo = deviceDetector.detect();

      expect(deviceInfo.isMobile).toBe(true);
      expect(deviceInfo.isDesktop).toBe(false);
      expect(deviceInfo.deviceType).toBe('mobile');
      expect(deviceInfo.os).toContain('iOS');
      expect(deviceInfo.hasTouch).toBe(true);
    });

    test('should detect desktop devices correctly', () => {
      // Mock desktop user agent
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        writable: true
      });

      // Mock desktop screen size
      Object.defineProperty(screen, 'width', {
        value: 1920,
        writable: true
      });

      Object.defineProperty(screen, 'height', {
        value: 1080,
        writable: true
      });

      const deviceInfo = deviceDetector.detect();

      expect(deviceInfo.isDesktop).toBe(true);
      expect(deviceInfo.isMobile).toBe(false);
      expect(deviceInfo.deviceType).toBe('desktop');
      expect(deviceInfo.os).toContain('Windows');
      expect(deviceInfo.hasTouch).toBe(false);
    });

    test('should use multiple detection methods for accuracy', () => {
      // Test with contradictory signals (should prioritize multiple indicators)
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPad; CPU OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15', // iPad agent
        writable: true
      });

      Object.defineProperty(navigator, 'maxTouchPoints', {
        value: 5, // Touch capable
        writable: true
      });

      Object.defineProperty(screen, 'width', {
        value: 1024, // Tablet screen width
        writable: true
      });

      Object.defineProperty(screen, 'height', {
        value: 1366,
        writable: true
      });

      const deviceInfo = deviceDetector.detect();

      // Should correctly identify as tablet/mobile despite desktop-sized screen
      expect(deviceInfo.hasTouch).toBe(true);
      expect(deviceInfo.deviceType).toBe('tablet');
    });

    test('should complete detection within 100ms', () => {
      const startTime = performance.now();

      // Multiple detection calls to test performance
      for (let i = 0; i < 10; i++) {
        deviceDetector.detect();
      }

      const endTime = performance.now();
      const avgTime = (endTime - startTime) / 10;

      expect(avgTime).toBeLessThan(100); // Should be much faster than 100ms
    });

    test('should provide detailed device information', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1',
        writable: true
      });

      const deviceInfo = deviceDetector.detect();

      expect(deviceInfo).toMatchObject({
        userAgent: expect.any(String),
        deviceType: expect.stringMatching(/^(desktop|mobile|tablet)$/),
        os: expect.any(String),
        browser: expect.any(String),
        browserVersion: expect.any(String),
        hasTouch: expect.any(Boolean),
        maxTouchPoints: expect.any(Number),
        screen: expect.objectContaining({
          width: expect.any(Number),
          height: expect.any(Number),
          pixelRatio: expect.any(Number)
        }),
        viewport: expect.objectContaining({
          width: expect.any(Number),
          height: expect.any(Number)
        })
      });
    });
  });

  describe('PRD 3.3.2: Device-Specific Optimization', () => {
    test('should return correct performance settings for desktop', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        writable: true
      });

      Object.defineProperty(screen, 'width', {
        value: 1920,
        writable: true
      });

      const deviceInfo = deviceDetector.detect();
      const performance = deviceDetector.getPerformanceSettings();

      expect(performance).toMatchObject({
        particleCount: 10000,
        targetFPS: 60,
        quality: 'high',
        enableAdvancedEffects: true,
        enableHighQualityImages: true
      });
    });

    test('should return correct performance settings for mobile', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)',
        writable: true
      });

      Object.defineProperty(screen, 'width', {
        value: 390,
        writable: true
      });

      const deviceInfo = deviceDetector.detect();
      const performance = deviceDetector.getPerformanceSettings();

      expect(performance).toMatchObject({
        particleCount: 5000,
        targetFPS: 30,
        quality: 'medium',
        enableAdvancedEffects: false,
        enableHighQualityImages: false
      });
    });

    test('should optimize for different mobile device classes', () => {
      // Test high-end mobile
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15',
        writable: true
      });

      Object.defineProperty(screen, 'width', {
        value: 428, // iPhone 14 Pro Max
        writable: true
      });

      let deviceInfo = deviceDetector.detect();
      let performance = deviceDetector.getPerformanceSettings();

      expect(performance.particleCount).toBeGreaterThanOrEqual(5000);
      expect(performance.quality).toBe('high');

      // Test low-end mobile
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Linux; Android 8.1.0; SM-J260M) AppleWebKit/537.36',
        writable: true
      });

      Object.defineProperty(screen, 'width', {
        value: 360, // Low-end Android
        writable: true
      });

      deviceInfo = deviceDetector.detect();
      performance = deviceDetector.getPerformanceSettings();

      expect(performance.particleCount).toBeLessThanOrEqual(3000);
      expect(performance.quality).toBe('low');
    });
  });

  describe('PRD 4.3.3.3: Browser Compatibility and Feature Detection', () => {
    test('should detect Canvas support', () => {
      const canvas = document.createElement('canvas');
      const hasCanvas = deviceDetector.detectFeature('canvas');

      expect(hasCanvas).toBe(true);

      // Test with Canvas disabled
      const originalGetContext = canvas.getContext;
      canvas.getContext = jest.fn().mockReturnValue(null);

      const hasCanvasDisabled = deviceDetector.detectFeature('canvas');
      expect(hasCanvasDisabled).toBe(false);

      // Restore
      canvas.getContext = originalGetContext;
    });

    test('should detect ES6 module support', () => {
      const hasES6Modules = deviceDetector.detectFeature('es6Modules');

      // Should be supported in modern browsers
      expect(hasES6Modules).toBe(true);
    });

    test('should detect WebAssembly support', () => {
      const hasWebAssembly = deviceDetector.detectFeature('webassembly');

      // Should be supported in modern browsers
      expect(hasWebAssembly).toBe(true);
    });

    test('should provide browser-specific recommendations', () => {
      const recommendations = deviceDetector.getBrowserRecommendations();

      expect(recommendations).toHaveProperty('supported');
      expect(recommendations).toHaveProperty('recommendedVersion');
      expect(recommendations).toHaveProperty('upgradeMessage');
      expect(recommendations).toHaveProperty('fallbackSupport');

      if (!recommendations.supported) {
        expect(recommendations.upgradeMessage).toBeDefined();
        expect(recommendations.fallbackSupport).toBe(true);
      }
    });

    test('should identify supported browsers', () => {
      const supportedBrowsers = [
        { userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36', supported: true },
        { userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36', supported: true },
        { userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0', supported: true },
        { userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1', supported: true },
        { userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1', supported: true },
        { userAgent: 'Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; rv:11.0) like Gecko', supported: true }, // IE 11
      ];

      supportedBrowsers.forEach(({ userAgent, supported }) => {
        Object.defineProperty(navigator, 'userAgent', {
          value: userAgent,
          writable: true
        });

        const browserInfo = deviceDetector.getBrowserInfo();
        expect(browserInfo.supported).toBe(supported);
      });
    });
  });

  describe('Device Detection Accuracy', () => {
    test('should correctly identify all major device types', () => {
      const testCases = [
        {
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)',
          expected: 'mobile',
          screen: { width: 390, height: 844 }
        },
        {
          userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_7_1 like Mac OS X)',
          expected: 'tablet',
          screen: { width: 1024, height: 1366 }
        },
        {
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          expected: 'desktop',
          screen: { width: 1920, height: 1080 }
        },
        {
          userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
          expected: 'desktop',
          screen: { width: 1366, height: 768 }
        },
        {
          userAgent: 'Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36',
          expected: 'mobile',
          screen: { width: 384, height: 854 }
        }
      ];

      testCases.forEach(({ userAgent, expected, screen: screenConfig }) => {
        Object.defineProperty(navigator, 'userAgent', {
          value: userAgent,
          writable: true
        });

        Object.defineProperty(screen, 'width', {
          value: screenConfig.width,
          writable: true
        });

        Object.defineProperty(screen, 'height', {
          value: screenConfig.height,
          writable: true
        });

        const deviceInfo = deviceDetector.detect();

        expect(deviceInfo.deviceType).toBe(expected);
      });
    });

    test('should handle edge cases gracefully', () => {
      // Empty user agent
      Object.defineProperty(navigator, 'userAgent', {
        value: '',
        writable: true
      });

      const deviceInfo1 = deviceDetector.detect();
      expect(deviceInfo1.deviceType).toBeDefined();

      // Unknown user agent
      Object.defineProperty(navigator, 'userAgent', {
        value: 'SomeUnknownBrowser/1.0',
        writable: true
      });

      const deviceInfo2 = deviceDetector.detect();
      expect(deviceInfo2.deviceType).toBeDefined();
      expect(deviceInfo2.supported).toBe(false);
    });
  });

  describe('Redirection Logic', () => {
    test('should provide correct redirection URLs', () => {
      // Mobile device should redirect to mobile version
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)',
        writable: true
      });

      Object.defineProperty(screen, 'width', {
        value: 390,
        writable: true
      });

      const redirection = deviceDetector.getRedirection('http://localhost:3000');

      expect(redirection.shouldRedirect).toBe(true);
      expect(redirection.targetUrl).toContain('mobile/index.html');

      // Desktop device should not redirect
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        writable: true
      });

      Object.defineProperty(screen, 'width', {
        value: 1920,
        writable: true
      });

      const desktopRedirection = deviceDetector.getRedirection('http://localhost:3000');

      expect(desktopRedirection.shouldRedirect).toBe(false);
    });

    test('should preserve URL parameters during redirection', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)',
        writable: true
      });

      const originalUrl = 'http://localhost:3000/?stage=3&debug=true';
      const redirection = deviceDetector.getRedirection(originalUrl);

      expect(redirection.targetUrl).toContain('stage=3');
      expect(redirection.targetUrl).toContain('debug=true');
    });

    test('should handle tablet-specific redirection', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPad; CPU OS 14_7_1 like Mac OS X)',
        writable: true
      });

      Object.defineProperty(screen, 'width', {
        value: 1024,
        writable: true
      });

      const redirection = deviceDetector.getRedirection('http://localhost:3000');

      // Tablets could go to either mobile or desktop depending on configuration
      expect(['mobile/index.html', 'desktop/index.html']).toContain(
        redirection.targetUrl.split('/').pop()
      );
    });
  });

  describe('Performance and Caching', () => {
    test('should cache detection results for performance', () => {
      const startTime = performance.now();

      // First detection
      deviceDetector.detect();

      const firstTime = performance.now() - startTime;

      const secondStartTime = performance.now();

      // Second detection (should use cache)
      deviceDetector.detect();

      const secondTime = performance.now() - secondStartTime;

      // Second detection should be faster due to caching
      expect(secondTime).toBeLessThan(firstTime);
    });

    test('should detect performance characteristics', () => {
      const performance = deviceDetector.detectPerformanceCharacteristics();

      expect(performance).toMatchObject({
        cpuCores: expect.any(Number),
        memory: expect.any(Object),
        connection: expect.any(Object),
        battery: expect.any(Object)
      });

      // Should have reasonable defaults
      expect(performance.cpuCores).toBeGreaterThan(0);
    });
  });
});