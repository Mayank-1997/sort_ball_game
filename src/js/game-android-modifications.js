/**
 * Updated Game.js methods for Android compatibility
 * These replace the existing localStorage-based methods
 */

class BallSortGame {
    constructor() {
        // ... existing constructor code ...
        
        // Use Android-compatible progress manager
        this.progressManager = null;
        this.initializeProgressManager();
    }

    /**
     * Initialize progress manager for Android
     */
    async initializeProgressManager() {
        if (typeof AndroidUserProgressManager !== 'undefined') {
            this.progressManager = new AndroidUserProgressManager();
            await this.progressManager.initialize();
            
            console.log('Android UserProgressManager initialized');
        } else {
            console.warn('AndroidUserProgressManager not available, using fallback');
            // Fallback to original UserProgressManager
            this.progressManager = new UserProgressManager();
        }
    }

    /**
     * Save game state (Android-compatible)
     */
    async saveGameState() {
        const gameState = {
            currentLevel: this.currentLevel,
            maxLevelReached: Math.max(this.currentLevel, this.maxLevelReached || 1),
            tubes: this.tubes,
            moves: this.moves,
            moveHistory: this.moveHistory,
            hintsUsed: this.hintsUsed,
            shufflesUsed: this.shufflesUsed,
            gameState: this.gameState,
            soundEnabled: this.soundEnabled,
            lastPlayedTime: Date.now()
        };
        
        try {
            if (this.progressManager && this.progressManager.saveGameState) {
                // Use Android-compatible storage
                await this.progressManager.saveGameState(gameState);
            } else {
                // Fallback to localStorage
                localStorage.setItem('ballSortGame', JSON.stringify(gameState));
            }
            console.log(`Game state saved - Level: ${this.currentLevel}, Moves: ${this.moves}`);
        } catch (e) {
            console.error('Failed to save game state:', e);
        }
    }

    /**
     * Load game state (Android-compatible)
     */
    async loadGameState() {
        try {
            // Wait for progress manager to initialize
            if (this.progressManager && this.progressManager.loadUserProgress) {
                await this.progressManager.loadUserProgress();
                
                // Get the maximum level reached from progress manager
                const maxLevelFromProgress = this.progressManager.userData.maxLevelReached;
                console.log(`Max level from progress manager: ${maxLevelFromProgress}`);
                
                // Update our max level
                this.maxLevelReached = maxLevelFromProgress;
            }
            
            let savedState = null;
            
            if (this.progressManager && this.progressManager.loadGameState) {
                // Use Android-compatible storage
                savedState = await this.progressManager.loadGameState();
            } else {
                // Fallback to localStorage
                const localData = localStorage.getItem('ballSortGame');
                savedState = localData ? JSON.parse(localData) : null;
            }
            
            if (savedState) {
                console.log('Loading saved game state...');
                
                // Restore level progress, but ensure it doesn't exceed progress manager max
                this.currentLevel = Math.min(savedState.currentLevel || 1, this.maxLevelReached);
                this.tubes = savedState.tubes || [];
                this.moves = savedState.moves || 0;
                this.moveHistory = savedState.moveHistory || [];
                this.hintsUsed = savedState.hintsUsed || 0;
                this.shufflesUsed = savedState.shufflesUsed || 0;
                this.timeLeft = 0;
                this.levelTimeLimit = this.calculateTimeLimit(this.currentLevel);
                this.soundEnabled = savedState.soundEnabled !== undefined ? savedState.soundEnabled : true;
                
                console.log(`Restored to level ${this.currentLevel} (max reached: ${this.maxLevelReached}) with ${this.moves} moves`);
                
                // If we have valid saved game state, restore it
                if (this.tubes.length > 0) {
                    this.levelTimeLimit = this.calculateTimeLimit(this.currentLevel);
                    this.timeLeft = this.levelTimeLimit;
                    console.log(`Game state restored - timer will start when user begins playing`);
                    this.updateUI();
                } else {
                    console.log(`No level data found, generating level ${this.currentLevel}`);
                    this.generateLevel(this.currentLevel, false);
                }
            } else {
                // No saved state, start from highest unlocked level
                this.currentLevel = this.maxLevelReached;
                console.log(`No saved state found, starting from max level: ${this.currentLevel}`);
                this.initializeGame();
            }
        } catch (e) {
            console.error('Error loading saved state:', e);
            // Invalid saved state, start fresh
            this.initializeGame();
        }
    }

    /**
     * Save user progress when level is completed (Android-compatible)
     */
    async saveUserProgress() {
        if (this.progressManager && this.progressManager.saveUserProgress) {
            try {
                await this.progressManager.saveUserProgress();
                console.log('User progress saved to Android storage');
            } catch (error) {
                console.error('Failed to save user progress:', error);
            }
        }
    }

    /**
     * Handle level completion with Android storage
     */
    async handleLevelCompletion() {
        // ... existing level completion code ...
        
        // Update user progress with the progress manager
        if (this.progressManager) {
            // Record level completion
            this.progressManager.addGameCompletion(
                this.currentLevel, 
                this.moves, 
                totalTimeSpent
            );
            
            // Update maximum level reached  
            this.progressManager.updateMaxLevel(this.currentLevel + 1);
            this.maxLevelReached = this.currentLevel + 1;
            console.log(`Max level updated to: ${this.maxLevelReached}`);
            
            // Save progress asynchronously
            await this.saveUserProgress();
        }
        
        // ... rest of level completion logic ...
    }

    /**
     * Auto-save when page unloads (Android-compatible)
     */
    setupAutoSave() {
        // For web browsers
        window.addEventListener('beforeunload', async () => {
            await this.saveGameState();
        });
        
        // For Android apps (Cordova events)
        document.addEventListener('pause', async () => {
            console.log('App paused, saving state...');
            await this.saveGameState();
            await this.saveUserProgress();
        });
        
        document.addEventListener('resume', async () => {
            console.log('App resumed, loading state...');
            await this.loadGameState();
        });
        
        // Periodic auto-save
        setInterval(async () => {
            if (this.gameState === 'playing') {
                await this.saveGameState();
            }
        }, 30000); // Save every 30 seconds during gameplay
    }
}

/**
 * Initialize game with Android support
 */
document.addEventListener('deviceready', async () => {
    console.log('Device ready, initializing game...');
    window.ballSortGameInstance = new BallSortGame();
    
    // Wait for progress manager to initialize
    if (window.ballSortGameInstance.progressManager) {
        await window.ballSortGameInstance.progressManager.initialize();
    }
    
    console.log('Game initialized with Android storage support');
}, false);

// Fallback for web browsers
if (typeof window.cordova === 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('Web environment detected, initializing game...');
        window.ballSortGameInstance = new BallSortGame();
    });
}
