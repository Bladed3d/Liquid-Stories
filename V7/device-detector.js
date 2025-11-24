/**
 * Device Detection System for V7 Liquid Stories
 * Routes to appropriate transformation files based on device type and stage
 */

// Simple device detection (20 lines as required)
function detectDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0 ? 'mobile' : 'desktop';
}

// Get current stage from URL parameter or default to stage 1
function getCurrentStage() {
    const urlParams = new URLSearchParams(window.location.search);
    const stage = parseInt(urlParams.get('stage')) || 1;
    return Math.max(1, Math.min(4, stage)); // Clamp between 1-4
}

// Route to appropriate transformation file
function routeToTransformation() {
    const device = detectDevice();
    const stage = getCurrentStage();

    // Determine the appropriate file based on stage
    let fileName;
    if (stage === 1) fileName = 'liquid-paint-1to2.html';
    else if (stage === 2) fileName = 'liquid-paint-2to3.html';
    else if (stage === 3) fileName = 'liquid-paint-3to4.html';
    else if (stage === 4) fileName = 'liquid-paint-4to5.html';

    const deviceFolder = device === 'mobile' ? 'mobile' : 'desktop';
    const targetPath = `${deviceFolder}/${fileName}`;

    // Redirect to the appropriate file
    window.location.href = targetPath;
}

// Auto-route on page load
document.addEventListener('DOMContentLoaded', function() {
    // Add a small delay to ensure proper loading
    setTimeout(routeToTransformation, 100);
});

// Export functions for testing
if (typeof window !== 'undefined') {
    window.deviceDetector = {
        detectDevice,
        getCurrentStage,
        routeToTransformation
    };
}