/**
 * Android-Compatible User Progress Management System
 * Supports multiple storage backends for Android applications
 */

class AndroidUserProgressManager {
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
                perfectLevels: 0,
                adsWatched: 0,
                coinsEarned: 0
            },
            lastPlayedDate: null,
            gameVersion: '1.0.0'
        };
        
        // Detect runtime environment
        this.isAndroid = this.detectAndroidEnvironment();
        this.storageBackend = null;
        
        this.initialize();
    }

    /**
     * Detect if running in Android environment
     */
    detectAndroidEnvironment() {
        // Check for Cordova/PhoneGap
        if (typeof window.cordova !== 'undefined') {
            return true;
        }
        
        // Check for Android WebView
        if (typeof window.Android !== 'undefined') {
            return true;
        }
        
        // Check user agent
        if (/Android/i.test(navigator.userAgent)) {
            return true;
        }
        
        return false;
    }

    /**
     * Initialize storage backend based on environment
     */
    async initialize() {
        console.log('Initializing storage for environment:', this.isAndroid ? 'Android' : 'Web');
        
        if (this.isAndroid) {
            await this.initializeAndroidStorage();
        } else {
            this.initializeWebStorage();
        }
        
        // Generate or retrieve user ID
        this.userId = await this.getUserId();
        
        // Load user progress
        await this.loadUserProgress();
        
        console.log('UserProgressManager initialized for user:', this.userId);
    }

    /**
     * Initialize Android-specific storage
     */
    async initializeAndroidStorage() {
        // Try SQLite first (most robust)
        if (typeof window.sqlitePlugin !== 'undefined') {
            this.storageBackend = new SQLiteStorageBackend();
            await this.storageBackend.initialize();
            console.log('Using SQLite storage backend');
            return;
        }
        
        // Fallback to NativeStorage (SharedPreferences)
        if (typeof window.NativeStorage !== 'undefined') {
            this.storageBackend = new NativeStorageBackend();
            console.log('Using NativeStorage backend');
            return;
        }
        
        // Last resort: File storage
        if (typeof window.requestFileSystem !== 'undefined') {
            this.storageBackend = new FileStorageBackend();
            await this.storageBackend.initialize();
            console.log('Using File storage backend');
            return;
        }
        
        // If no Android storage available, fallback to web storage
        console.warn('No Android storage available, falling back to web storage');
        this.initializeWebStorage();
    }

    /**
     * Initialize web storage (localStorage)
     */
    initializeWebStorage() {
        this.storageBackend = new WebStorageBackend();
        console.log('Using Web storage backend');
    }

    /**
     * Get or generate user ID
     */
    async getUserId() {
        try {
            let userId = await this.storageBackend.getItem('ballSortUserId');
            
            if (!userId) {
                userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                await this.storageBackend.setItem('ballSortUserId', userId);
                console.log('Generated new user ID:', userId);
            }
            
            return userId;
        } catch (error) {
            console.error('Error getting user ID:', error);
            // Fallback to memory-based ID
            return 'user_' + Date.now() + '_fallback';
        }
    }

    /**
     * Load user progress from storage
     */
    async loadUserProgress() {
        try {
            const savedData = await this.storageBackend.getItem('ballSortUserProgress');
            
            if (savedData) {
                this.userData = this.mergeUserData(this.userData, savedData);
                console.log('Loaded user progress from storage');
            } else {
                console.log('No saved progress found, using defaults');
            }
            
            return this.userData;
        } catch (error) {
            console.error('Error loading user progress:', error);
            return this.userData;
        }
    }

    /**
     * Save user progress to storage
     */
    async saveUserProgress() {
        this.userData.lastPlayedDate = new Date().toISOString();
        
        try {
            await this.storageBackend.setItem('ballSortUserProgress', this.userData);
            console.log('User progress saved successfully');
        } catch (error) {
            console.error('Error saving user progress:', error);
        }
    }

    /**
     * Save current game state
     */
    async saveGameState(gameState) {
        try {
            await this.storageBackend.setItem('ballSortGameState', gameState);
            console.log('Game state saved successfully');
        } catch (error) {
            console.error('Error saving game state:', error);
        }
    }

    /**
     * Load current game state
     */
    async loadGameState() {
        try {
            const gameState = await this.storageBackend.getItem('ballSortGameState');
            return gameState;
        } catch (error) {
            console.error('Error loading game state:', error);
            return null;
        }
    }

    /**
     * Update max level reached
     */
    updateMaxLevel(level) {
        if (level > this.userData.maxLevelReached) {
            this.userData.maxLevelReached = level;
            this.saveUserProgress();
            console.log(`New max level reached: ${level}`);
        }
    }

    /**
     * Merge user data with saved data
     */
    mergeUserData(defaultData, savedData) {
        return {
            ...defaultData,
            ...savedData,
            settings: { ...defaultData.settings, ...savedData.settings },
            stats: { ...defaultData.stats, ...savedData.stats }
        };
    }

    /**
     * Get user data
     */
    getUserData() {
        return { ...this.userData };
    }
}

/**
 * SQLite Storage Backend for Android
 */
class SQLiteStorageBackend {
    constructor() {
        this.db = null;
    }

    async initialize() {
        return new Promise((resolve, reject) => {
            this.db = window.sqlitePlugin.openDatabase({
                name: 'BallSortGame.db',
                location: 'default'
            });

            this.db.transaction((tx) => {
                tx.executeSql(`
                    CREATE TABLE IF NOT EXISTS app_data (
                        key TEXT PRIMARY KEY,
                        value TEXT,
                        created_at TEXT,
                        updated_at TEXT
                    )
                `, [], () => {
                    console.log('SQLite database initialized');
                    resolve();
                }, reject);
            });
        });
    }

    async setItem(key, value) {
        return new Promise((resolve, reject) => {
            const valueStr = JSON.stringify(value);
            const now = new Date().toISOString();
            
            this.db.transaction((tx) => {
                tx.executeSql(`
                    INSERT OR REPLACE INTO app_data (key, value, created_at, updated_at)
                    VALUES (?, ?, COALESCE((SELECT created_at FROM app_data WHERE key = ?), ?), ?)
                `, [key, valueStr, key, now, now], () => resolve(), reject);
            });
        });
    }

    async getItem(key) {
        return new Promise((resolve, reject) => {
            this.db.transaction((tx) => {
                tx.executeSql('SELECT value FROM app_data WHERE key = ?', [key], (tx, results) => {
                    if (results.rows.length > 0) {
                        try {
                            const value = JSON.parse(results.rows.item(0).value);
                            resolve(value);
                        } catch (error) {
                            reject(error);
                        }
                    } else {
                        resolve(null);
                    }
                }, reject);
            });
        });
    }

    async removeItem(key) {
        return new Promise((resolve, reject) => {
            this.db.transaction((tx) => {
                tx.executeSql('DELETE FROM app_data WHERE key = ?', [key], () => resolve(), reject);
            });
        });
    }
}

/**
 * Native Storage Backend (SharedPreferences on Android)
 */
class NativeStorageBackend {
    async setItem(key, value) {
        return new Promise((resolve, reject) => {
            window.NativeStorage.setItem(key, value, resolve, reject);
        });
    }

    async getItem(key) {
        return new Promise((resolve, reject) => {
            window.NativeStorage.getItem(key, resolve, (error) => {
                if (error.code === 2) { // Item not found
                    resolve(null);
                } else {
                    reject(error);
                }
            });
        });
    }

    async removeItem(key) {
        return new Promise((resolve, reject) => {
            window.NativeStorage.remove(key, resolve, reject);
        });
    }
}

/**
 * File Storage Backend
 */
class FileStorageBackend {
    constructor() {
        this.fileSystem = null;
    }

    async initialize() {
        return new Promise((resolve, reject) => {
            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, (fs) => {
                this.fileSystem = fs;
                resolve();
            }, reject);
        });
    }

    async setItem(key, value) {
        const filename = `${key}.json`;
        return new Promise((resolve, reject) => {
            this.fileSystem.root.getFile(filename, { create: true }, (fileEntry) => {
                fileEntry.createWriter((fileWriter) => {
                    fileWriter.onwriteend = () => resolve();
                    fileWriter.onerror = reject;
                    
                    const blob = new Blob([JSON.stringify(value)], { type: 'application/json' });
                    fileWriter.write(blob);
                });
            }, reject);
        });
    }

    async getItem(key) {
        const filename = `${key}.json`;
        return new Promise((resolve, reject) => {
            this.fileSystem.root.getFile(filename, { create: false }, (fileEntry) => {
                fileEntry.file((file) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        try {
                            const data = JSON.parse(reader.result);
                            resolve(data);
                        } catch (error) {
                            reject(error);
                        }
                    };
                    reader.readAsText(file);
                });
            }, () => resolve(null)); // File doesn't exist
        });
    }

    async removeItem(key) {
        const filename = `${key}.json`;
        return new Promise((resolve, reject) => {
            this.fileSystem.root.getFile(filename, { create: false }, (fileEntry) => {
                fileEntry.remove(resolve, reject);
            }, () => resolve()); // File doesn't exist
        });
    }
}

/**
 * Web Storage Backend (localStorage fallback)
 */
class WebStorageBackend {
    async setItem(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            throw new Error(`Failed to save to localStorage: ${error.message}`);
        }
    }

    async getItem(key) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            throw new Error(`Failed to load from localStorage: ${error.message}`);
        }
    }

    async removeItem(key) {
        localStorage.removeItem(key);
    }
}
