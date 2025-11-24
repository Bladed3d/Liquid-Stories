/**
 * Unit Tests for Story Controller System
 * PRD Sections: 2.2, 3.2.3, 5.1.2, 7.1.2
 *
 * Tests cover:
 * - 5-stage story progression (1→2→3→4→5)
 * - Character image integration per stage
 * - Smooth transitions (500ms ease-in-out)
 * - Stage persistence in URL parameters
 * - Progress indicators
 * - Story state management
 */

import { StoryController } from '../../V6/js/story-controller';

describe('StoryController Unit Tests', () => {
  let storyController: StoryController;
  let mockImageLoader: any;
  let mockParticleSystem: any;

  beforeEach(() => {
    // Mock dependencies
    mockImageLoader = {
      loadStageImage: jest.fn(),
      getStageImage: jest.fn((stage) => {
        const stageImages = {
          1: 'KidHappy.png',
          2: 'KidScared.png',
          3: 'Monster01.png',
          4: 'Monster02.png',
          5: null
        };
        return stageImages[stage];
      }),
      preloadAll: jest.fn().mockResolvedValue({
        successful: 4,
        failed: 0,
        total: 4
      })
    };

    mockParticleSystem = {
      setStage: jest.fn(),
      transitionToStage: jest.fn(),
      getParticleCount: jest.fn().mockReturnValue(10000)
    };

    // Mock URL and history APIs
    Object.defineProperty(window, 'location', {
      value: {
        href: 'http://localhost:3000',
        search: '',
        pathname: '/'
      },
      writable: true
    });

    Object.defineProperty(window, 'history', {
      value: {
        pushState: jest.fn(),
        replaceState: jest.fn()
      },
      writable: true
    });

    storyController = new StoryController({
      imageLoader: mockImageLoader,
      particleSystem: mockParticleSystem,
      config: {
        stages: 5,
        transitionDuration: 500,
        autoProgress: false,
        autoProgressDelay: 10000,
        enableProgressIndicator: true
      }
    });
  });

  afterEach(() => {
    storyController.destroy();
  });

  describe('PRD 2.2: 5-Stage Story Transformation', () => {
    test('should initialize at stage 1 with Kid Happy character', () => {
      expect(storyController.getCurrentStage()).toBe(1);
      expect(mockImageLoader.getStageImage).toHaveBeenCalledWith(1);
    });

    test('should progress through all 5 stages correctly', async () => {
      const stageProgression = [1, 2, 3, 4, 5];
      const expectedCharacters = [
        'KidHappy.png',
        'KidScared.png',
        'Monster01.png',
        'Monster02.png',
        null // Resolution stage
      ];

      for (let i = 0; i < stageProgression.length; i++) {
        const stage = stageProgression[i];
        await storyController.goToStage(stage);

        expect(storyController.getCurrentStage()).toBe(stage);
        expect(mockImageLoader.getStageImage).toHaveBeenCalledWith(stage);
        expect(mockParticleSystem.setStage).toHaveBeenCalledWith(stage);

        if (expectedCharacters[i]) {
          expect(mockImageLoader.loadStageImage).toHaveBeenCalledWith(expectedCharacters[i]);
        }
      }
    });

    test('should validate stage boundaries', () => {
      // Should not allow stage 0
      expect(() => storyController.goToStage(0)).toThrow('Stage must be between 1 and 5');

      // Should not allow stage 6
      expect(() => storyController.goToStage(6)).toThrow('Stage must be between 1 and 5');

      // Should allow valid stages
      [1, 2, 3, 4, 5].forEach(stage => {
        expect(() => storyController.goToStage(stage)).not.toThrow();
      });
    });

    test('should prevent skipping stages unless explicitly allowed', async () => {
      // Start at stage 1
      expect(storyController.getCurrentStage()).toBe(1);

      // Should not skip to stage 3 by default
      await expect(storyController.goToStage(3)).rejects.toThrow('Cannot skip stages');

      // But should allow it if explicitly enabled
      storyController.enableStageSkipping();
      await storyController.goToStage(3);
      expect(storyController.getCurrentStage()).toBe(3);
    });

    test('should track story progress percentage', async () => {
      expect(storyController.getProgressPercentage()).toBe(0); // Stage 1/5 = 0%

      await storyController.goToStage(2);
      expect(storyController.getProgressPercentage()).toBe(25); // Stage 2/5 = 25%

      await storyController.goToStage(3);
      expect(storyController.getProgressPercentage()).toBe(50); // Stage 3/5 = 50%

      await storyController.goToStage(4);
      expect(storyController.getProgressPercentage()).toBe(75); // Stage 4/5 = 75%

      await storyController.goToStage(5);
      expect(storyController.getProgressPercentage()).toBe(100); // Stage 5/5 = 100%
    });
  });

  describe('PRD 3.2.3: Stage Transitions and Visual Effects', () => {
    test('should execute smooth 500ms transitions between stages', async () => {
      const startTime = performance.now();

      await storyController.goToStage(2);

      const transitionTime = performance.now() - startTime;

      // Should take approximately 500ms for transition
      expect(transitionTime).toBeGreaterThan(450);
      expect(transitionTime).toBeLessThan(600);

      // Should call particle system transition
      expect(mockParticleSystem.transitionToStage).toHaveBeenCalledWith(2, 500);
    });

    test('should use ease-in-out timing function for transitions', () => {
      const progressFunction = storyController.getTransitionProgress(0); // Start
      expect(progressFunction).toBe(0);

      const midProgress = storyController.getTransitionProgress(0.5); // Middle
      expect(midProgress).toBeCloseTo(0.5, 1);

      const endProgress = storyController.getTransitionProgress(1); // End
      expect(endProgress).toBe(1);

      // Should create smooth ease-in-out curve
      const earlyProgress = storyController.getTransitionProgress(0.25);
      const lateProgress = storyController.getTransitionProgress(0.75);

      // Ease-in-out should have slower start and end
      expect(earlyProgress).toBeLessThan(0.25);
      expect(lateProgress).toBeGreaterThan(0.75);
    });

    test('should coordinate particle color transitions with stage changes', async () => {
      await storyController.goToStage(1);
      expect(mockParticleSystem.setStage).toHaveBeenCalledWith(1);

      await storyController.goToStage(2);
      expect(mockParticleSystem.transitionToStage).toHaveBeenCalledWith(2, 500);

      await storyController.goToStage(3);
      expect(mockParticleSystem.transitionToStage).toHaveBeenCalledWith(3, 500);
    });

    test('should handle rapid stage transitions gracefully', async () => {
      // Rapid transitions should queue properly
      const transitions = [
        storyController.goToStage(2),
        storyController.goToStage(3),
        storyController.goToStage(4)
      ];

      await Promise.all(transitions);

      // Should end up at final stage
      expect(storyController.getCurrentStage()).toBe(4);
    });
  });

  describe('PRD 5.1.2: Color Specifications per Stage', () => {
    test('should use correct HSL colors for each stage', async () => {
      const stageColors = [
        { stage: 1, color: 'hsl(200, 70%, 60%)' },   // Blue theme
        { stage: 2, color: 'hsl(20, 70%, 50%)' },    // Orange transition
        { stage: 3, color: 'hsl(280, 60%, 40%)' },   // Purple theme
        { stage: 4, color: 'hsl(0, 70%, 50%)' },     // Red theme
        { stage: 5, color: 'hsl(120, 60%, 50%)' }    // Green resolution
      ];

      for (const { stage, color } of stageColors) {
        await storyController.goToStage(stage);
        const stageConfig = storyController.getStageConfig(stage);
        expect(stageConfig.particleColor).toBe(color);
      }
    });

    test('should maintain color variance <5% within same stage', async () => {
      await storyController.goToStage(1);
      const stage1Config = storyController.getStageConfig(1);

      // Get multiple color samples
      const colors = [];
      for (let i = 0; i < 10; i++) {
        colors.push(storyController.getParticleColor());
      }

      // Calculate color variance (simplified)
      const hslValues = colors.map(color => {
        const match = color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
        return match ? parseInt(match[1]) : 0; // Just checking hue for simplicity
      });

      const average = hslValues.reduce((a, b) => a + b, 0) / hslValues.length;
      const variance = hslValues.reduce((sum, hue) => sum + Math.abs(hue - average), 0) / hslValues.length;

      expect(variance).toBeLessThan(10); // Less than 5% of 200 (hue range)
    });
  });

  describe('URL Parameter Persistence', () => {
    test('should persist current stage in URL parameters', async () => {
      await storyController.goToStage(3);

      expect(window.history.replaceState).toHaveBeenCalledWith(
        { stage: 3 },
        '',
        expect.stringContaining('?stage=3')
      );
    });

    test('should restore stage from URL parameters on initialization', () => {
      // Set up URL with stage parameter
      Object.defineProperty(window, 'location', {
        value: {
          href: 'http://localhost:3000/?stage=4',
          search: '?stage=4',
          pathname: '/'
        },
        writable: true
      });

      const newController = new StoryController({
        imageLoader: mockImageLoader,
        particleSystem: mockParticleSystem,
        config: {
          stages: 5,
          transitionDuration: 500,
          autoProgress: false,
          enableProgressIndicator: true
        }
      });

      expect(newController.getCurrentStage()).toBe(4);
      newController.destroy();
    });

    test('should handle invalid stage parameters gracefully', () => {
      Object.defineProperty(window, 'location', {
        value: {
          href: 'http://localhost:3000/?stage=invalid',
          search: '?stage=invalid',
          pathname: '/'
        },
        writable: true
      });

      const newController = new StoryController({
        imageLoader: mockImageLoader,
        particleSystem: mockParticleSystem,
        config: {
          stages: 5,
          transitionDuration: 500,
          autoProgress: false,
          enableProgressIndicator: true
        }
      });

      // Should default to stage 1
      expect(newController.getCurrentStage()).toBe(1);
      newController.destroy();
    });

    test('should preserve other URL parameters during stage changes', async () => {
      Object.defineProperty(window, 'location', {
        value: {
          href: 'http://localhost:3000/?debug=true&mode=test',
          search: '?debug=true&mode=test',
          pathname: '/'
        },
        writable: true
      });

      await storyController.goToStage(2);

      expect(window.history.replaceState).toHaveBeenCalledWith(
        { stage: 2 },
        '',
        expect.stringContaining('?debug=true&mode=test&stage=2')
      );
    });
  });

  describe('Progress Indicators', () => {
    test('should create progress indicator when enabled', () => {
      const indicator = storyController.getProgressIndicator();

      expect(indicator).toBeDefined();
      expect(indicator.tagName.toLowerCase()).toBe('div');
      expect(indicator.classList.contains('progress-indicator')).toBe(true);
    });

    test('should update progress indicator on stage changes', async () => {
      const indicator = storyController.getProgressIndicator();

      // Initial state
      expect(indicator.getAttribute('data-stage')).toBe('1');
      expect(indicator.getAttribute('data-progress')).toBe('0%');

      // Stage change
      await storyController.goToStage(3);

      expect(indicator.getAttribute('data-stage')).toBe('3');
      expect(indicator.getAttribute('data-progress')).toBe('50%');
    });

    test('should show current stage in progress indicator', async () => {
      const indicator = storyController.getProgressIndicator();
      const stageText = indicator.querySelector('.stage-text');

      expect(stageText.textContent).toContain('Stage 1');

      await storyController.goToStage(2);
      expect(stageText.textContent).toContain('Stage 2');

      await storyController.goToStage(5);
      expect(stageText.textContent).toContain('Stage 5');
    });

    test('should animate progress bar during transitions', async () => {
      const indicator = storyController.getProgressIndicator();
      const progressBar = indicator.querySelector('.progress-bar');

      const initialWidth = progressBar.style.width;
      expect(initialWidth).toBe('0%');

      // Start transition
      const transitionPromise = storyController.goToStage(2);

      // Should animate during transition
      setTimeout(() => {
        const duringTransition = progressBar.style.width;
        expect(duringTransition).toMatch(/^\d+%$/); // Should be percentage
        expect(parseInt(duringTransition)).toBeGreaterThan(0);
        expect(parseInt(duringTransition)).toBeLessThan(25);
      }, 250);

      await transitionPromise;

      // Final state
      expect(progressBar.style.width).toBe('25%');
    });
  });

  describe('Story State Management', () => {
    test('should track complete story state', async () => {
      expect(storyController.isStoryComplete()).toBe(false);

      await storyController.goToStage(5);
      expect(storyController.isStoryComplete()).toBe(true);
    });

    test('should track story completion time', async () => {
      const startTime = performance.now();

      await storyController.goToStage(2);
      await storyController.goToStage(3);
      await storyController.goToStage(4);
      await storyController.goToStage(5);

      const endTime = performance.now();
      const completionTime = endTime - startTime;

      const storyStats = storyController.getStoryStats();

      expect(storyStats.totalTime).toBeCloseTo(completionTime, -2); // Within 100ms
      expect(storyStats.stagesCompleted).toBe(5);
      expect(storyStats.averageStageTime).toBe(completionTime / 4); // 4 transitions
    });

    test('should save and restore story state', async () => {
      await storyController.goToStage(3);

      const state = storyController.saveState();

      expect(state.currentStage).toBe(3);
      expect(state.startTime).toBeDefined();
      expect(state.stageTransitions).toHaveLength(2); // 1→2, 2→3

      // Create new controller with saved state
      const restoredController = new StoryController({
        imageLoader: mockImageLoader,
        particleSystem: mockParticleSystem,
        config: {
          stages: 5,
          transitionDuration: 500,
          autoProgress: false,
          enableProgressIndicator: true
        }
      });

      restoredController.restoreState(state);
      expect(restoredController.getCurrentStage()).toBe(3);

      restoredController.destroy();
    });

    test('should reset story state when requested', async () => {
      await storyController.goToStage(4);
      expect(storyController.getCurrentStage()).toBe(4);

      storyController.reset();
      expect(storyController.getCurrentStage()).toBe(1);
      expect(storyController.isStoryComplete()).toBe(false);

      // URL should be reset
      expect(window.history.replaceState).toHaveBeenCalledWith(
        { stage: 1 },
        '',
        expect.stringContaining('?stage=1')
      );
    });
  });

  describe('Auto-Progress Features', () => {
    test('should auto-progress after delay when enabled', async () => {
      const autoController = new StoryController({
        imageLoader: mockImageLoader,
        particleSystem: mockParticleSystem,
        config: {
          stages: 5,
          transitionDuration: 500,
          autoProgress: true,
          autoProgressDelay: 1000, // 1 second for testing
          enableProgressIndicator: true
        }
      });

      expect(autoController.getCurrentStage()).toBe(1);

      // Wait for auto-progress
      await new Promise(resolve => setTimeout(resolve, 1200));

      expect(autoController.getCurrentStage()).toBe(2);

      autoController.destroy();
    });

    test('should cancel auto-progress on user interaction', async () => {
      const autoController = new StoryController({
        imageLoader: mockImageLoader,
        particleSystem: mockParticleSystem,
        config: {
          stages: 5,
          transitionDuration: 500,
          autoProgress: true,
          autoProgressDelay: 1000,
          enableProgressIndicator: true
        }
      });

      // User interaction before auto-progress
      setTimeout(() => {
        autoController.userInteracted();
      }, 500);

      await new Promise(resolve => setTimeout(resolve, 1200));

      // Should not have auto-progressed due to user interaction
      expect(autoController.getCurrentStage()).toBe(1);

      autoController.destroy();
    });
  });

  describe('Error Handling', () => {
    test('should handle image loading failures gracefully', async () => {
      mockImageLoader.loadStageImage.mockRejectedValue(new Error('Image load failed'));

      // Should not throw error, but handle gracefully
      await expect(storyController.goToStage(2)).resolves.toBeUndefined();

      // Should update stage anyway
      expect(storyController.getCurrentStage()).toBe(2);
    });

    test('should handle particle system errors gracefully', async () => {
      mockParticleSystem.transitionToStage.mockRejectedValue(new Error('Particle system error'));

      await expect(storyController.goToStage(3)).resolves.toBeUndefined();

      // Should still update stage
      expect(storyController.getCurrentStage()).toBe(3);
    });

    test('should recover from corrupted story state', () => {
      const corruptedState = {
        currentStage: 10, // Invalid stage
        startTime: 'invalid-date',
        stageTransitions: null
      };

      expect(() => {
        storyController.restoreState(corruptedState);
      }).not.toThrow();

      // Should reset to valid state
      expect(storyController.getCurrentStage()).toBe(1);
    });
  });

  describe('Event System', () => {
    test('should emit events for stage changes', async () => {
      const stageChangeSpy = jest.fn();
      storyController.addEventListener('stageChange', stageChangeSpy);

      await storyController.goToStage(2);

      expect(stageChangeSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 1,
          to: 2,
          timestamp: expect.any(Number)
        })
      );
    });

    test('should emit events for story completion', async () => {
      const completionSpy = jest.fn();
      storyController.addEventListener('storyComplete', completionSpy);

      await storyController.goToStage(5);

      expect(completionSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          totalTime: expect.any(Number),
          stagesCompleted: 5
        })
      );
    });

    test('should emit events for transitions start and end', async () => {
      const transitionStartSpy = jest.fn();
      const transitionEndSpy = jest.fn();

      storyController.addEventListener('transitionStart', transitionStartSpy);
      storyController.addEventListener('transitionEnd', transitionEndSpy);

      await storyController.goToStage(2);

      expect(transitionStartSpy).toHaveBeenCalledWith({ stage: 2 });
      expect(transitionEndSpy).toHaveBeenCalledWith({ stage: 2 });
    });
  });
});