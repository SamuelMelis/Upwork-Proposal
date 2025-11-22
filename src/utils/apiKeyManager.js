/**
 * API Key Manager - Handles multiple Gemini API keys with automatic rotation
 * Add your API keys to the GEMINI_API_KEYS array below
 */

// ========================================
// ADD YOUR GEMINI API KEYS HERE
// ========================================
const GEMINI_API_KEYS = [
    'AIzaSyAMxplrswhzhuAFqgBSoUA_Od0GimupasQ',
    'AIzaSyBv2aY3lXAMcxFRMyCBSSq8m1DbRPqUxHU',
    'AIzaSyCP4_6Lz-1gjDP9jTCLCkN7pkBxf9A5jVk',
];

// Filter out any undefined/empty keys
const validKeys = GEMINI_API_KEYS.filter(key => key && key.trim() !== '');

class ApiKeyManager {
    constructor() {
        this.keys = validKeys;
        this.currentIndex = 0;

        if (this.keys.length === 0) {
            console.warn('⚠️ No API keys configured! Please add keys to apiKeyManager.js');
        } else {
            console.log(`✅ API Key Manager initialized with ${this.keys.length} key(s)`);
        }
    }

    /**
     * Get the current active API key
     */
    getCurrentKey() {
        if (this.keys.length === 0) {
            throw new Error('No API keys available. Please add keys to apiKeyManager.js');
        }
        return this.keys[this.currentIndex];
    }

    /**
     * Rotate to the next available API key
     * Returns true if rotation was successful, false if no more keys available
     */
    rotateToNextKey() {
        if (this.keys.length <= 1) {
            console.warn('⚠️ No additional API keys available for rotation');
            return false;
        }

        const previousIndex = this.currentIndex;
        this.currentIndex = (this.currentIndex + 1) % this.keys.length;

        console.log(`🔄 Rotated API key from index ${previousIndex} to ${this.currentIndex}`);
        return true;
    }

    /**
     * Check if an error is related to quota/rate limits
     */
    isQuotaError(error) {
        if (!error) return false;

        const errorMessage = error.message?.toLowerCase() || '';
        const errorString = error.toString().toLowerCase();

        // Common quota/rate limit error patterns from Gemini API
        const quotaPatterns = [
            'quota',
            'rate limit',
            'resource exhausted',
            'too many requests',
            '429',
            'quota exceeded',
            'rate_limit_exceeded',
            'insufficient quota'
        ];

        return quotaPatterns.some(pattern =>
            errorMessage.includes(pattern) || errorString.includes(pattern)
        );
    }

    /**
     * Get total number of available keys
     */
    getTotalKeys() {
        return this.keys.length;
    }

    /**
     * Get current key index (for debugging)
     */
    getCurrentIndex() {
        return this.currentIndex;
    }

    /**
     * Reset to first key (useful for testing)
     */
    reset() {
        this.currentIndex = 0;
        console.log('🔄 API key index reset to 0');
    }
}

// Export singleton instance
export const apiKeyManager = new ApiKeyManager();
