/**
 * Ball Sort Puzzle Game
 * A complete 2D puzzle game where players sort colored balls into tubes
 * Features: Progressive difficulty, smooth animations, sound effects, hint system
 */

class BallSortGame {
    constructor() {
        // Canvas and rendering
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 800;
        this.canvas.height = 600;
        
        // Game state
        this.currentLevel = 1;
        this.maxLevel = 50;
        this.maxLevelReached = 1; // Track highest level reached
        this.moves = 0;
        this.gameState = 'playing'; // 'playing', 'paused', 'completed', 'timeup'
        this.isPaused = false;
        
        // User Progress Manager
        this.progressManager = new UserProgressManager();
        this.levelStartTime = Date.now();
        
        // Timer system
        this.timeLeft = 0; // seconds
        this.timerId = null;
        this.levelTimeLimit = 0; // seconds for current level
        
        // Tubes and balls
        this.tubes = [];
        this.selectedTube = -1;
        this.animatingBall = null;
        this.animationProgress = 0;
        
        // Game configuration
        this.tubeWidth = 60;
        this.tubeHeight = 200;
        this.ballSize = 25;
        this.ballSpacing = 5;
        this.maxBallsPerTube = 6;
        
        // Colors for balls
        this.ballColors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
            '#FECA57', '#FF9FF3', '#54A0FF', '#5F27CD',
            '#00D2D3', '#FF9F43', '#A3CB38', '#6C5CE7',
            '#FDA7DF', '#26DE81', '#FD79A8', '#E17055'
        ];
        
        // Game mechanics
        this.moveHistory = [];
        this.hintsUsed = 0;
        this.shufflesUsed = 0;
        this.maxHints = 3;
        this.maxShuffles = 2;
        
        // Animation and effects
        this.particles = [];
        this.shakeEffects = [];
        
        // Audio
        this.soundEnabled = true;
        this.audioInitialized = false;
        this.createAudioElements();
        
        // AdMob integration
        this.admobInitialized = false;
        this.rewardedAd = null;
        this.bannerAd = null;
        this.bannerAdLoaded = false;
        this.initializeAdMob();

        // User Progress Management
        this.progressManager = null;
        this.initializeProgressManager();

        // Show welcome screen first instead of auto-starting
        this.showWelcomeScreen();
        
        // Initialize game but don't start yet
        this.setupEventListeners();
        this.gameLoop();
    }
    
    /**
     * Show welcome screen with start game button
     */
    showWelcomeScreen() {
        const welcomeScreen = document.getElementById('welcomeScreen');
        const gameContainer = document.getElementById('gameContainer');
        const startGameBtn = document.getElementById('startGameBtn');
        
        if (welcomeScreen && gameContainer && startGameBtn) {
            // Ensure welcome screen is visible
            welcomeScreen.classList.remove('fade-out');
            gameContainer.classList.remove('fade-in');
            
            // Add click handler for start button
            startGameBtn.addEventListener('click', () => {
                this.hideWelcomeScreen();
                this.startGame();
            });
            
            console.log('Welcome screen initialized');
        }
    }
    
    /**
     * Hide welcome screen and show game
     */
    hideWelcomeScreen() {
        const welcomeScreen = document.getElementById('welcomeScreen');
        const gameContainer = document.getElementById('gameContainer');
        
        if (welcomeScreen && gameContainer) {
            // Show game container first
            gameContainer.style.display = 'block';
            
            // Fade out welcome screen
            welcomeScreen.classList.add('fade-out');
            
            // Fade in game container after a delay
            setTimeout(() => {
                gameContainer.classList.add('fade-in');
                
                // Hide welcome screen completely after transition
                setTimeout(() => {
                    welcomeScreen.style.display = 'none';
                }, 800);
            }, 300);
            
            console.log('Welcome screen hidden, game started');
        }
    }
    
    /**
     * Start the actual game after welcome screen
     */
    startGame() {
        // Load game state or initialize new game
        this.loadGameState();
        
        // If no saved game, initialize with level 1
        if (this.tubes.length === 0) {
            this.initializeGame();
        }
        
        console.log('Game started successfully');
    }
    
    /**
     * Initialize the game with level 1
     */
    initializeGame() {
        this.generateLevel(this.currentLevel);
        this.updateUI();
        this.saveGameState();
    }
    
    /**
     * Initialize User Progress Management
     */
    async initializeProgressManager() {
        if (typeof UserProgressManager !== 'undefined') {
            this.progressManager = new UserProgressManager();
            await this.progressManager.initialize();
            
            // Load user's max level reached
            const userData = this.progressManager.getUserData();
            if (userData.maxLevelReached > this.currentLevel) {
                this.currentLevel = userData.maxLevelReached;
                console.log(`Restored user to max level: ${this.currentLevel}`);
            }
        } else {
            console.warn('UserProgressManager not available');
        }
    }

    /**
     * Initialize Google AdMob
     */
    initializeAdMob() {
        // Check if AdMob is available (for mobile apps)
        if (typeof window.AdMob !== 'undefined') {
            this.admobInitialized = true;
            this.setupAdMobOptions();
            this.loadBannerAd();
            this.loadRewardedAd();
        } else {
            console.log('AdMob not available - running in web browser');
            // For web testing, we'll simulate ad behavior
            this.admobInitialized = false;
            this.simulateBannerAd();
        }
    }

    /**
     * Setup AdMob options and configuration
     */
    setupAdMobOptions() {
        if (!this.admobInitialized) return;
        
        window.AdMob.setOptions({
            publisherId: "ca-app-pub-YOUR_ACTUAL_PUBLISHER_ID", // Replace with your ID
            bannerAdId: "ca-app-pub-3940256099942544/6300978111", // Test banner ID
            interstitialAdId: "ca-app-pub-3940256099942544/1033173712", // Test interstitial ID
            rewardVideoId: "ca-app-pub-3940256099942544/5224354917", // Test rewarded ID
            isTesting: true, // Set to false for production
            autoShowBanner: false,
            autoShowInterstitial: false,
            autoShowRewarded: false,
            bannerAtTop: false, // Show banner at bottom
            overlap: false, // Don't overlap content
            offsetTopBar: false
        });
    }

    /**
     * Load and show banner ad
     */
    loadBannerAd() {
        if (!this.admobInitialized) return;
        
        try {
            window.AdMob.createBanner({
                adId: 'ca-app-pub-3940256099942544/6300978111', // Test banner ID
                position: window.AdMob.AD_POSITION.BOTTOM_CENTER,
                autoShow: true
            }, () => {
                console.log('Banner ad loaded successfully');
                this.bannerAdLoaded = true;
                this.hideBannerPlaceholder();
            }, (error) => {
                console.error('Failed to load banner ad:', error);
                this.showBannerPlaceholder();
            });
        } catch (error) {
            console.error('Banner ad error:', error);
            this.showBannerPlaceholder();
        }
    }

    /**
     * Hide banner ad
     */
    hideBannerAd() {
        if (this.admobInitialized && this.bannerAdLoaded) {
            try {
                window.AdMob.hideBanner();
                console.log('Banner ad hidden');
            } catch (error) {
                console.error('Error hiding banner:', error);
            }
        }
    }

    /**
     * Show banner ad
     */
    showBannerAd() {
        if (this.admobInitialized && this.bannerAdLoaded) {
            try {
                window.AdMob.showBanner();
                console.log('Banner ad shown');
            } catch (error) {
                console.error('Error showing banner:', error);
            }
        }
    }

    /**
     * Remove banner ad completely
     */
    removeBannerAd() {
        if (this.admobInitialized) {
            try {
                window.AdMob.removeBanner();
                this.bannerAdLoaded = false;
                console.log('Banner ad removed');
            } catch (error) {
                console.error('Error removing banner:', error);
            }
        }
    }

    /**
     * Simulate banner ad for web testing
     */
    simulateBannerAd() {
        const placeholder = document.getElementById('bannerAdPlaceholder');
        if (placeholder) {
            // Simulate different ad types
            const adTypes = [
                { text: '🎮 New Mobile Games - Download Now!', color: 'from-blue-500 to-purple-600' },
                { text: '🏆 Best Puzzle Games 2025 - Play Free!', color: 'from-green-500 to-blue-600' },
                { text: '🎯 Challenge Your Brain - More Puzzles!', color: 'from-purple-500 to-pink-600' },
                { text: '⭐ Rate this game 5 stars!', color: 'from-yellow-500 to-orange-600' }
            ];
            
            let currentAdIndex = 0;
            
            const updateAd = () => {
                const ad = adTypes[currentAdIndex];
                placeholder.textContent = ad.text;
                placeholder.className = `bg-gradient-to-r ${ad.color} text-white text-center py-3 px-6 text-sm cursor-pointer transition-all duration-300 hover:scale-105`;
                currentAdIndex = (currentAdIndex + 1) % adTypes.length;
            };
            
            // Initial ad
            updateAd();
            
            // Rotate ads every 30 seconds
            setInterval(updateAd, 30000);
            
            // Add click handler for demo
            placeholder.addEventListener('click', () => {
                this.showAdClickedNotification();
            });
        }
    }

    /**
     * Show/hide banner placeholder
     */
    showBannerPlaceholder() {
        const container = document.getElementById('bannerAdContainer');
        if (container) {
            container.style.display = 'flex';
        }
    }

    hideBannerPlaceholder() {
        const placeholder = document.getElementById('bannerAdPlaceholder');
        if (placeholder) {
            placeholder.style.display = 'none';
        }
    }

    /**
     * Show ad clicked notification (for demo)
     */
    showAdClickedNotification() {
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 left-4 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform -translate-x-full transition-transform duration-300';
        notification.innerHTML = `
            <div class="flex items-center">
                <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span class="font-bold">Ad clicked! (Demo)</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.classList.remove('-translate-x-full');
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.add('-translate-x-full');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    /**
     * Load rewarded ad
     */
    loadRewardedAd() {
        if (!this.admobInitialized) return;
        
        try {
            // Use the rewarded video ad unit ID from options
            window.AdMob.prepareRewardVideoAd({
                adId: 'ca-app-pub-3940256099942544/5224354917', // Test rewarded ID
                autoShow: false
            }, () => {
                console.log('Rewarded ad loaded successfully');
                this.rewardedAd = true;
            }, (error) => {
                console.error('Failed to load rewarded ad:', error);
                this.rewardedAd = false;
            });
        } catch (error) {
            console.error('AdMob rewarded ad error:', error);
        }
    }

    /**
     * Show rewarded ad
     */
    showRewardedAd() {
        if (!this.admobInitialized || !this.rewardedAd) {
            // Fallback for web browser or when ad is not available
            this.simulateRewardedAd();
            return;
        }

        try {
            window.AdMob.showRewardVideoAd(
                () => {
                    console.log('Rewarded ad shown successfully');
                },
                () => {
                    // User watched the ad and earned reward
                    console.log('User earned reward');
                    this.onAdRewardEarned();
                    this.loadRewardedAd(); // Load next ad
                },
                (error) => {
                    console.error('Failed to show rewarded ad:', error);
                    this.onAdFailed();
                }
            );
        } catch (error) {
            console.error('AdMob show error:', error);
            this.onAdFailed();
        }
    }

    /**
     * Simulate rewarded ad for web testing
     */
    simulateRewardedAd() {
        // Show a mock ad interface
        const adOverlay = document.createElement('div');
        adOverlay.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50';
        adOverlay.innerHTML = `
            <div class="bg-white p-8 rounded-lg text-center max-w-sm mx-4">
                <h3 class="text-xl font-bold mb-4">Watch Ad for Extra Time</h3>
                <p class="mb-6 text-gray-600">Watch a 30-second ad to get +30 seconds</p>
                <div class="mb-4">
                    <div class="w-full bg-gray-200 rounded-full h-2">
                        <div class="bg-blue-600 h-2 rounded-full ad-progress" style="width: 0%"></div>
                    </div>
                    <p class="text-sm text-gray-500 mt-2">Ad simulation: <span id="adTimer">30</span>s</p>
                </div>
                <button id="skipAd" class="bg-gray-300 text-gray-700 px-4 py-2 rounded mr-2" disabled>
                    Skip (15s)
                </button>
                <button id="closeAd" class="bg-red-500 text-white px-4 py-2 rounded" onclick="this.closest('.fixed').remove()">
                    Close
                </button>
            </div>
        `;
        
        document.body.appendChild(adOverlay);
        
        // Simulate ad timer
        let timeLeft = 30;
        const timer = setInterval(() => {
            timeLeft--;
            const timerEl = document.getElementById('adTimer');
            const progressEl = document.querySelector('.ad-progress');
            const skipBtn = document.getElementById('skipAd');
            
            if (timerEl) timerEl.textContent = timeLeft;
            if (progressEl) progressEl.style.width = ((30 - timeLeft) / 30 * 100) + '%';
            
            if (timeLeft <= 15 && skipBtn) {
                skipBtn.disabled = false;
                skipBtn.textContent = 'Skip';
                skipBtn.onclick = () => {
                    clearInterval(timer);
                    adOverlay.remove();
                    this.onAdRewardEarned();
                };
            }
            
            if (timeLeft <= 0) {
                clearInterval(timer);
                adOverlay.remove();
                this.onAdRewardEarned();
            }
        }, 1000);
    }

    /**
     * Handle successful ad reward
     */
    onAdRewardEarned() {
        // Give player 30 extra seconds
        this.timeLeft += 30;
        this.updateTimerDisplay();
        
        // Hide time up modal and resume game
        document.getElementById('timeUpModal').classList.add('hidden');
        this.gameState = 'playing';
        this.isPaused = false;
        
        // Restart timer
        this.startTimer();
        
        // Show reward notification
        this.showRewardNotification();
        
        console.log('Player earned 30 extra seconds!');
    }

    /**
     * Handle ad failure
     */
    onAdFailed() {
        alert('Ad not available. Try again later.');
    }

    /**
     * Show reward notification
     */
    showRewardNotification() {
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300';
        notification.innerHTML = `
            <div class="flex items-center">
                <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span class="font-bold">+30 seconds added!</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    /**
     * Calculate time limit based on level difficulty
     */
    calculateTimeLimit(level) {
        // Set timer to 1 minute (60 seconds) for all levels
        return 60;
    }
    
    /**
     * Start the timer for current level
     */
    startTimer() {
        this.stopTimer(); // Clear any existing timer
        
        this.levelTimeLimit = this.calculateTimeLimit(this.currentLevel);
        this.timeLeft = this.levelTimeLimit;
        
        console.log(`Level ${this.currentLevel} timer started: ${this.timeLeft} seconds`);
        console.log(`Game state: ${this.gameState}, isPaused: ${this.isPaused}`);
        
        // Update display immediately
        this.updateTimerDisplay();
        
        this.timerId = setInterval(() => {
            console.log(`Timer check - gameState: ${this.gameState}, isPaused: ${this.isPaused}, timeLeft: ${this.timeLeft}`);
            
            if (!this.isPaused && (this.gameState === 'playing' || this.gameState === undefined)) {
                this.timeLeft--;
                console.log(`Timer tick: ${this.timeLeft} seconds left`);
                this.updateTimerDisplay();
                
                // Warning at 30 seconds
                if (this.timeLeft === 30) {
                    this.showTimeWarning();
                }
                
                // Time up
                if (this.timeLeft <= 0) {
                    this.timeUp();
                }
            } else {
                console.log('Timer paused or game not playing');
            }
        }, 1000);
    }
    
    /**
     * Stop the timer
     */
    stopTimer() {
        if (this.timerId) {
            clearInterval(this.timerId);
            this.timerId = null;
        }
    }
    
    /**
     * Pause the timer
     */
    pauseTimer() {
        // Timer automatically pauses when isPaused is true
    }
    
    /**
     * Resume the timer
     */
    resumeTimer() {
        // Timer automatically resumes when isPaused is false
    }
    
    /**
     * Handle time up event
     */
    timeUp() {
        this.stopTimer();
        this.gameState = 'timeup';
        this.playSound('error');
        
        // Show rewarded ad immediately when time is up
        setTimeout(() => {
            this.showRewardedAd();
        }, 500);
        
        // Also show time up modal as fallback
        setTimeout(() => {
            document.getElementById('timeUpModal').classList.remove('hidden');
            document.getElementById('timeUpModal').classList.add('modal-enter');
        }, 1000);
    }
    
    /**
     * Show time warning
     */
    showTimeWarning() {
        const timerDisplay = document.getElementById('timerDisplay');
        if (timerDisplay) {
            timerDisplay.classList.add('pulse-animation');
            timerDisplay.style.backgroundColor = 'rgba(239, 68, 68, 0.3)'; // Red warning
            
            setTimeout(() => {
                timerDisplay.classList.remove('pulse-animation');
                timerDisplay.style.backgroundColor = '';
            }, 3000);
        }
        
        // Play warning sound
        this.playSound('error');
    }
    
    /**
     * Update timer display
     */
    updateTimerDisplay() {
        const timeLeftElement = document.getElementById('timeLeft');
        const timerDisplay = document.getElementById('timerDisplay');
        
        console.log(`Updating timer display: ${this.timeLeft} seconds`);
        
        if (timeLeftElement && timerDisplay) {
            const minutes = Math.floor(this.timeLeft / 60);
            const seconds = this.timeLeft % 60;
            const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            timeLeftElement.textContent = timeString;
            
            console.log(`Timer display updated to: ${timeString}`);
            
            // Color coding based on time left
            if (this.timeLeft <= 30) {
                timerDisplay.style.backgroundColor = 'rgba(239, 68, 68, 0.3)'; // Red
                timerDisplay.style.color = '#FEE2E2';
            } else if (this.timeLeft <= 60) {
                timerDisplay.style.backgroundColor = 'rgba(245, 158, 11, 0.3)'; // Orange
                timerDisplay.style.color = '#FEF3C7';
            } else {
                timerDisplay.style.backgroundColor = '';
                timerDisplay.style.color = '';
            }
        } else {
            console.error('Timer elements not found:', { timeLeftElement, timerDisplay });
        }
    }
    
    /**
     * Generate a level based on difficulty progression
     */
    generateLevel(level) {
        console.log(`Generating level ${level}`);
        
        this.tubes = [];
        this.selectedTube = -1;
        this.moves = 0;
        this.moveHistory = [];
        this.animatingBall = null;
        this.hintsUsed = 0;
        this.shufflesUsed = 0;
        this.gameState = 'playing';
        this.isPaused = false; // Ensure timer can run
        
        // Track level start time for progress manager
        this.levelStartTime = Date.now();
        
        console.log(`Game state set to: ${this.gameState}, isPaused: ${this.isPaused}`);
        
        // Progressive difficulty
        let config = this.getLevelConfig(level);
        
        // Create tubes
        for (let i = 0; i < config.totalTubes; i++) {
            this.tubes.push([]);
        }
        
        // Create a mixed puzzle instead of starting from solved state
        this.createMixedPuzzle(config);
        
        // Start the timer for this level
        console.log('Starting timer...');
        this.startTimer();
        
        // Save the new level state
        this.saveGameState();
    }
    
    /**
     * Get level configuration based on difficulty progression
     */
    getLevelConfig(level) {
        if (level <= 5) {
            // Beginner levels
            return {
                colors: Math.min(2 + Math.floor(level / 2), 4),
                ballsPerColor: 4,
                totalTubes: 5,
                filledTubes: 4,
                emptyTubes: 1
            };
        } else if (level <= 15) {
            // Intermediate levels
            return {
                colors: Math.min(3 + Math.floor(level / 3), 6),
                ballsPerColor: 4,
                totalTubes: 6 + Math.floor(level / 5),
                filledTubes: 5 + Math.floor(level / 5),
                emptyTubes: 1 + Math.floor(level / 10)
            };
        } else {
            // Advanced levels
            return {
                colors: Math.min(4 + Math.floor(level / 4), 8),
                ballsPerColor: 4,
                totalTubes: 7 + Math.floor(level / 3),
                filledTubes: 6 + Math.floor(level / 3),
                emptyTubes: 1 + Math.floor(level / 8)
            };
        }
    }
    
    /**
     * Create a mixed puzzle that's definitely not solved
     */
    createMixedPuzzle(config) {
        // Create all balls
        let allBalls = [];
        for (let color = 0; color < config.colors; color++) {
            for (let i = 0; i < config.ballsPerColor; i++) {
                allBalls.push(color);
            }
        }
        
        // Shuffle all balls thoroughly
        this.shuffleArray(allBalls);
        this.shuffleArray(allBalls); // Shuffle twice for better mixing
        
        // Distribute balls ensuring no tube is complete
        let filledTubes = config.totalTubes - 1; // Leave at least one empty tube
        let ballsPerFilledTube = Math.floor(allBalls.length / filledTubes);
        let extraBalls = allBalls.length % filledTubes;
        
        let ballIndex = 0;
        for (let tubeIndex = 0; tubeIndex < filledTubes; tubeIndex++) {
            let ballsForThisTube = ballsPerFilledTube + (tubeIndex < extraBalls ? 1 : 0);
            
            for (let i = 0; i < ballsForThisTube && ballIndex < allBalls.length; i++) {
                this.tubes[tubeIndex].push(allBalls[ballIndex]);
                ballIndex++;
            }
            
            // Ensure this tube is NOT solved by checking if all balls are same color
            if (this.tubes[tubeIndex].length === config.ballsPerColor) {
                let firstColor = this.tubes[tubeIndex][0];
                if (this.tubes[tubeIndex].every(ball => ball === firstColor)) {
                    // This tube is solved, mix it up
                    let nextTube = (tubeIndex + 1) % config.totalTubes;
                    if (this.tubes[nextTube].length < this.maxBallsPerTube) {
                        // Move one ball to next tube
                        let ballToMove = this.tubes[tubeIndex].pop();
                        this.tubes[nextTube].push(ballToMove);
                    }
                }
            }
        }
        
        // Double-check no tube is complete
        for (let i = 0; i < this.tubes.length; i++) {
            if (this.tubes[i].length === config.ballsPerColor) {
                let firstColor = this.tubes[i][0];
                if (this.tubes[i].every(ball => ball === firstColor)) {
                    // Found a complete tube, scramble it
                    let tubeToScramble = this.tubes[i].slice();
                    this.tubes[i] = [];
                    
                    // Redistribute these balls
                    for (let ball of tubeToScramble) {
                        let targetTube = Math.floor(Math.random() * (this.tubes.length - 1));
                        if (this.tubes[targetTube].length < this.maxBallsPerTube) {
                            this.tubes[targetTube].push(ball);
                        } else {
                            // Find any tube with space
                            for (let j = 0; j < this.tubes.length; j++) {
                                if (this.tubes[j].length < this.maxBallsPerTube) {
                                    this.tubes[j].push(ball);
                                    break;
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    
    /**
     * Setup event listeners for game controls
     */
    setupEventListeners() {
        // Canvas click events
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        
        // UI button events
        document.getElementById('undoBtn').addEventListener('click', () => this.undoMove());
        document.getElementById('hintBtn').addEventListener('click', () => this.showHint());
        document.getElementById('shuffleBtn').addEventListener('click', () => this.shuffleBalls());
        document.getElementById('restartBtn').addEventListener('click', () => this.restartLevel());
        document.getElementById('pauseBtn').addEventListener('click', () => this.pauseGame());
        document.getElementById('soundToggle').addEventListener('click', () => this.toggleSound());
        document.getElementById('testSoundBtn').addEventListener('click', () => {
            console.log('Test sound button clicked');
            this.playSound('pop');
        });
        
        // Modal events
        document.getElementById('nextLevelBtn').addEventListener('click', () => this.nextLevel());
        document.getElementById('replayBtn').addEventListener('click', () => this.restartLevel());
        document.getElementById('resumeBtn').addEventListener('click', () => this.resumeGame());
        document.getElementById('mainMenuBtn').addEventListener('click', () => this.goToMainMenu());
        document.getElementById('retryLevelBtn').addEventListener('click', () => this.restartLevel());
        document.getElementById('watchAdBtn').addEventListener('click', () => this.showRewardedAd());
        
        // Keyboard events
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // Window events
        window.addEventListener('beforeunload', () => this.saveGameState());
        window.addEventListener('load', () => this.loadGameState());
    }
    
    /**
     * Handle canvas click events for tube selection and ball movement
     */
    handleCanvasClick(e) {
        if (this.isPaused || this.animatingBall) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const tubeIndex = this.getTubeAtPosition(x, y);
        
        if (tubeIndex !== -1) {
            if (this.selectedTube === -1) {
                // Select tube if it has balls
                if (this.tubes[tubeIndex].length > 0) {
                    this.selectedTube = tubeIndex;
                    this.playSound('select');
                }
            } else {
                // Try to move ball
                if (tubeIndex === this.selectedTube) {
                    // Deselect same tube
                    this.selectedTube = -1;
                } else {
                    // Attempt move
                    if (this.isValidMove(this.selectedTube, tubeIndex)) {
                        this.moveBall(this.selectedTube, tubeIndex);
                        this.selectedTube = -1;
                    } else {
                        // Invalid move - shake animation and error sound
                        this.addShakeEffect(tubeIndex);
                        this.playSound('error');
                        this.selectedTube = -1;
                    }
                }
            }
        } else {
            // Click outside tubes - deselect
            this.selectedTube = -1;
        }
    }
    
    /**
     * Handle mouse movement for hover effects
     */
    handleMouseMove(e) {
        if (this.isPaused) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const tubeIndex = this.getTubeAtPosition(x, y);
        this.canvas.style.cursor = tubeIndex !== -1 ? 'pointer' : 'default';
    }
    
    /**
     * Get tube index at given position
     */
    getTubeAtPosition(x, y) {
        const startX = (this.canvas.width - (this.tubes.length * (this.tubeWidth + 20) - 20)) / 2;
        const tubeY = this.canvas.height - this.tubeHeight - 50;
        
        for (let i = 0; i < this.tubes.length; i++) {
            const tubeX = startX + i * (this.tubeWidth + 20);
            
            if (x >= tubeX && x <= tubeX + this.tubeWidth &&
                y >= tubeY && y <= tubeY + this.tubeHeight) {
                return i;
            }
        }
        return -1;
    }
    
    /**
     * Check if a move from one tube to another is valid
     */
    isValidMove(fromTube, toTube) {
        if (fromTube === toTube) return false;
        if (this.tubes[fromTube].length === 0) return false;
        if (this.tubes[toTube].length >= this.maxBallsPerTube) return false;
        
        const fromBall = this.tubes[fromTube][this.tubes[fromTube].length - 1];
        
        if (this.tubes[toTube].length === 0) return true;
        
        const toBall = this.tubes[toTube][this.tubes[toTube].length - 1];
        return fromBall === toBall;
    }
    
    /**
     * Move a ball from one tube to another with animation
     */
    moveBall(fromTube, toTube, recordMove = true) {
        if (!this.isValidMove(fromTube, toTube)) return false;
        
        const ball = this.tubes[fromTube].pop();
        
        // Record move for undo
        if (recordMove) {
            this.moveHistory.push({ from: fromTube, to: toTube, ball: ball });
            this.moves++;
        }
        
        // Start animation
        this.animatingBall = {
            ball: ball,
            fromTube: fromTube,
            toTube: toTube,
            progress: 0
        };
        
        this.playSound('transfer');
        this.updateUI();
        
        // Save game state after each move
        this.saveGameState();
        
        return true;
    }
    
    /**
     * Complete ball animation and check for level completion
     */
    completeBallAnimation() {
        if (!this.animatingBall) return;
        
        console.log("Completing ball animation...");
        
        this.tubes[this.animatingBall.toTube].push(this.animatingBall.ball);
        this.animatingBall = null;
        
        // Check for level completion
        console.log("Checking if level is complete...");
        if (this.isLevelComplete()) {
            console.log("Level complete detected! Calling completeLevel()");
            this.completeLevel();
        } else {
            console.log("Level not complete yet");
        }
    }
    
    /**
     * Check if current level is complete
     */
    isLevelComplete() {
        // Get level config to know how many balls per color we should have
        let config = this.getLevelConfig(this.currentLevel);
        let colorCounts = new Array(config.colors).fill(0);
        
        console.log(`Checking level completion for level ${this.currentLevel}, expecting ${config.colors} colors with ${config.ballsPerColor} balls each`);
        
        // Count balls of each color and check tube validity
        for (let tube of this.tubes) {
            if (tube.length === 0) continue;
            
            // Check if all balls in tube are same color
            const firstBall = tube[0];
            for (let ball of tube) {
                if (ball !== firstBall) {
                    console.log(`Mixed colors in tube: ${JSON.stringify(tube)}`);
                    return false;
                }
            }
            
            // Count this color
            colorCounts[firstBall] += tube.length;
        }
        
        console.log(`Color counts: ${JSON.stringify(colorCounts)}`);
        
        // Check if each color has the correct number of balls (ballsPerColor)
        for (let count of colorCounts) {
            if (count !== 0 && count !== config.ballsPerColor) {
                console.log(`Incorrect color count: ${count}, expected: ${config.ballsPerColor}`);
                return false;
            }
        }
        
        // Must have at least some completed tubes (not all empty)
        let completedTubes = 0;
        for (let tube of this.tubes) {
            if (tube.length === config.ballsPerColor) {
                completedTubes++;
            }
        }
        
        console.log(`Completed tubes: ${completedTubes}, expected: ${config.colors}`);
        const isComplete = completedTubes === config.colors;
        
        if (isComplete) {
            console.log("LEVEL IS COMPLETE!");
        }
        
        return isComplete;
    }
    
    /**
     * Handle level completion
     */
    completeLevel() {
        console.log("🎉 COMPLETE LEVEL CALLED! 🎉");
        this.stopTimer(); // Stop the timer
        this.gameState = 'completed';
        this.playSound('victory');
        // Play congratulations sound after a short delay
        setTimeout(() => {
            this.playSound('congratulations');
        }, 800);
        this.createVictoryEffect();
        
        // Calculate completion stats
        const timeSpent = this.levelTimeLimit - this.timeLeft;
        const levelEndTime = Date.now();
        const totalTimeSpent = Math.floor((levelEndTime - this.levelStartTime) / 1000);
        
        console.log(`Level ${this.currentLevel} completed in ${this.moves} moves, ${totalTimeSpent}s`);
        
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
        }
        
        // Update final moves display
        document.getElementById('finalMoves').textContent = this.moves;
        
        console.log("About to show victory modal...");
        
        // Show victory modal
        setTimeout(() => {
            console.log("Showing victory modal now!");
            document.getElementById('victoryModal').classList.remove('hidden');
            document.getElementById('victoryModal').classList.add('modal-enter');
        }, 1000);
        
        this.saveGameState();
    }
    
    /**
     * Calculate optimal number of moves for a level
     */
    calculateOptimalMoves(level) {
        const config = this.getLevelConfig(level);
        // Rough estimate: each ball needs to move at least once
        // More complex levels need more moves due to blocking
        return Math.floor(config.colors * config.ballsPerColor * 1.5);
    }

    /**
     * Show achievement notifications
     */
    showAchievementNotifications(achievements) {
        achievements.forEach((achievement, index) => {
            setTimeout(() => {
                this.showAchievementNotification(achievement);
            }, index * 2000); // Stagger notifications
        });
    }

    /**
     * Show single achievement notification
     */
    showAchievementNotification(achievement) {
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-yellow-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-500 max-w-sm';
        notification.innerHTML = `
            <div class="flex items-center">
                <div class="text-2xl mr-3">🏆</div>
                <div>
                    <div class="font-bold text-lg">Achievement Unlocked!</div>
                    <div class="font-semibold">${achievement.name}</div>
                    <div class="text-sm opacity-90">${achievement.description}</div>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);
        
        // Remove after 5 seconds
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => notification.remove(), 500);
        }, 5000);
        
        // Play achievement sound
        this.playSound('victory');
    }

    /**
     * Show perfect level notification
     */
    showPerfectLevelNotification() {
        const notification = document.createElement('div');
        notification.className = 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-6 rounded-xl shadow-2xl z-50 text-center';
        notification.innerHTML = `
            <div class="text-4xl mb-2">⭐</div>
            <div class="text-xl font-bold mb-1">PERFECT!</div>
            <div class="text-sm">Completed with optimal moves!</div>
        `;
        
        document.body.appendChild(notification);
        
        // Animate and remove
        setTimeout(() => {
            notification.style.transform = 'translate(-50%, -50%) scale(1.1)';
        }, 100);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translate(-50%, -50%) scale(0.8)';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }

    /**
     * Update the ad reward method to track stats
     */
    onAdRewardEarned() {
        // Give player 30 extra seconds
        this.timeLeft += 30;
        this.updateTimerDisplay();
        
        // Track ad watched
        if (this.progressManager) {
            this.progressManager.recordAdWatched();
        }
        
        // Hide time up modal and resume game
        document.getElementById('timeUpModal').classList.add('hidden');
        this.gameState = 'playing';
        this.isPaused = false;
        
        // Restart timer
        this.startTimer();
        
        // Show reward notification
        this.showRewardNotification();
        
        console.log('Player earned 30 extra seconds!');
    }

    /**
     * Create victory particle effect
     */
    createVictoryEffect() {
        for (let i = 0; i < 50; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 60,
                color: this.ballColors[Math.floor(Math.random() * this.ballColors.length)]
            });
        }
    }
    
    /**
     * Undo the last move
     */
    undoMove() {
        if (this.moveHistory.length === 0 || this.animatingBall) return;
        
        const lastMove = this.moveHistory.pop();
        const ball = this.tubes[lastMove.to].pop();
        this.tubes[lastMove.from].push(ball);
        
        this.moves = Math.max(0, this.moves - 1);
        this.updateUI();
        this.playSound('pop');
    }
    
    /**
     * Show hint by highlighting a valid move
     */
    showHint() {
        if (this.hintsUsed >= this.maxHints || this.animatingBall) return;
        
        // Find a valid move
        for (let from = 0; from < this.tubes.length; from++) {
            for (let to = 0; to < this.tubes.length; to++) {
                if (this.isValidMove(from, to)) {
                    // Highlight the hint
                    this.selectedTube = from;
                    this.hintsUsed++;
                    this.updateUI();
                    
                    setTimeout(() => {
                        this.selectedTube = -1;
                    }, 2000);
                    
                    return;
                }
            }
        }
    }
    
    /**
     * Shuffle balls in tubes (limited use)
     */
    shuffleBalls() {
        if (this.shufflesUsed >= this.maxShuffles || this.animatingBall) return;
        
        // Collect all balls
        let allBalls = [];
        for (let tube of this.tubes) {
            allBalls.push(...tube);
            tube.length = 0;
        }
        
        // Shuffle and redistribute
        this.shuffleArray(allBalls);
        
        let tubeIndex = 0;
        for (let ball of allBalls) {
            if (this.tubes[tubeIndex].length >= this.maxBallsPerTube) {
                tubeIndex = (tubeIndex + 1) % (this.tubes.length - 1); // Keep some tubes empty
            }
            this.tubes[tubeIndex].push(ball);
        }
        
        this.shufflesUsed++;
        this.updateUI();
    }
    
    /**
     * Restart current level
     */
    restartLevel() {
        this.generateLevel(this.currentLevel);
        this.updateUI();
        this.hideModals();
    }
    
    /**
     * Go to next level
     */
    nextLevel() {
        if (this.currentLevel < this.maxLevel) {
            this.currentLevel++;
            this.maxLevelReached = Math.max(this.currentLevel, this.maxLevelReached);
            this.generateLevel(this.currentLevel);
            this.updateUI();
            this.saveGameState(); // Save progress when advancing levels
        }
        this.hideModals();
    }
    
    /**
     * Pause/resume game
     */
    pauseGame() {
        this.isPaused = true;
        this.saveGameState(); // Save when pausing
        this.showBannerAd(); // Show banner during pause
        document.getElementById('pauseModal').classList.remove('hidden');
    }

    resumeGame() {
        this.isPaused = false;
        this.hideModals();
        // Keep banner visible during gameplay for continuous revenue
    }    /**
     * Go to main menu (restart from level 1)
     */
    goToMainMenu() {
        this.currentLevel = 1;
        this.generateLevel(this.currentLevel);
        this.updateUI();
        this.hideModals();
    }
    
    /**
     * Hide all modals
     */
    hideModals() {
        document.getElementById('victoryModal').classList.add('hidden');
        document.getElementById('pauseModal').classList.add('hidden');
        document.getElementById('timeUpModal').classList.add('hidden');
        
        // Clean up any dynamically added time bonus elements
        const finalMovesElement = document.getElementById('finalMoves').parentElement;
        const timeBonusElements = finalMovesElement.querySelectorAll('p:not(:first-child)');
        timeBonusElements.forEach(element => element.remove());
        
        this.gameState = 'playing';
        this.isPaused = false;
    }
    
    /**
     * Handle keyboard input
     */
    handleKeyPress(e) {
        if (this.isPaused) return;
        
        switch (e.key) {
            case 'Escape':
                this.pauseGame();
                break;
            case 'r':
            case 'R':
                this.restartLevel();
                break;
            case 'u':
            case 'U':
                this.undoMove();
                break;
            case 'h':
            case 'H':
                this.showHint();
                break;
        }
    }
    
    /**
     * Add shake effect to tube
     */
    addShakeEffect(tubeIndex) {
        this.shakeEffects.push({
            tube: tubeIndex,
            intensity: 10,
            duration: 30
        });
    }
    
    /**
     * Toggle sound on/off
     */
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        console.log('Sound toggled:', this.soundEnabled ? 'ON' : 'OFF');
        this.updateSoundButton();
        
        // Play a test sound if enabling
        if (this.soundEnabled) {
            setTimeout(() => this.playSound('pop'), 200);
        }
    }
    
    /**
     * Update sound button appearance
     */
    updateSoundButton() {
        const soundButton = document.getElementById('soundToggle');
        if (soundButton) {
            soundButton.textContent = this.soundEnabled ? '🔊' : '🔇';
            soundButton.title = this.soundEnabled ? 'Sound On (Click to mute)' : 'Sound Off (Click to unmute)';
        }
    }
    
    /**
     * Create HTML5 audio elements with base64 encoded sounds
     */
    createAudioElements() {
        try {
            // Create tube selection sound (pleasant chime)
            this.selectAudio = new Audio();
            this.selectAudio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBT2Y1/LBeSsFJ3nJ8N2QPwkUX7br66hVFAlFnt/yv2IcBTyX1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFApGn+DyvmEcBT2Y1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFAlFnt/yv2IcBTyX1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFApGn+DyvmEcBT2Y1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFAlFnt/yv2IcBTyX1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFApGn+DyvmEcBT2Y1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFAlFnt/yv2IcBTyX1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFApGn+DyvmEcBT2Y1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFAlFnt/yv2IcBTyX1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFApGn+DyvmEcBT2Y1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFAlFnt/yv2IcBTyX1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFApGn+DyvmEcBT2Y1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFAlFnt/yv2IcBTyX1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFApGn+DyvmEcBT2Y1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFAlFnt/yv2IcBTyX1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFApGn+DyvmEcBT2Y1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFAlFnt/yv2IcBTyX1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFApGn+DyvmEcBT2Y1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFAlFnt/yv2IcBTyX1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFApGn+DyvmEcBT2Y1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFAlFnt/yv2IcBTyX1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFApGn+DyvmEcBT2Y1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFApGn+DyvmEcBT2Y1/LBeSsFJ3nJ8N2Q==';
            this.selectAudio.volume = 0.2;
            
            // Create ball transfer sound (soft pop/whoosh)
            this.transferAudio = new Audio();
            this.transferAudio.src = 'data:audio/wav;base64,UklGRpYFAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YXIFAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBT2Y1/LBeSsFJ3nJ8N2QPwkUX7br66hVFAlFnt/yv2IcBTyX1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFApGn+DyvmEcBT2Y1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFAlFnt/yv2IcBTyX1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFApGn+DyvmEcBT2Y1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFAlFnt/yv2IcBTyX1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFApGn+DyvmEcBT2Y1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFAlFnt/yv2IcBTyX1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFApGn+DyvmEcBT2Y1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFAlFnt/yv2IcBTyX1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFApGn+DyvmEcBT2Y1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFAlFnt/yv2IcBTyX1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFApGn+DyvmEcBT2Y1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFAlFnt/yv2IcBTyX1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFApGn+DyvmEcBT2Y1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFAlFnt/yv2IcBTyX1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFApGn+DyvmEcBT2Y1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFAlFnt/yv2IcBTyX1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFApGn+DyvmEcBT2Y1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFAlFnt/yv2IcBTyX1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFApGn+DyvmEcBT2Y1/LBeSsFJ3nJ8N2Q==';
            this.transferAudio.volume = 0.25;
            
            // Create congratulations sound (fanfare)
            this.congratsAudio = new Audio();
            this.congratsAudio.src = 'data:audio/wav;base64,UklGRvAIAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YcwIAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBT2Y1/LBeSsFJ3nJ8N2QPwkUX7br66hVFAlFnt/yv2IcBTyX1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFApGn+DyvmEcBT2Y1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFAlFnt/yv2IcBTyX1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFApGn+DyvmEcBT2Y1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFAlFnt/yv2IcBTyX1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFApGn+DyvmEcBT2Y1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFAlFnt/yv2IcBTyX1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFApGn+DyvmEcBT2Y1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFAlFnt/yv2IcBTyX1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFApGn+DyvmEcBT2Y1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFAlFnt/yv2IcBTyX1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFApGn+DyvmEcBT2Y1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFAlFnt/yv2IcBTyX1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFApGn+DyvmEcBT2Y1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFAlFnt/yv2IcBTyX1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFApGn+DyvmEcBT2Y1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFAlFnt/yv2IcBTyX1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFApGn+DyvmEcBT2Y1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFAlFnt/yv2IcBTyX1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFApGn+DyvmEcBT2Y1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFAlFnt/yv2IcBTyX1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFApGn+DyvmEcBT2Y1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFAlFnt/yv2IcBTyX1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFApGn+DyvmEcBT2Y1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFAlFnt/yv2IcBTyX1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFApGn+DyvmEcBT2Y1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFAlFnt/yv2IcBTyX1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFApGn+DyvmEcBT2Y1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFAlFnt/yv2IcBTyX1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFApGn+DyvmEcBT2Y1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFAlFnt/yv2IcBTyX1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFApGn+DyvmEcBT2Y1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFAlFnt/yv2IcBTyX1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFApGn+DyvmEcBT2Y1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFAlFnt/yv2IcBTyX1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFApGn+DyvmEcBT2Y1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFApGn+DyvmEcBT2Y1/LBeSsFJ3nJ8N2Q==';
            this.congratsAudio.volume = 0.6;
            
            // Create pop sound (short beep)
            this.popAudio = new Audio();
            this.popAudio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBT2Y1/LBeSsFJ3nJ8N2QPwkUX7br66hVFAlFnt/yv2IcBTyX1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFApGn+DyvmEcBT2Y1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFAlFnt/yv2IcBTyX1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFApGn+DyvmEcBT2Y1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFAlFnt/yv2IcBTyX1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFApGn+DyvmEcBT2Y1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFAlFnt/yv2IcBTyX1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFApGn+DyvmEcBT2Y1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFAlFnt/yv2IcBTyX1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFApGn+DyvmEcBT2Y1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFAlFnt/yv2IcBTyX1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFApGn+DyvmEcBT2Y1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFAlFnt/yv2IcBTyX1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFApGn+DyvmEcBT2Y1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFAlFnt/yv2IcBTyX1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFApGn+DyvmEcBT2Y1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFAlFnt/yv2IcBTyX1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFApGn+DyvmEcBT2Y1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFAlFnt/yv2IcBTyX1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFApGn+DyvmEcBT2Y1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFAlFnt/yv2IcBTyX1/LBeSsFJ3nJ8N2Q==';
            this.popAudio.volume = 0.3;
            
            // Create error sound (low tone)
            this.errorAudio = new Audio();
            this.errorAudio.src = 'data:audio/wav;base64,UklGRjYDAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YRIAAACAAAD//wAA//8AAP//AACAAAD//wAA//8AAP//AAD//wAAAACAAP//AAD//wAA//8AAID//wAA//8AAP//AAD//wAAAACAAP//AAD//wAA//8AAID//wAA//8AAP//AAD//wAAAACAAP//AAD//wAA//8AAID//wAA//8AAP//AAD//wAAAACAAP//AAD//wAA//8AAID//wAA//8AAP//AAD//wAAAACAAP//AAD//wAA//8AAID//wAA//8AAP//AAD//wAAAACAAP//AAD//wAA//8AAID//wAA//8AAP//AAD//wAAAACAAP//AAD//wAA//8AAID//wAA//8AAP//AAD//wAAAACAAP//AAD//wAA//8AAID//wAA//8AAP//AAD//wAAAACAAP//AAD//wAA//8AAID//wAA//8AAP//AAD//wAAAACAAP//AAD//wAA//8AAID//wAA//8AAP//AAD//wAAAACAAP//AAD//wAA//8AAID//wAA//8AAP//AAD//wAAAACAAP//AAD//wAA//8AAID//wAA//8AAP//AAD//wAAAACAAP//AAD//wAA//8AAID//wAA//8AAP//AAD//wAAAACAAP//AAD//wAA//8AAID//wAA//8AAP//AAD//wAAAACAAP//AAD//wAA//8AAID//wAA//8AAP//AAD//wAAAACAAP//AAD//wAA//8AAID//wAA//8AAP//AAD//wAAAACAAP//AAD//wAA//8AAID//wAA//8AAP//AAD//wAAAACAAP//AAD//wAA//8AAID//wAA//8AAP//AAD//wAAAACAAP//AAD//wAA//8AAID//wAA//8AAP//AAD//wAAAACAAP//AAD//wAA//8AAID//wAA//8AAP//AAD//wAAAACAAP//AAD//wAA//8AAID//wAA//8AAP//AAD//wAAAACAAP//AAD//wAA//8AAID//wAA//8AAP//AAD//wAAAACAAP//AAD//wAA//8AAID//wAA//8AAP//AAD//wAAAACAAP//AAD//wAA//8AAID//wAA//8AAP//AAD//w==';
            this.errorAudio.volume = 0.2;
            
            // Create victory sound  
            this.victoryAudio = new Audio();
            this.victoryAudio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBT2Y1/LBeSsFJ3nJ8N2QPwkUX7br66hVFAlFnt/yv2IcBTyX1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFApGn+DyvmEcBT2Y1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFAlFnt/yv2IcBTyX1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFApGn+DyvmEcBT2Y1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFAlFnt/yv2IcBTyX1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFApGn+DyvmEcBT2Y1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFAlFnt/yv2IcBTyX1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFApGn+DyvmEcBT2Y1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFAlFnt/yv2IcBTyX1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFApGn+DyvmEcBT2Y1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFAlFnt/yv2IcBTyX1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFApGn+DyvmEcBT2Y1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFAlFnt/yv2IcBTyX1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFApGn+DyvmEcBT2Y1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFAlFnt/yv2IcBTyX1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFApGn+DyvmEcBT2Y1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFAlFnt/yv2IcBTyX1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFApGn+DyvmEcBT2Y1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFAlFnt/yv2IcBTyX1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFApGn+DyvmEcBT2Y1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFAlFnt/yv2IcBTyX1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFApGn+DyvmEcBT2Y1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFAlFnt/yv2IcBTyX1/LBeSsFJ3nJ8N2QQAoUXrTp66hVFApGn+DyvmEcBT2Y1/LBeSsFJ3nJ8N2Q==';
            this.victoryAudio.volume = 0.4;
            
            console.log('Enhanced audio elements created successfully');
            this.audioInitialized = true;
        } catch (e) {
            console.error('Failed to create audio elements:', e);
            this.soundEnabled = false;
        }
    }
    
    /**
     * Simple and reliable audio playback
     */
    playSound(type) {
        if (!this.soundEnabled || !this.audioInitialized) {
            console.log('Sound disabled or not initialized');
            return;
        }
        
        console.log(`Attempting to play sound: ${type}`);
        
        try {
            let audio = null;
            
            if (type === 'select' && this.selectAudio) {
                audio = this.selectAudio;
            } else if (type === 'transfer' && this.transferAudio) {
                audio = this.transferAudio;
            } else if (type === 'congratulations' && this.congratsAudio) {
                audio = this.congratsAudio;
            } else if (type === 'pop' && this.popAudio) {
                audio = this.popAudio;
            } else if (type === 'error' && this.errorAudio) {
                audio = this.errorAudio;
            } else if (type === 'victory' && this.victoryAudio) {
                audio = this.victoryAudio;
            }
            
            if (audio) {
                // Reset to beginning and play
                audio.currentTime = 0;
                const playPromise = audio.play();
                
                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        console.log(`${type} sound played successfully`);
                    }).catch(error => {
                        console.error(`Failed to play ${type} sound:`, error);
                        // Show user notification if audio fails
                        this.showAudioError();
                    });
                }
            }
        } catch (e) {
            console.error('Sound playback error:', e);
        }
    }
    
    /**
     * Show audio error notification
     */
    showAudioError() {
        const gameMessage = document.getElementById('gameMessage');
        if (gameMessage) {
            const originalText = gameMessage.textContent;
            gameMessage.textContent = 'Audio blocked by browser - click sound button to enable!';
            gameMessage.style.color = '#FFB84D';
            setTimeout(() => {
                gameMessage.textContent = originalText;
                gameMessage.style.color = '';
            }, 3000);
        }
    }
    
    /**
     * Update UI elements
     */
    updateUI() {
        document.getElementById('levelDisplay').textContent = this.currentLevel;
        document.getElementById('moveCounter').textContent = this.moves;
        
        // Update button states
        document.getElementById('undoBtn').disabled = this.moveHistory.length === 0;
        document.getElementById('hintBtn').disabled = this.hintsUsed >= this.maxHints;
        document.getElementById('shuffleBtn').disabled = this.shufflesUsed >= this.maxShuffles;
        
        // Update button text to show remaining uses
        document.getElementById('hintBtn').textContent = `Hint (${this.maxHints - this.hintsUsed})`;
        document.getElementById('shuffleBtn').textContent = `Shuffle (${this.maxShuffles - this.shufflesUsed})`;
        
        // Update sound button
        this.updateSoundButton();
    }
    
    /**
     * Save game state to localStorage
     */
    saveGameState() {
        const gameState = {
            currentLevel: this.currentLevel,
            maxLevelReached: Math.max(this.currentLevel, this.maxLevelReached || 1),
            tubes: this.tubes,
            moves: this.moves,
            moveHistory: this.moveHistory,
            hintsUsed: this.hintsUsed,
            shufflesUsed: this.shufflesUsed,
            timeLeft: this.timeLeft,
            levelTimeLimit: this.levelTimeLimit,
            gameState: this.gameState,
            soundEnabled: this.soundEnabled,
            lastPlayedTime: Date.now()
        };
        
        try {
            localStorage.setItem('ballSortGame', JSON.stringify(gameState));
            console.log(`Game state saved - Level: ${this.currentLevel}, Moves: ${this.moves}`);
        } catch (e) {
            console.error('Failed to save game state:', e);
        }
    }
    
    /**
     * Load game state from localStorage
     */
    async loadGameState() {
        try {
            // Wait for progress manager to initialize
            if (this.progressManager) {
                await this.progressManager.loadUserProgress();
                
                // Get the maximum level reached from progress manager
                const maxLevelFromProgress = this.progressManager.userData.maxLevelReached;
                console.log(`Max level from progress manager: ${maxLevelFromProgress}`);
                
                // Update our max level
                this.maxLevelReached = maxLevelFromProgress;
            }
            
            const savedState = localStorage.getItem('ballSortGame');
            if (savedState) {
                console.log('Loading saved game state...');
                const gameState = JSON.parse(savedState);
                
                // Restore level progress, but ensure it doesn't exceed progress manager max
                this.currentLevel = Math.min(gameState.currentLevel || 1, this.maxLevelReached);
                this.tubes = gameState.tubes || [];
                this.moves = gameState.moves || 0;
                this.moveHistory = gameState.moveHistory || [];
                this.hintsUsed = gameState.hintsUsed || 0;
                this.shufflesUsed = gameState.shufflesUsed || 0;
                this.timeLeft = gameState.timeLeft || 0;
                this.levelTimeLimit = gameState.levelTimeLimit || 0;
                this.soundEnabled = gameState.soundEnabled !== undefined ? gameState.soundEnabled : true;
                
                console.log(`Restored to level ${this.currentLevel} (max reached: ${this.maxLevelReached}) with ${this.moves} moves`);
                
                // If we have valid saved game state, restore it
                if (this.tubes.length > 0) {
                    // Resume timer if there was time left and game was in progress
                    if (this.timeLeft > 0 && !this.isGameWon()) {
                        this.startTimer();
                        this.timeLeft = gameState.timeLeft; // Restore exact saved time
                        console.log(`Resuming timer with ${this.timeLeft} seconds`);
                    }
                    this.updateUI();
                } else {
                    // No valid level data, generate the current level fresh
                    console.log(`No level data found, generating level ${this.currentLevel}`);
                    this.generateLevel(this.currentLevel);
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
     * Utility function to shuffle array
     */
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    
    /**
     * Main game loop for rendering and animations
     */
    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
    
    /**
     * Update game state and animations
     */
    update() {
        // Update ball animation
        if (this.animatingBall) {
            this.animatingBall.progress += 0.05;
            if (this.animatingBall.progress >= 1) {
                this.completeBallAnimation();
            }
        }
        
        // Update particles
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.3; // Gravity
            particle.life--;
            return particle.life > 0;
        });
        
        // Update shake effects
        this.shakeEffects = this.shakeEffects.filter(effect => {
            effect.duration--;
            effect.intensity *= 0.9;
            return effect.duration > 0;
        });
    }
    
    /**
     * Render the game
     */
    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background pattern
        this.drawBackground();
        
        // Draw tubes and balls
        this.drawTubes();
        
        // Draw animating ball
        if (this.animatingBall) {
            this.drawAnimatingBall();
        }
        
        // Draw particles
        this.drawParticles();
        
        // Draw UI elements
        this.drawLevelInfo();
    }
    
    /**
     * Draw background pattern
     */
    drawBackground() {
        const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.05)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0.1)');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw subtle grid pattern
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        this.ctx.lineWidth = 1;
        for (let x = 0; x < this.canvas.width; x += 40) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        for (let y = 0; y < this.canvas.height; y += 40) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }
    
    /**
     * Draw all tubes and their balls
     */
    drawTubes() {
        const startX = (this.canvas.width - (this.tubes.length * (this.tubeWidth + 20) - 20)) / 2;
        const tubeY = this.canvas.height - this.tubeHeight - 50;
        
        for (let i = 0; i < this.tubes.length; i++) {
            let tubeX = startX + i * (this.tubeWidth + 20);
            
            // Apply shake effect
            const shakeEffect = this.shakeEffects.find(effect => effect.tube === i);
            if (shakeEffect) {
                tubeX += (Math.random() - 0.5) * shakeEffect.intensity;
            }
            
            this.drawTube(tubeX, tubeY, i);
            this.drawBallsInTube(tubeX, tubeY, i);
        }
    }
    
    /**
     * Draw a single tube
     */
    drawTube(x, y, tubeIndex) {
        // Tube shadow
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        this.ctx.fillRect(x + 3, y + 3, this.tubeWidth, this.tubeHeight);
        
        // Tube body
        const gradient = this.ctx.createLinearGradient(x, y, x + this.tubeWidth, y);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.9)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0.7)');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(x, y, this.tubeWidth, this.tubeHeight);
        
        // Tube border
        if (tubeIndex === this.selectedTube) {
            this.ctx.strokeStyle = '#FFD700';
            this.ctx.lineWidth = 4;
        } else {
            this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
            this.ctx.lineWidth = 2;
        }
        this.ctx.strokeRect(x, y, this.tubeWidth, this.tubeHeight);
        
        // Tube cap
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.fillRect(x - 5, y - 10, this.tubeWidth + 10, 10);
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x - 5, y - 10, this.tubeWidth + 10, 10);
    }
    
    /**
     * Draw balls in a tube
     */
    drawBallsInTube(tubeX, tubeY, tubeIndex) {
        const balls = this.tubes[tubeIndex];
        
        for (let j = 0; j < balls.length; j++) {
            const ballY = tubeY + this.tubeHeight - (j + 1) * (this.ballSize * 2 + this.ballSpacing) - this.ballSpacing;
            const ballX = tubeX + this.tubeWidth / 2;
            
            this.drawBall(ballX, ballY, balls[j]);
        }
    }
    
    /**
     * Draw a single ball
     */
    drawBall(x, y, colorIndex) {
        const color = this.ballColors[colorIndex];
        
        // Ball shadow
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.beginPath();
        this.ctx.arc(x + 2, y + 2, this.ballSize, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Ball gradient
        const gradient = this.ctx.createRadialGradient(
            x - this.ballSize * 0.3, y - this.ballSize * 0.3, 0,
            x, y, this.ballSize
        );
        gradient.addColorStop(0, this.lightenColor(color, 40));
        gradient.addColorStop(0.7, color);
        gradient.addColorStop(1, this.darkenColor(color, 20));
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(x, y, this.ballSize, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Ball highlight
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        this.ctx.beginPath();
        this.ctx.arc(x - this.ballSize * 0.3, y - this.ballSize * 0.3, this.ballSize * 0.3, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Ball border
        this.ctx.strokeStyle = this.darkenColor(color, 30);
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(x, y, this.ballSize, 0, Math.PI * 2);
        this.ctx.stroke();
    }
    
    /**
     * Draw animating ball during movement
     */
    drawAnimatingBall() {
        const startX = (this.canvas.width - (this.tubes.length * (this.tubeWidth + 20) - 20)) / 2;
        const tubeY = this.canvas.height - this.tubeHeight - 50;
        
        const fromX = startX + this.animatingBall.fromTube * (this.tubeWidth + 20) + this.tubeWidth / 2;
        const fromY = tubeY + this.tubeHeight - (this.tubes[this.animatingBall.fromTube].length + 1) * (this.ballSize * 2 + this.ballSpacing) - this.ballSpacing;
        
        const toX = startX + this.animatingBall.toTube * (this.tubeWidth + 20) + this.tubeWidth / 2;
        const toY = tubeY + this.tubeHeight - (this.tubes[this.animatingBall.toTube].length + 1) * (this.ballSize * 2 + this.ballSpacing) - this.ballSpacing;
        
        // Smooth easing animation
        const progress = this.easeInOutCubic(this.animatingBall.progress);
        
        // Arc trajectory
        const midY = Math.min(fromY, toY) - 50;
        const arcProgress = progress;
        
        let currentX, currentY;
        if (progress < 0.5) {
            // Rising arc
            const t = progress * 2;
            currentX = fromX + (toX - fromX) * t * 0.5;
            currentY = fromY + (midY - fromY) * this.easeOutQuad(t);
        } else {
            // Falling arc
            const t = (progress - 0.5) * 2;
            currentX = fromX + (toX - fromX) * (0.5 + t * 0.5);
            currentY = midY + (toY - midY) * this.easeInQuad(t);
        }
        
        this.drawBall(currentX, currentY, this.animatingBall.ball);
    }
    
    /**
     * Draw victory particles
     */
    drawParticles() {
        for (let particle of this.particles) {
            this.ctx.save();
            this.ctx.globalAlpha = particle.life / 60;
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        }
    }
    
    /**
     * Draw level information
     */
    drawLevelInfo() {
        // Level progress indicator
        const progressWidth = 200;
        const progressHeight = 8;
        const progressX = (this.canvas.width - progressWidth) / 2;
        const progressY = 20;
        
        // Progress background
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.fillRect(progressX, progressY, progressWidth, progressHeight);
        
        // Progress fill
        const progress = (this.currentLevel - 1) / (this.maxLevel - 1);
        const gradient = this.ctx.createLinearGradient(progressX, progressY, progressX + progressWidth, progressY);
        gradient.addColorStop(0, '#10B981');
        gradient.addColorStop(0.5, '#3B82F6');
        gradient.addColorStop(1, '#8B5CF6');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(progressX, progressY, progressWidth * progress, progressHeight);
        
        // Progress border
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(progressX, progressY, progressWidth, progressHeight);
    }
    
    /**
     * Utility functions for color manipulation
     */
    lightenColor(color, percent) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }
    
    darkenColor(color, percent) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) - amt;
        const G = (num >> 8 & 0x00FF) - amt;
        const B = (num & 0x0000FF) - amt;
        return "#" + (0x1000000 + (R > 255 ? 255 : R < 0 ? 0 : R) * 0x10000 +
            (G > 255 ? 255 : G < 0 ? 0 : G) * 0x100 +
            (B > 255 ? 255 : B < 0 ? 0 : B)).toString(16).slice(1);
    }
    
    /**
     * Easing functions for smooth animations
     */
    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
    
    easeOutQuad(t) {
        return 1 - (1 - t) * (1 - t);
    }
    
    easeInQuad(t) {
        return t * t;
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new BallSortGame();
});

// Service worker for offline play (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => console.log('SW registered'))
            .catch(error => console.log('SW registration failed'));
    });
}
