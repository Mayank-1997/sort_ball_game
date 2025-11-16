/**
 * Ball Expression System for Ball Sort Game
 * Adds facial expressions to balls while maintaining game compatibility
 */

class BallExpressionSystem {
    constructor() {
        // Define all available expressions
        this.expressions = [
            'angry',
            'laughing', 
            'crying',
            'surprised',
            'sleeping'
        ];
        
        // Cache for level-based expression mappings
        this.levelExpressionCache = new Map();
    }
    
    /**
     * Generate a pseudo-random number based on level and color
     * This ensures consistent expressions for same colors in same level
     */
    generateSeed(level, colorIndex) {
        // Enhanced seed generation for better distribution
        // Use larger primes and more variation
        const levelSeed = level * 37;
        const colorSeed = colorIndex * 23;
        const mixedSeed = (levelSeed + colorSeed) * 13;
        
        // Use a larger modulus to avoid patterns
        return Math.abs(mixedSeed) % 999983;
    }
    
    /**
     * Get a pseudo-random number between 0 and max-1 using a seed
     */
    seededRandom(seed, max) {
        if (max <= 0) return 0;
        
        // Enhanced LCG with better constants
        const a = 1664525;
        const c = 1013904223;
        const m = Math.pow(2, 32);
        
        // Apply the LCG transformation
        let next = (a * seed + c) % m;
        
        // Ensure positive result
        next = Math.abs(next);
        
        // Use modulo to get the final index
        const result = next % max;
        
        return result;
    }
    
    /**
     * Get expression for a specific color in a specific level
     * Same colors in same level will always have same expression
     * Enhanced with better distribution algorithm
     */
    getExpressionForColor(level, colorIndex) {
        const cacheKey = `${level}-${colorIndex}`;
        
        if (this.levelExpressionCache.has(cacheKey)) {
            return this.levelExpressionCache.get(cacheKey);
        }
        
        // Use the improved distribution algorithm
        const levelOffset = (level * 3) % this.expressions.length;
        let expressionIndex;
        
        // Try to maximize variety within a level
        const maxColorsPerLevel = 8; // Reasonable assumption for max colors in a level
        
        if (colorIndex < this.expressions.length) {
            // Direct mapping with level offset for first N colors
            expressionIndex = (colorIndex + levelOffset) % this.expressions.length;
        } else {
            // For additional colors, use deterministic but varied approach
            const seed = this.getExpressionSeed(level, colorIndex);
            expressionIndex = Math.abs(seed) % this.expressions.length;
        }
        
        const expression = this.expressions[expressionIndex];
        
        // Debug logging for first few levels
        if (level <= 5) {
            console.log(`Level ${level}, Color ${colorIndex}: offset=${levelOffset}, index=${expressionIndex}, expression=${expression}`);
        }
        
        // Cache the result
        this.levelExpressionCache.set(cacheKey, expression);
        
        return expression;
    }
    
    /**
     * Generate expression mapping for all colors in a level
     * Returns object: {0: 'angry', 1: 'laughing', 2: 'crying', ...}
     * Enhanced to ensure maximum variety within each level
     */
    generateLevelExpressions(level, totalColors) {
        const expressions = {};
        
        // For better variety, use a round-robin approach combined with level-based offset
        const levelOffset = (level * 3) % this.expressions.length; // Rotate expressions per level
        
        for (let colorIndex = 0; colorIndex < totalColors; colorIndex++) {
            // Calculate expression index ensuring variety
            let expressionIndex;
            
            if (totalColors <= this.expressions.length) {
                // If we have enough expressions for all colors, distribute them evenly
                expressionIndex = (colorIndex + levelOffset) % this.expressions.length;
            } else {
                // More colors than expressions, use the original algorithm
                expressionIndex = Math.abs(this.getExpressionSeed(level, colorIndex)) % this.expressions.length;
            }
            
            const expression = this.expressions[expressionIndex];
            expressions[colorIndex] = expression;
        }
        
        // Debug output for first few levels
        if (level <= 5) {
            console.log(`Level ${level} expressions:`, expressions);
        }
        
        return expressions;
    }
    
    /**
     * Get a deterministic seed for expression assignment
     */
    getExpressionSeed(level, colorIndex) {
        const levelFactor = (level * 7) % 997;
        const colorFactor = (colorIndex * 11) % 991;
        return levelFactor + colorFactor + (level + colorIndex) * 3;
    }
    
    /**
     * Convert old ball format (number) to new format (object)
     */
    convertBallToObject(colorIndex, level) {
        return {
            color: colorIndex,
            expression: this.getExpressionForColor(level, colorIndex)
        };
    }
    
    /**
     * Convert new ball format (object) to old format (number) for compatibility
     */
    convertBallToNumber(ballObject) {
        return typeof ballObject === 'object' ? ballObject.color : ballObject;
    }
    
    /**
     * Get ball color (works with both old and new formats)
     */
    getBallColor(ball) {
        return typeof ball === 'object' ? ball.color : ball;
    }
    
    /**
     * Get ball expression (works with both old and new formats)
     */
    getBallExpression(ball, level, fallbackColor) {
        if (typeof ball === 'object' && ball.expression) {
            return ball.expression;
        }
        
        // Fallback: generate expression based on color
        const colorIndex = typeof ball === 'object' ? ball.color : ball;
        return this.getExpressionForColor(level, colorIndex);
    }
    
    /**
     * Clear cache (useful for testing or memory management)
     */
    clearCache() {
        this.levelExpressionCache.clear();
    }
    
    /**
     * Get all available expressions
     */
    getAllExpressions() {
        return [...this.expressions];
    }
    
    /**
     * Debug: Get current cache size
     */
    getCacheSize() {
        return this.levelExpressionCache.size;
    }
    
    /**
     * Debug: Get cached expressions for a level
     */
    getLevelCache(level) {
        const levelData = {};
        for (const [key, value] of this.levelExpressionCache.entries()) {
            if (key.startsWith(`${level}-`)) {
                const colorIndex = key.split('-')[1];
                levelData[colorIndex] = value;
            }
        }
        return levelData;
    }
}

// Export for use in game
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BallExpressionSystem;
} else if (typeof window !== 'undefined') {
    window.BallExpressionSystem = BallExpressionSystem;
}