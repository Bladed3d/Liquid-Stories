/**
 * Interaction Handler Module
 * Manages mouse and touch input for particle interaction
 */

class InteractionHandler {
    constructor(element, config = {}) {
        this.element = element;

        // Configuration
        this.config = {
            enableMouse: config.enableMouse !== false,
            enableTouch: config.enableTouch !== false,
            inputLatencyThreshold: config.inputLatencyThreshold || 16, // ms for desktop
            mobileInputLatencyThreshold: config.mobileInputLatencyThreshold || 33, // ms for mobile
            enableUniversalPuck: config.enableUniversalPuck !== false,
            puckSize: config.puckSize || { desktop: 60, mobile: 50 },
            enableVelocitySmoothing: config.enableVelocitySmoothing !== false,
            velocitySmoothingFactor: config.velocitySmoothingFactor || 0.7,
            ...config
        };

        // Device detection
        this.isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        this.isTouch = this.isMobile;

        // Interaction state
        this.isActive = false;
        this.x = 0;
        this.y = 0;
        this.prevX = 0;
        this.prevY = 0;
        this.velocityX = 0;
        this.velocityY = 0;
        this.lastUpdateTime = performance.now();

        // Touch-specific state
        this.activeTouches = new Map(); // touchId -> touch info
        this.primaryTouchId = null;

        // Universal puck element
        this.puckElement = null;
        this.puckVisible = false;

        // Event callbacks
        this.callbacks = {
            start: [],
            move: [],
            end: [],
            velocityChange: []
        };

        // Performance tracking
        this.latencyHistory = [];
        this.maxLatencyHistory = 10;

        // Initialize
        this.init();
    }

    /**
     * Initialize interaction handlers
     */
    init() {
        this.createUniversalPuck();
        this.attachEventListeners();

        console.log(`Interaction handler initialized for ${this.isMobile ? 'mobile' : 'desktop'}`);
    }

    /**
     * Create universal puck element
     */
    createUniversalPuck() {
        if (!this.config.enableUniversalPuck) return;

        this.puckElement = document.createElement('div');
        this.puckElement.className = 'universal-puck';
        this.puckElement.style.cssText = `
            position: fixed;
            width: ${this.config.puckSize[this.isMobile ? 'mobile' : 'desktop']}px;
            height: ${this.config.puckSize[this.isMobile ? 'mobile' : 'desktop']}px;
            border-radius: 50%;
            background: radial-gradient(circle at 30% 30%,
                rgba(255,255,255,0.9),
                rgba(255,255,255,0.5),
                rgba(255,255,255,0.1));
            border: 3px solid rgba(255,255,255,0.8);
            box-shadow: 0 0 20px rgba(255,255,255,0.5),
                        0 0 40px rgba(255,255,255,0.3);
            pointer-events: none;
            z-index: 1000;
            transform: translate(-50%, -50%);
            transition: none;
            display: none;
            left: 50%;
            top: 50%;
        `;

        document.body.appendChild(this.puckElement);

        // Add hover effects for desktop
        if (!this.isMobile) {
            this.puckElement.addEventListener('mouseenter', () => {
                this.puckElement.style.transform = 'translate(-50%, -50%) scale(1.1)';
            });

            this.puckElement.addEventListener('mouseleave', () => {
                this.puckElement.style.transform = 'translate(-50%, -50%) scale(1.0)';
            });
        }
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        if (this.isTouch && this.config.enableTouch) {
            this.attachTouchListeners();
        }

        if (!this.isTouch && this.config.enableMouse) {
            this.attachMouseListeners();
        }

        // Global events
        window.addEventListener('resize', this.handleResize.bind(this));
        window.addEventListener('orientationchange', this.handleOrientationChange.bind(this));

        // Prevent default touch behaviors
        if (this.isTouch) {
            document.addEventListener('touchstart', this.preventTouchDefaults.bind(this), { passive: false });
            document.addEventListener('touchmove', this.preventTouchDefaults.bind(this), { passive: false });
        }
    }

    /**
     * Attach mouse event listeners
     */
    attachMouseListeners() {
        this.element.addEventListener('mouseenter', this.handleMouseEnter.bind(this));
        this.element.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
        this.element.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.element.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.element.addEventListener('mouseup', this.handleMouseUp.bind(this));

        // Hide cursor over element
        this.element.style.cursor = 'none';
        this.element.style.userSelect = 'none';
        this.element.style.webkitUserSelect = 'none';
    }

    /**
     * Attach touch event listeners
     */
    attachTouchListeners() {
        this.element.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
        this.element.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        this.element.addEventListener('touchend', this.handleTouchEnd.bind(this));
        this.element.addEventListener('touchcancel', this.handleTouchEnd.bind(this));

        // Disable touch behaviors that interfere
        this.element.style.touchAction = 'none';
    }

    /**
     * Handle mouse enter
     */
    handleMouseEnter(event) {
        this.showPuck();
        this.isActive = true;
        this.updatePosition(event.clientX, event.clientY);
        this.triggerCallback('start', { x: this.x, y: this.y, type: 'mouse' });
    }

    /**
     * Handle mouse leave
     */
    handleMouseLeave(event) {
        this.isActive = false;
        this.hidePuck();
        this.triggerCallback('end', { x: this.x, y: this.y, type: 'mouse' });
    }

    /**
     * Handle mouse move
     */
    handleMouseMove(event) {
        if (!this.isActive) return;

        this.updatePosition(event.clientX, event.clientY);
        this.updateVelocity();
        this.updatePuckPosition();

        this.triggerCallback('move', {
            x: this.x,
            y: this.y,
            velocityX: this.velocityX,
            velocityY: this.velocityY,
            type: 'mouse'
        });
    }

    /**
     * Handle mouse down
     */
    handleMouseDown(event) {
        this.setPuckState('dragging');
    }

    /**
     * Handle mouse up
     */
    handleMouseUp(event) {
        this.setPuckState('active');
    }

    /**
     * Handle touch start
     */
    handleTouchStart(event) {
        event.preventDefault();

        const touches = Array.from(event.changedTouches);

        touches.forEach(touch => {
            const touchInfo = {
                id: touch.identifier,
                x: touch.clientX,
                y: touch.clientY,
                startTime: performance.now()
            };

            this.activeTouches.set(touch.identifier, touchInfo);

            // Set primary touch if none exists
            if (!this.primaryTouchId) {
                this.primaryTouchId = touch.identifier;
                this.isActive = true;
                this.showPuck();
                this.updatePosition(touch.clientX, touch.clientY);
                this.setPuckState('dragging');

                this.triggerCallback('start', {
                    x: this.x,
                    y: this.y,
                    type: 'touch',
                    touchId: touch.identifier
                });
            }
        });
    }

    /**
     * Handle touch move
     */
    handleTouchMove(event) {
        event.preventDefault();

        const touches = Array.from(event.changedTouches);

        touches.forEach(touch => {
            if (this.activeTouches.has(touch.identifier)) {
                const touchInfo = this.activeTouches.get(touch.identifier);
                touchInfo.x = touch.clientX;
                touchInfo.y = touch.clientY;

                // Update if this is primary touch
                if (touch.identifier === this.primaryTouchId) {
                    this.updatePosition(touch.clientX, touch.clientY);
                    this.updateVelocity();
                    this.updatePuckPosition();

                    this.triggerCallback('move', {
                        x: this.x,
                        y: this.y,
                        velocityX: this.velocityX,
                        velocityY: this.velocityY,
                        type: 'touch',
                        touchId: touch.identifier
                    });
                }
            }
        });
    }

    /**
     * Handle touch end
     */
    handleTouchEnd(event) {
        const touches = Array.from(event.changedTouches);

        touches.forEach(touch => {
            if (this.activeTouches.has(touch.identifier)) {
                this.activeTouches.delete(touch.identifier);

                // Handle primary touch ending
                if (touch.identifier === this.primaryTouchId) {
                    this.primaryTouchId = null;

                    // Find new primary touch if any remain
                    if (this.activeTouches.size > 0) {
                        const [newPrimaryId] = this.activeTouches.keys();
                        this.primaryTouchId = newPrimaryId;
                        const newTouchInfo = this.activeTouches.get(newPrimaryId);
                        this.updatePosition(newTouchInfo.x, newTouchInfo.y);
                    } else {
                        this.isActive = false;
                        this.hidePuck();
                        this.setPuckState('inactive');

                        this.triggerCallback('end', {
                            x: this.x,
                            y: this.y,
                            type: 'touch'
                        });
                    }
                }
            }
        });
    }

    /**
     * Update interaction position
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     */
    updatePosition(x, y) {
        this.prevX = this.x;
        this.prevY = this.y;
        this.x = x;
        this.y = y;

        // Track input latency
        const now = performance.now();
        const latency = now - this.lastUpdateTime;
        this.lastUpdateTime = now;
        this.updateLatencyTracking(latency);
    }

    /**
     * Update velocity based on position change
     */
    updateVelocity() {
        const dx = this.x - this.prevX;
        const dy = this.y - this.prevY;

        if (this.config.enableVelocitySmoothing) {
            // Smooth velocity changes
            this.velocityX = this.velocityX * this.config.velocitySmoothingFactor + dx * (1 - this.config.velocitySmoothingFactor);
            this.velocityY = this.velocityY * this.config.velocitySmoothingFactor + dy * (1 - this.config.velocitySmoothingFactor);
        } else {
            this.velocityX = dx;
            this.velocityY = dy;
        }

        this.triggerCallback('velocityChange', {
            velocityX: this.velocityX,
            velocityY: this.velocityY,
            speed: Math.sqrt(this.velocityX * this.velocityX + this.velocityY * this.velocityY)
        });
    }

    /**
     * Update latency tracking
     * @param {number} latency - Input latency in milliseconds
     */
    updateLatencyTracking(latency) {
        this.latencyHistory.push(latency);
        if (this.latencyHistory.length > this.maxLatencyHistory) {
            this.latencyHistory.shift();
        }
    }

    /**
     * Get average input latency
     * @returns {number} Average latency in milliseconds
     */
    getAverageLatency() {
        if (this.latencyHistory.length === 0) return 0;
        return this.latencyHistory.reduce((sum, latency) => sum + latency, 0) / this.latencyHistory.length;
    }

    /**
     * Check if input latency is acceptable
     * @returns {boolean} Whether latency is within acceptable range
     */
    isLatencyAcceptable() {
        const threshold = this.isMobile ? this.config.mobileInputLatencyThreshold : this.config.inputLatencyThreshold;
        return this.getAverageLatency() <= threshold;
    }

    /**
     * Show universal puck
     */
    showPuck() {
        if (this.puckElement) {
            this.puckElement.style.display = 'block';
            this.puckVisible = true;
        }
    }

    /**
     * Hide universal puck
     */
    hidePuck() {
        if (this.puckElement) {
            this.puckElement.style.display = 'none';
            this.puckVisible = false;
        }
    }

    /**
     * Update puck position
     */
    updatePuckPosition() {
        if (this.puckElement && this.puckVisible) {
            this.puckElement.style.left = this.x + 'px';
            this.puckElement.style.top = this.y + 'px';
        }
    }

    /**
     * Set puck visual state
     * @param {string} state - Visual state ('active', 'dragging', 'inactive')
     */
    setPuckState(state) {
        if (!this.puckElement) return;

        // Remove existing state classes
        this.puckElement.classList.remove('dragging', 'active', 'inactive');

        // Add new state class
        if (state !== 'inactive') {
            this.puckElement.classList.add(state);
        }

        // Update visual properties based on state
        switch (state) {
            case 'dragging':
                this.puckElement.style.transform = 'translate(-50%, -50%) scale(1.2)';
                this.puckElement.style.boxShadow = '0 0 30px rgba(255,255,255,0.8), 0 0 60px rgba(255,255,255,0.5)';
                break;
            case 'active':
                this.puckElement.style.transform = 'translate(-50%, -50%) scale(1.0)';
                this.puckElement.style.boxShadow = '0 0 20px rgba(255,255,255,0.5), 0 0 40px rgba(255,255,255,0.3)';
                break;
            case 'inactive':
                this.puckElement.style.transform = 'translate(-50%, -50%) scale(0.9)';
                this.puckElement.style.boxShadow = '0 0 10px rgba(255,255,255,0.3)';
                break;
        }
    }

    /**
     * Prevent default touch behaviors
     * @param {TouchEvent} event - Touch event
     */
    preventTouchDefaults(event) {
        // Prevent scrolling, zooming, and other default touch behaviors
        if (this.element.contains(event.target)) {
            event.preventDefault();
        }
    }

    /**
     * Handle window resize
     */
    handleResize() {
        // Recalculate positions if needed
        if (this.isActive) {
            this.updatePuckPosition();
        }
    }

    /**
     * Handle orientation change
     */
    handleOrientationChange() {
        // Small delay to allow orientation change to complete
        setTimeout(() => {
            if (this.isActive) {
                this.updatePuckPosition();
            }
        }, 100);
    }

    /**
     * Register event callback
     * @param {string} event - Event type ('start', 'move', 'end', 'velocityChange')
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
     * Get current interaction state
     * @returns {Object} Current state
     */
    getState() {
        return {
            isActive: this.isActive,
            isMobile: this.isMobile,
            position: { x: this.x, y: this.y },
            velocity: { x: this.velocityX, y: this.velocityY },
            speed: Math.sqrt(this.velocityX * this.velocityX + this.velocityY * this.velocityY),
            latency: this.getAverageLatency(),
            latencyAcceptable: this.isLatencyAcceptable(),
            activeTouches: this.activeTouches.size,
            puckVisible: this.puckVisible
        };
    }

    /**
     * Destroy interaction handler
     */
    destroy() {
        // Remove puck element
        if (this.puckElement && this.puckElement.parentNode) {
            this.puckElement.parentNode.removeChild(this.puckElement);
        }

        // Clear callbacks
        this.callbacks = {
            start: [],
            move: [],
            end: [],
            velocityChange: []
        };

        // Clear state
        this.activeTouches.clear();
        this.latencyHistory = [];

        console.log('Interaction handler destroyed');
    }
}

export { InteractionHandler };

// Note: singleton instance removed because it requires an element parameter
// Users should create their own instance: new InteractionHandler(element)
