/**
 * Image System Module - Liquid Stories V4
 * Handles image loading, processing, and management
 */

class ImageSystem {
    constructor() {
        this.IMAGE_SIZE = 700;
        this.IMAGE1_URL = 'KidHappy.png';
        this.IMAGE2_URL = 'KidScared.png';

        this.sourceImage1 = null;
        this.sourceImage2 = null;
        this.image1Loaded = false;
        this.image2Loaded = false;
        this.imagesLoaded = false;

        this.scaledWidth = 0;
        this.scaledHeight = 0;

        this.onImagesLoadedCallback = null;

        console.log('[ImageSystem] Initialized');
    }

    /**
     * Load both images
     */
    loadDualImages() {
        console.log('[ImageSystem] Loading dual images...');

        this.loadImage1();
        this.loadImage2();
    }

    /**
     * Load Image 1 (KidHappy)
     */
    loadImage1() {
        const img1 = new Image();

        img1.onload = () => {
            console.log('[ImageSystem] Image 1 loaded successfully');

            // Calculate image dimensions
            const imageAspect = img1.width / img1.height;
            if (imageAspect > 1) {
                this.scaledWidth = this.IMAGE_SIZE;
                this.scaledHeight = this.IMAGE_SIZE / imageAspect;
            } else {
                this.scaledHeight = this.IMAGE_SIZE;
                this.scaledWidth = this.IMAGE_SIZE * imageAspect;
            }

            // Pre-resize for perfect grid division
            const resizedCanvas1 = document.createElement('canvas');
            resizedCanvas1.width = Math.floor(this.scaledWidth);
            resizedCanvas1.height = Math.floor(this.scaledHeight);
            const resizedCtx1 = resizedCanvas1.getContext('2d');
            resizedCtx1.imageSmoothingEnabled = false;
            resizedCtx1.drawImage(img1, 0, 0, resizedCanvas1.width, resizedCanvas1.height);

            this.sourceImage1 = resizedCanvas1;
            this.image1Loaded = true;

            this.checkImagesLoaded();
        };

        img1.onerror = () => {
            console.error('[ImageSystem] Failed to load Image 1, creating demo');
            this.createDemoImages();
        };

        img1.src = this.IMAGE1_URL;
    }

    /**
     * Load Image 2 (KidScared)
     */
    loadImage2() {
        const img2 = new Image();

        img2.onload = () => {
            console.log('[ImageSystem] Image 2 loaded successfully');

            // Use same dimensions as image1
            const resizedCanvas2 = document.createElement('canvas');
            resizedCanvas2.width = Math.floor(this.scaledWidth);
            resizedCanvas2.height = Math.floor(this.scaledHeight);
            const resizedCtx2 = resizedCanvas2.getContext('2d');
            resizedCtx2.imageSmoothingEnabled = false;
            resizedCtx2.drawImage(img2, 0, 0, resizedCanvas2.width, resizedCanvas2.height);

            this.sourceImage2 = resizedCanvas2;
            this.image2Loaded = true;

            this.checkImagesLoaded();
        };

        img2.onerror = () => {
            console.error('[ImageSystem] Failed to load Image 2, creating demo');
            this.createDemoImages();
        };

        img2.src = this.IMAGE2_URL;
    }

    /**
     * Create demo images as fallback
     */
    createDemoImages() {
        console.log('[ImageSystem] Creating demo images...');

        // Demo KidHappy
        const demoCanvas1 = document.createElement('canvas');
        demoCanvas1.width = this.IMAGE_SIZE;
        demoCanvas1.height = this.IMAGE_SIZE;
        const demoCtx1 = demoCanvas1.getContext('2d');

        const gradient1 = demoCtx1.createRadialGradient(
            this.IMAGE_SIZE/2, this.IMAGE_SIZE/2, 0,
            this.IMAGE_SIZE/2, this.IMAGE_SIZE/2, this.IMAGE_SIZE/2
        );
        gradient1.addColorStop(0, '#FFD700');
        gradient1.addColorStop(1, '#FFA500');
        demoCtx1.fillStyle = gradient1;
        demoCtx1.fillRect(0, 0, this.IMAGE_SIZE, this.IMAGE_SIZE);

        demoCtx1.fillStyle = 'rgba(255, 255, 255, 0.9)';
        demoCtx1.font = 'bold 48px Arial';
        demoCtx1.textAlign = 'center';
        demoCtx1.textBaseline = 'middle';
        demoCtx1.fillText('😊', this.IMAGE_SIZE/2, this.IMAGE_SIZE/2 - 30);
        demoCtx1.fillText('KID HAPPY', this.IMAGE_SIZE/2, this.IMAGE_SIZE/2 + 30);

        // Demo KidScared
        const demoCanvas2 = document.createElement('canvas');
        demoCanvas2.width = this.IMAGE_SIZE;
        demoCanvas2.height = this.IMAGE_SIZE;
        const demoCtx2 = demoCanvas2.getContext('2d');

        const gradient2 = demoCtx2.createRadialGradient(
            this.IMAGE_SIZE/2, this.IMAGE_SIZE/2, 0,
            this.IMAGE_SIZE/2, this.IMAGE_SIZE/2, this.IMAGE_SIZE/2
        );
        gradient2.addColorStop(0, '#4169E1');
        gradient2.addColorStop(1, '#000080');
        demoCtx2.fillStyle = gradient2;
        demoCtx2.fillRect(0, 0, this.IMAGE_SIZE, this.IMAGE_SIZE);

        demoCtx2.fillStyle = 'rgba(255, 255, 255, 0.9)';
        demoCtx2.font = 'bold 48px Arial';
        demoCtx2.textAlign = 'center';
        demoCtx2.textBaseline = 'middle';
        demoCtx2.fillText('😰', this.IMAGE_SIZE/2, this.IMAGE_SIZE/2 - 30);
        demoCtx2.fillText('KID SCARED', this.IMAGE_SIZE/2, this.IMAGE_SIZE/2 + 30);

        // Set dimensions
        this.scaledWidth = this.IMAGE_SIZE;
        this.scaledHeight = this.IMAGE_SIZE;

        // Use canvases directly - no need to convert to images
        this.sourceImage1 = demoCanvas1;
        this.sourceImage2 = demoCanvas2;
        this.image1Loaded = true;
        this.image2Loaded = true;
        this.checkImagesLoaded();
    }

    /**
     * Check if both images are loaded
     */
    checkImagesLoaded() {
        if (this.image1Loaded && this.image2Loaded) {
            this.imagesLoaded = true;
            console.log('[ImageSystem] Dual images loaded successfully');

            if (this.onImagesLoadedCallback) {
                this.onImagesLoadedCallback();
            }
        }
    }

    /**
     * Set callback for when images are loaded
     */
    setOnImagesLoadedCallback(callback) {
        this.onImagesLoadedCallback = callback;
    }

    /**
     * Get image dimensions
     */
    getImageDimensions() {
        return {
            width: this.scaledWidth,
            height: this.scaledHeight
        };
    }

    /**
     * Get image size constant
     */
    getImageSize() {
        return this.IMAGE_SIZE;
    }

    /**
     * Get source images
     */
    getSourceImages() {
        return {
            image1: this.sourceImage1,
            image2: this.sourceImage2
        };
    }

    /**
     * Check if images are loaded
     */
    areImagesLoaded() {
        return this.imagesLoaded;
    }

    /**
     * Get image URLs
     */
    getImageUrls() {
        return {
            image1: this.IMAGE1_URL,
            image2: this.IMAGE2_URL
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ImageSystem;
}