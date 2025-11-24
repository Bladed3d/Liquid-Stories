/**
 * Image Loader Module
 * Handles image loading, caching, and error recovery
 */

class ImageLoader {
    constructor(config = {}) {
        this.config = {
            basePath: config.basePath || './images/',
            maxRetries: config.maxRetries || 3,
            retryDelays: config.retryDelays || [1000, 2000, 4000], // Exponential backoff
            cacheExpiry: config.cacheExpiry || 3600000, // 1 hour
            enableFallbacks: config.enableFallbacks !== false,
            ...config
        };

        this.images = new Map(); // Loaded images cache
        this.loadingPromises = new Map(); // Loading operation promises
        this.errors = new Map(); // Error tracking
        this.fallbackImages = new Map(); // Fallback image cache
    }

    /**
     * Load a single image with retry logic
     * @param {string} name - Image name (without extension)
     * @param {string} extension - File extension (default: .png)
     * @returns {Promise<HTMLImageElement>} Loaded image element
     */
    async loadImage(name, extension = '.png') {
        const cacheKey = `${name}${extension}`;

        // Return cached image if available and not expired
        if (this.images.has(cacheKey)) {
            const cached = this.images.get(cacheKey);
            if (Date.now() - cached.timestamp < this.config.cacheExpiry) {
                console.log(`Using cached image: ${cacheKey}`);
                return cached.image;
            } else {
                this.images.delete(cacheKey);
            }
        }

        // Return existing loading promise if in progress
        if (this.loadingPromises.has(cacheKey)) {
            return this.loadingPromises.get(cacheKey);
        }

        // Create loading promise
        const loadingPromise = this.loadImageWithRetry(name, extension);
        this.loadingPromises.set(cacheKey, loadingPromise);

        try {
            const image = await loadingPromise;
            this.images.set(cacheKey, {
                image,
                timestamp: Date.now()
            });
            this.loadingPromises.delete(cacheKey);
            console.log(`Successfully loaded image: ${cacheKey}`);
            return image;
        } catch (error) {
            this.loadingPromises.delete(cacheKey);
            this.errors.set(cacheKey, error);

            // Try to use fallback if enabled
            if (this.config.enableFallbacks) {
                const fallbackImage = await this.createFallbackImage(name);
                this.fallbackImages.set(cacheKey, fallbackImage);
                console.log(`Using fallback image for: ${cacheKey}`);
                return fallbackImage;
            }

            throw error;
        }
    }

    /**
     * Load image with retry logic
     * @param {string} name - Image name
     * @param {string} extension - File extension
     * @returns {Promise<HTMLImageElement>} Loaded image
     */
    async loadImageWithRetry(name, extension) {
        const imagePath = `${this.config.basePath}${name}${extension}`;
        let lastError;

        for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
            try {
                if (attempt > 0) {
                    const delay = this.config.retryDelays[attempt - 1] || 4000;
                    console.log(`Retrying image load (${attempt}/${this.config.maxRetries}): ${imagePath} (delay: ${delay}ms)`);
                    await this.delay(delay);
                }

                const image = await this.loadSingleImage(imagePath);
                return image;

            } catch (error) {
                lastError = error;
                console.error(`Image load attempt ${attempt + 1} failed: ${imagePath}`, error);

                if (attempt === this.config.maxRetries) {
                    throw new Error(`Failed to load image after ${this.config.maxRetries + 1} attempts: ${imagePath}. Last error: ${error.message}`);
                }
            }
        }

        throw lastError;
    }

    /**
     * Load a single image
     * @param {string} imagePath - Full path to image
     * @returns {Promise<HTMLImageElement>} Loaded image
     */
    async loadSingleImage(imagePath) {
        return new Promise((resolve, reject) => {
            const img = new Image();

            img.onload = () => {
                // Validate image loaded correctly
                if (img.naturalWidth === 0 || img.naturalHeight === 0) {
                    reject(new Error(`Image has invalid dimensions: ${imagePath}`));
                    return;
                }
                resolve(img);
            };

            img.onerror = () => {
                reject(new Error(`Failed to load image: ${imagePath}`));
            };

            // Start loading
            img.src = imagePath;
        });
    }

    /**
     * Create a fallback image when original fails to load
     * @param {string} name - Original image name
     * @returns {Promise<HTMLImageElement>} Fallback image
     */
    async createFallbackImage(name) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Create 400x400 fallback image
        canvas.width = 400;
        canvas.height = 400;

        // Create gradient background based on name
        const gradient = ctx.createRadialGradient(200, 200, 0, 200, 200, 200);

        // Different colors for different characters
        const colorSchemes = {
            'KidHappy': ['#FFD700', '#FFA500'],
            'KidScared': ['#4169E1', '#000080'],
            'Monster01': ['#9400D3', '#4B0082'],
            'Monster02': ['#DC143C', '#8B0000']
        };

        const colors = colorSchemes[name] || ['#666666', '#333333'];
        gradient.addColorStop(0, colors[0]);
        gradient.addColorStop(1, colors[1]);

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 400, 400);

        // Add text
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Add emoji and text based on name
        const emojiMap = {
            'KidHappy': '😊',
            'KidScared': '😰',
            'Monster01': '👹',
            'Monster02': '👺'
        };

        ctx.font = '64px Arial';
        ctx.fillText(emojiMap[name] || '❓', 200, 160);

        ctx.font = 'bold 24px Arial';
        ctx.fillText(name.replace(/([A-Z])/g, ' $1').trim(), 200, 240);

        // Convert canvas to image
        const fallbackImg = new Image();

        return new Promise((resolve) => {
            fallbackImg.onload = () => resolve(fallbackImg);
            fallbackImg.src = canvas.toDataURL();
        });
    }

    /**
     * Preload all story images
     * @returns {Promise<Array>} Array of loaded images
     */
    async preloadStoryImages() {
        const storyImages = ['KidHappy', 'KidScared', 'Monster01', 'Monster02'];

        console.log('Preloading story images...');
        const startTime = performance.now();

        const loadingPromises = storyImages.map(name =>
            this.loadImage(name)
                .then(img => ({ name, success: true, image: img }))
                .catch(error => ({ name, success: false, error: error.message }))
        );

        const results = await Promise.all(loadingPromises);
        const endTime = performance.now();

        const successful = results.filter(r => r.success);
        const failed = results.filter(r => !r.success);

        console.log(`Image loading completed in ${(endTime - startTime).toFixed(2)}ms`);
        console.log(`Successfully loaded: ${successful.length}/${results.length} images`);

        if (failed.length > 0) {
            console.warn('Failed images:', failed);
        }

        return results;
    }

    /**
     * Get loaded images
     * @returns {Array<string>} Array of loaded image names
     */
    getLoadedImages() {
        return Array.from(this.images.keys()).map(key => key.replace(/\.[^/.]+$/, ''));
    }

    /**
     * Get image by name
     * @param {string} name - Image name
     * @returns {HTMLImageElement|null} Image element or null
     */
    getImage(name) {
        for (const [key, cached] of this.images) {
            if (key.startsWith(name)) {
                return cached.image;
            }
        }

        // Check fallbacks
        for (const [key, image] of this.fallbackImages) {
            if (key.startsWith(name)) {
                return image;
            }
        }

        return null;
    }

    /**
     * Check if image is loaded
     * @param {string} name - Image name
     * @returns {boolean} Whether image is loaded
     */
    isLoaded(name) {
        return this.getImage(name) !== null;
    }

    /**
     * Get loading progress
     * @returns {Object} Progress information
     */
    getLoadingProgress() {
        const totalExpected = 4; // Expected number of story images
        const loaded = this.images.size;
        const loading = this.loadingPromises.size;
        const errors = this.errors.size;

        return {
            total: totalExpected,
            loaded,
            loading,
            errors,
            progress: Math.min((loaded / totalExpected) * 100, 100),
            isComplete: loaded === totalExpected
        };
    }

    /**
     * Clear image cache
     * @param {string} name - Specific image name to clear (optional)
     */
    clearCache(name = null) {
        if (name) {
            // Clear specific image
            for (const [key] of this.images) {
                if (key.startsWith(name)) {
                    this.images.delete(key);
                    break;
                }
            }
        } else {
            // Clear all
            this.images.clear();
            this.fallbackImages.clear();
            this.errors.clear();
        }
    }

    /**
     * Get memory usage information
     * @returns {Object} Memory usage stats
     */
    getMemoryUsage() {
        let totalMemory = 0;
        let imageCount = 0;

        for (const [key, cached] of this.images) {
            // Estimate memory usage (width * height * 4 bytes for RGBA)
            const img = cached.image;
            const memoryEstimate = img.naturalWidth * img.naturalHeight * 4;
            totalMemory += memoryEstimate;
            imageCount++;
        }

        return {
            imageCount,
            estimatedMemoryBytes: totalMemory,
            estimatedMemoryMB: (totalMemory / (1024 * 1024)).toFixed(2),
            cachedImages: this.images.size,
            fallbackImages: this.fallbackImages.size,
            errors: this.errors.size
        };
    }

    /**
     * Get error information
     * @returns {Array} Array of error objects
     */
    getErrors() {
        return Array.from(this.errors.entries()).map(([key, error]) => ({
            image: key,
            error: error.message,
            timestamp: Date.now()
        }));
    }

    /**
     * Delay helper function
     * @param {number} ms - Milliseconds to delay
     * @returns {Promise} Promise that resolves after delay
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Destroy image loader and clean up resources
     */
    destroy() {
        this.images.clear();
        this.fallbackImages.clear();
        this.errors.clear();
        this.loadingPromises.clear();
        console.log('Image loader destroyed');
    }
}

export { ImageLoader };

// Note: singleton instance removed to avoid initialization during module import
// Users should create their own instance: new ImageLoader()
