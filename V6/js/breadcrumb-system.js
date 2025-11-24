/**
 * LED Breadcrumb System
 * Provides comprehensive logging and debugging tracking for V6 Modular Liquid Stories
 * Following SYSTEM-BREAKTHROUGHS.md requirements
 */

// Browser-compatible breadcrumb system
let fs, path;

// Only try to require in Node.js environment
try {
    if (typeof window === 'undefined') {
        fs = require('fs');
        path = require('path');
    }
} catch (e) {
    // Browser environment - fs and path not available
    fs = null;
    path = null;
}

// LED Range Definitions (from SYSTEM-BREAKTHROUGHS.md)
const LED_RANGES = {
    SYSTEM_LIFECYCLE: {
        INIT: 10000,
        READY: 10001,
        ERROR: 10002,
        SHUTDOWN: 10003
    },
    DEVICE_DETECTION: {
        START: 11000,
        COMPLETE: 11001,
        MOBILE_DETECTED: 11002,
        DESKTOP_DETECTED: 11003,
        TABLET_DETECTED: 11004,
        ERROR: 11005
    },
    PARTICLE_SYSTEM: {
        INIT: 20000,
        PARTICLES_CREATED: 20001,
        ANIMATION_START: 20002,
        ANIMATION_FRAME: 20003,
        INTERACTION_START: 20004,
        INTERACTION_END: 20005,
        PERFORMANCE_WARNING: 20006,
        ERROR: 20007
    },
    IMAGE_LOADING: {
        START: 21000,
        LOAD_SUCCESS: 21001,
        LOAD_ERROR: 21002,
        CACHE_HIT: 21003,
        ALL_LOADED: 21004,
        ERROR: 21005
    },
    USER_INTERACTION: {
        MOUSE_MOVE: 22000,
        TOUCH_START: 22001,
        TOUCH_MOVE: 22002,
        TOUCH_END: 22003,
        CLICK: 22004,
        GESTURE: 22005,
        ERROR: 22006
    },
    STORY_PROGRESSION: {
        STAGE_CHANGE: 23000,
        TRANSITION_START: 23001,
        TRANSITION_COMPLETE: 23002,
        PROGRESS_UPDATE: 23003,
        ERROR: 23004
    },
    PERFORMANCE: {
        FPS_MEASURE: 24000,
        MEMORY_WARNING: 24001,
        PERFORMANCE_DEGRADATION: 24002,
        OPTIMIZATION_APPLIED: 24003,
        ERROR: 24004
    },
    ERROR_LOGGING: {
        SYSTEM_ERROR: 30000,
        VALIDATION_ERROR: 30001,
        NETWORK_ERROR: 30002,
        USER_ERROR: 30003,
        CRITICAL_ERROR: 30004
    }
};

class BreadcrumbTrail {
    constructor(componentName) {
        this.componentName = componentName;
        this.startTime = Date.now();
        this.sessionId = this.generateSessionId();
        this.logs = []; // Store logs in memory for browser

        // Initialize log file with session header
        this.writeSessionHeader();
    }

    generateSessionId() {
        return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    writeSessionHeader() {
        // Set log file path only in Node.js environment
        if (fs && path && typeof process !== 'undefined') {
            this.logFile = path.join(process.cwd(), 'breadcrumb-debug.log');
        }

        const header = `\n=== V6 LIQUID STORIES SESSION ===\nSession ID: ${this.sessionId}\nComponent: ${this.componentName}\nStart Time: ${new Date().toISOString()}\n===============================\n`;
        this.writeToLog(header);
    }

    light(ledId, event, context = {}) {
        const timestamp = new Date().toISOString();
        const elapsed = Date.now() - this.startTime;

        const logEntry = `✅ LED ${ledId}: ${event} [${this.componentName}] (${elapsed}ms) ${
            Object.keys(context).length > 0 ? JSON.stringify(context) : ''
        }\n`;

        this.writeToLog(logEntry);

        // Also log to console in browser environment
        if (typeof window !== 'undefined') {
            console.log(`[LED ${ledId}] ${event}`, context);
        }
    }

    fail(ledId, error, event, context = {}) {
        const timestamp = new Date().toISOString();
        const elapsed = Date.now() - this.startTime;

        const logEntry = `❌ LED ${ledId} FAILED [${this.componentName}] (${elapsed}ms): ${event} - ${error.message}\n${
            Object.keys(context).length > 0 ? JSON.stringify(context, null, 2) : ''
        }\n`;

        this.writeToLog(logEntry);

        // Also log to console in browser environment
        if (typeof window !== 'undefined') {
            console.error(`[LED ${ledId} FAILED] ${event}`, error, context);
        }
    }

    warn(ledId, event, context = {}) {
        const timestamp = new Date().toISOString();
        const elapsed = Date.now() - this.startTime;

        const logEntry = `⚠️ LED ${ledId} WARNING [${this.componentName}] (${elapsed}ms): ${event}\n${
            Object.keys(context).length > 0 ? JSON.stringify(context) : ''
        }\n`;

        this.writeToLog(logEntry);

        // Also log to console in browser environment
        if (typeof window !== 'undefined') {
            console.warn(`[LED ${ledId} WARNING] ${event}`, context);
        }
    }

    writeToLog(entry) {
        try {
            // Write to file system in Node.js environment
            if (typeof fs !== 'undefined' && fs && this.logFile) {
                fs.appendFileSync(this.logFile, entry);
            } else {
                // Browser environment - store in memory
                this.logs.push(entry);
            }
        } catch (error) {
            // Fallback to console if file writing fails
            if (typeof console !== 'undefined') {
                console.log('BreadcrumbTrail: Could not write to log file', error);
                console.log(entry);
            }
        }
    }

    // Performance tracking
    startPerformanceMeasure(measureName) {
        this.light(LED_RANGES.PERFORMANCE.FPS_MEASURE, `Performance measurement started: ${measureName}`);
        return performance.now();
    }

    endPerformanceMeasure(measureName, startTime) {
        const duration = performance.now() - startTime;
        this.light(LED_RANGES.PERFORMANCE.FPS_MEASURE, `Performance measurement ended: ${measureName}`, {
            duration: `${duration.toFixed(2)}ms`,
            startTime: startTime.toFixed(2)
        });
        return duration;
    }

    // Error tracking with LED breadcrumbs
    trackError(error, context = {}) {
        const ledId = this.getErrorCode(error);
        this.fail(ledId, error, error.message || 'Unknown error', {
            stack: error.stack,
            ...context
        });
    }

    getErrorCode(error) {
        if (error.name === 'TypeError') return LED_RANGES.ERROR_LOGGING.VALIDATION_ERROR;
        if (error.name === 'NetworkError') return LED_RANGES.ERROR_LOGGING.NETWORK_ERROR;
        return LED_RANGES.ERROR_LOGGING.SYSTEM_ERROR;
    }

    // Session cleanup
    destroy() {
        const elapsed = Date.now() - this.startTime;
        this.light(LED_RANGES.SYSTEM_LIFECYCLE.SHUTDOWN, 'Component shutdown', {
            totalRuntime: `${elapsed}ms`,
            sessionDuration: `${(elapsed / 1000).toFixed(2)}s`
        });
    }

    // Get logs for browser debugging
    getLogs() {
        return this.logs.join('\n');
    }

    // Export logs to downloadable file in browser
    exportLogs() {
        if (typeof window !== 'undefined' && this.logs.length > 0) {
            const blob = new Blob([this.logs.join('\n')], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `breadcrumb-debug-${this.sessionId}.log`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    }
}

// ES6 exports for browser environment
export { BreadcrumbTrail, LED_RANGES };
export default BreadcrumbTrail;