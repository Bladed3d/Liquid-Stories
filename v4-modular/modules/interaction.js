/**
 * Interaction System Module - Liquid Stories V4
 * Handles mouse/touch interactions and puck physics
 */

class InteractionSystem {
    constructor(universalPuck, onPositionUpdate, onInteractionComplete) {
        this.universalPuck = universalPuck;
        this.onPositionUpdate = onPositionUpdate;
        this.onInteractionComplete = onInteractionComplete;

        // Detect device type
        this.isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

        // Puck state
        this.puckActive = false;
        this.puckX = window.innerWidth - 50; // Right edge with padding
        this.puckY = window.innerHeight / 2;    // Middle vertically
        this.prevPuckX = this.puckX;
        this.prevPuckY = this.puckY;
        this.puckVelX = 0;
        this.puckVelY = 0;
        this.mouseInCanvas = false;

        // Mobile menu state
        this.mobileMenuOpen = false;

        console.log(`[InteractionSystem] Initialized for ${this.isMobile ? 'mobile' : 'desktop'}`);
    }

    /**
     * Initialize event listeners
     */
    initialize() {
        if (this.isMobile) {
            this.setupMobileEventListeners();
        } else {
            this.setupDesktopEventListeners();
        }
    }

    /**
     * Setup mobile touch event listeners
     */
    setupMobileEventListeners() {
        document.addEventListener('touchstart', (e) => {
            this.handlePuckStart(e);
            e.preventDefault();
        });

        document.addEventListener('touchmove', (e) => {
            this.handlePuckMove(e);
            e.preventDefault();
        });

        document.addEventListener('touchend', (e) => {
            this.handlePuckEnd(e);
        });
    }

    /**
     * Setup desktop mouse event listeners
     */
    setupDesktopEventListeners() {
        document.addEventListener('mousemove', (e) => this.handleDesktopMouseMove(e));
        document.addEventListener('mousedown', (e) => this.handleDesktopMouseDown(e));
        document.addEventListener('mouseup', (e) => this.handleDesktopMouseUp(e));
        document.addEventListener('mouseenter', (e) => this.handleDesktopMouseEnter(e));
        document.addEventListener('mouseleave', (e) => this.handleDesktopMouseLeave(e));
    }

    /**
     * Handle puck start (mobile)
     */
    handlePuckStart(e) {
        if (!this.isMobile) return;

        const instructions = document.getElementById('puckInstructions');
        if (instructions) {
            instructions.style.display = 'none';
        }

        this.puckActive = true;
        const touch = e.touches[0];
        this.puckX = touch.clientX;
        this.puckY = touch.clientY;
        this.prevPuckX = this.puckX;
        this.prevPuckY = this.puckY;

        this.updatePuckPosition();
        this.universalPuck.classList.add('dragging');
    }

    /**
     * Handle puck move (mobile)
     */
    handlePuckMove(e) {
        if (!this.isMobile || !this.puckActive) return;

        const touch = e.touches[0];
        this.prevPuckX = this.puckX;
        this.prevPuckY = this.puckY;
        this.puckX = touch.clientX;
        this.puckY = touch.clientY;

        this.updatePuckPosition();
        this.calculateVelocity();
        this.notifyUpdate();
    }

    /**
     * Handle puck end (mobile)
     */
    handlePuckEnd(e) {
        if (!this.isMobile) return;

        this.puckActive = false;
        this.puckVelX = 0;
        this.puckVelY = 0;
        this.universalPuck.classList.remove('dragging');
    }

    /**
     * Handle desktop mouse move
     */
    handleDesktopMouseMove(e) {
        if (this.isMobile) return;

        this.prevPuckX = this.puckX;
        this.prevPuckY = this.puckY;
        this.puckX = e.clientX;
        this.puckY = e.clientY;

        this.updatePuckPosition();
        this.universalPuck.classList.add('desktop-following');
        this.calculateVelocity();
        this.notifyUpdate();
    }

    /**
     * Handle desktop mouse down
     */
    handleDesktopMouseDown(e) {
        if (this.isMobile) return;
        this.universalPuck.classList.add('dragging');
    }

    /**
     * Handle desktop mouse up
     */
    handleDesktopMouseUp(e) {
        if (this.isMobile) return;
        this.universalPuck.classList.remove('dragging');
    }

    /**
     * Handle desktop mouse enter
     */
    handleDesktopMouseEnter(e) {
        if (this.isMobile) return;
        this.mouseInCanvas = true;
        this.universalPuck.style.display = 'block';
    }

    /**
     * Handle desktop mouse leave
     */
    handleDesktopMouseLeave(e) {
        if (this.isMobile) return;
        this.mouseInCanvas = false;
        this.universalPuck.classList.remove('dragging');
        this.universalPuck.classList.remove('desktop-following');
    }

    /**
     * Update puck visual position
     */
    updatePuckPosition() {
        this.universalPuck.style.left = this.puckX + 'px';
        this.universalPuck.style.top = this.puckY + 'px';
    }

    /**
     * Calculate puck velocity
     */
    calculateVelocity() {
        this.puckVelX = this.puckX - this.prevPuckX;
        this.puckVelY = this.puckY - this.prevPuckY;
    }

    /**
     * Notify position update callback
     */
    notifyUpdate() {
        if (this.onPositionUpdate) {
            this.onPositionUpdate(this.puckX, this.puckY, this.puckVelX, this.puckVelY);
        }
    }

    /**
     * Get current puck position
     */
    getPosition() {
        return {
            x: this.puckX,
            y: this.puckY,
            velX: this.puckVelX,
            velY: this.puckVelY
        };
    }

    /**
     * Get device type
     */
    getDeviceType() {
        return this.isMobile ? 'Mobile' : 'Desktop';
    }

    /**
     * Get velocity magnitude
     */
    getVelocity() {
        return Math.sqrt(this.puckVelX * this.puckVelX + this.puckVelY * this.puckVelY);
    }

    /**
     * Reset puck to center position
     */
    resetPosition() {
        this.puckX = window.innerWidth / 2;
        this.puckY = window.innerHeight / 2;
        this.prevPuckX = this.puckX;
        this.prevPuckY = this.puckY;
        this.puckVelX = 0;
        this.puckVelY = 0;
        this.updatePuckPosition();
    }

    /**
     * Mobile menu functions
     */
    toggleMobileMenu() {
        this.mobileMenuOpen = !this.mobileMenuOpen;
        const menuBackdrop = document.getElementById('menuBackdrop');
        if (menuBackdrop) {
            if (this.mobileMenuOpen) {
                menuBackdrop.classList.add('active');
            } else {
                menuBackdrop.classList.remove('active');
            }
        }
    }

    closeMobileMenu() {
        this.mobileMenuOpen = false;
        const menuBackdrop = document.getElementById('menuBackdrop');
        if (menuBackdrop) {
            menuBackdrop.classList.remove('active');
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = InteractionSystem;
}