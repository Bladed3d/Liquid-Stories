/**
 * Story Controller Module
 * Manages the 5-stage story progression and narrative flow
 */

class StoryController {
    constructor(config = {}) {
        this.config = {
            transitionDuration: config.transitionDuration || 500,
            enableURLPersistence: config.enableURLPersistence !== false,
            enableProgressTracking: config.enableProgressTracking !== false,
            autoAdvance: config.autoAdvance || false,
            autoAdvanceDelay: config.autoAdvanceDelay || 10000,
            ...config
        };

        // Story stages configuration
        this.stages = [
            {
                id: 1,
                title: 'The Happy Beginning',
                character: 'KidHappy',
                description: 'A child\'s joyful adventure begins',
                particleColor: { h: 200, s: 70, l: 50, a: 0.8 }, // Blue
                backgroundColor: '#0a0a0a',
                progressPercentage: 0
            },
            {
                id: 2,
                title: 'Growing Concern',
                character: 'KidScared',
                description: 'Fear begins to creep in',
                particleColor: { h: 20, s: 70, l: 50, a: 0.8 }, // Orange
                backgroundColor: '#1a0a0a',
                progressPercentage: 25
            },
            {
                id: 3,
                title: 'The Monster Appears',
                character: 'Monster01',
                description: 'A fearsome creature emerges',
                particleColor: { h: 280, s: 70, l: 50, a: 0.8 }, // Purple
                backgroundColor: '#1a0a1a',
                progressPercentage: 50
            },
            {
                id: 4,
                title: 'Facing the Fear',
                character: 'Monster02',
                description: 'Confronting the ultimate challenge',
                particleColor: { h: 0, s: 70, l: 50, a: 0.8 }, // Red
                backgroundColor: '#1a0a0a',
                progressPercentage: 75
            },
            {
                id: 5,
                title: 'Resolution',
                character: 'Resolution',
                description: 'Peace and understanding prevail',
                particleColor: { h: 120, s: 70, l: 50, a: 0.8 }, // Green
                backgroundColor: '#0a1a0a',
                progressPercentage: 100
            }
        ];

        // Current state
        this.currentStage = 1;
        this.isTransitioning = false;
        this.isReady = false;
        this.transitionStartTime = 0;

        // Progress tracking
        this.interactionProgress = 0; // 0-1 based on user interaction
        this.stageStartTime = Date.now();

        // References to other systems
        this.particleSystem = null;
        this.imageLoader = null;
        this.uiElements = {};

        // Event callbacks
        this.callbacks = {
            stageStart: [],
            stageComplete: [],
            transitionStart: [],
            transitionComplete: [],
            storyComplete: []
        };

        // Initialize
        this.init();
    }

    /**
     * Initialize story controller
     */
    init() {
        // Load stage from URL if persistence is enabled
        if (this.config.enableURLPersistence) {
            this.loadStageFromURL();
        }

        this.isReady = true;
        console.log(`Story controller initialized at stage ${this.currentStage}`);

        // Trigger stage start event
        this.triggerCallback('stageStart', {
            stage: this.currentStage,
            stageData: this.getStageData(this.currentStage)
        });
    }

    /**
     * Set references to other systems
     * @param {ParticleSystem} particleSystem - Particle system instance
     * @param {ImageLoader} imageLoader - Image loader instance
     */
    setSystemReferences(particleSystem, imageLoader) {
        this.particleSystem = particleSystem;
        this.imageLoader = imageLoader;
    }

    /**
     * Set UI element references
     * @param {Object} uiElements - Map of UI elements
     */
    setUIElements(uiElements) {
        this.uiElements = {
            progressBar: uiElements.progressBar,
            progressText: uiElements.progressText,
            stageTitle: uiElements.stageTitle,
            stageDescription: uiElements.stageDescription,
            ...uiElements
        };
    }

    /**
     * Go to specific stage
     * @param {number} stageNumber - Target stage (1-5)
     * @returns {Promise<boolean>} Success status
     */
    async goToStage(stageNumber) {
        if (stageNumber < 1 || stageNumber > this.stages.length) {
            console.error(`Invalid stage number: ${stageNumber}`);
            return false;
        }

        if (stageNumber === this.currentStage) {
            console.log(`Already at stage ${stageNumber}`);
            return true;
        }

        if (this.isTransitioning) {
            console.warn('Cannot change stage during transition');
            return false;
        }

        console.log(`Transitioning to stage ${stageNumber}`);

        // Start transition
        this.isTransitioning = true;
        this.transitionStartTime = performance.now();

        // Trigger transition start event
        this.triggerCallback('transitionStart', {
            fromStage: this.currentStage,
            toStage: stageNumber,
            fromData: this.getStageData(this.currentStage),
            toData: this.getStageData(stageNumber)
        });

        // Complete previous stage
        await this.completeCurrentStage();

        // Change stage
        const previousStage = this.currentStage;
        this.currentStage = stageNumber;
        this.stageStartTime = Date.now();
        this.interactionProgress = 0;

        // Update particle system
        if (this.particleSystem) {
            const stageData = this.getStageData(stageNumber);
            this.particleSystem.setStage(stageNumber, this.config.transitionDuration);
        }

        // Update UI
        this.updateUI();

        // Update URL if persistence is enabled
        if (this.config.enableURLPersistence) {
            this.updateURL();
        }

        // Wait for transition to complete
        await this.waitForTransition();

        // Complete transition
        this.isTransitioning = false;

        // Trigger events
        this.triggerCallback('transitionComplete', {
            fromStage: previousStage,
            toStage: stageNumber,
            duration: performance.now() - this.transitionStartTime
        });

        this.triggerCallback('stageStart', {
            stage: stageNumber,
            stageData: this.getStageData(stageNumber)
        });

        // Check for story completion
        if (stageNumber === this.stages.length) {
            this.completeStory();
        }

        return true;
    }

    /**
     * Go to next stage
     * @returns {Promise<boolean>} Success status
     */
    async goToNextStage() {
        const nextStage = this.currentStage + 1;
        if (nextStage > this.stages.length) {
            console.log('Already at final stage');
            return false;
        }

        return await this.goToStage(nextStage);
    }

    /**
     * Go to previous stage
     * @returns {Promise<boolean>} Success status
     */
    async goToPreviousStage() {
        const prevStage = this.currentStage - 1;
        if (prevStage < 1) {
            console.log('Already at first stage');
            return false;
        }

        return await this.goToStage(prevStage);
    }

    /**
     * Reset story to beginning
     * @returns {Promise<boolean>} Success status
     */
    async reset() {
        console.log('Resetting story to beginning');
        return await this.goToStage(1);
    }

    /**
     * Complete current stage
     */
    async completeCurrentStage() {
        const stageData = this.getStageData(this.currentStage);

        this.triggerCallback('stageComplete', {
            stage: this.currentStage,
            stageData,
            timeSpent: Date.now() - this.stageStartTime,
            interactionProgress: this.interactionProgress
        });
    }

    /**
     * Complete the entire story
     */
    completeStory() {
        console.log('Story completed!');

        this.triggerCallback('storyComplete', {
            totalTime: Date.now() - this.stageStartTime,
            finalStage: this.currentStage,
            allStagesCompleted: true
        });

        // Show completion celebration
        this.showCompletionCelebration();
    }

    /**
     * Update interaction progress
     * @param {number} progress - Progress value (0-1)
     */
    updateInteractionProgress(progress) {
        if (!this.config.enableProgressTracking) return;

        this.interactionProgress = Math.max(0, Math.min(1, progress));
        this.updateProgressIndicator();
    }

    /**
     * Get stage data by ID
     * @param {number} stageId - Stage ID
     * @returns {Object|null} Stage data
     */
    getStageData(stageId) {
        return this.stages.find(stage => stage.id === stageId) || null;
    }

    /**
     * Get current stage data
     * @returns {Object} Current stage data
     */
    getCurrentStageData() {
        return this.getStageData(this.currentStage);
    }

    /**
     * Get current stage number
     * @returns {number} Current stage (1-5)
     */
    getCurrentStage() {
        return this.currentStage;
    }

    /**
     * Get current character/image name
     * @returns {string} Current character name
     */
    getCurrentImage() {
        const stageData = this.getCurrentStageData();
        return stageData ? stageData.character : null;
    }

    /**
     * Get progress percentage (0-100)
     * @returns {number} Progress percentage
     */
    getProgressPercentage() {
        return ((this.currentStage - 1) / (this.stages.length - 1)) * 100;
    }

    /**
     * Update UI elements
     */
    updateUI() {
        const stageData = this.getCurrentStageData();

        if (this.uiElements.stageTitle) {
            this.uiElements.stageTitle.textContent = `Stage ${this.currentStage}: ${stageData.title}`;
        }

        if (this.uiElements.stageDescription) {
            this.uiElements.stageDescription.textContent = stageData.description;
        }

        this.updateProgressIndicator();
    }

    /**
     * Update progress indicator
     */
    updateProgressIndicator() {
        if (this.uiElements.progressBar) {
            const progress = this.getProgressPercentage();
            this.uiElements.progressBar.style.width = `${progress}%`;
        }

        if (this.uiElements.progressText) {
            this.uiElements.progressText.textContent = `${Math.round(this.getProgressPercentage())}% Complete`;
        }
    }

    /**
     * Show completion celebration
     */
    showCompletionCelebration() {
        // Create celebration overlay
        const celebration = document.createElement('div');
        celebration.className = 'completion-celebration';
        celebration.innerHTML = `
            <div class="celebration-content">
                <h2>🎉 Story Complete! 🎉</h2>
                <p>You've completed the entire journey</p>
                <button onclick="this.parentElement.parentElement.remove()">Close</button>
            </div>
        `;

        // Add styles
        celebration.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: fadeIn 0.5s ease;
        `;

        const content = celebration.querySelector('.celebration-content');
        content.style.cssText = `
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            border-radius: 20px;
            text-align: center;
            max-width: 400px;
            animation: slideUp 0.5s ease;
        `;

        document.body.appendChild(celebration);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (celebration.parentNode) {
                celebration.remove();
            }
        }, 5000);
    }

    /**
     * Wait for transition to complete
     * @returns {Promise} Promise that resolves when transition is complete
     */
    waitForTransition() {
        return new Promise(resolve => {
            setTimeout(resolve, this.config.transitionDuration);
        });
    }

    /**
     * Load stage from URL parameters
     */
    loadStageFromURL() {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const stageParam = urlParams.get('stage');

            if (stageParam) {
                const stage = parseInt(stageParam, 10);
                if (stage >= 1 && stage <= this.stages.length) {
                    this.currentStage = stage;
                    console.log(`Loaded stage ${stage} from URL`);
                } else {
                    console.warn(`Invalid stage in URL: ${stageParam}`);
                }
            }
        } catch (error) {
            console.error('Error loading stage from URL:', error);
        }
    }

    /**
     * Update URL with current stage
     */
    updateURL() {
        if (!this.config.enableURLPersistence) return;

        try {
            const url = new URL(window.location);
            url.searchParams.set('stage', this.currentStage.toString());
            window.history.replaceState({}, '', url.toString());
        } catch (error) {
            console.error('Error updating URL:', error);
        }
    }

    /**
     * Check if story is complete
     * @returns {boolean} Whether story is complete
     */
    isStoryComplete() {
        return this.currentStage === this.stages.length;
    }

    /**
     * Check if system is ready
     * @returns {boolean} Whether system is ready
     */
    isSystemReady() {
        return this.isReady;
    }

    /**
     * Get story statistics
     * @returns {Object} Story statistics
     */
    getStoryStats() {
        return {
            currentStage: this.currentStage,
            totalStages: this.stages.length,
            progressPercentage: this.getProgressPercentage(),
            isComplete: this.isStoryComplete(),
            timeInCurrentStage: Date.now() - this.stageStartTime,
            interactionProgress: this.interactionProgress,
            isTransitioning: this.isTransitioning
        };
    }

    /**
     * Register event callback
     * @param {string} event - Event type
     * @param {Function} callback - Callback function
     */
    on(event, callback) {
        if (this.callbacks[event]) {
            this.callbacks[event].push(callback);
        }
    }

    /**
     * Unregister event callback
     * @param {string} event - Event type
     * @param {Function} callback - Callback function
     */
    off(event, callback) {
        if (this.callbacks[event]) {
            const index = this.callbacks[event].indexOf(callback);
            if (index > -1) {
                this.callbacks[event].splice(index, 1);
            }
        }
    }

    /**
     * Trigger event callbacks
     * @param {string} event - Event type
     * @param {Object} data - Event data
     */
    triggerCallback(event, data) {
        if (this.callbacks[event]) {
            this.callbacks[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in ${event} callback:`, error);
                }
            });
        }
    }

    /**
     * Destroy story controller
     */
    destroy() {
        this.callbacks = {
            stageStart: [],
            stageComplete: [],
            transitionStart: [],
            transitionComplete: [],
            storyComplete: []
        };

        this.particleSystem = null;
        this.imageLoader = null;
        this.uiElements = {};

        console.log('Story controller destroyed');
    }
}

export { StoryController };

// Note: singleton instance removed to avoid initialization during module import
// Users should create their own instance: new StoryController()
