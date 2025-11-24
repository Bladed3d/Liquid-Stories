/**
 * Timeline Component for V7 Modular HTML System
 * Mimics V3 timeline behavior with automatic progress detection
 */

class TimelineComponent {
    constructor(options = {}) {
        this.options = {
            totalStages: options.totalStages || 4,
            currentStage: options.currentStage || 1,
            onStageChange: options.onStageChange || null,
            interactive: options.interactive || false // Set to false for MVP
        };

        this.revealPercentage = 0; // 0-100, based on particle transformation
        this.container = null;
        this.circles = [];
        this.progressBar = null;

        this.init();
    }

    init() {
        this.createTimelineHTML();
        this.updateDisplay();
        this.startRevealTracking();
    }

    createTimelineHTML() {
        // Create timeline container
        this.container = document.createElement('div');
        this.container.className = 'timeline-container';
        this.container.innerHTML = `
            <div class="timeline-wrapper">
                <div class="timeline-progress-bar">
                    <div class="timeline-progress-fill"></div>
                </div>
                <div class="timeline-circles"></div>
            </div>
        `;

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .timeline-container {
                position: fixed;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                z-index: 1000;
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(10px);
                border-radius: 25px;
                padding: 15px 30px;
                border: 1px solid rgba(255, 255, 255, 0.2);
            }

            .timeline-wrapper {
                display: flex;
                align-items: center;
                gap: 15px;
            }

            .timeline-progress-bar {
                width: 300px;
                height: 6px;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 3px;
                position: relative;
                overflow: hidden;
            }

            .timeline-progress-fill {
                height: 100%;
                background: linear-gradient(90deg, #fe802d, #fe0048);
                border-radius: 3px;
                width: 0%;
                transition: width 0.3s ease;
            }

            .timeline-circles {
                display: flex;
                gap: 20px;
            }

            .timeline-circle {
                width: 12px;
                height: 12px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.3);
                border: 2px solid rgba(255, 255, 255, 0.5);
                transition: all 0.3s ease;
                cursor: default;
            }

            .timeline-circle.completed {
                background: #fe0048;
                border-color: #fe0048;
            }

            .timeline-circle.active {
                background: #fe802d;
                border-color: #fe802d;
                transform: scale(1.2);
            }

            .timeline-circle:hover {
                transform: scale(1.1);
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(this.container);

        // Create circles
        const circlesContainer = this.container.querySelector('.timeline-circles');
        this.progressBar = this.container.querySelector('.timeline-progress-fill');

        for (let i = 1; i <= this.options.totalStages; i++) {
            const circle = document.createElement('div');
            circle.className = 'timeline-circle';
            circle.dataset.stage = i;

            if (this.options.interactive) {
                circle.addEventListener('click', () => {
                    this.navigateToStage(i);
                });
            }

            circlesContainer.appendChild(circle);
            this.circles.push(circle);
        }
    }

    updateDisplay() {
        // Update circles
        this.circles.forEach((circle, index) => {
            const stageNum = index + 1;
            circle.classList.remove('completed', 'active');

            if (stageNum < this.options.currentStage) {
                circle.classList.add('completed');
            } else if (stageNum === this.options.currentStage) {
                circle.classList.add('active');
            }
        });

        // Update progress bar
        this.updateProgressBar();
    }

    updateProgressBar() {
        if (!this.progressBar) return;

        // Calculate progress based on completed stages + current stage reveal percentage
        const completedStages = this.options.currentStage - 1;
        const currentStageProgress = (completedStages * 100) + this.revealPercentage;
        const totalProgress = currentStageProgress / this.options.totalStages;

        this.progressBar.style.width = `${totalProgress}%`;
    }

    setRevealPercentage(percentage) {
        this.revealPercentage = Math.max(0, Math.min(100, percentage));
        this.updateProgressBar();
    }

    setCurrentStage(stage) {
        this.options.currentStage = stage;
        this.revealPercentage = 0; // Reset reveal percentage for new stage
        this.updateDisplay();

        if (this.options.onStageChange) {
            this.options.onStageChange(stage);
        }
    }

    navigateToStage(stage) {
        if (!this.options.interactive) return;

        const stageFiles = {
            1: 'desktop/liquid-paint-1to2.html',
            2: 'desktop/liquid-paint-2to3.html',
            3: 'desktop/liquid-paint-3to4.html',
            4: 'desktop/liquid-paint-4to5.html'
        };

        // Check if mobile
        const isMobile = window.innerWidth <= 768 || 'ontouchstart' in window;
        if (isMobile) {
            stageFiles[1] = 'mobile/liquid-paint-1to2.html';
            stageFiles[2] = 'mobile/liquid-paint-2to3.html';
            stageFiles[3] = 'mobile/liquid-paint-3to4.html';
            stageFiles[4] = 'mobile/liquid-paint-4to5.html';
        }

        const targetFile = stageFiles[stage];
        if (targetFile) {
            window.location.href = targetFile;
        }
    }

    startRevealTracking() {
        // Track particle transformation progress
        // This would be called by the particle system as transformation progresses

        // For now, simulate gradual reveal
        let revealProgress = 0;
        const revealInterval = setInterval(() => {
            revealProgress += 1;
            this.setRevealPercentage(revealProgress);

            if (revealProgress >= 100) {
                clearInterval(revealInterval);
                this.onTransformationComplete();
            }
        }, 200); // Adjust timing based on actual transformation speed
    }

    onTransformationComplete() {
        // Auto-progress to next stage after completion
        setTimeout(() => {
            if (this.options.currentStage < this.options.totalStages) {
                this.setCurrentStage(this.options.currentStage + 1);
                this.navigateToStage(this.options.currentStage);
            }
        }, 2000); // Wait 2 seconds before auto-progressing
    }

    // Method to be called by particle system
    trackParticleTransformation(transformedParticles, totalParticles) {
        const percentage = (transformedParticles / totalParticles) * 100;
        this.setRevealPercentage(percentage);
    }

    destroy() {
        if (this.container) {
            this.container.remove();
        }
    }
}

// Auto-detect current stage from URL or filename and initialize timeline
function initTimeline(options = {}) {
    // Detect current stage from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    let currentStage = parseInt(urlParams.get('stage')) || 1;

    // Or detect from filename
    const filename = window.location.pathname.split('/').pop();
    if (filename.includes('1to2')) currentStage = 1;
    else if (filename.includes('2to3')) currentStage = 2;
    else if (filename.includes('3to4')) currentStage = 3;
    else if (filename.includes('4to5')) currentStage = 4;

    // Initialize timeline
    const timeline = new TimelineComponent({
        currentStage: currentStage,
        totalStages: 4,
        interactive: options.interactive || false,
        onStageChange: options.onStageChange
    });

    return timeline;
}

// Export for use in transformation HTML files
if (typeof window !== 'undefined') {
    window.TimelineComponent = TimelineComponent;
    window.initTimeline = initTimeline;
}