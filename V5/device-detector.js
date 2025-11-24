/**
 * Simple Device Detector
 * Determines if user is on mobile or desktop and loads appropriate HTML
 */

(function() {
    'use strict';

    // Simple mobile detection
    function isMobileDevice() {
        return (
            /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
            (navigator.maxTouchPoints && navigator.maxTouchPoints > 1) ||
            (window.innerWidth <= 768)
        );
    }

    // Load appropriate HTML file based on device
    function loadDeviceSpecificFile() {
        const urlParams = new URLSearchParams(window.location.search);
        const transformation = urlParams.get('t') || '1'; // Default to transformation 1

        const devicePrefix = isMobileDevice() ? 'mobile' : 'desktop';
        const htmlFile = `liquid-paint-${transformation}to${parseInt(transformation) + 1}.html`;

        // If we're not already on the correct device-specific file, redirect
        if (!window.location.pathname.includes(`/${devicePrefix}/`)) {
            window.location.href = `${devicePrefix}/${htmlFile}?t=${transformation}`;
        }
    }

    // Export for use in other files
    window.DeviceDetector = {
        isMobile: isMobileDevice,
        loadDeviceSpecific: loadDeviceSpecificFile
    };

    // Auto-run on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadDeviceSpecificFile);
    } else {
        loadDeviceSpecificFile();
    }
})();