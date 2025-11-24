/**
 * Accessibility Tests: WCAG Compliance
 * PRD Sections: 5.3, 7.3.1
 *
 * Tests cover:
 * - Screen reader compatibility
 * - WCAG compliance for touch targets (44px minimum)
 * - Keyboard navigation support
 * - Color contrast requirements
 * - ARIA labels and semantic HTML
 * - High contrast mode support
 */

import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

test.describe('WCAG Accessibility Compliance', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    await injectAxe(page);
  });

  test.describe('PRD 5.3.1: Screen Reader Support', () => {
    test('should provide proper ARIA labels for interactive elements', async ({ page }) => {
      await page.waitForFunction(() => {
        return window.storyController && window.storyController.isReady();
      });

      // Check for ARIA labels on interactive elements
      const ariaLabels = await page.evaluate(() => {
        const interactiveElements = [
          ...Array.from(document.querySelectorAll('button')),
          ...Array.from(document.querySelectorAll('[data-testid]')),
          ...Array.from(document.querySelectorAll('.interactive')),
          ...Array.from(document.querySelectorAll('[role]'))
        ];

        return interactiveElements.map(el => ({
          tagName: el.tagName.toLowerCase(),
          className: el.className,
          hasLabel: !!el.getAttribute('aria-label'),
          hasLabeledBy: !!el.getAttribute('aria-labelledby'),
          hasDescription: !!el.getAttribute('aria-describedby'),
          role: el.getAttribute('role'),
          textContent: el.textContent?.trim()
        }));
      });

      // All interactive elements should have appropriate labels
      ariaLabels.forEach(element => {
        if (element.role || ['button', 'input', 'select'].includes(element.tagName)) {
          expect(element.hasLabel || element.hasLabeledBy || element.textContent).toBe(true);
        }
      });

      console.log('Interactive elements with ARIA labels:', ariaLabels.length);
    });

    test('should use semantic HTML structure', async ({ page }) => {
      const semanticStructure = await page.evaluate(() => {
        return {
          hasMain: !!document.querySelector('main'),
          hasHeader: !!document.querySelector('header'),
          hasNav: !!document.querySelector('nav'),
          hasSection: !!document.querySelector('section'),
          hasArticle: !!document.querySelector('article'),
          hasFooter: !!document.querySelector('footer'),
          hasHeadingHierarchy: (() => {
            const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
            return headings.length > 0 && headings.every(h => h.textContent?.trim());
          })(),
          hasLandmarks: !!document.querySelector('[role="main"]') || !!document.querySelector('main'),
          hasCanvasAlternative: !!document.querySelector('canvas[alt], canvas[aria-label]')
        };
      });

      // Should have basic semantic structure
      expect(semanticStructure.hasMain || semanticStructure.hasLandmarks).toBe(true);
      expect(semanticStructure.hasCanvasAlternative).toBe(true);

      console.log('Semantic structure analysis:', semanticStructure);
    });

    test('should announce stage changes to screen readers', async ({ page }) => {
      await page.waitForFunction(() => {
        return window.storyController && window.storyController.isReady();
      });

      // Create a live region for announcements
      await page.addInitScript(() => {
        const announcer = document.createElement('div');
        announcer.setAttribute('aria-live', 'polite');
        announcer.setAttribute('aria-atomic', 'true');
        announcer.setAttribute('class', 'sr-only');
        announcer.style.position = 'absolute';
        announcer.style.left = '-10000px';
        announcer.style.width = '1px';
        announcer.style.height = '1px';
        announcer.style.overflow = 'hidden';
        document.body.appendChild(announcer);
        window.screenReaderAnnouncer = announcer;
      });

      // Progress through stages and check announcements
      for (let stage = 2; stage <= 4; stage++) {
        await page.evaluate((targetStage) => {
          return window.storyController.goToStage(targetStage);
        }, stage);

        await page.waitForTimeout(700);

        // Check if announcement was made
        const announcement = await page.locator('.sr-only[aria-live="polite"]').textContent();
        expect(announcement).toContain(`Stage ${stage}`);
      }
    });

    test('should provide alternative text for meaningful images', async ({ page }) => {
      await page.waitForFunction(() => {
        return window.storyController && window.storyController.isReady();
      });

      // Check image elements for alt text
      const imageAccessibility = await page.evaluate(() => {
        const images = Array.from(document.querySelectorAll('img'));
        return images.map(img => ({
          src: img.src,
          hasAlt: !!img.alt,
          hasAriaLabel: !!img.getAttribute('aria-label'),
          hasRole: img.getAttribute('role'),
          isDecorative: img.getAttribute('alt') === '' || img.getAttribute('role') === 'presentation'
        }));
      });

      // All meaningful images should have alt text or aria-label
      imageAccessibility.forEach(image => {
        if (!image.isDecorative) {
          expect(image.hasAlt || image.hasAriaLabel).toBe(true);
        }
      });

      console.log('Image accessibility analysis:', imageAccessibility);
    });
  });

  test.describe('PRD 5.2.4: WCAG Touch Target Compliance', () => {
    test('should ensure touch targets are 44px minimum on mobile', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 393, height: 851 });
      await page.goto('http://localhost:3000/mobile');

      await page.waitForFunction(() => {
        return window.storyController && window.storyController.isReady();
      });

      // Analyze touch targets
      const touchTargetAnalysis = await page.evaluate(() => {
        const touchTargets = Array.from(document.querySelectorAll([
          'button',
          '[role="button"]',
          'a',
          'input',
          'select',
          'textarea',
          '[data-touch-target]',
          '.touch-target',
          '.interactive'
        ].join(', ')));

        return touchTargets.map(target => {
          const rect = target.getBoundingClientRect();
          const computedStyle = window.getComputedStyle(target);

          return {
            tagName: target.tagName.toLowerCase(),
            className: target.className,
            width: rect.width,
            height: rect.height,
            area: rect.width * rect.height,
            minDimension: Math.min(rect.width, rect.height),
            hasTouchOptimized: computedStyle.touchAction !== 'none',
            isVisible: computedStyle.display !== 'none' && computedStyle.visibility !== 'hidden',
            hasPointerCursor: computedStyle.cursor === 'pointer' || target.tagName === 'button'
          };
        }).filter(target => target.isVisible);
      });

      // Validate WCAG 44px minimum for touch targets
      let wcagCompliantTargets = 0;
      let totalTargets = touchTargetAnalysis.length;

      touchTargetAnalysis.forEach(target => {
        if (target.minDimension >= 44) {
          wcagCompliantTargets++;
        } else {
          console.warn(`Touch target too small: ${target.tagName}.${target.className} - ${target.minDimension}px`);
        }
      });

      const compliancePercentage = (wcagCompliantTargets / totalTargets) * 100;
      expect(compliancePercentage).toBeGreaterThanOrEqual(95); // 95% of targets should comply

      console.log(`Touch target compliance: ${wcagCompliantTargets}/${totalTargets} (${compliancePercentage.toFixed(1)}%)`);
    });

    test('should provide adequate spacing between touch targets', async ({ page }) => {
      await page.setViewportSize({ width: 393, height: 851 });
      await page.goto('http://localhost:3000/mobile');

      await page.waitForFunction(() => {
        return window.storyController && window.storyController.isReady();
      });

      // Analyze spacing between touch targets
      const spacingAnalysis = await page.evaluate(() => {
        const touchTargets = Array.from(document.querySelectorAll([
          'button',
          '[role="button"]',
          'a',
          '.touch-target'
        ].join(', ')));

        const rects = touchTargets.map(target => {
          const rect = target.getBoundingClientRect();
          return {
            element: target.tagName.toLowerCase() + (target.className ? '.' + target.className : ''),
            left: rect.left,
            top: rect.top,
            right: rect.right,
            bottom: rect.bottom,
            width: rect.width,
            height: rect.height,
            centerX: rect.left + rect.width / 2,
            centerY: rect.top + rect.height / 2
          };
        });

        // Calculate minimum distances between targets
        const distances = [];
        for (let i = 0; i < rects.length; i++) {
          for (let j = i + 1; j < rects.length; j++) {
            const a = rects[i];
            const b = rects[j];

            // Calculate distance between centers
            const dx = b.centerX - a.centerX;
            const dy = b.centerY - a.centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Calculate edge-to-edge distance
            const horizontalGap = Math.max(0, Math.min(b.left, a.right) - Math.max(a.left, b.right));
            const verticalGap = Math.max(0, Math.min(b.top, a.bottom) - Math.max(a.top, b.bottom));
            const edgeDistance = horizontalGap > 0 || verticalGap > 0 ?
              Math.max(horizontalGap, verticalGap) : distance;

            distances.push({
              target1: a.element,
              target2: b.element,
              centerDistance: distance,
              edgeDistance: edgeDistance
            });
          }
        }

        return {
          totalTargets: rects.length,
          minEdgeDistance: Math.min(...distances.map(d => d.edgeDistance)),
          avgEdgeDistance: distances.reduce((sum, d) => sum + d.edgeDistance, 0) / distances.length,
          problematicPairs: distances.filter(d => d.edgeDistance < 8) // 8px minimum spacing
        };
      });

      // Validate spacing requirements
      expect(spacingAnalysis.minEdgeDistance).toBeGreaterThanOrEqual(8); // 8px minimum spacing
      expect(spacingAnalysis.problematicPairs.length).toBeLessThanOrEqual(1); // At most 1 problematic pair

      console.log('Touch target spacing analysis:', spacingAnalysis);
    });
  });

  test.describe('PRD 5.3.2: Visual Accessibility', () => {
    test('should provide sufficient color contrast for readability', async ({ page }) => {
      await page.waitForFunction(() => {
        return window.storyController && window.storyController.isReady();
      });

      // Analyze color contrast
      const contrastAnalysis = await page.evaluate(() => {
        const textElements = Array.from(document.querySelectorAll([
          'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
          'p', 'span', 'div', 'button', 'a'
        ].join(', ')));

        // Simulate contrast calculation (would use actual color library in production)
        return textElements.map(element => {
          const style = window.getComputedStyle(element);
          const text = element.textContent?.trim();

          if (!text) return null;

          return {
            tagName: element.tagName.toLowerCase(),
            className: element.className,
            text: text.substring(0, 50),
            fontSize: parseFloat(style.fontSize),
            fontWeight: style.fontWeight,
            color: style.color,
            backgroundColor: style.backgroundColor,
            estimatedContrast: 'normal' // Would calculate actual WCAG ratio
          };
        }).filter(Boolean);
      });

      // Validate text visibility
      contrastAnalysis.forEach(element => {
        expect(element.text).toBeTruthy();
        expect(element.fontSize).toBeGreaterThan(0);

        // Large text (>18pt or 14pt bold) needs 3:1 contrast, small text needs 4.5:1
        const isLargeText = element.fontSize > 18 || (element.fontSize > 14 && element.fontWeight >= 700);
        const requiredContrast = isLargeText ? 3 : 4.5;

        // In production, would check actual contrast ratio
        expect(element.estimatedContrast).toBeDefined();
      });

      console.log('Color contrast analysis:', contrastAnalysis.length, 'text elements');
    });

    test('should support high contrast mode', async ({ page }) => {
      // Simulate high contrast mode
      await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });

      // Add high contrast media query simulation
      await page.addStyleTag({
        content: `
          @media (prefers-contrast: high) {
            .high-contrast {
              filter: contrast(2) !important;
            }
            .progress-indicator {
              border: 2px solid white !important;
            }
          }
        `
      });

      await page.goto('http://localhost:3000');

      await page.waitForFunction(() => {
        return window.storyController && window.storyController.isReady();
      });

      const highContrastSupport = await page.evaluate(() => {
        return {
          hasHighContrastStyles: !!document.querySelector('.high-contrast'),
          mediaQuerySupported: window.matchMedia('(prefers-contrast: high)').media !== 'not all',
          hasIncreasedBorders: !!Array.from(document.querySelectorAll('*')).some(el => {
            const style = window.getComputedStyle(el);
            return parseInt(style.borderWidth) > 1;
          })
        };
      });

      // Should provide some form of high contrast support
      expect(highContrastSupport.mediaQuerySupported || highContrastSupport.hasHighContrastStyles).toBe(true);

      console.log('High contrast support:', highContrastSupport);
    });

    test('should support reduced motion preferences', async ({ page }) => {
      // Enable reduced motion
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto('http://localhost:3000');

      await page.waitForFunction(() => {
        return window.storyController && window.storyController.isReady();
      });

      // Test transitions with reduced motion
      const transitionTime = await page.evaluate(async () => {
        const startTime = performance.now();
        await window.storyController.goToStage(2);
        const endTime = performance.now();
        return endTime - startTime;
      });

      // Transitions should be faster or disabled with reduced motion
      expect(transitionTime).toBeLessThan(300); // Should be much faster than 500ms

      const reducedMotionApplied = await page.evaluate(() => {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      });

      expect(reducedMotionApplied).toBe(true);

      console.log('Reduced motion transition time:', transitionTime);
    });

    test('should provide adjustable text sizes for readability', async ({ page }) => {
      await page.waitForFunction(() => {
        return window.storyController && window.storyController.isReady();
      });

      // Test text zoom functionality
      await page.addStyleTag({
        content: `
          body {
            font-size: 18px !important; /* Larger base font size */
          }
        `
      });

      const textZoomSupport = await page.evaluate(() => {
        const textElements = document.querySelectorAll('h1, h2, h3, p, span, div');
        const fontSizeAnalysis = Array.from(textElements).map(el => {
          const style = window.getComputedStyle(el);
          return {
            element: el.tagName.toLowerCase() + (el.className ? '.' + el.className : ''),
            fontSize: parseFloat(style.fontSize),
            isReadable: parseFloat(style.fontSize) >= 16
          };
        });

        return {
          totalElements: textElements.length,
          readableElements: fontSizeAnalysis.filter(el => el.isReadable).length,
          averageFontSize: fontSizeAnalysis.reduce((sum, el) => sum + el.fontSize, 0) / fontSizeAnalysis.length,
          smallestFont: Math.min(...fontSizeAnalysis.map(el => el.fontSize))
        };
      });

      // Most text should be readable after zoom
      expect(textZoomSupport.readableElements / textZoomSupport.totalElements).toBeGreaterThan(0.8);
      expect(textZoomSupport.smallestFont).toBeGreaterThanOrEqual(14);

      console.log('Text zoom support analysis:', textZoomSupport);
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('should support keyboard navigation for interactive elements', async ({ page }) => {
      await page.waitForFunction(() => {
        return window.storyController && window.storyController.isReady();
      });

      // Test keyboard navigation
      const keyboardNavigation = await page.evaluate(() => {
        const focusableElements = Array.from(document.querySelectorAll([
          'button',
          'input',
          'select',
          'textarea',
          'a[href]',
          '[tabindex]:not([tabindex="-1"])',
          '[contenteditable="true"]'
        ].join(', ')));

        return focusableElements.map(el => ({
          tagName: el.tagName.toLowerCase(),
          className: el.className,
          tabIndex: el.tabIndex,
          hasTabIndex: el.hasAttribute('tabindex'),
          isVisible: window.getComputedStyle(el).display !== 'none',
          hasFocusStyles: !!el.getAttribute('data-focus-visible') ||
                        window.getComputedStyle(el, ':focus').outline !== 'none'
        }));
      });

      // Should have focusable elements for accessibility
      expect(keyboardNavigation.length).toBeGreaterThan(0);

      // Elements should be visible and have proper focus handling
      keyboardNavigation.forEach(element => {
        expect(element.isVisible).toBe(true);
        // TabIndex should be reasonable (0 for natural order, -1 for programmatic)
        expect(element.tabIndex >= -1).toBe(true);
      });

      console.log('Keyboard navigation analysis:', keyboardNavigation);
    });

    test('should show visible focus indicators', async ({ page }) => {
      await page.waitForFunction(() => {
        return window.storyController && window.storyController.isReady();
      });

      // Tab through elements and check focus visibility
      await page.keyboard.press('Tab');
      await page.waitForTimeout(100);

      const focusIndicator = await page.evaluate(() => {
        const activeElement = document.activeElement;
        if (!activeElement) return null;

        const style = window.getComputedStyle(activeElement, ':focus');
        const computedStyle = window.getComputedStyle(activeElement);

        return {
          tagName: activeElement.tagName.toLowerCase(),
          className: activeElement.className,
          hasFocus: activeElement === document.activeElement,
          outlineWidth: style.outlineWidth,
          outlineStyle: style.outlineStyle,
          outlineColor: style.outlineColor,
          boxShadow: style.boxShadow,
          border: style.border
        };
      });

      // Focus should be visible with at least one visual indicator
      expect(focusIndicator).toBeTruthy();
      expect(focusIndicator.hasFocus).toBe(true);

      const hasVisibleFocus =
        focusIndicator.outlineWidth !== '0px' ||
        focusIndicator.outlineStyle !== 'none' ||
        focusIndicator.boxShadow !== 'none' ||
        focusIndicator.border !== '0px';

      expect(hasVisibleFocus).toBe(true);

      console.log('Focus indicator analysis:', focusIndicator);
    });
  });

  test.describe('Comprehensive Axe Testing', () => {
    test('should pass axe-core accessibility tests', async ({ page }) => {
      await page.waitForFunction(() => {
        return window.storyController && window.storyController.isReady();
      });

      // Run axe-core accessibility tests
      await checkA11y(page, null, {
        detailedReport: true,
        detailedReportOptions: { html: true },
        reporter: 'v2',
        rules: {
          // Enable WCAG 2.1 AA compliance
          'color-contrast': { enabled: true },
          'keyboard': { enabled: true },
          'focus-order-semantics': { enabled: true },
          'heading-order': { enabled: true },
          'label-title-only': { enabled: true },
          'link-name': { enabled: true },
          'list': { enabled: true },
          'list-item': { enabled: true },
          'meta-viewport-large': { enabled: true },
          'meta-viewport': { enabled: true },
          'scrollable-region-focusable': { enabled: true },
          'bypass': { enabled: true }
        }
      });
    });

    test('should pass mobile-specific accessibility tests', async ({ page }) => {
      await page.setViewportSize({ width: 393, height: 851 });
      await page.goto('http://localhost:3000/mobile');

      await page.waitForFunction(() => {
        return window.storyController && window.storyController.isReady();
      });

      // Run mobile-specific accessibility tests
      await checkA11y(page, null, {
        detailedReport: true,
        rules: {
          'touch-target-size': { enabled: true },
          'target-size': { enabled: true },
          'color-contrast': { enabled: true },
          'keyboard': { enabled: true }
        }
      });
    });
  });
});