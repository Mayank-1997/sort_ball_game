/**
 * Tube Design System for Ball Sort Game
 * Adds visual variety to test tubes while maintaining game functionality
 */

class TubeDesignSystem {
    constructor() {
        // Define all available tube designs
        this.tubeDesigns = [
            'simple',
            'zigzag',
            'round',
            'hexagonal',
            'wavy',
            'diamond',
            'star'
        ];
        
        // Vibrant outline colors for tubes
        this.vibrantColors = [
            '#FF6B6B', // Bright Red
            '#4ECDC4', // Turquoise
            '#45B7D1', // Sky Blue
            '#96CEB4', // Mint Green
            '#FECA57', // Golden Yellow
            '#FF9FF3', // Hot Pink
            '#54A0FF', // Electric Blue
            '#5F27CD', // Purple
            '#00D2D3', // Cyan
            '#FF9F43', // Orange
            '#10AC84', // Emerald
            '#EE5A24', // Red Orange
            '#0984E3', // Blue
            '#6C5CE7', // Violet
            '#A29BFE', // Light Purple
            '#FD79A8'  // Pink
        ];
        
        // Cache for level-based tube design mappings
        this.levelTubeDesignCache = new Map();
        
        // Cache for tube outline colors
        this.tubeOutlineColorCache = new Map();
    }
    
    /**
     * Generate a deterministic seed for tube design assignment
     */
    generateTubeSeed(level, tubeIndex) {
        // Use different multipliers than ball expressions to ensure variety
        const levelFactor = (level * 13) % 1009;  // Different prime
        const tubeFactor = (tubeIndex * 19) % 1013;  // Different prime
        return (levelFactor + tubeFactor + (level + tubeIndex) * 5) % 999979;
    }
    
    /**
     * Get tube design for a specific tube in a specific level
     * Same tube index in same level will always have same design
     */
    getTubeDesignForIndex(level, tubeIndex) {
        const cacheKey = `${level}-${tubeIndex}`;
        
        if (this.levelTubeDesignCache.has(cacheKey)) {
            return this.levelTubeDesignCache.get(cacheKey);
        }
        
        // Generate tube design ensuring variety within level
        const levelOffset = (level * 5) % this.tubeDesigns.length;
        let designIndex;
        
        if (tubeIndex < this.tubeDesigns.length) {
            // Direct mapping with level offset for first N tubes
            designIndex = (tubeIndex + levelOffset) % this.tubeDesigns.length;
        } else {
            // For additional tubes, use deterministic approach
            const seed = this.generateTubeSeed(level, tubeIndex);
            designIndex = Math.abs(seed) % this.tubeDesigns.length;
        }
        
        const design = this.tubeDesigns[designIndex];
        
        // Debug logging for first few levels
        if (level <= 5) {
            console.log(`Level ${level}, Tube ${tubeIndex}: offset=${levelOffset}, index=${designIndex}, design=${design}`);
        }
        
        // Cache the result
        this.levelTubeDesignCache.set(cacheKey, design);
        
        return design;
    }
    
    /**
     * Generate tube design mapping for all tubes in a level
     * Returns object: {0: 'simple', 1: 'zigzag', 2: 'round', ...}
     */
    generateLevelTubeDesigns(level, totalTubes) {
        const designs = {};
        
        for (let tubeIndex = 0; tubeIndex < totalTubes; tubeIndex++) {
            designs[tubeIndex] = this.getTubeDesignForIndex(level, tubeIndex);
        }
        
        // Debug output for first few levels
        if (level <= 5) {
            console.log(`Level ${level} tube designs:`, designs);
        }
        
        return designs;
    }
    
    /**
     * Get all available tube designs
     */
    getAllTubeDesigns() {
        return [...this.tubeDesigns];
    }
    
    /**
     * Clear cache (useful for testing or memory management)
     */
    clearCache() {
        this.levelTubeDesignCache.clear();
    }
    
    /**
     * Debug: Get current cache size
     */
    getCacheSize() {
        return this.levelTubeDesignCache.size;
    }
    
    /**
     * Debug: Get cached designs for a level
     */
    getLevelCache(level) {
        const levelData = {};
        for (const [key, value] of this.levelTubeDesignCache.entries()) {
            if (key.startsWith(`${level}-`)) {
                const tubeIndex = key.split('-')[1];
                levelData[tubeIndex] = value;
            }
        }
        return levelData;
    }
    
    /**
     * Get vibrant outline color for a specific tube in a level
     */
    getTubeOutlineColor(level, tubeIndex) {
        const cacheKey = `${level}-${tubeIndex}`;
        
        if (this.tubeOutlineColorCache.has(cacheKey)) {
            return this.tubeOutlineColorCache.get(cacheKey);
        }
        
        // Generate deterministic color based on level and tube index
        const colorSeed = (level * 7 + tubeIndex * 11) % this.vibrantColors.length;
        const color = this.vibrantColors[colorSeed];
        
        // Cache the result
        this.tubeOutlineColorCache.set(cacheKey, color);
        
        return color;
    }
    
    /**
     * Generate vibrant outline colors for all tubes in a level
     */
    generateLevelTubeOutlineColors(level, totalTubes) {
        const colors = {};
        
        for (let tubeIndex = 0; tubeIndex < totalTubes; tubeIndex++) {
            colors[tubeIndex] = this.getTubeOutlineColor(level, tubeIndex);
        }
        
        return colors;
    }
    
    /**
     * Get tube design parameters for rendering with vibrant outline
     */
    getTubeDesignParams(design, tubeWidth, tubeHeight, level = 1, tubeIndex = 0) {
        const vibrantColor = this.getTubeOutlineColor(level, tubeIndex);
        
        const params = {
            design: design,
            width: tubeWidth,
            height: tubeHeight,
            borderRadius: 0,
            borderWidth: 3, // Increased for better visibility
            borderColor: vibrantColor, // Use vibrant color instead of #333
            fillColor: 'rgba(255, 255, 255, 0.1)',
            specialEffects: [],
            outlineColor: vibrantColor, // Add specific outline color
            glowColor: vibrantColor + '40' // Semi-transparent glow effect (hex with alpha)
        };
        
        switch (design) {
            case 'simple':
                params.borderRadius = 0;
                break;
                
            case 'round':
                params.borderRadius = tubeWidth * 0.3;
                params.specialEffects.push('gradient');
                break;
                
            case 'zigzag':
                params.specialEffects.push('zigzag');
                params.borderWidth = 3;
                break;
                
            case 'hexagonal':
                params.specialEffects.push('hexagon');
                params.borderWidth = 2.5;
                break;
                
            case 'wavy':
                params.specialEffects.push('wave');
                params.borderWidth = 2.5;
                break;
                
            case 'diamond':
                params.specialEffects.push('diamond');
                params.borderWidth = 2;
                break;
                
            case 'star':
                params.specialEffects.push('star');
                params.borderWidth = 2.5;
                break;
                
            default:
                params.design = 'simple';
        }
        
        return params;
    }
}

// Export for use in game
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TubeDesignSystem;
} else if (typeof window !== 'undefined') {
    window.TubeDesignSystem = TubeDesignSystem;
}