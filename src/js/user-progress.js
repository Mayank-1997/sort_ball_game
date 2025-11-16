/**
 * User Progress Management System
 * Handles persistent storage of user game progress with multiple storage options
 */

class UserProgressManager {
    constructor() {
        this.userId = null;
        this.userData = {
            maxLevelReached: 1,
            totalGamesPlayed: 0,
            totalMoves: 0,
            totalTimeSpent: 0,
            achievements: [],
            settings: {
                soundEnabled: true,
                vibrationEnabled: true
            },
            stats: {
                fastestCompletionTime: null,
                averageMovesPerLevel: 0,
                perfectLevels: 0, // Levels completed with minimum moves
                adsWatched: 0,
                coinsEarned: 0
            },
            lastPlayedDate: null,
            gameVersion: '1.0.0'
        };
        
        this.storageOptions = {
            localStorage: true,
            firebase: false,
            gameCenter: false,
            googlePlay: false
        };
        
        this.initialize();
    }

    /**
     * Initialize user progress system
     */
    async initialize() {
        // Generate or retrieve user ID
        this.userId = this.getUserId();
        
        // Try to load from various sources
        await this.loadUserProgress();
        
        // Setup auto-save
        this.setupAutoSave();
        
        console.log('User Progress Manager initialized for user:', this.userId);
    }

    /**
     * Generate or retrieve persistent user ID
     */
    getUserId() {
        let userId = localStorage.getItem('ballSortUserId');
        
        if (!userId) {
            // Generate unique user ID
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('ballSortUserId', userId);
            console.log('Generated new user ID:', userId);
        }
        
        return userId;
    }

    /**
     * Load user progress from available storage options
     */
    async loadUserProgress() {
        let loadedData = null;

        // Try loading from different sources in priority order
        
        // 1. Try Firebase (cloud storage)
        if (this.storageOptions.firebase) {
            try {
                loadedData = await this.loadFromFirebase();
                if (loadedData) {
                    console.log('Loaded progress from Firebase');
                }
            } catch (error) {
                console.warn('Failed to load from Firebase:', error);
            }
        }

        // 2. Try Game Center (iOS) or Google Play Games (Android)
        if (!loadedData && (this.storageOptions.gameCenter || this.storageOptions.googlePlay)) {
            try {
                loadedData = await this.loadFromGameServices();
                if (loadedData) {
                    console.log('Loaded progress from Game Services');
                }
            } catch (error) {
                console.warn('Failed to load from Game Services:', error);
            }
        }

        // 3. Fallback to localStorage
        if (!loadedData && this.storageOptions.localStorage) {
            loadedData = this.loadFromLocalStorage();
            if (loadedData) {
                console.log('Loaded progress from localStorage');
            }
        }

        // Merge loaded data with defaults
        if (loadedData) {
            this.userData = this.mergeUserData(this.userData, loadedData);
        }

        return this.userData;
    }

    /**
     * Save user progress to all available storage options
     */
    async saveUserProgress() {
        this.userData.lastPlayedDate = new Date().toISOString();
        
        const savePromises = [];

        // Save to localStorage (always available)
        if (this.storageOptions.localStorage) {
            try {
                this.saveToLocalStorage();
                console.log('Saved to localStorage');
            } catch (error) {
                console.error('Failed to save to localStorage:', error);
            }
        }

        // Save to Firebase
        if (this.storageOptions.firebase) {
            savePromises.push(
                this.saveToFirebase().catch(error => {
                    console.error('Failed to save to Firebase:', error);
                })
            );
        }

        // Save to Game Services
        if (this.storageOptions.gameCenter || this.storageOptions.googlePlay) {
            savePromises.push(
                this.saveToGameServices().catch(error => {
                    console.error('Failed to save to Game Services:', error);
                })
            );
        }

        // Wait for all saves to complete
        if (savePromises.length > 0) {
            await Promise.allSettled(savePromises);
        }

        console.log('User progress saved:', this.userData);
    }

    /**
     * Update max level reached
     */
    updateMaxLevel(level) {
        if (level > this.userData.maxLevelReached) {
            this.userData.maxLevelReached = level;
            this.saveUserProgress(); // Auto-save
            console.log(`New max level reached: ${level}`);
            
            // Trigger achievement check
            this.checkAchievements();
        }
    }

    /**
     * Update game statistics
     */
    updateStats(statsUpdate) {
        Object.assign(this.userData.stats, statsUpdate);
        this.saveUserProgress();
    }

    /**
     * Add game completion data
     */
    addGameCompletion(level, moves, timeSpent, perfectLevel = false) {
        this.userData.totalGamesPlayed++;
        this.userData.totalMoves += moves;
        this.userData.totalTimeSpent += timeSpent;
        
        if (perfectLevel) {
            this.userData.stats.perfectLevels++;
        }
        
        // Update fastest completion time
        if (!this.userData.stats.fastestCompletionTime || timeSpent < this.userData.stats.fastestCompletionTime) {
            this.userData.stats.fastestCompletionTime = timeSpent;
        }
        
        // Update average moves per level
        this.userData.stats.averageMovesPerLevel = this.userData.totalMoves / this.userData.totalGamesPlayed;
        
        this.updateMaxLevel(level);
    }

    /**
     * Record ad watched
     */
    recordAdWatched() {
        this.userData.stats.adsWatched++;
        this.userData.stats.coinsEarned += 10; // Give coins for watching ads
        this.saveUserProgress();
    }

    /**
     * Check and unlock achievements
     */
    checkAchievements() {
        const achievements = [];
        
        // Level-based achievements
        if (this.userData.maxLevelReached >= 5 && !this.hasAchievement('LEVEL_5')) {
            achievements.push({ id: 'LEVEL_5', name: 'Getting Started', description: 'Reach level 5' });
        }
        if (this.userData.maxLevelReached >= 10 && !this.hasAchievement('LEVEL_10')) {
            achievements.push({ id: 'LEVEL_10', name: 'Making Progress', description: 'Reach level 10' });
        }
        if (this.userData.maxLevelReached >= 25 && !this.hasAchievement('LEVEL_25')) {
            achievements.push({ id: 'LEVEL_25', name: 'Expert Player', description: 'Reach level 25' });
        }
        if (this.userData.maxLevelReached >= 50 && !this.hasAchievement('LEVEL_50')) {
            achievements.push({ id: 'LEVEL_50', name: 'Master Sorter', description: 'Complete all levels' });
        }

        // Stats-based achievements
        if (this.userData.stats.perfectLevels >= 5 && !this.hasAchievement('PERFECT_5')) {
            achievements.push({ id: 'PERFECT_5', name: 'Perfectionist', description: 'Complete 5 levels perfectly' });
        }
        if (this.userData.totalGamesPlayed >= 100 && !this.hasAchievement('GAMES_100')) {
            achievements.push({ id: 'GAMES_100', name: 'Dedicated Player', description: 'Play 100 games' });
        }

        // Add new achievements
        achievements.forEach(achievement => {
            this.userData.achievements.push({
                ...achievement,
                unlockedDate: new Date().toISOString()
            });
        });

        if (achievements.length > 0) {
            this.saveUserProgress();
            return achievements; // Return for UI notification
        }

        return [];
    }

    /**
     * Check if user has specific achievement
     */
    hasAchievement(achievementId) {
        return this.userData.achievements.some(a => a.id === achievementId);
    }

    /**
     * Get user progress data
     */
    getUserData() {
        return { ...this.userData };
    }

    /**
     * Reset user progress (for testing or user request)
     */
    resetProgress() {
        const userId = this.userId;
        this.userData = {
            maxLevelReached: 1,
            totalGamesPlayed: 0,
            totalMoves: 0,
            totalTimeSpent: 0,
            achievements: [],
            settings: {
                soundEnabled: true,
                vibrationEnabled: true
            },
            stats: {
                fastestCompletionTime: null,
                averageMovesPerLevel: 0,
                perfectLevels: 0,
                adsWatched: 0,
                coinsEarned: 0
            },
            lastPlayedDate: null,
            gameVersion: '1.0.0'
        };
        this.userId = userId;
        this.saveUserProgress();
        console.log('User progress reset');
    }

    // Storage implementation methods

    /**
     * Save to localStorage
     */
    saveToLocalStorage() {
        const data = {
            userId: this.userId,
            userData: this.userData,
            savedAt: new Date().toISOString()
        };
        localStorage.setItem('ballSortUserProgress', JSON.stringify(data));
        localStorage.setItem('ballSortMaxLevel', this.userData.maxLevelReached.toString());
    }

    /**
     * Load from localStorage
     */
    loadFromLocalStorage() {
        try {
            const data = localStorage.getItem('ballSortUserProgress');
            if (data) {
                const parsed = JSON.parse(data);
                return parsed.userData;
            }
            
            // Legacy support - check for old max level storage
            const maxLevel = localStorage.getItem('ballSortMaxLevel');
            if (maxLevel) {
                return { maxLevelReached: parseInt(maxLevel) };
            }
        } catch (error) {
            console.error('Error loading from localStorage:', error);
        }
        return null;
    }

    /**
     * Save to Firebase (cloud storage)
     */
    async saveToFirebase() {
        // Implement Firebase integration
        if (typeof firebase !== 'undefined' && firebase.firestore) {
            const db = firebase.firestore();
            await db.collection('userProgress').doc(this.userId).set({
                ...this.userData,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        } else {
            throw new Error('Firebase not available');
        }
    }

    /**
     * Load from Firebase
     */
    async loadFromFirebase() {
        if (typeof firebase !== 'undefined' && firebase.firestore) {
            const db = firebase.firestore();
            const doc = await db.collection('userProgress').doc(this.userId).get();
            if (doc.exists) {
                return doc.data();
            }
        }
        return null;
    }

    /**
     * Save to Game Services (Game Center/Google Play)
     */
    async saveToGameServices() {
        // For Cordova/PhoneGap apps
        if (typeof window.plugins !== 'undefined') {
            if (window.plugins.gameCenter) {
                // iOS Game Center
                await this.saveToGameCenter();
            } else if (window.plugins.googlePlayGames) {
                // Android Google Play Games
                await this.saveToGooglePlay();
            }
        } else {
            throw new Error('Game Services not available');
        }
    }

    /**
     * Load from Game Services
     */
    async loadFromGameServices() {
        if (typeof window.plugins !== 'undefined') {
            if (window.plugins.gameCenter) {
                return await this.loadFromGameCenter();
            } else if (window.plugins.googlePlayGames) {
                return await this.loadFromGooglePlay();
            }
        }
        return null;
    }

    /**
     * iOS Game Center integration
     */
    async saveToGameCenter() {
        // Implementation for Game Center cloud save
        // This would use the Game Center API to save user progress
        console.log('Saving to Game Center...');
    }

    async loadFromGameCenter() {
        // Implementation for Game Center cloud load
        console.log('Loading from Game Center...');
        return null;
    }

    /**
     * Google Play Games integration
     */
    async saveToGooglePlay() {
        // Implementation for Google Play Games cloud save
        console.log('Saving to Google Play Games...');
    }

    async loadFromGooglePlay() {
        console.log('Loading from Google Play Games...');
        return null;
    }

    /**
     * Merge user data with defaults
     */
    mergeUserData(defaultData, loadedData) {
        return {
            ...defaultData,
            ...loadedData,
            settings: { ...defaultData.settings, ...(loadedData.settings || {}) },
            stats: { ...defaultData.stats, ...(loadedData.stats || {}) },
            achievements: loadedData.achievements || defaultData.achievements
        };
    }

    /**
     * Setup automatic saving
     */
    setupAutoSave() {
        // Save every 30 seconds during active play
        setInterval(() => {
            this.saveUserProgress();
        }, 30000);

        // Save when page is about to unload
        window.addEventListener('beforeunload', () => {
            this.saveUserProgress();
        });

        // Save when app goes to background (mobile)
        document.addEventListener('pause', () => {
            this.saveUserProgress();
        });
    }

    /**
     * Clear all user progress data and reset to initial state
     */
    clearAllData() {
        console.log('🔄 UserProgressManager: Clearing all data...');
        
        // Reset userData to initial state
        this.userData = {
            maxLevelReached: 1,
            totalGamesPlayed: 0,
            totalMoves: 0,
            totalTimeSpent: 0,
            achievements: [],
            settings: {
                soundEnabled: true,
                vibrationEnabled: true
            },
            stats: {
                fastestCompletionTime: null,
                averageMovesPerLevel: 0,
                perfectLevels: 0,
                adsWatched: 0,
                coinsEarned: 0
            },
            lastPlayedDate: null,
            gameVersion: '1.0.0'
        };
        
        // Clear from localStorage
        const storageKeys = [
            `userProgress_${this.userId}`,
            'ballSortUserProgress',
            'userGameData',
            'gameUserProgress'
        ];
        
        storageKeys.forEach(key => {
            localStorage.removeItem(key);
            console.log(`UserProgressManager: Removed ${key}`);
        });
        
        // Save the reset state
        this.saveUserProgress();
        
        console.log('✅ UserProgressManager: All data cleared and reset to initial state');
    }
}

// Export for use in main game
window.UserProgressManager = UserProgressManager;
