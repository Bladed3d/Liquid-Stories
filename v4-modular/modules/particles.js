/**
 * Particle System Module - Liquid Stories V4
 * Handles particle creation, physics, and rendering
 */

class ParticleSystem {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.particles = [];
        this.influenceRadius = 120;
        this.trailsEnabled = false;

        // Grid configuration
        this.gridCols = 0;
        this.gridRows = 0;
        this.scaledWidth = 0;
        this.scaledHeight = 0;

        // Performance tracking
        this.frameCount = 0;
        this.fps = 60;
        this.lastTime = performance.now();

        console.log('[ParticleSystem] Initialized');
    }

    /**
     * Initialize particles based on loaded images
     */
    initParticles(imageSize, sourceImage1, sourceImage2) {
        if (!sourceImage1 || !sourceImage2) {
            console.error('[ParticleSystem] Images not loaded');
            return;
        }

        this.particles = [];
        const imageX = Math.floor((this.canvas.width - imageSize) / 2);
        const imageY = Math.floor((this.canvas.height - imageSize) / 2);

        const spacing = 4; // Reduced spacing for more particles
        this.gridCols = Math.floor(imageSize / spacing);
        this.gridRows = Math.floor(imageSize / spacing);
        const pieceWidth = spacing;
        const pieceHeight = spacing;

        const offsetX = (imageSize - this.scaledWidth) / 2;
        const offsetY = (imageSize - this.scaledHeight) / 2;

        for (let gridY = 0; gridY < this.gridRows; gridY++) {
            for (let gridX = 0; gridX < this.gridCols; gridX++) {
                const x = imageX + offsetX + (gridX * spacing) + (spacing / 2);
                const y = imageY + offsetY + (gridY * spacing) + (spacing / 2);

                this.particles.push(new Particle(
                    this.canvas, x, y, gridX, gridY, pieceWidth, pieceHeight,
                    (this.scaledWidth / this.gridCols), (this.scaledHeight / this.gridRows),
                    offsetX, offsetY, this.scaledWidth, this.scaledHeight
                ));
            }
        }

        console.log(`[ParticleSystem] Created ${this.particles.length} particles`);
        return this.particles.length;
    }

    /**
     * Update particle physics and transformations
     */
    update(puckX, puckY, puckVelX, puckVelY) {
        this.particles.forEach(particle => {
            particle.update(puckX, puckY, puckVelX, puckVelY, this.influenceRadius);
        });
    }

    /**
     * Render all particles
     */
    render(sourceImage1, sourceImage2) {
        // Clear canvas or apply trail effect
        if (this.trailsEnabled) {
            this.ctx.fillStyle = 'rgba(10, 10, 10, 0.08)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        } else {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }

        // Render particles
        this.particles.forEach(particle => {
            particle.draw(this.ctx, sourceImage1, sourceImage2, this.gridCols, this.gridRows);
        });

        // Update FPS
        this.updateFPS();
    }

    /**
     * Update FPS counter
     */
    updateFPS() {
        this.frameCount++;
        const currentTime = performance.now();
        if (currentTime - this.lastTime >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastTime = currentTime;
        }
    }

    /**
     * Get transformation progress
     */
    getTransformationProgress() {
        if (this.particles.length === 0) return 0;

        let transformedCount = 0;
        this.particles.forEach(particle => {
            if (particle.currentImage === 2) {
                transformedCount++;
            }
        });

        return (transformedCount / this.particles.length) * 100;
    }

    /**
     * Reset all particles to Image 1
     */
    resetToImage1() {
        this.particles.forEach(particle => {
            particle.resetToImage1();
        });
    }

    /**
     * Force all particles to Image 2
     */
    forceToImage2() {
        this.particles.forEach(particle => {
            particle.forceToImage2();
        });
    }

    /**
     * Set image dimensions
     */
    setImageDimensions(width, height) {
        this.scaledWidth = width;
        this.scaledHeight = height;
    }

    /**
     * Adjust influence radius
     */
    adjustInfluence(delta) {
        this.influenceRadius = Math.max(50, Math.min(300, this.influenceRadius + delta));
    }

    /**
     * Toggle trail effect
     */
    toggleTrails() {
        this.trailsEnabled = !this.trailsEnabled;
    }
}

/**
 * Individual Particle Class
 */
class Particle {
    constructor(canvas, x, y, gridX, gridY, pieceWidth, pieceHeight, renderWidth, renderHeight, offsetX, offsetY, scaledWidth, scaledHeight) {
        this.canvas = canvas; // Store canvas reference
        this.x = x;
        this.y = y;
        this.originalX = x;
        this.originalY = y;
        this.vx = 0;
        this.vy = 0;
        this.radius = 2;
        this.mass = 1 + Math.random() * 0.5;

        this.gridX = gridX;
        this.gridY = gridY;
        this.pieceWidth = pieceWidth;
        this.pieceHeight = pieceHeight;
        this.renderWidth = renderWidth;
        this.renderHeight = renderHeight;
        this.offsetX = offsetX;
        this.offsetY = offsetY;
        this.scaledWidth = scaledWidth;
        this.scaledHeight = scaledHeight;
        this.rotation = 0;

        // Image state for transformation
        this.currentImage = 1; // Start with KidHappy
        this.hasBeenTransformed = false;
        this.isTransitioning = false;
        this.transitionProgress = 0;
    }

    /**
     * Update particle physics and transformation state
     */
    update(puckX, puckY, puckVelX, puckVelY, influenceRadius) {
        // Check distance to puck
        const dx = this.x - puckX;
        const dy = this.y - puckY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const inInfluence = distance < influenceRadius;

        // Handle persistent transformation
        if (inInfluence && !this.hasBeenTransformed && this.currentImage === 1) {
            this.isTransitioning = true;
            this.transitionProgress = 0;
        } else if (this.isTransitioning) {
            this.transitionProgress = Math.min(1, this.transitionProgress + 0.05);

            if (this.transitionProgress >= 1) {
                this.currentImage = 2;
                this.hasBeenTransformed = true;
                this.isTransitioning = false;
                this.transitionProgress = 0;
            }
        }

        // Apply physics (only if in influence zone for performance)
        if (distance < influenceRadius) {
            const influence = 1 - (distance / influenceRadius);
            const angle = Math.atan2(dy, dx);

            const tangentX = -Math.sin(angle);
            const tangentY = Math.cos(angle);

            const swirlStrength = puckVelX * tangentX + puckVelY * tangentY;
            this.vx += swirlStrength * influence * 0.3 / this.mass;
            this.vy += (puckVelX * tangentY - puckVelY * tangentX) * influence * 0.3 / this.mass;

            const radialForce = Math.min(puckVelX * puckVelX + puckVelY * puckVelY, 100);
            this.vx += (tangentX * radialForce * influence * 0.01) / this.mass;
            this.vy += (tangentY * radialForce * influence * 0.01) / this.mass;
        }

        // Spring force back to original position
        const springForce = 0.005;
        this.vx += (this.originalX - this.x) * springForce;
        this.vy += (this.originalY - this.y) * springForce;

        // Apply velocity with damping
        const damping = 0.92;
        this.vx *= damping;
        this.vy *= damping;

        // Update position
        this.x += this.vx;
        this.y += this.vy;

        // Boundary collision - use dynamic canvas dimensions
        if (this.x < this.radius || this.x > canvas.width - this.radius) {
            this.vx *= -0.7;
            this.x = Math.max(this.radius, Math.min(canvas.width - this.radius, this.x));
        }
        if (this.y < this.radius || this.y > canvas.height - this.radius) {
            this.vy *= -0.7;
            this.y = Math.max(this.radius, Math.min(canvas.height - this.radius, this.y));
        }
    }

    /**
     * Render the particle
     */
    draw(ctx, sourceImage1, sourceImage2, gridCols, gridRows) {
        if (!sourceImage1 || !sourceImage2) return;

        ctx.save();
        ctx.translate(this.x, this.y);

        try {
            let sourceImage, targetAlpha;

            if (this.isTransitioning) {
                // During transition: blend both images
                sourceImage = this.currentImage === 1 ? sourceImage2 : sourceImage1;
                targetAlpha = this.transitionProgress;

                // Draw original image with fading alpha
                ctx.globalAlpha = 1 - targetAlpha;
                const originalSource = this.currentImage === 1 ? sourceImage1 : sourceImage2;
                const originalPieceWidth = originalSource.width / gridCols;
                const originalPieceHeight = originalSource.height / gridRows;
                const originalX = this.gridX * originalPieceWidth;
                const originalY = this.gridY * originalPieceHeight;

                ctx.drawImage(
                    originalSource,
                    originalX, originalY,
                    originalPieceWidth, originalPieceHeight,
                    -this.renderWidth / 2, -this.renderHeight / 2,
                    this.renderWidth, this.renderHeight
                );

                // Draw new image with increasing alpha
                ctx.globalAlpha = targetAlpha;
            } else {
                // Not transitioning - just draw current image
                sourceImage = this.currentImage === 1 ? sourceImage1 : sourceImage2;
                ctx.globalAlpha = 1;
            }

            const sourcePieceWidth = sourceImage.width / gridCols;
            const sourcePieceHeight = sourceImage.height / gridRows;
            const sourceX = this.gridX * sourcePieceWidth;
            const sourceY = this.gridY * sourcePieceHeight;

            ctx.drawImage(
                sourceImage,
                sourceX, sourceY,
                sourcePieceWidth, sourcePieceHeight,
                -this.renderWidth / 2, -this.renderHeight / 2,
                this.renderWidth, this.renderHeight
            );

        } catch (error) {
            console.error('[Particle] Error drawing image piece:', error);
        }

        ctx.restore();
    }

    /**
     * Reset this particle to Image 1
     */
    resetToImage1() {
        this.currentImage = 1;
        this.hasBeenTransformed = false;
        this.isTransitioning = false;
        this.transitionProgress = 0;
    }

    /**
     * Force this particle to Image 2
     */
    forceToImage2() {
        this.currentImage = 2;
        this.hasBeenTransformed = true;
        this.isTransitioning = false;
        this.transitionProgress = 0;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ParticleSystem, Particle };
}