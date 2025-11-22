/**
 * LED Breadcrumbs Debugging System
 * Example implementation for Next.js/React projects
 *
 * Based on the proven Ai-Friends implementation
 */

export interface Breadcrumb {
  led: number;
  component: string;
  operation: string;
  context?: Record<string, any>;
  timestamp: number;
  status: 'success' | 'failed';
  error?: string;
}

export class BreadcrumbTrail {
  private component: string;
  private breadcrumbs: Breadcrumb[] = [];
  private static globalTrails: Map<string, BreadcrumbTrail> = new Map();

  constructor(componentName: string) {
    this.component = componentName;
    BreadcrumbTrail.globalTrails.set(componentName, this);
  }

  /**
   * Write breadcrumb to log file (server-side only)
   */
  private static async writeToLogFile(message: string): Promise<void> {
    if (typeof window !== 'undefined') {
      // Client-side: send to API endpoint that writes to file
      try {
        await fetch('/api/log-breadcrumb', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message, timestamp: Date.now() })
        }).catch(() => {
          // Silently fail if endpoint doesn't exist yet
        });
      } catch (e) {
        // Ignore logging errors
      }
    } else {
      // Server-side: write directly to file
      // Note: Requires fs module, implement based on your needs
      console.log(message); // Fallback to console
    }
  }

  /**
   * Light up an LED (successful operation)
   *
   * @example
   * const trail = new BreadcrumbTrail('LoginForm');
   * trail.light(LED_RANGES.FORM_SUBMISSION.VALIDATION_START, 'validating_input', {
   *   email: user.email
   * });
   */
  light(ledId: number, operation: string, context?: Record<string, any>): void {
    const breadcrumb: Breadcrumb = {
      led: ledId,
      component: this.component,
      operation,
      context: context || {},
      timestamp: Date.now(),
      status: 'success'
    };

    this.breadcrumbs.push(breadcrumb);

    // Console output for monitoring
    const contextStr = context ? JSON.stringify(context) : '';
    const message = `✅ LED ${ledId}: ${operation} [${this.component}] ${contextStr}`;
    console.log(message);

    // Write to log file
    BreadcrumbTrail.writeToLogFile(message);
  }

  /**
   * Light with verification (for critical checkpoints)
   *
   * @example
   * trail.lightWithVerification(
   *   LED_RANGES.DATA_PROCESSING.PARSE_COMPLETE,
   *   'json_parsed',
   *   { input: rawData },
   *   { expect: 'object', actual: typeof parsedData }
   * );
   */
  lightWithVerification(
    ledId: number,
    operation: string,
    context: Record<string, any>,
    verification: { expect: any; actual: any }
  ): void {
    const passed = verification.expect === verification.actual;
    const fullContext = {
      ...context,
      verification: {
        expected: verification.expect,
        actual: verification.actual,
        passed
      }
    };

    if (passed) {
      this.light(ledId, operation, fullContext);
    } else {
      this.fail(ledId, new Error('Verification failed'), operation, fullContext);
    }
  }

  /**
   * Record LED failure
   *
   * @example
   * try {
   *   const result = await api.post('/login', credentials);
   *   trail.light(LED_RANGES.API_CALLS.RESPONSE_RECEIVED, 'login_success');
   * } catch (error) {
   *   trail.fail(LED_RANGES.API_CALLS.REQUEST_FAILED, error, 'login_failed', {
   *     endpoint: '/login'
   *   });
   * }
   */
  fail(ledId: number, error: Error, operation: string, context?: Record<string, any>): void {
    const breadcrumb: Breadcrumb = {
      led: ledId,
      component: this.component,
      operation,
      context: context || {},
      timestamp: Date.now(),
      status: 'failed',
      error: error.message
    };

    this.breadcrumbs.push(breadcrumb);

    const message = `❌ LED ${ledId} FAILED [${this.component}]: ${operation} - ${error.message}`;
    console.error(message);

    // Write to log file
    BreadcrumbTrail.writeToLogFile(message);
  }

  /**
   * Get all breadcrumbs for this trail
   */
  getBreadcrumbs(): Breadcrumb[] {
    return [...this.breadcrumbs];
  }

  /**
   * Get all registered trails
   */
  static getAllTrails(): Map<string, BreadcrumbTrail> {
    return BreadcrumbTrail.globalTrails;
  }

  /**
   * Get breadcrumbs for a specific component
   */
  static getTrailFor(componentName: string): BreadcrumbTrail | undefined {
    return BreadcrumbTrail.globalTrails.get(componentName);
  }

  /**
   * Clear all breadcrumbs (useful for testing)
   */
  clear(): void {
    this.breadcrumbs = [];
  }

  /**
   * Clear all trails
   */
  static clearAll(): void {
    BreadcrumbTrail.globalTrails.forEach(trail => trail.clear());
  }
}

// Make available in browser console for debugging
if (typeof window !== 'undefined') {
  (window as any).debug = {
    breadcrumbs: BreadcrumbTrail,
    getTrail: (component: string) => BreadcrumbTrail.getTrailFor(component)?.getBreadcrumbs(),
    getAllTrails: () => {
      const trails: Record<string, Breadcrumb[]> = {};
      BreadcrumbTrail.getAllTrails().forEach((trail, name) => {
        trails[name] = trail.getBreadcrumbs();
      });
      return trails;
    }
  };
}

/**
 * Usage Example:
 *
 * import { BreadcrumbTrail } from '@/lib/breadcrumb-system';
 * import { LED_RANGES } from '@/lib/led-ranges';
 *
 * function MyComponent() {
 *   const trail = new BreadcrumbTrail('MyComponent');
 *
 *   useEffect(() => {
 *     trail.light(LED_RANGES.COMPONENT_RENDERING.RENDER_START, 'component_mounted');
 *
 *     return () => {
 *       trail.light(LED_RANGES.PAGE_LIFECYCLE.UNMOUNT, 'component_unmounting');
 *     };
 *   }, []);
 *
 *   const handleSubmit = async (data: FormData) => {
 *     trail.light(LED_RANGES.FORM_SUBMISSION.VALIDATION_START, 'validating');
 *
 *     try {
 *       trail.light(LED_RANGES.API_CALLS.REQUEST_START, 'api_call_started');
 *       const result = await api.post('/endpoint', data);
 *       trail.light(LED_RANGES.API_CALLS.RESPONSE_RECEIVED, 'api_success', { result });
 *     } catch (error) {
 *       trail.fail(LED_RANGES.ERRORS.NETWORK_ERROR, error, 'api_failed', { data });
 *     }
 *   };
 * }
 */
