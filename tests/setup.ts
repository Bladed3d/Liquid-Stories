// Jest setup file for test environment
import { expect } from '@jest/globals';
import 'jest-axe/extend-expect';

// Mock Canvas API for unit tests
const mockCanvasContext = {
  fillRect: jest.fn(),
  clearRect: jest.fn(),
  getImageData: jest.fn(() => ({ data: new Array(4).fill(0) })),
  putImageData: jest.fn(),
  createImageData: jest.fn(() => ({ data: new Array(4).fill(0) })),
  setTransform: jest.fn(),
  drawImage: jest.fn(),
  save: jest.fn(),
  fillText: jest.fn(),
  restore: jest.fn(),
  beginPath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  closePath: jest.fn(),
  stroke: jest.fn(),
  translate: jest.fn(),
  scale: jest.fn(),
  rotate: jest.fn(),
  arc: jest.fn(),
  fill: jest.fn(),
  measureText: jest.fn(() => ({ width: 0 })),
  transform: jest.fn(),
  rect: jest.fn(),
  clip: jest.fn(),
  canvas: document.createElement('canvas'),
  globalAlpha: 1,
  globalCompositeOperation: 'source-over',
  isPointInPath: jest.fn(),
  // Add other required properties to avoid TypeScript errors
} as any;

global.HTMLCanvasElement.prototype.getContext = jest.fn(() => mockCanvasContext);

// Mock performance API
global.performance = {
  now: jest.fn(() => Date.now()),
  mark: jest.fn(),
  measure: jest.fn(),
  getEntriesByName: jest.fn(() => []),
  getEntriesByType: jest.fn(() => []),
  clearMarks: jest.fn(),
  clearMeasures: jest.fn(),
} as any;

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn((cb) => setTimeout(cb, 16));
global.cancelAnimationFrame = jest.fn((id) => clearTimeout(id));

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock performance.memory for Chrome
if (!global.performance.memory) {
  Object.defineProperty(global.performance, 'memory', {
    value: {
      usedJSHeapSize: 1024 * 1024 * 50, // 50MB
      totalJSHeapSize: 1024 * 1024 * 100, // 100MB
      jsHeapSizeLimit: 1024 * 1024 * 2048, // 2GB
    },
    configurable: true,
  });
}

// Test timeout settings
jest.setTimeout(60000);

// Global test utilities
global.createMockImageData = (width: number, height: number) => {
  const data = new Uint8ClampedArray(width * height * 4);
  return { data, width, height };
};

global.createMockParticle = (overrides = {}) => ({
  x: Math.random() * 800,
  y: Math.random() * 600,
  vx: (Math.random() - 0.5) * 2,
  vy: (Math.random() - 0.5) * 2,
  size: Math.random() * 3 + 1,
  color: 'rgba(255, 255, 255, 0.8)',
  ...overrides,
});

global.createMockDevice = (type: 'desktop' | 'mobile') => ({
  isMobile: type === 'mobile',
  isDesktop: type === 'desktop',
  viewport: type === 'mobile' ? { width: 393, height: 851 } : { width: 1920, height: 1080 },
  pixelRatio: type === 'mobile' ? 2.625 : 1,
});

// Error handling for tests
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Console error detection
const originalError = console.error;
console.error = (...args: any[]) => {
  originalError.apply(console, args);

  // Fail tests on certain console errors
  const errorString = args.join(' ');
  if (
    errorString.includes('Error:') ||
    errorString.includes('TypeError:') ||
    errorString.includes('ReferenceError:')
  ) {
    throw new Error(`Console error detected: ${errorString}`);
  }
};

export {};