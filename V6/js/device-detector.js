/**
 * Device Detection Module
 * Provides automatic device detection and capability assessment
 * with LED breadcrumb debugging system
 */

import { BreadcrumbTrail, LED_RANGES } from './breadcrumb-system.js';

class DeviceDetector {
    constructor() {
        // Initialize LED breadcrumb system
        this.trail = new BreadcrumbTrail('DeviceDetector');
        this.trail.light(LED_RANGES.DEVICE_DETECTION.START, 'DeviceDetector initialization started');

        // Don't store values in constructor - get them fresh in detect() method
        // This allows tests to mock navigator/screen before calling detect()

        this.trail.light(LED_RANGES.DEVICE_DETECTION.START, 'DeviceDetector initialization completed');
    }

    /**
     * Detect device type and capabilities
     * @returns {Object} Device information object
     */
    detect() {
        this.trail.light(LED_RANGES.DEVICE_DETECTION.COMPLETE, 'Starting device detection');

        try {
            // Get current values to support test mocking
            const currentUserAgent = navigator.userAgent;
            const currentTouchSupported = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
            const currentScreenInfo = this.getScreenInfo();

            const deviceType = this.getDeviceType();
            const capabilities = this.getCapabilities();
            const performance = this.getPerformanceProfile();

            const deviceInfo = {
                deviceType, // Added for test compatibility
                type: deviceType,
                isMobile: deviceType === 'mobile',
                isTablet: deviceType === 'tablet',
                isDesktop: deviceType === 'desktop',
                capabilities,
                performance,
                screen: currentScreenInfo,
                userAgent: currentUserAgent,
                touchSupported: currentTouchSupported,
                hasTouch: currentTouchSupported, // Added for test compatibility
                maxTouchPoints: navigator.maxTouchPoints || 0, // Added for test compatibility
                os: this.getOperatingSystem(), // Added for test compatibility
                browser: this.getBrowserName(), // Added for test compatibility
                browserVersion: this.getBrowserVersion(), // Added for test compatibility
                viewport: this.getViewportInfo(), // Added for test compatibility
                recommendedSettings: this.getRecommendedSettings(deviceType, performance)
            };

            // Log successful detection
            if (deviceType === 'mobile') {
                this.trail.light(LED_RANGES.DEVICE_DETECTION.MOBILE_DETECTED, 'Mobile device detected', deviceInfo);
            } else if (deviceType === 'tablet') {
                this.trail.light(LED_RANGES.DEVICE_DETECTION.TABLET_DETECTED, 'Tablet device detected', deviceInfo);
            } else {
                this.trail.light(LED_RANGES.DEVICE_DETECTION.DESKTOP_DETECTED, 'Desktop device detected', deviceInfo);
            }

            return deviceInfo;
        } catch (error) {
            this.trail.fail(LED_RANGES.DEVICE_DETECTION.ERROR, error, 'Device detection failed');
            throw error;
        }
    }

    /**
     * Determine device type based on user agent and capabilities
     * @returns {string} Device type: 'mobile', 'tablet', or 'desktop'
     */
    getDeviceType() {
        // Tablet detection first (tablets often have mobile user agents)
        if (this.isTablet()) {
            return 'tablet';
        }

        // Mobile detection
        if (this.isMobile()) {
            return 'mobile';
        }

        // Default to desktop
        return 'desktop';
    }

    /**
     * Check if device is a mobile phone
     * @returns {boolean}
     */
    isMobile() {
        const mobileKeywords = [
            'Mobile', 'Android', 'iPhone', 'iPod', 'BlackBerry',
            'Windows Phone', 'webOS', 'Opera Mini', 'IEMobile'
        ];

        const userAgent = navigator.userAgent;
        const touchSupported = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        const screenInfo = this.getScreenInfo();

        return mobileKeywords.some(keyword =>
            userAgent.includes(keyword) && !userAgent.includes('iPad')
        ) && touchSupported && screenInfo.width < 768;
    }

    /**
     * Check if device is a tablet
     * @returns {boolean}
     */
    isTablet() {
        const tabletKeywords = ['iPad', 'Tablet', 'Android Tablet'];
        const userAgent = navigator.userAgent;
        const touchSupported = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        const screenInfo = this.getScreenInfo();

        // More specific iPad detection - don't catch iPhones
        const isIPad = userAgent.includes('iPad') ||
                      (userAgent.includes('Mac') && touchSupported && !userAgent.includes('iPhone'));

        return isIPad ||
               tabletKeywords.some(keyword => userAgent.includes(keyword)) ||
               (touchSupported && screenInfo.width >= 768 && screenInfo.width < 1024);
    }

    /**
     * Get screen information
     * @returns {Object} Screen dimensions and pixel density
     */
    getScreenInfo() {
        return {
            width: screen.width,
            height: screen.height,
            availWidth: screen.availWidth,
            availHeight: screen.availHeight,
            colorDepth: screen.colorDepth,
            pixelDepth: screen.pixelDepth,
            devicePixelRatio: window.devicePixelRatio || 1,
            orientation: this.getScreenOrientation()
        };
    }

    /**
     * Get screen orientation
     * @returns {string} 'portrait' or 'landscape'
     */
    getScreenOrientation() {
        if (screen.orientation) {
            return screen.orientation.angle % 180 === 0 ? 'portrait' : 'landscape';
        }
        return window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
    }

    /**
     * Get device capabilities
     * @returns {Object} Capabilities object
     */
    getCapabilities() {
        return {
            touch: this.touchSupported,
            multiTouch: navigator.maxTouchPoints > 1,
            webGL: this.checkWebGLSupport(),
            webGL2: this.checkWebGL2Support(),
            canvas: !!document.createElement('canvas').getContext,
            webAudio: !!(window.AudioContext || window.webkitAudioContext),
            localStorage: this.checkLocalStorage(),
            sessionStorage: this.checkSessionStorage(),
            indexedDB: 'indexedDB' in window,
            webWorkers: typeof Worker !== 'undefined',
            serviceWorkers: 'serviceWorker' in navigator,
            geolocation: 'geolocation' in navigator,
            camera: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
            microphone: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
        };
    }

    /**
     * Check WebGL support
     * @returns {boolean}
     */
    checkWebGLSupport() {
        try {
            const canvas = document.createElement('canvas');
            return !!(window.WebGLRenderingContext &&
                     (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
        } catch (e) {
            return false;
        }
    }

    /**
     * Check WebGL2 support
     * @returns {boolean}
     */
    checkWebGL2Support() {
        try {
            const canvas = document.createElement('canvas');
            return !!canvas.getContext('webgl2');
        } catch (e) {
            return false;
        }
    }

    /**
     * Check localStorage availability
     * @returns {boolean}
     */
    checkLocalStorage() {
        try {
            const test = '__test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Check sessionStorage availability
     * @returns {boolean}
     */
    checkSessionStorage() {
        try {
            const test = '__test__';
            sessionStorage.setItem(test, test);
            sessionStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Get performance information
     * @returns {Object} Performance capabilities
     */
    getPerformanceInfo() {
        return {
            cores: navigator.hardwareConcurrency || 4,
            memory: navigator.deviceMemory || 4,
            connection: this.getConnectionInfo(),
            performanceAPI: !!window.performance,
            performanceNow: typeof performance !== 'undefined' && typeof performance.now === 'function'
        };
    }

    /**
     * Get network connection information
     * @returns {Object} Connection details
     */
    getConnectionInfo() {
        const connection = navigator.connection ||
                          navigator.mozConnection ||
                          navigator.webkitConnection;

        if (!connection) {
            return { available: false };
        }

        return {
            available: true,
            effectiveType: connection.effectiveType || 'unknown',
            downlink: connection.downlink || null,
            downlinkMax: connection.downlinkMax || null,
            rtt: connection.rtt || null,
            saveData: connection.saveData || false
        };
    }

    /**
     * Get performance profile based on device capabilities
     * @returns {string} 'low', 'medium', or 'high'
     */
    getPerformanceProfile() {
        let score = 0;

        // CPU cores
        score += (navigator.hardwareConcurrency || 4) * 10;

        // Memory
        score += (navigator.deviceMemory || 4) * 20;

        // Touch capability (penalty for touch-only devices)
        const touchSupported = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        score += touchSupported ? 0 : 30;

        // Screen size (bonus for larger screens)
        const screenInfo = this.getScreenInfo();
        score += Math.min(screenInfo.width / 50, 40);

        // Determine profile
        if (score >= 150) return 'high';
        if (score >= 80) return 'medium';
        return 'low';
    }

    /**
     * Get recommended settings based on device type and performance
     * @param {string} deviceType - Device type
     * @param {string} performance - Performance profile
     * @returns {Object} Recommended settings
     */
    getRecommendedSettings(deviceType, performance) {
        const baseSettings = {
            particleCount: deviceType === 'mobile' ? 5000 : 10000,
            maxVelocity: deviceType === 'mobile' ? 3 : 5,
            interactionRadius: 150,
            damping: 0.98,
            targetFPS: deviceType === 'mobile' ? 30 : 60
        };

        // Adjust based on performance
        if (performance === 'low') {
            baseSettings.particleCount = Math.floor(baseSettings.particleCount * 0.6);
            baseSettings.targetFPS = Math.floor(baseSettings.targetFPS * 0.7);
            baseSettings.interactionRadius = Math.floor(baseSettings.interactionRadius * 0.8);
        } else if (performance === 'high') {
            baseSettings.particleCount = Math.floor(baseSettings.particleCount * 1.2);
            baseSettings.interactionRadius = Math.floor(baseSettings.interactionRadius * 1.1);
        }

        return baseSettings;
    }

    /**
     * Get browser information
     * @returns {Object} Browser details
     */
    getBrowserInfo() {
        const ua = this.userAgent;

        return {
            name: this.getBrowserName(ua),
            version: this.getBrowserVersion(ua),
            engine: this.getBrowserEngine(ua),
            platform: navigator.platform
        };
    }

    /**
     * Get browser name from user agent
     * @param {string} ua - User agent string
     * @returns {string} Browser name
     */
    getBrowserName(ua) {
        if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Chrome';
        if (ua.includes('Firefox')) return 'Firefox';
        if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
        if (ua.includes('Edg')) return 'Edge';
        if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera';
        if (ua.includes('MSIE') || ua.includes('Trident')) return 'Internet Explorer';
        return 'Unknown';
    }

    /**
     * Get browser version from user agent
     * @param {string} ua - User agent string
     * @returns {string} Browser version
     */
    getBrowserVersion(ua) {
        const match = ua.match(/(Chrome|Firefox|Safari|Edg|Opera|MSIE|Trident)\/(\d+)/);
        return match ? match[2] : 'Unknown';
    }

    /**
     * Get browser engine from user agent
     * @param {string} ua - User agent string
     * @returns {string} Browser engine
     */
    getBrowserEngine(ua) {
        if (ua.includes('WebKit')) return 'WebKit';
        if (ua.includes('Gecko')) return 'Gecko';
        if (ua.includes('Trident')) return 'Trident';
        if (ua.includes('Presto')) return 'Presto';
        return 'Unknown';
    }
  // === ADDITIONAL METHODS FOR TEST COMPATIBILITY ===

    /**
     * Destroy method for test cleanup
     */
    destroy() {
        this.trail.light(LED_RANGES.SYSTEM_LIFECYCLE.SHUTDOWN, 'DeviceDetector destroyed');
        if (this.trail) {
            this.trail.destroy();
        }
    }

    /**
     * Get performance settings based on detected device
     * @returns {Object} Performance settings
     */
    getPerformanceSettings() {
        const deviceInfo = this.detect();

        if (deviceInfo.isMobile) {
            return {
                particleCount: 5000,
                quality: 'high',
                targetFPS: 30,
                maxVelocity: 4,
                interactionRadius: 120,
                enableTrails: false,
                enableGlow: true
            };
        } else if (deviceInfo.isTablet) {
            return {
                particleCount: 7500,
                quality: 'high',
                targetFPS: 45,
                maxVelocity: 4.5,
                interactionRadius: 135,
                enableTrails: true,
                enableGlow: true
            };
        } else {
            return {
                particleCount: 10000,
                quality: 'maximum',
                targetFPS: 60,
                maxVelocity: 5,
                interactionRadius: 150,
                enableTrails: true,
                enableGlow: true
            };
        }
    }

    /**
     * Detect specific feature support
     * @param {string} feature - Feature name to detect
     * @returns {boolean} Whether feature is supported
     */
    detectFeature(feature) {
        const features = {
            canvas: () => {
                const canvas = document.createElement('canvas');
                return !!(canvas.getContext && canvas.getContext('2d'));
            },
            webgl: () => {
                const canvas = document.createElement('canvas');
                return !!(canvas.getContext && canvas.getContext('webgl'));
            },
            es6Modules: () => {
                try {
                    new Function('import("")');
                    return true;
                } catch (e) {
                    return false;
                }
            },
            webassembly: () => {
                return typeof WebAssembly === 'object';
            },
            touch: () => {
                return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
            }
        };

        if (features[feature]) {
            const supported = features[feature]();
            this.trail.light(LED_RANGES.DEVICE_DETECTION.COMPLETE, `Feature detection: ${feature}`, {
                supported
            });
            return supported;
        }

        return false;
    }

    /**
     * Get browser recommendations
     * @returns {Object} Browser compatibility information
     */
    getBrowserRecommendations() {
        const browserInfo = this.getBrowserInfo();
        const ua = navigator.userAgent;

        // Check browser version
        const isChrome = ua.includes('Chrome');
        const isFirefox = ua.includes('Firefox');
        const isSafari = ua.includes('Safari') && !isChrome;
        const isEdge = ua.includes('Edg');

        let supported = true;
        let recommendedVersion = 'Latest';
        let warnings = [];

        // Check browser compatibility
        if (isChrome && browserInfo.version && parseInt(browserInfo.version) < 90) {
            supported = false;
            recommendedVersion = '90+';
            warnings.push('Chrome version 90+ required for optimal performance');
        }

        if (isFirefox && browserInfo.version && parseInt(browserInfo.version) < 88) {
            supported = false;
            recommendedVersion = '88+';
            warnings.push('Firefox version 88+ required for optimal performance');
        }

        if (isSafari && browserInfo.version && parseInt(browserInfo.version) < 14) {
            supported = false;
            recommendedVersion = '14+';
            warnings.push('Safari version 14+ required for optimal performance');
        }

        this.trail.light(LED_RANGES.DEVICE_DETECTION.COMPLETE, 'Browser recommendations generated', {
            supported,
            browser: browserInfo.name,
            version: browserInfo.version,
            warnings: warnings.length
        });

        return {
            supported,
            recommendedVersion,
            currentVersion: browserInfo.version,
            browser: browserInfo.name,
            warnings,
            upgradeRequired: !supported
        };
    }

    /**
     * Get browser information
     * @returns {Object} Browser details
     */
    getBrowserInfo() {
        const ua = navigator.userAgent;
        const name = this.getBrowserName(ua);
        const version = this.getBrowserVersion(ua);

        return {
            name,
            version,
            userAgent: ua,
            engine: this.getBrowserEngine(ua),
            supported: true // Will be updated in getBrowserRecommendations
        };
    }

    /**
     * Get redirection information
     * @param {string} currentUrl - Current URL
     * @returns {Object} Redirection details
     */
    getRedirection(currentUrl) {
        const deviceInfo = this.detect();
        const url = new URL(currentUrl);

        let shouldRedirect = false;
        let targetUrl = currentUrl;

        // Check if already on correct device version
        if (deviceInfo.isMobile && !url.pathname.includes('/mobile/')) {
            shouldRedirect = true;
            targetUrl = currentUrl.replace(/\/[^\/]*\.html$/, '/mobile/index.html');
        } else if (deviceInfo.isDesktop && !url.pathname.includes('/desktop/')) {
            shouldRedirect = true;
            targetUrl = currentUrl.replace(/\/[^\/]*\.html$/, '/desktop/index.html');
        }

        // Preserve URL parameters
        if (shouldRedirect) {
            const params = url.searchParams.toString();
            if (params) {
                targetUrl += (targetUrl.includes('?') ? '&' : '?') + params;
            }
        }

        this.trail.light(LED_RANGES.DEVICE_DETECTION.COMPLETE, 'Redirection check', {
            shouldRedirect,
            currentUrl,
            targetUrl,
            deviceType: deviceInfo.deviceType
        });

        return {
            shouldRedirect,
            targetUrl,
            deviceType: deviceInfo.deviceType,
            currentDevice: deviceInfo.deviceType,
            recommendedPath: deviceInfo.isMobile ? '/mobile/' : '/desktop/'
        };
    }

    // === HELPER METHODS FOR THE ABOVE FUNCTIONS ===

    getOperatingSystem() {
        const ua = navigator.userAgent;

        if (ua.includes('Windows')) return 'Windows';
        if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
        if (ua.includes('Mac OS')) return 'macOS';
        if (ua.includes('Android')) return 'Android';
        if (ua.includes('Linux')) return 'Linux';

        return 'Unknown';
    }

    getBrowserName(ua = navigator.userAgent) {
        if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Chrome';
        if (ua.includes('Firefox')) return 'Firefox';
        if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
        if (ua.includes('Edg')) return 'Edge';
        if (ua.includes('Opera')) return 'Opera';
        if (ua.includes('MSIE') || ua.includes('Trident')) return 'Internet Explorer';

        return 'Unknown';
    }

    getBrowserVersion(ua = navigator.userAgent) {
        const match = ua.match(/(Chrome|Firefox|Safari|Edg|Opera|MSIE|Trident)\/(\d+)/);
        return match ? match[2] : 'Unknown';
    }

    getBrowserEngine(ua = navigator.userAgent) {
        if (ua.includes('WebKit')) return 'WebKit';
        if (ua.includes('Gecko')) return 'Gecko';
        if (ua.includes('Trident')) return 'Trident';
        if (ua.includes('Presto')) return 'Presto';
        return 'Unknown';
    }

    getViewportInfo() {
        return {
            width: window.innerWidth,
            height: window.innerHeight,
            devicePixelRatio: window.devicePixelRatio || 1
        };
    }
}

// Export for ES6 modules (browser environment)
export { DeviceDetector, LED_RANGES };

// Create singleton instance for easy access
const deviceDetector = new DeviceDetector();
export default deviceDetector;
