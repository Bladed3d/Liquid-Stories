/**
 * Particle System Module
 * Core liquid particle animation and physics engine
 */

import deviceDetector from './device-detector.js';

class ParticleSystem {
    constructor(canvas, config = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        // Configuration with defaults
        this.config = {
            particleCount: config.particleCount || 10000,
            maxVelocity: config.maxVelocity || 5,
            interactionRadius: config.interactionRadius || 150,
            damping: config.damping || 0.98,
            springStrength: config.springStrength || 0.005,
            swirlStrength: config.swirlStrength || 0.3,
            radialStrength: config.radialStrength || 0.01,
            trailsEnabled: config.trailsEnabled || false,
            targetFPS: config.targetFPS || 60,
            ...config
        };

        // Particle system state
        this.particles = [];
        this.isInitialized = false;
        this.isRunning = false;
        this.lastFrameTime = 0;
        this.frameCount = 0;
        this.fps = 0;
        this.errors = [];

        // Interaction state
        this.mouseX = 0;
        this.mouseY = 0;
        this.prevMouseX = 0;
        this.prevMouseY = 0;
        this.mouseVelX = 0;
        this.mouseVelY = 0;
        this.isInteracting = false;

        // Stage-specific colors (HSL format for smooth transitions)
        this.stageColors = [
            { h: 200, s: 70, l: 50, a: 0.8 }, // Stage 1: Blue (Kid Happy)
            { h: 20, s: 70, l: 50, a: 0.8 },  // Stage 2: Orange (Kid Scared)
            { h: 280, s: 70, l: 50, a: 0.8 }, // Stage 3: Purple (Monster 01)
            { h: 0, s: 70, l: 50, a: 0.8 },   // Stage 4: Red (Monster 02)
            { h: 120, s: 70, l: 50, a: 0.8 }  // Stage 5: Green (Resolution)
        ];

        this.currentStage = 1;
        this.currentColor = { ...this.stageColors[0] };

        // Initialize
        this.init();
    }

    /**
     * Initialize the particle system
     */
    init() {
        try {
            this.resizeCanvas();
            this.createParticles();
            this.isInitialized = true;
            console.log(`Particle system initialized with ${this.particles.length} particles`);
        } catch (error) {
            this.errors.push(error);
            console.error('Failed to initialize particle system:', error);
        }
    }

    /**
     * Resize canvas to window dimensions
     */
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
    }

    /**
     * Create particle grid for image-based layout
     */
    createParticles() {
        this.particles = [];

        // Create particles in a grid pattern for image reconstruction
        const gridSize = Math.ceil(Math.sqrt(this.config.particleCount));
        const spacing = 4; // Small spacing between particles
        const imageArea = 600; // Size of the image area
        const startX = (this.canvas.width - imageArea) / 2;
        const startY = (this.canvas.height - imageArea) / 2;

        let particleCount = 0;
        for (let y = 0; y < gridSize && particleCount < this.config.particleCount; y++) {
            for (let x = 0; x < gridSize && particleCount < this.config.particleCount; x++) {
                const px = startX + (x * spacing * imageArea / (gridSize * spacing));
                const py = startY + (y * spacing * imageArea / (gridSize * spacing));

                // Create particle with slight randomization
                const particle = new Particle(
                    px + (Math.random() - 0.5) * 2,
                    py + (Math.random() - 0.5) * 2,
                    x, y, gridSize, gridSize
                );

                this.particles.push(particle);
                particleCount++;
            }
        }

        console.log(`Created ${this.particles.length} particles in grid layout`);
    }

    /**
     * Start animation loop
     */
    start() {
        if (!this.isInitialized) {
            this.init();
        }

        this.isRunning = true;
        this.lastFrameTime = performance.now();
        this.animate();

        console.log('Particle system started');
    }

    /**
     * Stop animation loop
     */
    stop() {
        this.isRunning = false;
        console.log('Particle system stopped');
    }

    /**
     * Main animation loop
     */
    animate = () => {
        if (!this.isRunning) return;

        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastFrameTime;

        // Limit frame rate
        if (deltaTime >= 1000 / this.config.targetFPS) {
            this.update(deltaTime);
            this.render();
            this.updateFPS(currentTime);
            this.lastFrameTime = currentTime;
        }

        requestAnimationFrame(this.animate);
    }

    /**
     * Update particle physics
     * @param {number} deltaTime - Time since last frame
     */
    update(deltaTime) {
        // Update mouse velocity
        this.mouseVelX = this.mouseX - this.prevMouseX;
        this.mouseVelY = this.mouseY - this.prevMouseY;
        this.prevMouseX = this.mouseX;
        this.prevMouseY = this.mouseY;

        // Update particles
        this.particles.forEach(particle => {
            particle.update(
                this.mouseX, this.mouseY,
                this.mouseVelX, this.mouseVelY,
                this.config.interactionRadius,
                this.config.springStrength,
                this.config.swirlStrength,
                this.config.radialStrength,
                this.config.damping,
                this.config.maxVelocity,
                this.currentColor
            );
        });
    }

    /**
     * Render particles to canvas
     */
    render() {
        // Clear or apply trail effect
        if (this.config.trailsEnabled) {
            this.ctx.fillStyle = 'rgba(10, 10, 10, 0.08)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        } else {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }

        // Render particles
        this.particles.forEach(particle => {
            particle.render(this.ctx, this.currentColor);
        });
    }

    /**
     * Update FPS counter
     * @param {number} currentTime - Current timestamp
     */
    updateFPS(currentTime) {
        this.frameCount++;
        if (currentTime - this.lastFrameTime >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastFrameTime = currentTime;
        }
    }

    /**
     * Set mouse/touch position for interaction
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {boolean} isInteracting - Whether user is actively interacting
     */
    setInteractionPosition(x, y, isInteracting = true) {
        this.mouseX = x;
        this.mouseY = y;
        this.isInteracting = isInteracting;
    }

    /**
     * Update stage and change particle colors
     * @param {number} stage - Stage number (1-5)
     * @param {number} transitionTime - Transition duration in ms
     */
    setStage(stage, transitionTime = 500) {
        if (stage < 1 || stage > 5) {
            console.warn('Invalid stage number:', stage);
            return;
        }

        const targetColor = { ...this.stageColors[stage - 1] };

        // Smooth color transition
        this.animateColorTransition(this.currentColor, targetColor, transitionTime);
        this.currentStage = stage;

        console.log(`Particle system transitioned to stage ${stage}`);
    }

    /**
     * Animate smooth color transition
     * @param {Object} fromColor - Starting color
     * @param {Object} toColor - Target color
     * @param {number} duration - Transition duration
     */
    animateColorTransition(fromColor, toColor, duration) {
        const startTime = performance.now();

        const animate = () => {
            const elapsed = performance.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Smooth easing function
            const easeProgress = 1 - Math.pow(1 - progress, 3);

            // Interpolate color values
            this.currentColor.h = fromColor.h + (toColor.h - fromColor.h) * easeProgress;
            this.currentColor.s = fromColor.s + (toColor.s - fromColor.s) * easeProgress;
            this.currentColor.l = fromColor.l + (toColor.l - fromColor.l) * easeProgress;
            this.currentColor.a = fromColor.a + (toColor.a - fromColor.a) * easeProgress;

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        animate();
    }

    /**
     * Get current particle count
     * @returns {number} Number of particles
     */
    getParticleCount() {
        return this.particles.length;
    }

    /**
     * Get all particles (for testing/debugging)
     * @returns {Array} Array of particle objects
     */
    getParticles() {
        return this.particles.map(p => ({
            x: p.x,
            y: p.y,
            vx: p.vx,
            vy: p.vy,
            radius: p.radius,
            gridX: p.gridX,
            gridY: p.gridY
        }));
    }

    /**
     * Get current stage color
     * @returns {Object} Current color in HSL format
     */
    getCurrentStageColor() {
        return `hsl(${Math.round(this.currentColor.h)}, ${this.currentColor.s}%, ${this.currentColor.l}%)`;
    }

    /**
     * Check if system has any errors
     * @returns {boolean} True if errors exist
     */
    hasErrors() {
        return this.errors.length > 0;
    }

    /**
     * Get current FPS
     * @returns {number} Current frames per second
     */
    getFPS() {
        return this.fps;
    }

    /**
     * Toggle trail effect
     * @param {boolean} enabled - Whether trails should be enabled
     */
    setTrailsEnabled(enabled) {
        this.config.trailsEnabled = enabled;
    }

    /**
     * Update configuration
     * @param {Object} newConfig - New configuration options
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };

        // If particle count changed, recreate particles
        if (newConfig.particleCount && newConfig.particleCount !== this.particles.length) {
            this.createParticles();
        }
    }

    /**
     * Handle window resize
     */
    handleResize() {
        this.resizeCanvas();
        this.createParticles(); // Recreate particles for new dimensions
    }

    /**
     * Reset particle system to initial state
     */
    reset() {
        this.currentStage = 1;
        this.currentColor = { ...this.stageColors[0] };
        this.createParticles();
        this.errors = [];
        console.log('Particle system reset');
    }

    /**
     * Destroy particle system and clean up
     */
    destroy() {
        this.stop();
        this.particles = [];
        this.isInitialized = false;
        console.log('Particle system destroyed');
    }
}

/**
 * Individual Particle class
 */
class Particle {
    constructor(x, y, gridX, gridY, gridCols, gridRows) {
        // Position
        this.x = x;
        this.y = y;
        this.originalX = x;
        this.originalY = y;

        // Velocity
        this.vx = 0;
        this.vy = 0;

        // Properties
        this.radius = 2;
        this.mass = 1 + Math.random() * 0.5;

        // Grid position for image reconstruction
        this.gridX = gridX;
        this.gridY = gridY;
        this.gridCols = gridCols;
        this.gridRows = gridRows;

        // Visual properties
        this.baseRadius = this.radius;
        this.glowIntensity = 0;
    }

    /**
     * Update particle physics and position
     */
    update(mouseX, mouseY, mouseVelX, mouseVelY, interactionRadius,
            springStrength, swirlStrength, radialStrength, damping, maxVelocity, currentColor) {

        // Calculate distance to interaction point
        const dx = this.x - mouseX;
        const dy = this.y - mouseY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Apply interaction forces if within radius
        if (distance < interactionRadius && distance > 0) {
            const influence = 1 - (distance / interactionRadius);
            const angle = Math.atan2(dy, dx);

            // Tangential force for swirl effect
            const tangentX = -Math.sin(angle);
            const tangentY = Math.cos(angle);

            const swirlForce = mouseVelX * tangentX + mouseVelY * tangentY;
            this.vx += swirlForce * influence * swirlStrength / this.mass;
            this.vy += (mouseVelX * tangentY - mouseVelY * tangentX) * influence * swirlStrength / this.mass;

            // Radial force based on mouse velocity
            const radialForce = Math.min(mouseVelX * mouseVelX + mouseVelY * mouseVelY, 100);
            this.vx += (tangentX * radialForce * influence * radialStrength) / this.mass;
            this.vy += (tangentY * radialForce * influence * radialStrength) / this.mass;

            // Visual feedback
            this.glowIntensity = influence;
        } else {
            this.glowIntensity = Math.max(0, this.glowIntensity - 0.05);
        }

        // Spring force back to original position
        this.vx += (this.originalX - this.x) * springStrength;
        this.vy += (this.originalY - this.y) * springStrength;

        // Apply damping
        this.vx *= damping;
        this.vy *= damping;

        // Limit maximum velocity
        const velocity = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (velocity > maxVelocity) {
            this.vx = (this.vx / velocity) * maxVelocity;
            this.vy = (this.vy / velocity) * maxVelocity;
        }

        // Update position
        this.x += this.vx;
        this.y += this.vy;

        // Boundary collision
        if (this.x < this.radius || this.x > this.canvas?.width - this.radius) {
            this.vx *= -0.7;
            this.x = Math.max(this.radius, Math.min(this.canvas?.width - this.radius, this.x));
        }
        if (this.y < this.radius || this.y > this.canvas?.height - this.radius) {
            this.vy *= -0.7;
            this.y = Math.max(this.radius, Math.min(this.canvas?.height - this.radius, this.y));
        }

        // Update visual radius based on velocity and glow
        const speedFactor = Math.min(velocity / maxVelocity, 1);
        this.radius = this.baseRadius + speedFactor * 2 + this.glowIntensity * 3;
    }

    /**
     * Render particle to canvas context
     */
    render(ctx, currentColor) {
        ctx.save();

        // Create glowing effect
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.radius
        );

        const alpha = currentColor.a * (0.5 + this.glowIntensity * 0.5);
        gradient.addColorStop(0, `hsla(${Math.round(currentColor.h)}, ${currentColor.s}%, ${currentColor.l}%, ${alpha})`);
        gradient.addColorStop(0.5, `hsla(${Math.round(currentColor.h)}, ${currentColor.s}%, ${currentColor.l * 0.8}%, ${alpha * 0.7})`);
        gradient.addColorStop(1, `hsla(${Math.round(currentColor.h)}, ${currentColor.s}%, ${currentColor.l * 0.6}%, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Add bright center for high glow
        if (this.glowIntensity > 0.5) {
            ctx.fillStyle = `hsla(${Math.round(currentColor.h)}, 100%, 80%, ${this.glowIntensity * 0.5})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius * 0.3, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }
}

export { ParticleSystem };

// Note: singleton instance removed because it requires a canvas element
// Users should create their own instance: new ParticleSystem(canvas)
