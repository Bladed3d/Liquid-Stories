/**
 * Story System Module - Liquid Stories V4
 * Handles progress tracking, UI updates, and narrative elements
 */

class StorySystem {
    constructor() {
        this.transformationComplete = false;
        this.currentImage = 1; // 1 = KidHappy, 2 = KidScared
        this.currentTransformation = 0; // 0 = all image1, 1 = all image2

        // LED Debug Trail System
        this.ledTrail = [];
        this.MAX_LED_TRAIL = 10;

        console.log('[StorySystem] Initialized');
    }

    /**
     * Initialize story elements
     */
    initialize(isMobile) {
        this.updateDeviceDisplay(isMobile);
        this.updateInstructions(isMobile);
        this.led('Story system initialized');
    }

    /**
     * Update progress display
     */
    updateProgress(percentage) {
        this.led(`Updating progress: ${percentage}%`);

        // Update progress fill
        const progressFill = document.getElementById('progressFill');
        if (progressFill) {
            progressFill.style.width = percentage + '%';
        }

        // Update timeline line directly (from circle 1 to circle 2 = 20 to 150 pixels)
        const timelineProgress = document.getElementById('timelineProgress');
        if (timelineProgress) {
            const lineLength = 20 + (percentage / 100) * 130; // 130 pixels from circle 1 to circle 2
            timelineProgress.setAttribute('x1', '20');
            timelineProgress.setAttribute('x2', lineLength);
            this.led(`Timeline updated: ${percentage}% -> x2=${lineLength}px`);
        }

        // Update circle colors based on progress
        const circle2 = document.getElementById('circle2');
        if (circle2) {
            if (percentage >= 100) {
                circle2.setAttribute('fill', '#fe0048');
                circle2.setAttribute('stroke', '#fe0048');
                this.led('Circle 2 completed - turned red');
            } else {
                circle2.setAttribute('fill', 'rgba(255,255,255,0.3)');
                circle2.setAttribute('stroke', 'white');
            }
        }

        // Update text displays
        const progressText = document.getElementById('progressText');
        if (progressText) {
            progressText.textContent = percentage + '% Revealed';
        }

        const image1Percent = document.getElementById('image1Percent');
        if (image1Percent) {
            image1Percent.textContent = (100 - percentage) + '%';
        }

        const image2Percent = document.getElementById('image2Percent');
        if (image2Percent) {
            image2Percent.textContent = percentage + '%';
        }
    }

    /**
     * Complete transformation with celebration
     */
    completeTransformation(targetImage) {
        if (this.transformationComplete) return;

        this.transformationComplete = true;
        this.currentImage = targetImage;

        const progressTitle = document.getElementById('progressTitle');
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');

        if (targetImage === 2) {
            if (progressTitle) progressTitle.textContent = '✨ Complete: Kid Scared! ✨';
            if (progressFill) progressFill.style.width = '100%';
            if (progressText) progressText.textContent = '100% Revealed';
            this.showCompletionMessage('Kid Scared', '😰 Transformation Complete!');
            this.led('Kid Scared transformation completed');
        } else {
            if (progressTitle) progressTitle.textContent = '✨ Complete: Kid Happy! ✨';
            if (progressFill) progressFill.style.width = '0%';
            if (progressText) progressText.textContent = '0% Revealed';
            this.showCompletionMessage('Kid Happy', '😊 Back to Happy!');
            this.led('Kid Happy transformation completed');
        }

        // Reset completion flag after delay
        setTimeout(() => {
            this.transformationComplete = false;
        }, 2000);
    }

    /**
     * Show completion celebration message
     */
    showCompletionMessage(title, message) {
        const completionDiv = document.createElement('div');
        completionDiv.className = 'completion-message';
        completionDiv.innerHTML = `
            <h2>${title}</h2>
            <p>${message}</p>
        `;
        document.body.appendChild(completionDiv);

        setTimeout(() => {
            if (document.body.contains(completionDiv)) {
                document.body.removeChild(completionDiv);
            }
        }, 3000);
    }

    /**
     * Reset transformation state
     */
    resetTransformation() {
        this.transformationComplete = false;
        this.currentImage = 1;
        this.currentTransformation = 0;

        const progressTitle = document.getElementById('progressTitle');
        if (progressTitle) {
            progressTitle.textContent = 'Transforming Kid Happy → Kid Scared';
        }

        this.led('Transformation reset');
    }

    /**
     * Update device display
     */
    updateDeviceDisplay(isMobile) {
        const modeDisplay = document.getElementById('mode');
        if (modeDisplay) {
            modeDisplay.textContent = isMobile ? 'Mobile' : 'Desktop';
        }
    }

    /**
     * Update instructions based on device
     */
    updateInstructions(isMobile) {
        const instructionText = document.getElementById('instructionText');
        if (instructionText) {
            instructionText.textContent = isMobile ?
                'Touch and drag to transform!' :
                'Move mouse to transform!';
        }
    }

    /**
     * Update FPS display
     */
    updateFPS(fps) {
        const fpsElement = document.getElementById('fps');
        if (fpsElement) {
            fpsElement.textContent = fps;
        }
    }

    /**
     * Update particle count display
     */
    updateParticleCount(count) {
        const countElement = document.getElementById('particleCount');
        if (countElement) {
            countElement.textContent = count;
        }
    }

    /**
     * Update velocity display
     */
    updateVelocityDisplay(velocity) {
        const velElement = document.getElementById('puckVel');
        if (velElement) {
            velElement.textContent = velocity.toFixed(1);
        }
    }

    /**
     * Update status message
     */
    updateStatus(status) {
        this.led(status);
    }

    /**
     * Hide loading indicator
     */
    hideLoading() {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.style.display = 'none';
        }
    }

    /**
     * LED Debug Trail System - Integrated with Team Error Logging
     */
    led(message, type = 'led') {
        const timestamp = new Date().toLocaleTimeString();
        const entry = `[${timestamp}] ${type.toUpperCase()}: ${message}`;
        this.ledTrail.push(entry);

        if (this.ledTrail.length > this.MAX_LED_TRAIL) {
            this.ledTrail.shift();
        }

        // Display on screen
        const ledLog = document.getElementById('ledLog');
        if (ledLog) {
            ledLog.innerHTML = this.ledTrail.join('<br>');
        }

        // ALSO write to team error log file
        try {
            if (typeof window.teamLogger !== 'undefined') {
                window.teamLogger.logToTeamFile('SUCCESS', 'led', message, {
                    agent: 'v4-story',
                    file: 'story.js',
                    line: 221
                });
            }
        } catch (error) {
            console.error('[StorySystem] Failed to write to team error log:', error);
        }

        // Also log to console for visibility
        console.log(`[V4-LED] ${type.toUpperCase()}: ${message}`);
    }

    ledError(message) {
        // Write ERROR to team log
        try {
            if (typeof window.teamLogger !== 'undefined') {
                window.teamLogger.logToTeamFile('ERROR', 'v4-led', message, {
                    agent: 'v4-story',
                    file: 'story.js',
                    line: 252
                });
            }
        } catch (error) {
            console.error('[StorySystem] Failed to write ERROR to team log:', error);
        }

        this.led(message, 'error');
    }

    ledWarning(message) {
        // Write WARNING to team log
        try {
            if (typeof window.teamLogger !== 'undefined') {
                window.teamLogger.logToTeamFile('WARNING', 'v4-led', message, {
                    agent: 'v4-story',
                    file: 'story.js',
                    line: 264
                });
            }
        } catch (error) {
            console.error('[StorySystem] Failed to write WARNING to team log:', error);
        }

        this.led(message, 'warning');
    }

    /**
     * Get current transformation state
     */
    getTransformationState() {
        return {
            currentImage: this.currentImage,
            isComplete: this.transformationComplete,
            transformation: this.currentTransformation
        };
    }

    /**
     * Set transformation state
     */
    setTransformationState(state) {
        this.currentImage = state.currentImage || 1;
        this.transformationComplete = state.isComplete || false;
        this.currentTransformation = state.transformation || 0;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StorySystem;
}