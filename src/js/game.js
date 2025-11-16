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
        this.canvas.height = 700; // Increased to accommodate taller tubes
        
        // Game state
        this.currentLevel = 1;
        this.maxLevel = 1000; // Extended from 200 to 1000 levels for enhanced gameplay
        this.maxLevelReached = 1; // Track highest level reached
        this.moves = 0;
        this.gameState = 'playing'; // 'playing', 'paused', 'completed', 'timeup'
        this.isPaused = false;
        
        // User Progress Manager
        this.progressManager = new UserProgressManager();
        this.levelStartTime = Date.now();
        
        // Google Play Games Manager
        this.googlePlayGames = null;
        this.initializeGooglePlayGames();
        
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
        this.tubeHeight = 360; // Increased to properly contain all 6 balls (6*55px + padding)
        this.ballSize = 25;
        this.ballSpacing = 5;
        this.maxBallsPerTube = 6;
        
        // Colors for balls - More vibrant and distinct
        this.ballColors = [
            '#FF3B30', '#FF9500', '#FFCC02', '#34C759', 
            '#00C7BE', '#007AFF', '#5856D6', '#AF52DE',
            '#FF2D92', '#A2845E', '#8E8E93', '#FF6B35',
            '#6BCF7F', '#4A90E2', '#BD10E0', '#F5A623'
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
        
        // Selected ball animation
        this.selectedBallAnimation = {
            scale: 1.0,
            glow: 0,
            bounce: 0,
            time: 0
        };
        
        // Audio system with downloadable sound files
        this.soundEnabled = true;
        this.audioFiles = {};
        this.loadAudioFiles();
        
        // AdMob integration with new manager
        this.admobManager = null;
        this.admobInitialized = false;
        this.rewardedAd = null;
        this.bannerAd = null;
        this.bannerAdLoaded = false;
        this.adRotationInterval = null; // Track ad rotation interval
        
        // Premium/Ad-free functionality - Load from enhanced premium system
        this.isPremium = false; // Will be updated by loadPremiumStatus()
        // Don't reset premium status - preserve existing premium purchases
        
        this.gameLoopRunning = false; // Track if game loop is running
        
        // Clear any existing intervals from previous instances
        if (window.ballSortGameInstance && window.ballSortGameInstance.clearAdIntervals) {
            window.ballSortGameInstance.clearAdIntervals();
        }
        
        // Initialize Ball Expression System
        try {
            this.expressionSystem = new BallExpressionSystem();
            console.log('✅ Ball Expression System initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize Ball Expression System:', error);
            // Fallback to a simple system
            this.expressionSystem = {
                getExpressionForColor: (level, color) => ['angry', 'laughing', 'crying', 'surprised', 'sleeping'][color % 5],
                convertBallToObject: (color, level) => ({ color, expression: ['angry', 'laughing', 'crying', 'surprised', 'sleeping'][color % 5] }),
                getBallColor: (ball) => typeof ball === 'object' ? ball.color : ball,
                getBallExpression: (ball, level, fallback) => typeof ball === 'object' ? ball.expression : ['angry', 'laughing', 'crying', 'surprised', 'sleeping'][fallback % 5]
            };
        }
        
        // Initialize Tube Design System
        try {
            this.tubeDesignSystem = new TubeDesignSystem();
            console.log('✅ Tube Design System initialized successfully');
            // Make it globally available for drawing functions
            window.tubeDesignSystem = this.tubeDesignSystem;
        } catch (error) {
            console.error('❌ Failed to initialize Tube Design System:', error);
            // Fallback to a simple system
            this.tubeDesignSystem = {
                getTubeDesignForIndex: (level, tubeIndex) => 'simple',
                generateLevelTubeDesigns: (level, totalTubes) => ({}),
                getAllTubeDesigns: () => ['simple']
            };
        }
        
        // Initialize 3D Animated Background System
        try {
            this.animatedBackground3D = new AnimatedBackground3D();
            // Initialize after DOM is ready
            setTimeout(() => {
                this.animatedBackground3D.initialize();
            }, 100);
            console.log('✅ 3D Animated Background System initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize 3D Animated Background System:', error);
            this.animatedBackground3D = null;
        }
        
        // Initialize AdMob Manager (handles both web and Android)
        this.initializeAdMobManager();

        // Mobile-specific features
        this.isMobile = this.detectMobile();
        this.setupMobileFeatures();

        // User Progress Management
        this.progressManager = null;
        this.initializeProgressManager();

        // Load premium status early to prevent button flashing
        this.loadPremiumStatus();

        // Show welcome screen first instead of auto-starting
        this.showWelcomeScreen();
        
        // Initialize game but don't start yet
        this.setupEventListeners();
        this.setupCanvas(); // Ensure canvas is properly configured
        this.gameLoop();
        
        // Make instance globally accessible for testing
        window.ballSortGame = this;
        window.ballSortGameInstance = this; // Also add this alias for consistency
        
        // Add debug function for testing premium persistence
        window.testPremiumPersistence = () => {
            console.log('🧪 Testing Premium Persistence System...');
            console.log('Current premium status:', this.googlePlayGames?.isPremiumUser() || false);
            console.log('Premium details:', this.googlePlayGames?.getPremiumDetails() || 'None');
            console.log('localStorage premium data:', localStorage.getItem('premiumStatus'));
            const goAdFreeBtn = document.getElementById('goAdFreeBtn');
            console.log('Go Ad Free button:', {
                exists: !!goAdFreeBtn,
                visible: goAdFreeBtn ? (goAdFreeBtn.style.display !== 'none') : 'N/A'
            });
            console.log('Premium badges present:', {
                topBar: !!document.getElementById('premiumBadge'),
                welcomeScreen: !!document.getElementById('welcomePremiumBadge')
            });
            
            // Test localStorage format
            const savedStatus = localStorage.getItem('premiumStatus');
            if (savedStatus) {
                try {
                    const parsed = JSON.parse(savedStatus);
                    console.log('Premium status format: Enhanced JSON');
                    console.log('Purchase date:', parsed.purchaseDate);
                    console.log('Days since purchase:', Math.floor((Date.now() - new Date(parsed.purchaseDate)) / (1000 * 60 * 60 * 24)));
                } catch (e) {
                    console.log('Premium status format: Simple boolean');
                }
            } else {
                console.log('No premium status saved');
            }
        };
    }
    
    /**
     * Detect if running on mobile device
     */
    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
               typeof window.cordova !== 'undefined';
    }

    /**
     * Setup mobile-specific features
     */
    setupMobileFeatures() {
        if (this.isMobile) {
            // Prevent zoom on double tap
            document.addEventListener('touchstart', function(e) {
                if (e.touches.length > 1) {
                    e.preventDefault();
                }
            });
            
            // Prevent context menu on long press
            document.addEventListener('contextmenu', function(e) {
                e.preventDefault();
            });
            
            // Handle device back button (Cordova)
            document.addEventListener('backbutton', () => {
                if (this.gameState === 'playing') {
                    this.pauseGame();
                } else if (typeof navigator.app !== 'undefined') {
                    navigator.app.exitApp();
                }
            }, false);
            
            // Handle device pause/resume (Cordova)
            document.addEventListener('pause', () => {
                if (this.gameState === 'playing') {
                    this.pauseGame();
                }
            }, false);
            
            document.addEventListener('resume', () => {
                // Resume handled by user interaction
            }, false);
        }
    }

    /**
     * Add vibration feedback for mobile
     */
    addHapticFeedback(type = 'light') {
        if (this.isMobile && typeof navigator.vibrate !== 'undefined') {
            switch (type) {
                case 'light':
                    navigator.vibrate(50);
                    break;
                case 'medium':
                    navigator.vibrate(100);
                    break;
                case 'heavy':
                    navigator.vibrate(200);
                    break;
            }
        }
    }
    
    /**
     * Show welcome screen with start game button
     */
    showWelcomeScreen() {
        console.log('🎬 Starting welcome screen setup...');
        
        const welcomeScreen = document.getElementById('welcomeScreen');
        const gameContainer = document.getElementById('gameContainer');
        const startGameBtn = document.getElementById('startGameBtn');
        const goAdsFreeBtn = document.getElementById('goAdsFreeBtn');
        
        console.log('🔍 Welcome screen elements check:', {
            welcomeScreen: !!welcomeScreen,
            gameContainer: !!gameContainer,
            startGameBtn: !!startGameBtn,
            goAdsFreeBtn: !!goAdsFreeBtn
        });
        
        if (welcomeScreen && gameContainer && startGameBtn) {
            // Ensure welcome screen is visible
            welcomeScreen.classList.remove('fade-out');
            gameContainer.classList.remove('fade-in');
            
            // Remove any existing event listeners to prevent duplicates
            const newStartBtn = startGameBtn.cloneNode(true);
            startGameBtn.parentNode.replaceChild(newStartBtn, startGameBtn);
            
            // Add click handler for start button
            newStartBtn.addEventListener('click', () => {
                console.log('Start Game button clicked!');
                this.hideWelcomeScreen();
                
                // Start the game
                if (this.isFirstTimeUser) {
                    console.log('🎮 Starting game...');
                    this.startGame();
                } else {
                    console.log('👤 Returning user - starting normal game');
                    this.startGame();
                }
            });
            
            // Handle Go Ads Free button
            if (goAdsFreeBtn) {
                // Remove any existing event listeners to prevent duplicates
                const newGoAdsFreeBtn = goAdsFreeBtn.cloneNode(true);
                goAdsFreeBtn.parentNode.replaceChild(newGoAdsFreeBtn, goAdsFreeBtn);
                
                newGoAdsFreeBtn.addEventListener('click', async () => {
                    console.log('🛒 Go Ads Free button clicked!');
                    
                    // Check if user is already premium
                    if (this.isPremium || (this.googlePlayGames && this.googlePlayGames.isPremiumUser())) {
                        console.log('👑 User is already premium!');
                        alert('You are already a premium user! Enjoy your ad-free experience! 💎');
                        return;
                    }
                    
                    // Show detailed purchase information before proceeding
                    this.showAdFreeConfirmationDialog();
                });
                console.log('Go Ads Free button event listener attached');
            } else {
                console.error('Go Ads Free button not found!');
            }
            
            // Handle Game Info button
            const gameInfoBtn = document.getElementById('gameInfoBtn');
            if (gameInfoBtn) {
                // Remove any existing event listeners to prevent duplicates
                const newGameInfoBtn = gameInfoBtn.cloneNode(true);
                gameInfoBtn.parentNode.replaceChild(newGameInfoBtn, gameInfoBtn);
                
                newGameInfoBtn.addEventListener('click', () => {
                    console.log('📊 Game Info button clicked!');
                    this.showGameInfoModal();
                });
                console.log('Game Info button event listener attached');
            } else {
                console.error('Game Info button not found!');
            }
            
            // Set up purchase modal event listeners
            // Note: Modal listeners will be set up when modal is shown
            
            console.log('Welcome screen initialized');
            
            // Load premium status and update UI immediately (no delay)
            this.loadPremiumStatus();
            this.updatePremiumUI();
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
            
            // Start the actual game
            setTimeout(() => {
                this.startGame();
                console.log('🎮 Game initialization completed after welcome screen');
            }, 400);
        }
    }
    
    /**
     * Show Ad-Free Purchase Confirmation Dialog
     */
    showAdFreeConfirmationDialog() {
        // Create modal overlay
        const modalOverlay = document.createElement('div');
        modalOverlay.id = 'adFreeConfirmationModal';
        modalOverlay.className = 'fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50';
        
        // Create modal content
        modalOverlay.innerHTML = `
            <div class="bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 rounded-2xl p-8 mx-4 max-w-md w-full shadow-2xl border border-purple-500/30">
                <div class="text-center">
                    <div class="text-6xl mb-4">✨</div>
                    <h2 class="text-2xl font-bold text-white mb-4">Go Ad-Free Premium</h2>
                    
                    <div class="bg-green-800/30 rounded-lg p-4 mb-4 border border-green-500/50">
                        <h3 class="text-lg font-semibold text-green-300 mb-2">✅ What's Included:</h3>
                        <p class="text-green-100 text-sm leading-relaxed">
                            Completely removes banner and level completion ads
                        </p>
                    </div>
                    
                    <div class="bg-yellow-800/30 rounded-lg p-4 mb-6 border border-yellow-500/50">
                        <h3 class="text-lg font-semibold text-yellow-300 mb-2">⚠️ Please Note:</h3>
                        <p class="text-yellow-100 text-sm leading-relaxed">
                            Time out ads will continue
                        </p>
                    </div>
                    
                    <div class="flex space-x-3">
                        <button id="cancelAdFreePurchase" class="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg font-semibold transition-colors">
                            Cancel
                        </button>
                        <button id="confirmAdFreePurchase" class="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-4 py-3 rounded-lg font-semibold transition-colors">
                            Purchase $9.99
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Add to body
        document.body.appendChild(modalOverlay);
        
        // Add event listeners
        const cancelBtn = document.getElementById('cancelAdFreePurchase');
        const confirmBtn = document.getElementById('confirmAdFreePurchase');
        
        cancelBtn.addEventListener('click', () => {
            document.body.removeChild(modalOverlay);
            console.log('Ad-free purchase cancelled by user');
        });
        
        confirmBtn.addEventListener('click', async () => {
            document.body.removeChild(modalOverlay);
            console.log('User confirmed ad-free purchase, proceeding...');
            await this.processPremiumPurchase();
        });
        
        // Close on overlay click
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                document.body.removeChild(modalOverlay);
                console.log('Ad-free modal closed by overlay click');
            }
        });
    }
    
    /**
     * Show Game Info Modal with difficulty levels, time limits, and level ranges
     */
    showGameInfoModal() {
        const gameInfoModal = document.getElementById('gameInfoModal');
        if (gameInfoModal) {
            gameInfoModal.classList.remove('hidden');
            console.log('Game Info modal shown');
            
            // Add close button functionality
            const closeBtn = document.getElementById('closeGameInfoBtn');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    this.hideGameInfoModal();
                }, { once: true }); // Use once to prevent duplicate listeners
            }
            
            // Close on overlay click
            gameInfoModal.addEventListener('click', (e) => {
                if (e.target === gameInfoModal) {
                    this.hideGameInfoModal();
                }
            }, { once: true });
            
            // Prevent closing when clicking inside the modal content
            const modalContent = gameInfoModal.querySelector('.bg-white');
            if (modalContent) {
                modalContent.addEventListener('click', (e) => {
                    e.stopPropagation();
                });
            }
        } else {
            console.error('Game Info modal not found!');
        }
    }
    
    /**
     * Hide Game Info Modal
     */
    hideGameInfoModal() {
        const gameInfoModal = document.getElementById('gameInfoModal');
        if (gameInfoModal) {
            gameInfoModal.classList.add('hidden');
            console.log('Game Info modal hidden');
        }
    }
    
    /**
     * Process the premium purchase after user confirmation
     */
    async processPremiumPurchase() {
        try {
            // Direct Google Play Games purchase flow
            if (this.googlePlayGames && this.googlePlayGames.isSignedIn()) {
                console.log('📱 Starting Google Play Games purchase flow...');
                const success = await this.googlePlayGames.purchaseAdFree();
                if (success) {
                    console.log('✅ Google Play Games purchase successful');
                    this.isPremium = true; // Update premium status
                    this.updateAdVisibility(); // Update ad visibility
                    alert('🎉 Purchase successful! Banner and level completion ads have been removed. Enjoy your premium experience!');
                    return;
                } else {
                    console.log('❌ Google Play Games purchase failed or cancelled');
                    alert('Purchase cancelled or failed. Please try again.');
                    return;
                }
            } else {
                console.log('🔐 Google Play Games not available, please sign in first');
                alert('Please sign in to Google Play Games first to make purchases.');
                return;
            }
            
        } catch (error) {
            console.error('💥 Purchase flow error:', error);
            alert('Purchase failed. Please try again later.');
        }
    }
    
    /**
     * Start the actual game after welcome screen
     */
    startGame() {
        // Setup canvas for proper coordinate mapping
        this.setupCanvas();
        
        // Load game state or initialize new game
        this.loadGameState();
        
        // If no saved game, initialize with level 1
        if (this.tubes.length === 0) {
            this.initializeGame();
        }
        
        // Now start the timer since user is actually playing
        console.log('Starting timer for actual gameplay...');
        this.startTimer();
        
        console.log('Game started successfully');
    }
    
    /**
     * Setup canvas with proper scaling and coordinate mapping
     */
    setupCanvas() {
        // Ensure canvas has proper dimensions
        if (!this.canvas.width || this.canvas.width === 0) {
            this.canvas.width = 800;
        }
        if (!this.canvas.height || this.canvas.height === 0) {
            this.canvas.height = 700;
        }
        
        // Add resize listener to handle window size changes
        window.addEventListener('resize', () => this.handleCanvasResize());
        
        // Setup more options functionality
        this.setupMoreOptions();
        
        // Initial setup
        this.handleCanvasResize();
        
        console.log(`Canvas setup: ${this.canvas.width}x${this.canvas.height}`);
    }
    
    /**
     * Handle canvas resize to maintain proper coordinate mapping
     */
    handleCanvasResize() {
        // Store the display size
        const rect = this.canvas.getBoundingClientRect();
        this.displayWidth = rect.width;
        this.displayHeight = rect.height;
        
        console.log(`Canvas display size: ${this.displayWidth}x${this.displayHeight}, Internal: ${this.canvas.width}x${this.canvas.height}`);
    }

    /**
     * Setup More Options functionality
     */
    setupMoreOptions() {
        const moreOptionsBtn = document.getElementById('moreOptionsBtn');
        const optionsModal = document.getElementById('optionsModal');
        const closeModalBtn = document.getElementById('closeModalBtn');
        
        if (moreOptionsBtn && optionsModal && closeModalBtn) {
            // Show options modal when More Options is clicked
            moreOptionsBtn.addEventListener('click', () => {
                optionsModal.classList.remove('hidden');
                optionsModal.classList.add('flex');
                console.log('Options modal opened');
            });
            
            // Hide options modal when close button is clicked
            closeModalBtn.addEventListener('click', () => {
                optionsModal.classList.remove('flex');
                optionsModal.classList.add('hidden');
                console.log('Options modal closed');
            });
            
            // Hide options modal when backdrop is clicked
            optionsModal.addEventListener('click', (e) => {
                if (e.target === optionsModal) {
                    optionsModal.classList.remove('flex');
                    optionsModal.classList.add('hidden');
                    console.log('Options modal closed via backdrop');
                }
            });
            
            console.log('More Options modal functionality initialized');
        } else {
            console.log('More Options modal elements not found, skipping setup');
        }
    }
    
    /**
     * Debug function to show where touches are registered
     */
    drawTouchDebug(x, y) {
        // Save current context
        this.ctx.save();
        
        // Draw a red circle at touch position
        this.ctx.fillStyle = 'red';
        this.ctx.globalAlpha = 0.7;
        this.ctx.beginPath();
        this.ctx.arc(x, y, 10, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw crosshairs
        this.ctx.strokeStyle = 'red';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(x - 15, y);
        this.ctx.lineTo(x + 15, y);
        this.ctx.moveTo(x, y - 15);
        this.ctx.lineTo(x, y + 15);
        this.ctx.stroke();
        
        // Restore context
        this.ctx.restore();
        
        // Clear debug after 1 second
        setTimeout(() => {
            // Just trigger a redraw to clear the debug marker
            this.render();
        }, 1000);
    }
    
    /**
     * Initialize the game with level 1
     */
    initializeGame() {
        this.generateLevel(this.currentLevel, false); // Don't start timer during initialization
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
     * Initialize AdMob Manager for cross-platform ad handling
     */
    initializeAdMobManager() {
        // Skip ad initialization if user has premium (for banner/interstitial only)
        console.log('Initializing AdMob Manager...');
        
        // Check if AdMobManager is available
        if (typeof window.AdMobManager !== 'undefined') {
            this.admobManager = new window.AdMobManager(this);
            this.admobInitialized = true;
            console.log('AdMob Manager initialized successfully');
        } else {
            console.log('AdMobManager not available - running without ad manager');
            this.admobInitialized = false;
        }
        
        // Update ad visibility based on premium status
        this.updateAdVisibility();
    }

    /**
     * Update ad visibility based on premium status
     */
    updateAdVisibility() {
        if (this.admobManager) {
            this.admobManager.updateAdVisibility(this.isPremium);
        }
    }

    /**
     * Legacy method - now delegates to AdMob Manager
     */
    initializeAdMob() {
        // This method is kept for backwards compatibility
        // All functionality is now handled by AdMobManager
        this.initializeAdMobManager();
    }

    /**
     * Show banner ad - delegates to AdMob Manager
     */
    showBannerAd() {
        if (this.admobManager) {
            this.admobManager.showBanner();
        }
    }

    /**
     * Hide banner ad - delegates to AdMob Manager
     */
    hideBannerAd() {
        if (this.admobManager) {
            this.admobManager.hideBanner();
        }
    }

    /**
     * Show rewarded ad - delegates to AdMob Manager
     */
    showRewardedAd() {
        if (this.admobManager) {
            return this.admobManager.showRewardedAd();
        }
        return false;
    }

    /**
     * Handle level completion - notify AdMob Manager
     */
    onLevelCompleted() {
        if (this.admobManager) {
            this.admobManager.onLevelCompleted();
        }
    }

    /**
     * Handle game over - notify AdMob Manager
     */
    onGameOver() {
        if (this.admobManager) {
            this.admobManager.onGameOver();
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
        // Skip banner ads if user has premium
        if (this.isPremium) {
            console.log('Premium user - skipping banner ad simulation');
            const placeholder = document.getElementById('bannerAdPlaceholder');
            if (placeholder) {
                placeholder.style.display = 'none';
            }
            return;
        }
        
        // Clear any existing ad rotation interval
        if (this.adRotationInterval) {
            clearInterval(this.adRotationInterval);
            this.adRotationInterval = null;
        }
        
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
            
            // Rotate ads every 30 seconds and store the interval ID
            this.adRotationInterval = setInterval(updateAd, 30000);
            
            // Add click handler for demo
            placeholder.addEventListener('click', () => {
                this.showAdClickedNotification();
            });
        }
    }

    /**
     * Clear all ad intervals and cleanup resources
     */
    clearAdIntervals() {
        if (this.adRotationInterval) {
            clearInterval(this.adRotationInterval);
            this.adRotationInterval = null;
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
    simulateRewardedAd(preferredReward = 'choice') {
        // If called without a specific preference, show choice dialog first
        if (preferredReward === 'choice') {
            this.showAdChoiceDialog();
            return;
        }
        
        // Otherwise, use the enhanced ad system
        this.simulateEnhancedRewardedAd(preferredReward);
    }
    
    /**
     * Show ad choice dialog (for general rewarded ads, not time-up specific)
     */
    showAdChoiceDialog() {
        // Create modal overlay
        const modalOverlay = document.createElement('div');
        modalOverlay.id = 'adChoiceModal';
        modalOverlay.className = 'fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50';
        
        // Create modal content
        modalOverlay.innerHTML = `
            <div class="bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 rounded-2xl p-8 mx-4 max-w-md w-full shadow-2xl border border-blue-500/30">
                <div class="text-center">
                    <div class="text-6xl mb-4">🎬</div>
                    <h2 class="text-2xl font-bold text-white mb-2">Choose Your Reward</h2>
                    <p class="text-blue-200 mb-6">How would you like to watch the ad?</p>
                    
                    <div class="space-y-4 mb-6">
                        <div class="bg-yellow-800/40 rounded-lg p-4 border border-yellow-500/50 hover:bg-yellow-800/60 transition-colors cursor-pointer" id="skipAdChoice">
                            <div class="flex items-center justify-between">
                                <div class="text-left">
                                    <h3 class="text-lg font-semibold text-yellow-300">Quick Skip</h3>
                                    <p class="text-yellow-100 text-sm">Skip after 15 seconds</p>
                                </div>
                                <div class="text-right">
                                    <div class="text-2xl font-bold text-yellow-400">+20s</div>
                                    <div class="text-xs text-yellow-300">Fast reward</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="bg-green-800/40 rounded-lg p-4 border border-green-500/50 hover:bg-green-800/60 transition-colors cursor-pointer" id="fullAdChoice">
                            <div class="flex items-center justify-between">
                                <div class="text-left">
                                    <h3 class="text-lg font-semibold text-green-300">Full Watch</h3>
                                    <p class="text-green-100 text-sm">Complete entire ad</p>
                                </div>
                                <div class="text-right">
                                    <div class="text-2xl font-bold text-green-400">+30s</div>
                                    <div class="text-xs text-green-300">Best reward</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="text-center">
                        <button id="startChosenAd" class="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors mb-3 w-full">
                            Start Ad
                        </button>
                        <button id="cancelAdChoice" class="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors w-full">
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Add to body
        document.body.appendChild(modalOverlay);
        
        // Add event listeners
        const startAdBtn = document.getElementById('startChosenAd');
        const cancelBtn = document.getElementById('cancelAdChoice');
        const skipChoice = document.getElementById('skipAdChoice');
        const fullChoice = document.getElementById('fullAdChoice');
        
        let selectedChoice = 'full'; // Default to full reward
        
        skipChoice.addEventListener('click', () => {
            skipChoice.classList.add('ring-2', 'ring-yellow-400');
            fullChoice.classList.remove('ring-2', 'ring-green-400');
            selectedChoice = 'skip';
            startAdBtn.textContent = '🎬 Start Ad (Skip → +20s)';
        });
        
        fullChoice.addEventListener('click', () => {
            fullChoice.classList.add('ring-2', 'ring-green-400');
            skipChoice.classList.remove('ring-2', 'ring-yellow-400');
            selectedChoice = 'full';
            startAdBtn.textContent = '🎬 Start Ad (Full → +30s)';
        });
        
        // Default selection
        fullChoice.classList.add('ring-2', 'ring-green-400');
        startAdBtn.textContent = '🎬 Start Ad (Full → +30s)';
        
        startAdBtn.addEventListener('click', () => {
            document.body.removeChild(modalOverlay);
            console.log(`User chose ${selectedChoice} ad option`);
            this.simulateEnhancedRewardedAd(selectedChoice);
        });
        
        cancelBtn.addEventListener('click', () => {
            document.body.removeChild(modalOverlay);
            console.log('User cancelled ad choice');
        });
        
        // Close on overlay click
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                document.body.removeChild(modalOverlay);
                console.log('Ad choice modal closed by overlay click');
            }
        });
    }

    /**
     * Handle successful ad reward
     * @param {number} rewardSeconds - Number of seconds to add (default: 30)
     */
    onAdRewardEarned(rewardSeconds = 30) {
        console.log(`Ad reward earned - adding ${rewardSeconds} seconds...`);
        
        // Set game state first
        this.gameState = 'playing';
        this.isPaused = false;
        
        // Set timer to the reward amount
        this.timeLeft = rewardSeconds;
        
        console.log(`Game state set to: ${this.gameState}, isPaused: ${this.isPaused}, timeLeft: ${this.timeLeft}`);
        
        // Track ad watched
        if (this.progressManager) {
            this.progressManager.recordAdWatched();
        }
        
        // Hide time up modal
        document.getElementById('timeUpModal').classList.add('hidden');
        
        // Start fresh timer with reward seconds
        this.startAdRewardTimer();
        
        // Show reward notification with dynamic amount
        this.showRewardNotification(rewardSeconds);
        
        console.log(`Player earned ${rewardSeconds} seconds!`);
    }

    /**
     * Start timer specifically for ad reward (30 seconds)
     */
    startAdRewardTimer() {
        this.stopTimer(); // Clear any existing timer
        
        console.log(`Starting ad reward timer with ${this.timeLeft} seconds`);
        
        // Update display immediately
        this.updateTimerDisplay();
        
        this.timerId = setInterval(() => {
            console.log(`Ad reward timer tick - gameState: ${this.gameState}, isPaused: ${this.isPaused}, timeLeft: ${this.timeLeft}`);
            
            if (this.gameState === 'playing' && !this.isPaused) {
                this.timeLeft--;
                console.log(`Ad reward timer decremented to: ${this.timeLeft}`);
                this.updateTimerDisplay();
                
                // Warning at 15 seconds
                if (this.timeLeft === 15) {
                    // Warning at 15 seconds (no sound)
                }
                
                if (this.timeLeft <= 0) {
                    console.log('Ad reward timer reached 0 - calling timeUp()');
                    this.timeUp();
                    return;
                }
            } else {
                console.log(`Ad reward timer paused - gameState: ${this.gameState}, isPaused: ${this.isPaused}`);
            }
        }, 1000);
        
        console.log(`Ad reward timer started with ID: ${this.timerId}`);
    }

    /**
     * Handle ad failure
     */
    onAdFailed() {
        alert('Ad not available. Try again later.');
    }

    /**
     * Show reward notification
     * @param {number} rewardSeconds - Number of seconds added (default: 30)
     */
    showRewardNotification(rewardSeconds = 30) {
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300';
        notification.innerHTML = `
            <div class="flex items-center">
                <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span class="font-bold">+${rewardSeconds} seconds added!</span>
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
     * Show interstitial ad after level completion
     */
    showInterstitialAd() {
        console.log('🎬 showInterstitialAd() called');
        console.log('this.isPremium:', this.isPremium);
        console.log('adBlockingEnabled:', this.adBlockingEnabled);
        
        // Double-check premium status from Google Play Games
        if (this.googlePlayGames) {
            const gpgPremium = this.googlePlayGames.isPremiumUser();
            console.log('Google Play Games premium status:', gpgPremium);
            if (gpgPremium !== this.isPremium) {
                console.log('⚠️ Premium status mismatch! Updating...');
                this.isPremium = gpgPremium;
            }
        }
        
        // Skip ads if user has premium
        if (this.isPremium || this.adBlockingEnabled) {
            console.log('🎯 Premium user detected - skipping interstitial ad and showing victory modal');
            this.showVictoryModalDirectly();
            return;
        }
        
        console.log('Showing interstitial ad...');
        
        // Show the interstitial ad modal
        const modal = document.getElementById('interstitialAdModal');
        const timer = document.getElementById('interstitialTimer');
        const closeBtn = document.getElementById('closeInterstitialAd');
        const progressBar = document.getElementById('interstitialProgress');
        
        console.log('Modal element:', modal);
        console.log('Timer element:', timer);
        console.log('Close button element:', closeBtn);
        console.log('Progress bar element:', progressBar);
        
        if (!modal) {
            console.error('Interstitial modal not found!');
            this.showVictoryModalDirectly();
            return;
        }
        
        modal.classList.remove('hidden');
        console.log('Modal should now be visible');
        
        let timeLeft = 5;
        timer.textContent = timeLeft;
        
        // Reset progress bar
        progressBar.style.width = '0%';
        
        // Disable close button initially
        closeBtn.classList.add('opacity-0', 'pointer-events-none');
        closeBtn.disabled = true;
        
        const adInterval = setInterval(() => {
            timeLeft--;
            timer.textContent = timeLeft;
            console.log('Ad timer:', timeLeft);
            
            // Update progress bar
            const progress = ((5 - timeLeft) / 5) * 100;
            progressBar.style.width = progress + '%';
            
            if (timeLeft <= 0) {
                clearInterval(adInterval);
                // Enable close button
                closeBtn.classList.remove('opacity-0', 'pointer-events-none');
                closeBtn.disabled = false;
                timer.textContent = '0';
                progressBar.style.width = '100%';
                
                console.log('Interstitial ad completed - close button enabled');
            }
        }, 1000);
    }

    /**
     * Close interstitial ad and show victory modal
     */
    closeInterstitialAd() {
        console.log('Closing interstitial ad...');
        
        const modal = document.getElementById('interstitialAdModal');
        modal.classList.add('hidden');
        
        // Show victory modal after closing interstitial ad
        setTimeout(() => {
            console.log("Showing victory modal after interstitial ad!");
            document.getElementById('victoryModal').classList.remove('hidden');
            document.getElementById('victoryModal').classList.add('modal-enter');
        }, 500);
    }

    /**
     * Show victory modal directly (for premium users)
     */
    showVictoryModalDirectly() {
        console.log("🎉 Showing victory modal directly for premium user!");
        
        const victoryModal = document.getElementById('victoryModal');
        if (!victoryModal) {
            console.error('❌ Victory modal not found!');
            return;
        }
        
        console.log('✅ Victory modal found, showing it...');
        victoryModal.classList.remove('hidden');
        victoryModal.classList.add('modal-enter');
        
        // Add extra debugging
        setTimeout(() => {
            const isVisible = getComputedStyle(victoryModal).display !== 'none';
            console.log('Victory modal visibility check:', isVisible);
            if (!isVisible) {
                console.error('❌ Victory modal is not visible after showing!');
                // Force show it
                victoryModal.style.display = 'flex';
                victoryModal.style.zIndex = '9999';
            }
        }, 100);
    }

    /**
     * Check if user has premium (ad-free) status
     */
    checkPremiumStatus() {
        const premiumStatus = localStorage.getItem('ballSortPremium') === 'true';
        console.log('Checking premium status from localStorage:', premiumStatus);
        return premiumStatus;
    }

    /**
     * Set premium status
     */
    setPremiumStatus(isPremium) {
        this.isPremium = isPremium;
        localStorage.setItem('ballSortPremium', isPremium.toString());
        
        // Also set premium status in Google Play Games manager
        if (this.googlePlayGames && this.googlePlayGames.setPremiumStatus) {
            this.googlePlayGames.setPremiumStatus(isPremium);
        }
        
        console.log(`Premium status set to: ${isPremium}`);
        
        if (isPremium) {
            console.log('User is now PREMIUM - ads will be skipped');
            this.hideAllAds(); // Immediately hide all ads
        } else {
            console.log('User is now NON-PREMIUM - ads will be shown');
            this.adBlockingEnabled = false; // Re-enable ads
        }
    }
    
    /**
     * Toggle premium status for testing
     */
    togglePremiumForTesting() {
        this.setPremiumStatus(!this.isPremium);
        console.log(`Premium status toggled to: ${this.isPremium}`);
        return this.isPremium;
    }

    /**
     * Load premium status from localStorage on game initialization
     */
    loadPremiumStatus() {
        console.log('🔍 Loading premium status from localStorage...');
        
        // First, check localStorage directly for immediate UI update
        const localPremiumStatus = localStorage.getItem('premiumStatus') || localStorage.getItem('ballSortPremiumSimple');
        let hasLocalPremium = false;
        
        if (localPremiumStatus) {
            try {
                // Try to parse as JSON first
                const parsed = JSON.parse(localPremiumStatus);
                hasLocalPremium = parsed && parsed.isPremium === true;
            } catch (e) {
                // Fallback to simple boolean check
                hasLocalPremium = localPremiumStatus === 'true';
            }
        }
        
        // Set preliminary status for immediate UI update
        this.isPremium = hasLocalPremium;
        
        if (this.googlePlayGames) {
            // Use Google Play Games status if available
            this.isPremium = this.googlePlayGames.isPremiumUser();
            
            if (this.isPremium) {
                console.log('💎 Premium user detected - loading premium features');
                
                // Get premium details
                const premiumDetails = this.googlePlayGames.getPremiumDetails();
                if (premiumDetails) {
                    console.log('Premium purchase date:', premiumDetails.purchaseDate);
                    console.log('Last verified:', premiumDetails.lastVerified);
                }
                
                // Set ad blocking flag for premium users
                this.adBlockingEnabled = true;
            } else {
                console.log('👤 Regular user - ads enabled');
                this.adBlockingEnabled = false;
            }
        } else {
            console.warn('Google Play Games not initialized - using localStorage fallback');
            if (this.isPremium) {
                this.adBlockingEnabled = true;
            }
        }
        
        console.log(`Current premium status: ${this.isPremium}`);
    }

    /**
     * Update UI elements based on premium status
     */
    updatePremiumUI() {
        console.log('🎨 Updating premium UI elements...');
        
        const goAdsFreeBtn = document.getElementById('goAdsFreeBtn');
        
        if (this.isPremium) {
            // Hide Go Ad Free button for premium users
            if (goAdsFreeBtn) {
                goAdsFreeBtn.classList.remove('show-for-regular-users');
                console.log('✅ Go Ad Free button hidden for premium user');
            }
            
            // Show premium indicator
            this.showPremiumIndicator();
            
            // Ensure ads are hidden (only if not already hidden)
            if (!this.adBlockingEnabled) {
                this.adBlockingEnabled = true;
                setTimeout(() => this.hideAllAds(), 100);
            }
            
        } else {
            // Show Go Ad Free button for non-premium users
            if (goAdsFreeBtn) {
                goAdsFreeBtn.classList.add('show-for-regular-users');
                console.log('👤 Go Ad Free button visible for regular user');
            }
            
            // Remove premium indicator if it exists
            this.removePremiumIndicator();
        }
    }

    /**
     * Remove premium indicator from UI
     */
    removePremiumIndicator() {
        console.log('🗑️ Removing premium status indicators...');
        
        // Remove premium badge from game top bar
        const existingBadge = document.getElementById('premiumBadge');
        if (existingBadge) {
            existingBadge.remove();
            console.log('✅ Premium badge removed from top bar');
        }
        
        // Remove premium badge from welcome screen
        const welcomeBadge = document.getElementById('welcomePremiumBadge');
        if (welcomeBadge) {
            welcomeBadge.remove();
            console.log('✅ Premium badge removed from welcome screen');
        }
        
        // Remove premium diamonds from user name
        const userName = document.getElementById('userName');
        if (userName && userName.textContent && userName.textContent.includes('💎')) {
            userName.textContent = userName.textContent.replace(' 💎', '');
            console.log('✅ Premium diamond removed from username');
        }
        
        // Remove animation styles if no premium indicators remain
        const style = document.querySelector('#premiumAnimationStyle');
        if (style && !document.getElementById('premiumBadge') && !document.getElementById('welcomePremiumBadge')) {
            style.remove();
        }
    }

    /**
     * Initiate Google Play purchase
     */
    async initiatePurchase() {
        console.log('Initiating purchase...');
        
        // First try Google Play Games Services if available and signed in
        if (this.googlePlayGames && this.googlePlayGames.isSignedIn()) {
            try {
                console.log('Attempting purchase through Google Play Games Services...');
                const success = await this.googlePlayGames.purchaseAdFree();
                if (success) {
                    console.log('Purchase successful through Google Play Games Services');
                    return;
                } else {
                    console.log('Google Play Games purchase failed, trying fallback');
                }
            } catch (error) {
                console.error('Google Play Games purchase error:', error);
            }
        }
        
        // Fallback: Check if we're on Android and have Google Play Billing available
        if (typeof Android !== 'undefined' && Android.purchaseProduct) {
            console.log('Android detected - calling native purchase method');
            Android.purchaseProduct('ball_sort_premium', '$9.99');
        } else {
            // Simulate purchase for web testing
            console.log('Web environment - simulating purchase...');
            this.simulatePurchase();
        }
    }

    /**
     * Simulate purchase for testing (web environment)
     */
    simulatePurchase() {
        const confirmed = confirm(
            'SIMULATION: This would redirect to Google Play for $9.99 payment.\n\n' +
            'For testing: Click OK to simulate successful purchase, Cancel to simulate failed purchase.'
        );
        
        if (confirmed) {
            setTimeout(() => {
                this.onPurchaseSuccess();
            }, 1000);
        } else {
            this.onPurchaseFailure('User cancelled');
        }
    }

    /**
     * Handle successful purchase
     */
    onPurchaseSuccess() {
        console.log('🎉 Purchase successful! Activating premium features...');
        
        // Set premium status
        this.setPremiumStatus(true);
        
        // Update premium UI (hide Go Ad Free button, show premium badge)
        this.updatePremiumUI();
        
        // Hide all ads immediately
        this.hideAllAds();
        
        // Show success notification
        this.showPurchaseSuccessNotification();
        
        // Ensure game continues running properly
        setTimeout(() => {
            console.log('🎮 Ensuring game is properly rendered after purchase...');
            
            // Make sure canvas is visible and properly configured
            const canvas = document.getElementById('gameCanvas');
            const gameContainer = document.getElementById('gameContainer');
            const gameArea = document.getElementById('gameArea');
            
            if (canvas) {
                canvas.style.display = 'block';
                canvas.style.visibility = 'visible';
                canvas.style.opacity = '1';
                console.log('✅ Canvas visibility confirmed');
                console.log('Canvas dimensions:', canvas.width + 'x' + canvas.height);
            }
            
            if (gameContainer) {
                gameContainer.style.display = 'block';
                gameContainer.style.visibility = 'visible';
                gameContainer.style.opacity = '1';
                console.log('✅ Game container visibility confirmed');
            }
            
            if (gameArea) {
                gameArea.style.display = 'block';
                gameArea.style.visibility = 'visible';
                gameArea.style.opacity = '1';
                console.log('✅ Game area visibility confirmed');
            }
            
            // Force canvas setup and rendering
            if (this.setupCanvas) {
                this.setupCanvas();
                console.log('✅ Canvas setup refreshed');
            }
            
            // Force a render regardless of game state
            if (this.render) {
                this.render();
                console.log('✅ Game re-rendered');
            }
            
            // Check game state
            console.log('Current game state:', {
                gameState: this.gameState,
                currentLevel: this.currentLevel,
                tubesLength: this.tubes ? this.tubes.length : 0,
                canvasExists: !!this.canvas,
                ctxExists: !!this.ctx
            });
        }, 200);
    }

    /**
     * Handle failed purchase
     */
    onPurchaseFailure(error) {
        console.log('Purchase failed:', error);
        alert('Purchase failed. Please try again later.');
    }

    /**
     * Show purchase success notification
     */
    showPurchaseSuccessNotification() {
        const notification = document.createElement('div');
        notification.className = 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-green-500 to-blue-500 text-white px-8 py-6 rounded-xl shadow-2xl z-50 scale-0 transition-all duration-500';
        notification.innerHTML = `
            <div class="text-center">
                <div class="text-4xl mb-2">💎✨</div>
                <div class="font-bold text-xl mb-2">Purchase Successful!</div>
                <div class="text-sm opacity-90 mb-3">Premium features activated</div>
                <div class="text-xs bg-white/20 px-3 py-1 rounded-full">All ads removed • Unlimited gameplay</div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animate in with scale effect
        setTimeout(() => {
            notification.classList.remove('scale-0');
            notification.classList.add('scale-100');
        }, 100);
        
        // Remove after 4 seconds with fade out
        setTimeout(() => {
            notification.classList.add('scale-0', 'opacity-0');
            setTimeout(() => notification.remove(), 500);
        }, 3000);
        
        // Also show a confetti effect
        this.showConfettiEffect();
    }

    /**
     * Show confetti effect for purchase success
     */
    showConfettiEffect() {
        // Create confetti particles
        for (let i = 0; i < 20; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'fixed pointer-events-none z-40';
            confetti.style.cssText = `
                width: 10px; 
                height: 10px; 
                background: ${['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'][Math.floor(Math.random() * 5)]};
                top: 50%;
                left: 50%;
                border-radius: 50%;
                animation: confetti-fall 3s ease-out forwards;
                transform: translate(-50%, -50%) rotate(${Math.random() * 360}deg);
            `;
            
            // Add random animation delay
            confetti.style.animationDelay = Math.random() * 1000 + 'ms';
            
            document.body.appendChild(confetti);
            
            // Remove after animation
            setTimeout(() => confetti.remove(), 3500);
        }
    }

    /**
     * Hide all ads when premium is active
     */
    hideAllAds() {
        console.log('Hiding all ads due to premium status...');
        
        // Hide banner ads
        const bannerContainer = document.getElementById('bannerAdContainer');
        if (bannerContainer) {
            bannerContainer.style.display = 'none';
            console.log('✅ Banner ads hidden');
        }
        
        // Hide interstitial ad modal
        const interstitialModal = document.getElementById('interstitialAdModal');
        if (interstitialModal) {
            interstitialModal.style.display = 'none';
            console.log('✅ Interstitial ads hidden');
        }
        
        // Hide specific ad containers (be more specific to avoid hiding game elements)
        const specificAdSelectors = [
            '.ad-container',
            '.interstitial-ad',
            '.banner-ad',
            '.rewarded-ad',
            '#googleAdContainer',
            '#mobileAdContainer',
            '.admob-ad'
        ];
        
        specificAdSelectors.forEach(selector => {
            const ads = document.querySelectorAll(selector);
            ads.forEach(ad => {
                ad.style.display = 'none';
            });
        });
        
        // Set global flag to prevent future ad displays
        this.adBlockingEnabled = true;
        
        // Clear ad rotation interval
        this.clearAdIntervals();
        
        console.log('✅ All ads hidden and ad blocking enabled');
        
        // Show premium status in UI
        this.showPremiumIndicator();
        
        // Force a re-render of the game to ensure it's still visible
        setTimeout(() => {
            if (this.render && this.gameState === 'playing') {
                console.log('🎮 Re-rendering game after ad hiding...');
                this.render();
            }
        }, 100);
    }

    /**
     * Show premium status indicator in UI
     */
    showPremiumIndicator() {
        console.log('🎖️ Showing premium status indicators...');
        
        // Add premium badge to welcome screen if visible
        const welcomeScreen = document.getElementById('welcomeScreen');
        if (welcomeScreen && getComputedStyle(welcomeScreen).display !== 'none') {
            this.addWelcomeScreenPremiumBadge();
        }
        
        // Add premium badge to top bar in game
        const topBar = document.querySelector('.game-header');
        if (topBar && !document.getElementById('premiumBadge')) {
            const badge = document.createElement('div');
            badge.id = 'premiumBadge';
            badge.className = 'premium-badge bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-3 py-1 rounded-full text-sm font-bold';
            badge.textContent = '💎 PREMIUM';
            badge.style.cssText = 'position: absolute; top: 10px; right: 10px; z-index: 1000; animation: pulse 2s infinite;';
            topBar.appendChild(badge);
            console.log('✅ Premium badge added to top bar');
        }
        
        // Update the user info to show premium status
        const userName = document.getElementById('userName');
        if (userName && userName.textContent && !userName.textContent.includes('💎')) {
            userName.textContent = userName.textContent + ' 💎';
            console.log('✅ Premium diamond added to username');
        }
    }

    /**
     * Add premium badge to welcome screen
     */
    addWelcomeScreenPremiumBadge() {
        const welcomeScreen = document.getElementById('welcomeScreen');
        if (!welcomeScreen || document.getElementById('welcomePremiumBadge')) {
            return; // Already exists or welcome screen not found
        }
        
        console.log('💎 Adding premium badge to welcome screen...');
        
        // Create premium status display
        const premiumDisplay = document.createElement('div');
        premiumDisplay.id = 'welcomePremiumBadge';
        premiumDisplay.style.cssText = `
            position: absolute;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #ffd700, #ffed4e);
            color: #1a1a1a;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: bold;
            font-size: 14px;
            box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
            animation: premiumPulse 2s ease-in-out infinite;
            z-index: 60;
            border: 2px solid #f59e0b;
        `;
        
        premiumDisplay.innerHTML = `
            <div style="display: flex; align-items: center; gap: 6px;">
                <span style="font-size: 16px;">💎</span>
                <span>PREMIUM USER</span>
            </div>
        `;
        
        // Add CSS animation if not already present
        if (!document.querySelector('#premiumAnimationStyle')) {
            const style = document.createElement('style');
            style.id = 'premiumAnimationStyle';
            style.textContent = `
                @keyframes premiumPulse {
                    0%, 100% { transform: scale(1); box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3); }
                    50% { transform: scale(1.05); box-shadow: 0 6px 20px rgba(255, 215, 0, 0.5); }
                }
            `;
            document.head.appendChild(style);
        }
        
        welcomeScreen.appendChild(premiumDisplay);
        console.log('✅ Premium badge added to welcome screen');
        
        // Get premium details and show purchase date
        if (this.googlePlayGames) {
            const premiumDetails = this.googlePlayGames.getPremiumDetails();
            if (premiumDetails && premiumDetails.purchaseDate !== 'Unknown') {
                const purchaseDate = new Date(premiumDetails.purchaseDate);
                const tooltip = document.createElement('div');
                tooltip.style.cssText = `
                    position: absolute;
                    bottom: -25px;
                    right: 0;
                    background: rgba(0, 0, 0, 0.8);
                    color: white;
                    padding: 4px 8px;
                    border-radius: 6px;
                    font-size: 11px;
                    white-space: nowrap;
                `;
                tooltip.textContent = `Since ${purchaseDate.toLocaleDateString()}`;
                premiumDisplay.appendChild(tooltip);
            }
        }
    }

    /**
     * Calculate time limit based on level difficulty
     */
    calculateTimeLimit(level) {
        // Set timer to 60 seconds (1 minute) for new levels
        return 60;
    }
    
    /**
     * Start the timer for current level
     */
    startTimer() {
        this.stopTimer(); // Clear any existing timer
        
        // Use pre-configured time limit (set in generateLevel)
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
                
                // Warning at 15 seconds (quarter of 60 seconds)
                if (this.timeLeft === 15) {
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
            console.log(`Stopping timer with ID: ${this.timerId}`);
            clearInterval(this.timerId);
            this.timerId = null;
        } else {
            console.log('No timer to stop (timerId is null)');
        }
    }

    /**
     * Resume timer without resetting time (used after ad rewards)
     */
    resumeTimer() {
        this.stopTimer(); // Clear any existing timer
        
        console.log(`Timer resumed with ${this.timeLeft} seconds remaining`);
        console.log(`Current game state: ${this.gameState}, isPaused: ${this.isPaused}`);
        
        // Update display immediately
        this.updateTimerDisplay();
        
        this.timerId = setInterval(() => {
            console.log(`Timer interval tick - gameState: ${this.gameState}, isPaused: ${this.isPaused}, timeLeft: ${this.timeLeft}`);
            
            if (this.gameState === 'playing' && !this.isPaused) {
                this.timeLeft--;
                console.log(`Timer decremented to: ${this.timeLeft}`);
                this.updateTimerDisplay();
                
                // Warning at 15 seconds (quarter of 60 seconds)
                if (this.timeLeft === 15) {
                    // Warning at 15 seconds (no sound)
                }
                
                if (this.timeLeft <= 0) {
                    console.log('Timer reached 0 - calling timeUp()');
                    this.timeUp();
                    return;
                }
            } else {
                console.log(`Timer paused or game not playing - gameState: ${this.gameState}, isPaused: ${this.isPaused}`);
            }
        }, 1000);
        
        console.log(`Timer interval started with ID: ${this.timerId}`);
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
        
        // Show the enhanced choice dialog with clear reward options
        setTimeout(() => {
            this.showEnhancedTimeUpDialog();
        }, 500);
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
        
        // Show game over modal
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
            
            // Color coding based on time left (for 60-second timer)
            if (this.timeLeft <= 15) {
                timerDisplay.style.backgroundColor = 'rgba(239, 68, 68, 0.3)'; // Red - critical
                timerDisplay.style.color = '#FEE2E2';
            } else if (this.timeLeft <= 30) {
                timerDisplay.style.backgroundColor = 'rgba(245, 158, 11, 0.3)'; // Orange - warning
                timerDisplay.style.color = '#FEF3C7';
            } else {
                timerDisplay.style.backgroundColor = ''; // Normal - no special color
                timerDisplay.style.color = '';
            }
        } else {
            console.error('Timer elements not found:', { timeLeftElement, timerDisplay });
        }
    }
    
    /**
     * Show enhanced time up dialog with clear reward options
     */
    showEnhancedTimeUpDialog() {
        // Create modal overlay
        const modalOverlay = document.createElement('div');
        modalOverlay.id = 'enhancedTimeUpModal';
        modalOverlay.className = 'fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50';
        
        // Create modal content with enhanced choice system
        modalOverlay.innerHTML = `
            <div class="bg-gradient-to-br from-red-900 via-orange-900 to-yellow-900 rounded-2xl p-8 mx-4 max-w-md w-full shadow-2xl border border-red-500/30">
                <div class="text-center">
                    <div class="text-6xl mb-4">⏰</div>
                    <h2 class="text-2xl font-bold text-white mb-2">Time's Up!</h2>
                    <p class="text-red-200 mb-6">Don't give up! Watch an ad to continue playing:</p>
                    
                    <div class="space-y-4 mb-6">
                        <div class="bg-yellow-800/40 rounded-lg p-4 border border-yellow-500/50 hover:bg-yellow-800/60 transition-colors cursor-pointer" id="skipRewardOption">
                            <div class="flex items-center justify-between">
                                <div class="text-left">
                                    <h3 class="text-lg font-semibold text-yellow-300">Skip After 15s</h3>
                                    <p class="text-yellow-100 text-sm">Skip ad early and get:</p>
                                </div>
                                <div class="text-right">
                                    <div class="text-2xl font-bold text-yellow-400">+20s</div>
                                    <div class="text-xs text-yellow-300">Quick reward</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="bg-green-800/40 rounded-lg p-4 border border-green-500/50 hover:bg-green-800/60 transition-colors cursor-pointer" id="fullRewardOption">
                            <div class="flex items-center justify-between">
                                <div class="text-left">
                                    <h3 class="text-lg font-semibold text-green-300">Watch Full Ad</h3>
                                    <p class="text-green-100 text-sm">Complete entire ad and get:</p>
                                </div>
                                <div class="text-right">
                                    <div class="text-2xl font-bold text-green-400">+30s</div>
                                    <div class="text-xs text-green-300">Maximum reward</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="text-center">
                        <button id="startAdForReward" class="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors mb-3 w-full">
                            🎬 Start Ad (Choose reward during ad)
                        </button>
                        <button id="giveUpLevel" class="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors w-full">
                            Restart Level Again !!
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Add to body
        document.body.appendChild(modalOverlay);
        
        // Add event listeners
        const startAdBtn = document.getElementById('startAdForReward');
        const giveUpBtn = document.getElementById('giveUpLevel');
        const skipOption = document.getElementById('skipRewardOption');
        const fullOption = document.getElementById('fullRewardOption');
        
        // Highlight selection on hover
        let selectedReward = 'full'; // Default to full reward
        
        skipOption.addEventListener('click', () => {
            skipOption.classList.add('ring-2', 'ring-yellow-400');
            fullOption.classList.remove('ring-2', 'ring-green-400');
            selectedReward = 'skip';
            startAdBtn.innerHTML = '🎬 Start Ad (Skip after 15s → +20s)';
        });
        
        fullOption.addEventListener('click', () => {
            fullOption.classList.add('ring-2', 'ring-green-400');
            skipOption.classList.remove('ring-2', 'ring-yellow-400');
            selectedReward = 'full';
            startAdBtn.innerHTML = '🎬 Start Ad (Watch full → +30s)';
        });
        
        // Default selection
        fullOption.classList.add('ring-2', 'ring-green-400');
        startAdBtn.innerHTML = '🎬 Start Ad (Watch full → +30s)';
        
        startAdBtn.addEventListener('click', () => {
            document.body.removeChild(modalOverlay);
            console.log(`User chose ${selectedReward} reward option`);
            // Start the enhanced ad with user's preferred reward type
            this.simulateEnhancedRewardedAd(selectedReward);
        });
        
        giveUpBtn.addEventListener('click', () => {
            document.body.removeChild(modalOverlay);
            console.log('User gave up on level');
            this.restartLevel();
        });
        
        // Close on overlay click
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                document.body.removeChild(modalOverlay);
                console.log('Enhanced time up modal closed by overlay click');
                this.restartLevel();
            }
        });
    }
    
    /**
     * Simulate enhanced rewarded ad with user's preferred reward choice
     */
    simulateEnhancedRewardedAd(preferredReward = 'full') {
        // Show a mock ad interface with enhanced UX
        const adOverlay = document.createElement('div');
        adOverlay.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50';
        
        const skipReward = 20;
        const fullReward = 30;
        const userPreferredReward = preferredReward === 'skip' ? skipReward : fullReward;
        
        adOverlay.innerHTML = `
            <div class="bg-white p-8 rounded-lg text-center max-w-sm mx-4">
                <h3 class="text-xl font-bold mb-4">🎬 Rewarded Ad</h3>
                <p class="mb-2 text-gray-600">Your choice: <strong>${preferredReward === 'skip' ? 'Skip for +20s' : 'Watch full for +30s'}</strong></p>
                <p class="mb-6 text-sm text-gray-500">You can always change your mind during the ad!</p>
                <div class="mb-4">
                    <div class="w-full bg-gray-200 rounded-full h-3">
                        <div class="bg-blue-600 h-3 rounded-full ad-progress" style="width: 0%"></div>
                    </div>
                    <p class="text-sm text-gray-500 mt-2">Ad progress: <span id="adTimer">30</span>s remaining</p>
                </div>
                
                <div class="space-y-2 mb-4">
                    <button id="skipAdEarly" class="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded w-full" disabled>
                        Skip Now → +20s (Available after 15s)
                    </button>
                    <button id="continueWatching" class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded w-full" disabled>
                        Keep Watching → +30s (Wait for completion)
                    </button>
                </div>
                
                <button id="closeAdFinal" class="bg-gray-400 text-gray-600 px-4 py-2 rounded cursor-not-allowed w-full" disabled>
                    Close Ad (Choose reward first)
                </button>
                
                <div class="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p class="text-xs text-blue-800">
                        💡 <strong>Tip:</strong> In real ads, you'll get the same clear choice between skip (+20s) and full watch (+30s)
                    </p>
                </div>
            </div>
        `;
        
        document.body.appendChild(adOverlay);
        
        // Get references to buttons
        const closeBtn = document.getElementById('closeAdFinal');
        const skipBtn = document.getElementById('skipAdEarly');
        const continueBtn = document.getElementById('continueWatching');
        
        let userMadeChoice = false;
        let chosenReward = 0;
        
        // Simulate ad timer
        let timeLeft = 30;
        const timer = setInterval(() => {
            timeLeft--;
            const timerEl = document.getElementById('adTimer');
            const progressEl = document.querySelector('.ad-progress');
            
            if (timerEl) timerEl.textContent = timeLeft;
            if (progressEl) progressEl.style.width = ((30 - timeLeft) / 30 * 100) + '%';
            
            // Enable skip button after 15 seconds
            if (timeLeft <= 15 && skipBtn && skipBtn.disabled) {
                skipBtn.disabled = false;
                skipBtn.className = 'bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded w-full cursor-pointer';
                skipBtn.textContent = 'Skip Now → +20s';
                
                skipBtn.onclick = () => {
                    if (!userMadeChoice) {
                        userMadeChoice = true;
                        chosenReward = 20;
                        clearInterval(timer);
                        
                        // Update UI to show choice made
                        skipBtn.className = 'bg-yellow-600 text-white px-4 py-2 rounded w-full';
                        skipBtn.textContent = '✓ Skipped - You get +20s';
                        continueBtn.disabled = true;
                        continueBtn.className = 'bg-gray-400 text-gray-600 px-4 py-2 rounded w-full cursor-not-allowed';
                        
                        // Enable close button
                        closeBtn.disabled = false;
                        closeBtn.className = 'bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded cursor-pointer w-full';
                        closeBtn.textContent = 'Collect Reward (+20s)';
                        closeBtn.onclick = () => {
                            adOverlay.remove();
                            this.onAdRewardEarned(chosenReward);
                        };
                    }
                };
            }
            
            // Enable continue watching button throughout
            if (continueBtn && continueBtn.disabled && timeLeft < 30) {
                continueBtn.disabled = false;
                continueBtn.className = 'bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded w-full cursor-pointer';
                continueBtn.textContent = 'Keep Watching → +30s';
                
                continueBtn.onclick = () => {
                    if (!userMadeChoice) {
                        // User chooses to continue watching
                        continueBtn.className = 'bg-green-600 text-white px-4 py-2 rounded w-full';
                        continueBtn.textContent = '✓ Watching full ad for +30s';
                        skipBtn.disabled = true;
                        skipBtn.className = 'bg-gray-400 text-gray-600 px-4 py-2 rounded w-full cursor-not-allowed';
                        skipBtn.textContent = 'Skip option disabled';
                    }
                };
            }
            
            // Auto-complete if user chose to continue watching
            if (timeLeft <= 0) {
                clearInterval(timer);
                
                if (!userMadeChoice) {
                    // User didn't make explicit choice but watched full ad
                    chosenReward = 30;
                    userMadeChoice = true;
                }
                
                if (continueBtn && !userMadeChoice) {
                    chosenReward = 30; // Default to full reward if no choice made
                }
                
                if (chosenReward === 0) {
                    chosenReward = 30; // Default full reward
                }
                
                // Update timer display to show completion
                if (timerEl) timerEl.textContent = '0';
                if (progressEl) progressEl.style.width = '100%';
                
                // Enable close button
                if (closeBtn) {
                    closeBtn.disabled = false;
                    closeBtn.className = 'bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded cursor-pointer w-full';
                    closeBtn.textContent = `Collect Reward (+${chosenReward}s)`;
                    closeBtn.onclick = () => {
                        adOverlay.remove();
                        this.onAdRewardEarned(chosenReward);
                    };
                }
                
                console.log(`Ad completed - user will receive ${chosenReward} seconds`);
            }
        }, 1000);
    }
    
    /**
     * Generate a level based on difficulty progression
     */
    generateLevel(level, startTimer = true) {
        console.log(`Generating level ${level}, startTimer: ${startTimer}`);
        
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
        
        // Set timer limit from config
        this.levelTimeLimit = config.timeLimit;
        
        // Create tubes
        for (let i = 0; i < config.totalTubes; i++) {
            this.tubes.push([]);
        }
        
        // Create a mixed puzzle instead of starting from solved state
        this.createMixedPuzzle(config);
        
        // Only start the timer if explicitly requested (i.e., when user is playing)
        if (startTimer) {
            console.log(`Starting timer with ${config.timeLimit} seconds...`);
            this.startTimer();
        } else {
            console.log('Timer not started - level generated for initialization only');
        }
        
        // Save the new level state
        this.saveGameState();
    }
    
    /**
     * Get level configuration based on progressive difficulty system (1000 levels)
     */
    getLevelConfig(level) {
        let config = {};
        
        // Define difficulty tiers based on your specifications
        if (level >= 1 && level <= 20) {
            // Very Easy (1-20): 5 tubes, 1 minute
            config = {
                difficultyName: "Very Easy",
                colors: 3, // 3 colors, 2 empty tubes = 5 total
                ballsPerColor: 4,
                totalTubes: 5,
                filledTubes: 3,
                emptyTubes: 2,
                timeLimit: 60 // 1 minute
            };
        } else if (level >= 21 && level <= 40) {
            // Easy (21-40): 6 tubes, 1 minute 10 seconds
            config = {
                difficultyName: "Easy",
                colors: 4, // 4 colors, 2 empty tubes = 6 total
                ballsPerColor: 4,
                totalTubes: 6,
                filledTubes: 4,
                emptyTubes: 2,
                timeLimit: 70 // 1 minute 10 seconds
            };
        } else if (level >= 41 && level <= 60) {
            // Normal (41-60): 7 tubes, 1 minute 20 seconds
            config = {
                difficultyName: "Normal",
                colors: 4, // 4 colors, 3 empty tubes = 7 total
                ballsPerColor: 4,
                totalTubes: 7,
                filledTubes: 4,
                emptyTubes: 3,
                timeLimit: 80 // 1 minute 20 seconds
            };
        } else if (level >= 61 && level <= 100) {
            // Normal to Bit Hard (61-100): 8 tubes, 1 minute 30 seconds
            config = {
                difficultyName: "Normal to Bit Hard",
                colors: 5, // 5 colors, 3 empty tubes = 8 total
                ballsPerColor: 4,
                totalTubes: 8,
                filledTubes: 5,
                emptyTubes: 3,
                timeLimit: 90 // 1 minute 30 seconds
            };
        } else if (level >= 101 && level <= 150) {
            // Hard (101-150): 9 tubes, 2 minutes
            config = {
                difficultyName: "Hard",
                colors: 6, // 6 colors, 3 empty tubes = 9 total
                ballsPerColor: 4,
                totalTubes: 9,
                filledTubes: 6,
                emptyTubes: 3,
                timeLimit: 120 // 2 minutes
            };
        } else if (level >= 151 && level <= 200) {
            // Hard to Very Hard (151-200): 10 tubes, 2 minutes
            config = {
                difficultyName: "Hard to Very Hard",
                colors: 7, // 7 colors, 3 empty tubes = 10 total
                ballsPerColor: 4,
                totalTubes: 10,
                filledTubes: 7,
                emptyTubes: 3,
                timeLimit: 120 // 2 minutes
            };
        } else if (level >= 201 && level <= 1000) {
            // Extended Hard to Very Hard (201-1000): Progressive difficulty with 3 minutes
            // Gradually increase complexity from 201 to 1000
            const progressInRange = (level - 201) / (1000 - 201); // 0 to 1
            const baseColors = 7;
            const maxColors = 12; // Maximum colors for highest difficulty
            const colors = Math.min(maxColors, baseColors + Math.floor(progressInRange * 5));
            
            config = {
                difficultyName: "Hard to Very Hard",
                colors: colors,
                ballsPerColor: 4,
                totalTubes: colors + 3, // Always 3 empty tubes for strategy
                filledTubes: colors,
                emptyTubes: 3,
                timeLimit: 180 // 3 minutes for all extended levels
            };
        } else {
            // Endless mode for levels beyond 1000 (if ever needed)
            config = {
                difficultyName: "Extreme Challenge",
                colors: 12,
                ballsPerColor: 4,
                totalTubes: 16,
                filledTubes: 12,
                emptyTubes: 4,
                timeLimit: 180 // 3 minutes (updated from 4 minutes)
            };
        }
        
        // Add some variation within each tier for more interesting gameplay
        const tierVariation = this.getTierVariation(level, config);
        
        return {
            ...config,
            ...tierVariation,
            level: level
        };
    }
    
    /**
     * Add subtle variations within each difficulty tier
     */
    getTierVariation(level, baseConfig) {
        const variation = {};
        
        // Add complexity variations within tiers
        const tierProgress = this.getTierProgress(level);
        
        // Slightly increase colors in later levels of each tier (except very easy)
        if (tierProgress > 0.7 && baseConfig.colors < 7 && level > 20) {
            variation.colors = baseConfig.colors + 1;
            variation.totalTubes = baseConfig.totalTubes + 1;
            variation.filledTubes = baseConfig.filledTubes + 1;
        }
        
        // Reduce empty tubes in harder variations (but keep minimum of 2)
        if (tierProgress > 0.8 && baseConfig.emptyTubes > 2 && level > 40) {
            variation.emptyTubes = Math.max(2, baseConfig.emptyTubes - 1);
            variation.totalTubes = baseConfig.totalTubes - 1;
        }
        
        return variation;
    }
    
    /**
     * Get progress within current difficulty tier (0.0 to 1.0)
     */
    getTierProgress(level) {
        if (level <= 20) return (level - 1) / 19;
        if (level <= 40) return (level - 21) / 19;
        if (level <= 60) return (level - 41) / 19;
        if (level <= 100) return (level - 61) / 39;
        if (level <= 150) return (level - 101) / 49;
        if (level <= 200) return (level - 151) / 49;
        if (level <= 1000) return (level - 201) / 799; // Extended range progression
        return 1.0;
    }
    
    /**
     * Create a mixed puzzle that's definitely not solved
     * Enhanced with ball expressions
     */
    createMixedPuzzle(config) {
        // Create all balls with expressions
        let allBalls = [];
        for (let color = 0; color < config.colors; color++) {
            for (let i = 0; i < config.ballsPerColor; i++) {
                // Create ball object with color and expression
                const ballObject = this.expressionSystem.convertBallToObject(color, this.currentLevel);
                allBalls.push(ballObject);
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
                let firstColor = this.expressionSystem.getBallColor(this.tubes[tubeIndex][0]);
                if (this.tubes[tubeIndex].every(ball => this.expressionSystem.getBallColor(ball) === firstColor)) {
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
                let firstColor = this.expressionSystem.getBallColor(this.tubes[i][0]);
                if (this.tubes[i].every(ball => this.expressionSystem.getBallColor(ball) === firstColor)) {
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
        this.canvas.addEventListener('click', (e) => {
            this.handleCanvasClick(e);
        });
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        
        // Touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault(); // Prevent scrolling, zooming, etc.
            const touch = e.touches[0];
            this.handleCanvasClick(touch); // Treat touch as click
        });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault(); // Prevent scrolling
        });
        
        // UI button events
        document.getElementById('undoBtn').addEventListener('click', () => {
            this.undoMove();
        });
        document.getElementById('hintBtn').addEventListener('click', () => {
            this.showHint();
        });
        document.getElementById('shuffleBtn').addEventListener('click', () => {
            this.shuffleBalls();
        });
        document.getElementById('soundToggle').addEventListener('click', () => {
            this.toggleSound();
        });
        document.getElementById('testSoundBtn').addEventListener('click', () => {
            this.playSound('select');
        });
        document.getElementById('resetProgressBtn').addEventListener('click', () => {
            if (confirm('🔄 Reset all progress and start from Level 1?\n\nThis will clear all saved data and you will lose your current progress.')) {
                this.clearAllProgressData();
                alert('✅ Progress reset! Starting fresh from Level 1.');
            }
        });
        
        // Google Play Games buttons
        document.getElementById('leaderboardBtn').addEventListener('click', () => {
            if (this.googlePlayGames) {
                this.googlePlayGames.showLeaderboard();
            }
        });

        // Google sign-in button
        document.getElementById('googleSignInBtn').addEventListener('click', async () => {
            if (this.googlePlayGames) {
                console.log('🔑 Attempting Google Play Games sign-in...');
                const success = await this.googlePlayGames.signIn();
                if (success) {
                    this.updateUserUI();
                    console.log('✅ Sign-in successful');
                    // Sync current progress to leaderboard after sign-in
                    setTimeout(() => this.syncProgressToLeaderboard(), 1000);
                } else {
                    console.log('❌ Sign-in failed');
                }
            }
        });

        // Google sign-out button  
        document.getElementById('googleSignOutBtn').addEventListener('click', async () => {
            if (this.googlePlayGames) {
                console.log('🚪 Signing out of Google Play Games...');
                await this.googlePlayGames.signOut();
                this.updateUserUI();
                console.log('✅ Signed out successfully');
            }
        });
        
        // Modal events
        document.getElementById('nextLevelBtn').addEventListener('click', () => {
            this.nextLevel();
        });
        document.getElementById('replayBtn').addEventListener('click', () => {
            this.restartLevel();
        });
        document.getElementById('resumeBtn').addEventListener('click', () => {
            this.resumeGame();
        });
        document.getElementById('mainMenuBtn').addEventListener('click', () => {
            this.goToMainMenu();
        });
        document.getElementById('retryLevelBtn').addEventListener('click', () => {
            this.restartLevel();
        });
        document.getElementById('watchAdBtn').addEventListener('click', () => {
            // Hide the time up modal first
            this.hideModals();
            // Then show the rewarded ad
            this.showRewardedAd();
        });
        document.getElementById('closeInterstitialAd').addEventListener('click', () => {
            this.closeInterstitialAd();
        });
        
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            this.handleKeyPress(e);
        });
        
        // Window events
        window.addEventListener('beforeunload', () => this.saveGameState());
        window.addEventListener('load', () => this.loadGameState());
    }
    
    /**
     * Handle canvas click events for tube selection and ball movement
     */
    handleCanvasClick(e) {
        if (this.isPaused || this.animatingBall) {
            return;
        }
        
        const rect = this.canvas.getBoundingClientRect();
        
        // Calculate scaled coordinates to account for CSS scaling
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;
        
        console.log(`Touch at: (${e.clientX - rect.left}, ${e.clientY - rect.top}) -> Scaled: (${x}, ${y}), Canvas: ${this.canvas.width}x${this.canvas.height}, Display: ${rect.width}x${rect.height}`);
        
        // Visual debug - draw a small circle where user clicked
        this.drawTouchDebug(x, y);
        
        const tubeIndex = this.getTubeAtPosition(x, y);
        
        if (tubeIndex !== -1) {
            if (this.selectedTube === -1) {
                // Select tube if it has balls
                if (this.tubes[tubeIndex].length > 0) {
                    this.selectedTube = tubeIndex;
                    this.playSound('select'); // Click sound for selection
                } else {
                    this.playSound('pop'); // Different sound for empty tube click
                }
            } else {
                // Try to move ball
                if (tubeIndex === this.selectedTube) {
                    // Deselect same tube
                    this.selectedTube = -1;
                    this.playSound('pop'); // Deselect sound
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
            this.playSound('pop'); // Deselect sound
        }
    }
    
    /**
     * Handle mouse movement for hover effects
     */
    handleMouseMove(e) {
        if (this.isPaused) return;
        
        const rect = this.canvas.getBoundingClientRect();
        
        // Calculate scaled coordinates to account for CSS scaling
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;
        
        const tubeIndex = this.getTubeAtPosition(x, y);
        this.canvas.style.cursor = tubeIndex !== -1 ? 'pointer' : 'default';
    }
    
    /**
     * Get tube index at given position
     */
    getTubeAtPosition(x, y) {
        const startX = (this.canvas.width - (this.tubes.length * (this.tubeWidth + 20) - 20)) / 2;
        const tubeY = this.canvas.height - this.tubeHeight - 50;
        
        console.log(`Looking for tube at (${x}, ${y}). StartX: ${startX}, TubeY: ${tubeY}, TubeWidth: ${this.tubeWidth}, TubeHeight: ${this.tubeHeight}`);
        
        for (let i = 0; i < this.tubes.length; i++) {
            const tubeX = startX + i * (this.tubeWidth + 20);
            
            console.log(`Tube ${i}: X=${tubeX}-${tubeX + this.tubeWidth}, Y=${tubeY}-${tubeY + this.tubeHeight}`);
            
            if (x >= tubeX && x <= tubeX + this.tubeWidth &&
                y >= tubeY && y <= tubeY + this.tubeHeight) {
                console.log(`Found tube ${i}!`);
                return i;
            }
        }
        
        console.log('No tube found at position');
        return -1;
    }
    
    /**
     * Check if a move from one tube to another is valid
     * Updated to work with ball expressions
     */
    isValidMove(fromTube, toTube) {
        if (fromTube === toTube) return false;
        if (this.tubes[fromTube].length === 0) return false;
        if (this.tubes[toTube].length >= this.maxBallsPerTube) return false;
        
        const fromBall = this.tubes[fromTube][this.tubes[fromTube].length - 1];
        
        if (this.tubes[toTube].length === 0) return true;
        
        const toBall = this.tubes[toTube][this.tubes[toTube].length - 1];
        
        // Compare colors using expression system
        const fromColor = this.expressionSystem.getBallColor(fromBall);
        const toColor = this.expressionSystem.getBallColor(toBall);
        
        return fromColor === toColor;
    }
    
    /**
     * Count consecutive same-colored balls from the top of a tube
     * Updated to work with ball expressions
     */
    countConsecutiveBalls(tubeIndex) {
        const tube = this.tubes[tubeIndex];
        if (tube.length === 0) return 0;
        
        const topBallColor = this.expressionSystem.getBallColor(tube[tube.length - 1]);
        let count = 0;
        
        // Count from the top going down
        for (let i = tube.length - 1; i >= 0; i--) {
            if (this.expressionSystem.getBallColor(tube[i]) === topBallColor) {
                count++;
            } else {
                break;
            }
        }
        
        return count;
    }
    
    /**
     * Check if multiple balls can be moved from one tube to another
     */
    canMoveMultipleBalls(fromTube, toTube, ballCount) {
        if (!this.isValidMove(fromTube, toTube)) return false;
        
        // Check if destination tube has enough space
        const availableSpace = this.maxBallsPerTube - this.tubes[toTube].length;
        return ballCount <= availableSpace;
    }
    
    /**
     * Enhanced move ball functionality with multi-ball transfer support
     */
    moveBall(fromTube, toTube, recordMove = true) {
        if (!this.isValidMove(fromTube, toTube)) {
            this.addHapticFeedback('medium'); // Error feedback
            return false;
        }
        
        // Count consecutive same-colored balls that can be moved
        const consecutiveBallCount = this.countConsecutiveBalls(fromTube);
        
        // Determine how many balls can actually be moved
        const availableSpace = this.maxBallsPerTube - this.tubes[toTube].length;
        const ballsToMove = Math.min(consecutiveBallCount, availableSpace);
        
        if (ballsToMove === 0) {
            this.addHapticFeedback('medium'); // Error feedback
            return false;
        }
        
        this.addHapticFeedback('light'); // Success feedback
        
        // Handle single ball move (existing functionality)
        if (ballsToMove === 1) {
            const ball = this.tubes[fromTube].pop();
            
            // Record move for undo
            if (recordMove) {
                this.moveHistory.push({ 
                    from: fromTube, 
                    to: toTube, 
                    ball: ball,
                    ballCount: 1
                });
                this.moves++;
            }
            
            // Start single ball animation
            this.animatingBall = {
                ball: ball,
                fromTube: fromTube,
                toTube: toTube,
                progress: 0,
                emergenceParticlesAdded: false,
                entryParticlesAdded: false,
                isMultiBall: false,
                ballCount: 1
            };
            
            this.playSound('transfer');
            this.updateUI();
            this.saveGameState();
            
            return true;
        }
        
        // Handle multiple balls move (new functionality)
        else {
            const ballsBeingMoved = [];
            
            // Remove balls from source tube (from top to bottom)
            for (let i = 0; i < ballsToMove; i++) {
                ballsBeingMoved.unshift(this.tubes[fromTube].pop());
            }
            
            // Record move for undo
            if (recordMove) {
                this.moveHistory.push({ 
                    from: fromTube, 
                    to: toTube, 
                    balls: ballsBeingMoved,
                    ballCount: ballsToMove
                });
                this.moves++;
            }
            
            // Start multi-ball animation with the top ball as representative
            this.animatingBall = {
                ball: ballsBeingMoved[0], // Top ball as visual representative
                ballsBeingMoved: ballsBeingMoved,
                fromTube: fromTube,
                toTube: toTube,
                progress: 0,
                emergenceParticlesAdded: false,
                entryParticlesAdded: false,
                isMultiBall: true,
                ballCount: ballsToMove
            };
            
            this.playSound('transfer');
            this.updateUI();
            this.saveGameState();
            
            return true;
        }
    }
    
    /**
     * Complete ball animation and check for level completion - Enhanced for multi-ball support
     */
    completeBallAnimation() {
        if (!this.animatingBall) return;
        
        console.log("Completing ball animation...");
        
        // Handle single ball animation (existing functionality)
        if (!this.animatingBall.isMultiBall) {
            this.tubes[this.animatingBall.toTube].push(this.animatingBall.ball);
        }
        // Handle multi-ball animation (new functionality)
        else {
            // Add all balls to destination tube in correct order
            for (let ball of this.animatingBall.ballsBeingMoved) {
                this.tubes[this.animatingBall.toTube].push(ball);
            }
            console.log(`Completed multi-ball transfer: ${this.animatingBall.ballCount} balls moved`);
        }
        
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
     * Updated to work with ball expressions
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
            const firstBallColor = this.expressionSystem.getBallColor(tube[0]);
            for (let ball of tube) {
                if (this.expressionSystem.getBallColor(ball) !== firstBallColor) {
                    console.log(`Mixed colors in tube: ${JSON.stringify(tube)}`);
                    return false;
                }
            }
            
            // Count this color
            colorCounts[firstBallColor] += tube.length;
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
        this.addHapticFeedback('heavy'); // Victory feedback
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
        
        // Submit score to Google Play Games leaderboard
        this.submitScoreToLeaderboard(this.currentLevel, this.moves, totalTimeSpent);
        
        // Update victory modal with enhanced information
        this.updateVictoryModal(totalTimeSpent);
        
        // Notify AdMob Manager about level completion
        this.onLevelCompleted();
        
        console.log("📊 About to handle post-level completion...");
        console.log("Current game state:", this.gameState);
        console.log("isPremium:", this.isPremium);
        console.log("adBlockingEnabled:", this.adBlockingEnabled);
        
        // Show interstitial ad or victory modal based on premium status
        setTimeout(() => {
            if (this.isPremium) {
                console.log("🎯 Premium user - showing victory modal directly!");
                this.showVictoryModalDirectly();
            } else {
                console.log("📺 Regular user - showing interstitial ad first!");
                this.showInterstitialAd();
            }
        }, 1000);
        
        this.saveGameState();
    }
    
    /**
     * Update victory modal with enhanced 1000-level progress information
     */
    updateVictoryModal(timeSpent) {
        const config = this.getLevelConfig(this.currentLevel);
        
        // Update level info
        document.getElementById('completedLevel').textContent = this.currentLevel;
        document.getElementById('finalMoves').textContent = this.moves;
        
        // Format time spent
        const minutes = Math.floor(timeSpent / 60);
        const seconds = timeSpent % 60;
        document.getElementById('finalTime').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        // Update difficulty display with color coding
        const difficultyElement = document.getElementById('completedDifficulty');
        if (difficultyElement) {
            difficultyElement.textContent = config.difficultyName;
            
            const difficultyColors = {
                'Very Easy': 'from-green-400 to-green-600',
                'Easy': 'from-blue-400 to-blue-600', 
                'Normal': 'from-yellow-400 to-yellow-600',
                'Normal to Bit Hard': 'from-orange-400 to-orange-600',
                'Hard': 'from-red-400 to-red-600',
                'Hard to Very Hard': 'from-purple-400 to-purple-600',
                'Extreme Challenge': 'from-pink-400 to-pink-600'
            };
            
            const colorClass = difficultyColors[config.difficultyName] || 'from-gray-400 to-gray-600';
            difficultyElement.className = `inline-block bg-gradient-to-r ${colorClass} text-white px-4 py-2 rounded-full text-sm font-semibold`;
        }
        
        // Update progress information
        const progressPercent = (this.currentLevel / 1000) * 100;
        document.getElementById('progressText').textContent = `Progress: ${this.currentLevel}/1000 levels (${progressPercent.toFixed(1)}%)`;
        document.getElementById('progressBar').style.width = `${progressPercent}%`;
        
        // Special milestone messages
        const specialMessageElement = document.getElementById('specialMessage');
        let specialMessage = '';
        
        if (this.currentLevel === 20) {
            specialMessage = '🎊 Congratulations! You\'ve mastered "Very Easy" difficulty! 🎊';
        } else if (this.currentLevel === 40) {
            specialMessage = '🌟 Amazing! You\'ve conquered "Easy" levels! Moving to Normal! 🌟';
        } else if (this.currentLevel === 60) {
            specialMessage = '🔥 Impressive! "Normal" difficulty completed! Getting harder now! 🔥';
        } else if (this.currentLevel === 100) {
            specialMessage = '💪 First Century! 100 levels down, 900 to go! You\'re unstoppable! 💪';
        } else if (this.currentLevel === 150) {
            specialMessage = '🏆 Master Player! 150 levels conquered! The journey continues! 🏆';
        } else if (this.currentLevel === 200) {
            specialMessage = '🌟 Original Master! You\'ve completed the first 200 levels! 800 more await! 🌟';
        } else if (this.currentLevel === 300) {
            specialMessage = '🚀 Triple Century! 300 levels mastered! You\'re a legend! 🚀';
        } else if (this.currentLevel === 500) {
            specialMessage = '💎 Half-Millennium Hero! 500 levels completed! Incredible dedication! 💎';
        } else if (this.currentLevel === 750) {
            specialMessage = '⚡ Three-Quarter Champion! Only 250 levels remain! You\'re phenomenal! ⚡';
        } else if (this.currentLevel === 1000) {
            specialMessage = '👑 ULTIMATE LEGEND! You\'ve conquered all 1000 levels! ABSOLUTE MASTER! 👑';
        } else if (this.currentLevel % 100 === 0) {
            specialMessage = `🎯 Century Milestone! ${this.currentLevel} levels conquered! Amazing! 🎯`;
        } else if (this.currentLevel % 50 === 0) {
            specialMessage = `🎉 Half-Century Achievement! ${this.currentLevel} levels completed! �`;
        }
        
        if (specialMessage) {
            specialMessageElement.textContent = specialMessage;
            specialMessageElement.classList.remove('hidden');
        } else {
            specialMessageElement.classList.add('hidden');
        }
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
     * Undo the last move - Enhanced for multi-ball support
     */
    undoMove() {
        if (this.moveHistory.length === 0 || this.animatingBall) return;
        
        const lastMove = this.moveHistory.pop();
        
        // Handle single ball undo (existing functionality)
        if (lastMove.ballCount === 1) {
            const ball = this.tubes[lastMove.to].pop();
            this.tubes[lastMove.from].push(ball);
        }
        // Handle multi-ball undo (new functionality)
        else {
            // Remove balls from destination tube (in reverse order)
            const ballsToUndo = [];
            for (let i = 0; i < lastMove.ballCount; i++) {
                ballsToUndo.unshift(this.tubes[lastMove.to].pop());
            }
            
            // Add balls back to source tube (in correct order)
            for (let ball of ballsToUndo) {
                this.tubes[lastMove.from].push(ball);
            }
            
            console.log(`Undid multi-ball move: ${lastMove.ballCount} balls restored`);
        }
        
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
        // Stop any existing timer
        this.stopTimer();
        
        // Reset game state
        this.gameState = 'playing';
        this.moves = 0;
        this.selectedTube = -1;
        this.animatingBall = null;
        this.animationProgress = 0;
        
        // Reset level start time for tracking
        this.levelStartTime = Date.now();
        
        // Regenerate the current level
        this.generateLevel(this.currentLevel);
        
        // Start timer for the level
        this.startTimer();
        
        // Update UI and hide modals
        this.updateUI();
        this.hideModals();
        
        console.log(`🔄 Level ${this.currentLevel} restarted with ${this.levelTimeLimit}s timer`);
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
     * Update UI elements with enhanced difficulty system
     */
    updateUI() {
        // Update level display with progress
        document.getElementById('levelDisplay').textContent = `${this.currentLevel}/1000`;
        document.getElementById('moveCounter').textContent = this.moves;
        
        // Update difficulty display with color coding
        const config = this.getLevelConfig(this.currentLevel);
        const difficultyElement = document.getElementById('difficultyDisplay');
        if (difficultyElement) {
            difficultyElement.textContent = config.difficultyName;
            
            // Color code difficulty levels
            const difficultyColors = {
                'Very Easy': 'from-green-400 to-green-600',
                'Easy': 'from-blue-400 to-blue-600',
                'Normal': 'from-yellow-400 to-yellow-600',
                'Normal to Bit Hard': 'from-orange-400 to-orange-600',
                'Hard': 'from-red-400 to-red-600',
                'Hard to Very Hard': 'from-purple-400 to-purple-600',
                'Extreme Challenge': 'from-pink-400 to-pink-600'
            };
            
            const colorClass = difficultyColors[config.difficultyName] || 'from-gray-400 to-gray-600';
            difficultyElement.className = `bg-gradient-to-r ${colorClass} px-3 py-1 rounded-lg text-sm font-semibold text-white`;
        }
        
        // Update timer display format
        const timeLeft = Math.max(0, this.timeLeft);
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        document.getElementById('timeLeft').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        // Update button states
        document.getElementById('undoBtn').disabled = this.moveHistory.length === 0;
        document.getElementById('hintBtn').disabled = this.hintsUsed >= this.maxHints;
        document.getElementById('shuffleBtn').disabled = this.shufflesUsed >= this.maxShuffles;
        
        // Update button text to show remaining uses
        document.getElementById('hintBtn').textContent = `Hint (${this.maxHints - this.hintsUsed})`;
        document.getElementById('shuffleBtn').textContent = `Shuffle (${this.maxShuffles - this.shufflesUsed})`;
    }
    
    /**
     * Load audio files from the audio folder
     */
    loadAudioFiles() {
        const soundFiles = {
            select: '../audio/select.mp3',
            pop: '../audio/select.mp3', // Use select.mp3 as fallback for pop
            transfer: '../audio/transfer.mp3',
            error: '../audio/error.mp3',
            warning: '../audio/error.mp3', // Use error.mp3 as fallback for warning
            victory: '../audio/victory.mp3',
            congratulations: '../audio/congratulations.mp3'
        };
        
        // Preload audio files
        for (const [soundName, filePath] of Object.entries(soundFiles)) {
            try {
                const audio = new Audio();
                audio.preload = 'auto';
                audio.src = filePath;
                audio.volume = 0.5; // Set default volume
                
                // Handle loading errors gracefully
                audio.addEventListener('error', () => {
                    console.warn(`Could not load sound file: ${filePath} - audio disabled for ${soundName}`);
                    // Set a flag to indicate this sound is not available
                    this.audioFiles[soundName] = null;
                });
                
                // Only add to audioFiles if successfully created
                audio.addEventListener('canplaythrough', () => {
                    console.log(`✅ Audio loaded successfully: ${soundName}`);
                });
                
                this.audioFiles[soundName] = audio;
            } catch (e) {
                console.warn(`Failed to create audio for ${soundName}:`, e);
                this.audioFiles[soundName] = null;
            }
        }
        
        console.log('Audio files loaded:', Object.keys(this.audioFiles));
    }
    
    /**
     * Play a sound effect
     */
    playSound(soundName) {
        if (!this.soundEnabled) {
            return;
        }
        
        const audio = this.audioFiles[soundName];
        if (audio && audio !== null) {
            try {
                // Reset the audio to the beginning
                audio.currentTime = 0;
                audio.play().catch(e => {
                    console.warn(`Failed to play sound ${soundName}:`, e);
                });
            } catch (e) {
                console.warn(`Error playing sound ${soundName}:`, e);
            }
        } else {
            console.warn(`Sound ${soundName} not available (file missing or failed to load)`);
        }
    }
    
    /**
     * Toggle sound on/off
     */
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        this.updateSoundButton();
        console.log(`Sound ${this.soundEnabled ? 'enabled' : 'disabled'}`);
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
     * Initialize Google Play Games Services
     */
    async initializeGooglePlayGames() {
        console.log('🎮 Initializing Google Play Games integration...');
        
        try {
            this.googlePlayGames = new GooglePlayGamesManager();
            
            // Set up event handlers
            this.googlePlayGames.onAuthSuccess = () => {
                console.log('✅ Google Play Games authentication successful');
                this.updateUserUI();
                this.loadCloudProgress();
                // Sync current progress to leaderboard
                setTimeout(() => this.syncProgressToLeaderboard(), 2000);
            };
            
            this.googlePlayGames.onAuthFailure = (error) => {
                console.log('❌ Google Play Games authentication failed:', error);
                // Continue with local play
                this.loadLocalProgress();
            };
            
            // Wait a moment for initialization
            setTimeout(() => {
                // Load premium status first
                this.loadPremiumStatus();
                
                if (this.googlePlayGames.isAuthenticated) {
                    this.loadCloudProgress();
                } else {
                    this.loadLocalProgress();
                }
                
                // Update UI to show current authentication status and premium status
                this.updateUserUI();
                this.updatePremiumUI();
                
                // Sync current progress to leaderboard after initialization
                setTimeout(() => this.syncProgressToLeaderboard(), 1000);
            }, 1000);
            
        } catch (error) {
            console.error('Failed to initialize Google Play Games:', error);
            this.loadLocalProgress();
            this.updateUserUI(); // Update UI even if initialization fails
        }
    }

    /**
     * Load progress from cloud save
     */
    async loadCloudProgress() {
        console.log('☁️ Loading progress from cloud...');
        
        try {
            const cloudData = await this.googlePlayGames.loadFromCloud();
            
            if (cloudData && cloudData.currentLevel) {
                console.log('✅ Cloud progress found:', cloudData);
                
                // Restore from cloud
                this.currentLevel = Math.min(cloudData.currentLevel, this.maxLevel);
                this.maxLevelReached = Math.min(cloudData.maxLevelReached || cloudData.currentLevel, this.maxLevel);
                
                // Update progress manager
                if (this.progressManager) {
                    this.progressManager.userData.maxLevelReached = this.maxLevelReached;
                }
                
                console.log(`🎮 Progress restored: Level ${this.currentLevel}, Max: ${this.maxLevelReached}`);
            } else {
                console.log('ℹ️ No cloud progress found, starting fresh');
                this.loadLocalProgress();
            }
        } catch (error) {
            console.error('❌ Failed to load cloud progress:', error);
            this.loadLocalProgress();
        }
        
        // Generate the current level
        this.generateLevel(this.currentLevel, false);
        this.updateUI();
    }

    /**
     * Load progress from local storage (fallback)
     */
    loadLocalProgress() {
        console.log('💾 Loading local progress...');
        
        // Load from localStorage or start fresh
        const savedProgress = localStorage.getItem('ballSortProgress');
        if (savedProgress) {
            try {
                const progress = JSON.parse(savedProgress);
                this.currentLevel = Math.min(progress.currentLevel || 1, this.maxLevel);
                this.maxLevelReached = Math.min(progress.maxLevelReached || 1, this.maxLevel);
                
                console.log(`📱 Local progress loaded: Level ${this.currentLevel}, Max: ${this.maxLevelReached}`);
            } catch (error) {
                console.error('Failed to parse local progress:', error);
                this.resetToLevel1();
            }
        } else {
            console.log('ℹ️ No local progress found, starting from Level 1');
            this.resetToLevel1();
        }
        
        // Generate the current level
        this.generateLevel(this.currentLevel, false);
        this.updateUI();
    }

    /**
     * Reset to Level 1 (for new players)
     */
    resetToLevel1() {
        this.currentLevel = 1;
        this.maxLevelReached = 1;
    }

    /**
     * Save progress to both cloud and local storage
     */
    async saveProgress() {
        const progressData = {
            currentLevel: this.currentLevel,
            maxLevelReached: this.maxLevelReached,
            lastSaved: Date.now(),
            gameVersion: '2.0'
        };
        
        // Save locally
        localStorage.setItem('ballSortProgress', JSON.stringify(progressData));
        
        // Save to cloud if authenticated
        if (this.googlePlayGames && this.googlePlayGames.isAuthenticated) {
            await this.googlePlayGames.saveToCloud(progressData);
        }
        
        console.log('💾 Progress saved:', progressData);
    }

    /**
     * Update user interface with Google Play Games info
     */
    updateUserUI() {
        const signInBtn = document.getElementById('googleSignInBtn');
        const signOutBtn = document.getElementById('googleSignOutBtn');
        const userName = document.getElementById('userName');
        const authStatus = document.getElementById('authStatus');
        
        if (this.googlePlayGames && this.googlePlayGames.isSignedIn() && this.googlePlayGames.playerInfo) {
            // User is signed in - show user info and sign out button
            if (userName && authStatus) {
                userName.textContent = `👤 ${this.googlePlayGames.playerInfo.displayName}`;
                userName.classList.remove('hidden');
                authStatus.textContent = 'Signed In';
                authStatus.className = 'bg-green-500/70 px-2 py-1 rounded text-xs text-white';
            }
            
            if (signInBtn && signOutBtn) {
                signInBtn.classList.add('hidden');
                signOutBtn.classList.remove('hidden');
            }
        } else {
            // User is not signed in - show sign in button
            if (userName && authStatus) {
                userName.classList.add('hidden');
                authStatus.textContent = 'Not Signed In';
                authStatus.className = 'bg-gray-500/70 px-2 py-1 rounded text-xs text-white';
            }
            
            if (signInBtn && signOutBtn) {
                signInBtn.classList.remove('hidden');
                signOutBtn.classList.add('hidden');
            }
        }
    }

    /**
     * Submit score to Google Play Games leaderboard
     */
    async submitScoreToLeaderboard(level, moves, timeSpent) {
        if (!this.googlePlayGames) {
            console.log('Google Play Games not initialized for score submission');
            return;
        }

        try {
            // Submit the highest level reached (max of current level + 1 or existing max)
            const maxLevelReached = Math.max(this.maxLevelReached || 1, level + 1);
            const levelToSubmit = level; // Submit the level just completed
            
            console.log(`🏆 Submitting completed level ${levelToSubmit} to leaderboard (Max reached: ${maxLevelReached})`);
            
            // Submit the level number directly to the leaderboard
            if (this.googlePlayGames.isSignedIn()) {
                await this.googlePlayGames.submitScore(levelToSubmit);
                console.log(`✅ Score submitted to authenticated leaderboard`);
            } else {
                // For web testing - still update local leaderboard even if not signed in
                console.log(`⚠️ Not signed in - updating local leaderboard for testing`);
                await this.googlePlayGames.submitScore(levelToSubmit);
            }
            
            // Optional: Log detailed performance stats for analytics (not sent to leaderboard)
            const config = this.getLevelConfig(level);
            const optimalMoves = Math.floor(config.colors * config.ballsPerColor * 1.2);
            const movesEfficiency = Math.max(0, Math.min(1, optimalMoves / moves));
            const timeRemaining = Math.max(0, this.levelTimeLimit - timeSpent);
            const timeEfficiency = timeRemaining / this.levelTimeLimit;
            
            console.log(`📊 Level ${level} performance: ${moves} moves (efficiency: ${(movesEfficiency * 100).toFixed(1)}%), ${timeSpent}s (efficiency: ${(timeEfficiency * 100).toFixed(1)}%)`);
            
        } catch (error) {
            console.error('Failed to submit score to leaderboard:', error);
        }
    }

    /**
     * Sync current progress to leaderboard (fix for leaderboard being out of sync)
     */
    async syncProgressToLeaderboard() {
        if (!this.googlePlayGames) {
            console.log('Google Play Games not available for progress sync');
            return;
        }

        try {
            // Submit the user's current maximum level reached
            const currentMaxLevel = this.maxLevelReached || this.currentLevel;
            console.log(`🔄 Syncing current progress to leaderboard: Level ${currentMaxLevel}`);
            
            // Force update the leaderboard with current progress
            if (this.googlePlayGames.playerInfo) {
                await this.googlePlayGames.submitScore(currentMaxLevel);
                console.log(`✅ Progress synced: Level ${currentMaxLevel} submitted to leaderboard`);
            } else {
                console.log('⚠️ No player info available for sync');
            }
        } catch (error) {
            console.error('Failed to sync progress to leaderboard:', error);
        }
    }

    /**
     * Clear all saved user progress data and reset to Level 1
     */
    clearAllProgressData() {
        console.log('🔄 Clearing all saved progress data...');
        
        // Clear all localStorage keys related to the game
        const keysToRemove = [
            'ballSortGameState',
            'ballSortProgress', 
            'ballSortMaxLevel',
            'ballSortUserProgress',
            'gameProgress',
            'maxLevelReached',
            'userGameProgress'
        ];
        
        keysToRemove.forEach(key => {
            localStorage.removeItem(key);
            console.log(`Removed: ${key}`);
        });
        
        // Reset progress manager if it exists
        if (this.progressManager) {
            this.progressManager.clearAllData();
        }
        
        // Reset game variables to initial state
        this.currentLevel = 1;
        this.maxLevelReached = 1;
        this.moves = 0;
        this.moveHistory = [];
        this.hintsUsed = 0;
        this.shufflesUsed = 0;
        
        console.log('✅ All progress data cleared! Game reset to Level 1.');
        
        // Generate Level 1 and update UI
        this.generateLevel(1, false);
        this.updateUI();
        
        return true;
    }
    
    /**
     * Convert saved tubes from old format (numbers) to new format (objects with expressions)
     * Ensures backward compatibility with existing saved games
     */
    convertSavedTubesToNewFormat(savedTubes, level) {
        if (!savedTubes || savedTubes.length === 0) {
            return [];
        }
        
        const convertedTubes = [];
        
        for (let tube of savedTubes) {
            const convertedTube = [];
            
            for (let ball of tube) {
                // Check if ball is already in new format (object with color and expression)
                if (typeof ball === 'object' && ball.hasOwnProperty('color') && ball.hasOwnProperty('expression')) {
                    // Already in new format
                    convertedTube.push(ball);
                } else {
                    // Old format (number), convert to new format
                    const colorIndex = typeof ball === 'number' ? ball : 0;
                    const ballObject = this.expressionSystem.convertBallToObject(colorIndex, level);
                    convertedTube.push(ballObject);
                }
            }
            
            convertedTubes.push(convertedTube);
        }
        
        console.log(`Converted ${savedTubes.length} tubes from saved game to new format`);
        return convertedTubes;
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
            // Don't save timer values - always start fresh with 30 seconds
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
                this.tubes = this.convertSavedTubesToNewFormat(gameState.tubes || [], this.currentLevel);
                this.moves = gameState.moves || 0;
                this.moveHistory = gameState.moveHistory || [];
                this.hintsUsed = gameState.hintsUsed || 0;
                this.shufflesUsed = gameState.shufflesUsed || 0;
                // Don't restore timeLeft - always start fresh with current level time limit
                this.timeLeft = 0;
                this.levelTimeLimit = this.calculateTimeLimit(this.currentLevel);
                this.soundEnabled = gameState.soundEnabled !== undefined ? gameState.soundEnabled : true;
                
                console.log(`Restored to level ${this.currentLevel} (max reached: ${this.maxLevelReached}) with ${this.moves} moves`);
                
                // Load premium status from localStorage
                const premiumStatus = localStorage.getItem('ballSortPremium');
                this.isPremium = premiumStatus === 'true';
                console.log(`Premium status loaded: ${this.isPremium}`);
                
                if (this.isPremium) {
                    this.hideAllAds();
                }
                
                // If we have valid saved game state, restore it
                if (this.tubes.length > 0) {
                    // Set time limit but don't start timer (will be started when user actually plays)
                    this.levelTimeLimit = this.calculateTimeLimit(this.currentLevel);
                    this.timeLeft = this.levelTimeLimit;
                    console.log(`Game state restored - timer will start when user begins playing`);
                    this.updateUI();
                } else {
                    // No valid level data, generate the current level fresh
                    console.log(`No level data found, generating level ${this.currentLevel}`);
                    this.generateLevel(this.currentLevel, false); // Don't start timer during load
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
        this.gameLoopRunning = true;
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
    
    /**
     * Update game state and animations
     */
    update() {
        // Update ball animation with smooth linear progression
        if (this.animatingBall) {
            this.animatingBall.progress += 0.05; // Smooth consistent speed
            
            // Ensure progress never exceeds 1
            if (this.animatingBall.progress >= 1) {
                this.animatingBall.progress = 1;
                this.completeBallAnimation();
            }
        }
        
        // Update selected ball animation
        if (this.selectedTube !== -1 && this.tubes[this.selectedTube].length > 0) {
            this.selectedBallAnimation.time += 0.1;
            
            // Breathing scale effect
            this.selectedBallAnimation.scale = 1.0 + Math.sin(this.selectedBallAnimation.time * 4) * 0.15;
            
            // Pulsing glow effect
            this.selectedBallAnimation.glow = 10 + Math.sin(this.selectedBallAnimation.time * 6) * 8;
            
            // Gentle bounce effect
            this.selectedBallAnimation.bounce = Math.sin(this.selectedBallAnimation.time * 3) * 3;
        } else {
            // Reset animation when no tube is selected
            this.selectedBallAnimation.time = 0;
            this.selectedBallAnimation.scale = 1.0;
            this.selectedBallAnimation.glow = 0;
            this.selectedBallAnimation.bounce = 0;
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
        // Solid black background
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw subtle grid pattern
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
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
     * Draw a single tube with design variety
     */
    drawTube(x, y, tubeIndex) {
        const ctx = this.ctx;
        
        // Get tube design for this specific tube in this level
        const tubeDesign = this.tubeDesignSystem.getTubeDesignForIndex(this.currentLevel, tubeIndex);
        
        // Draw tube shadow (common for all designs)
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 4;
        ctx.shadowOffsetY = 4;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(x + 2, y + 2, this.tubeWidth, this.tubeHeight);
        ctx.restore();
        
        // Draw tube with specific design and vibrant colors
        if (typeof drawTubeWithDesign === 'function') {
            drawTubeWithDesign(ctx, x, y, this.tubeWidth, this.tubeHeight, tubeDesign, this.tubes[tubeIndex], this.currentLevel, tubeIndex);
        } else {
            // Fallback to simple tube if drawing functions not loaded
            this.drawSimpleTubeFallback(x, y, tubeIndex);
        }
        
        // Draw tube rim (common for all designs)
        this.drawTubeRim(x, y, tubeIndex);
        
        // Selection highlight (common for all designs)
        if (tubeIndex === this.selectedTube) {
            this.drawTubeSelectionHighlight(x, y, tubeIndex);
        }
    }
    
    /**
     * Draw tube rim (opening at top) with vibrant outline
     */
    drawTubeRim(x, y, tubeIndex) {
        const ctx = this.ctx;
        const rimY = y - 8;
        const rimHeight = 16;
        
        // Get vibrant color for this tube
        const vibrantColor = this.tubeDesignSystem.getTubeOutlineColor(this.currentLevel, tubeIndex);
        
        // Rim shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.ellipse(x + this.tubeWidth/2, rimY + rimHeight/2, this.tubeWidth/2 + 6, rimHeight/2, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Rim body with gradient matching the vibrant color
        const rimGradient = ctx.createLinearGradient(x - 5, rimY, x + this.tubeWidth + 5, rimY + rimHeight);
        rimGradient.addColorStop(0, '#E8E8E8');
        rimGradient.addColorStop(0.5, '#F5F5F5');
        rimGradient.addColorStop(1, '#DCDCDC');
        
        ctx.fillStyle = rimGradient;
        ctx.beginPath();
        ctx.ellipse(x + this.tubeWidth/2, rimY + rimHeight/2, this.tubeWidth/2 + 4, rimHeight/2, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Inner rim (tube opening)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(x + this.tubeWidth/2, rimY + rimHeight/2, this.tubeWidth/2 - 2, rimHeight/2 - 2, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Vibrant rim border with glow
        ctx.save();
        ctx.shadowColor = vibrantColor + '80'; // Semi-transparent glow
        ctx.shadowBlur = 6;
        ctx.strokeStyle = vibrantColor;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.ellipse(x + this.tubeWidth/2, rimY + rimHeight/2, this.tubeWidth/2 + 4, rimHeight/2, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }
    
    /**
     * Draw selection highlight for selected tube with enhanced vibrant effect
     */
    drawTubeSelectionHighlight(x, y, tubeIndex) {
        const ctx = this.ctx;
        
        // Get the tube's vibrant color for enhanced selection effect
        const vibrantColor = this.tubeDesignSystem.getTubeOutlineColor(this.currentLevel, tubeIndex);
        
        ctx.save();
        
        // Multiple glow layers for intense effect
        ctx.shadowColor = vibrantColor;
        ctx.shadowBlur = 20;
        ctx.strokeStyle = vibrantColor;
        ctx.lineWidth = 4;
        
        // Outer highlight
        ctx.strokeRect(x - 4, y - 4, this.tubeWidth + 8, this.tubeHeight + 8);
        
        // Inner bright highlight
        ctx.shadowBlur = 10;
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.strokeRect(x - 2, y - 2, this.tubeWidth + 4, this.tubeHeight + 4);
        
        ctx.restore();
    }
    
    /**
     * Fallback simple tube drawing (used when design system fails)
     */
    drawSimpleTubeFallback(x, y, tubeIndex) {
        const ctx = this.ctx;
        const tubeRadius = 15;
        
        // Get vibrant color for this tube
        const vibrantColor = this.tubeDesignSystem.getTubeOutlineColor(this.currentLevel, tubeIndex);
        
        // Tube body gradient (glass effect) with slight tint
        const bodyGradient = ctx.createLinearGradient(x, y, x + this.tubeWidth, y);
        bodyGradient.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        bodyGradient.addColorStop(0.3, 'rgba(240, 248, 255, 0.9)');
        bodyGradient.addColorStop(0.5, vibrantColor + '15'); // Light tint
        bodyGradient.addColorStop(0.7, 'rgba(230, 240, 250, 0.9)');
        bodyGradient.addColorStop(1, 'rgba(220, 235, 245, 0.85)');
        
        ctx.fillStyle = bodyGradient;
        this.drawRoundedRect(x, y, this.tubeWidth, this.tubeHeight, 0, 0, tubeRadius, tubeRadius);
        ctx.fill();
        
        // Vibrant tube border with glow
        ctx.save();
        ctx.shadowColor = vibrantColor + '60';
        ctx.shadowBlur = 6;
        ctx.strokeStyle = vibrantColor;
        ctx.lineWidth = 3;
        this.drawRoundedRect(x, y, this.tubeWidth, this.tubeHeight, 0, 0, tubeRadius, tubeRadius);
        ctx.stroke();
        ctx.restore();
    
        
        // Glass shine effect
        const shineGradient = ctx.createLinearGradient(x, y, x + this.tubeWidth * 0.3, y + this.tubeHeight);
        shineGradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
        shineGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
        shineGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = shineGradient;
        this.drawRoundedRect(x + 2, y + 2, this.tubeWidth * 0.25, this.tubeHeight - 4, 0, 0, tubeRadius - 2, tubeRadius - 2);
        ctx.fill();
    }
    
    /**
     * Draw balls in a tube with selected ball animation and expressions
     */
    drawBallsInTube(tubeX, tubeY, tubeIndex) {
        const balls = this.tubes[tubeIndex];
        
        for (let j = 0; j < balls.length; j++) {
            const ballY = tubeY + this.tubeHeight - (j + 1) * (this.ballSize * 2 + this.ballSpacing) - this.ballSpacing;
            const ballX = tubeX + this.tubeWidth / 2;
            
            // Check if this is the topmost ball of the selected tube
            const isTopBall = (j === balls.length - 1);
            const isSelectedTube = (tubeIndex === this.selectedTube);
            
            if (isTopBall && isSelectedTube && !this.animatingBall) {
                // Apply special animation to selected ball
                this.drawSelectedBall(ballX, ballY, balls[j]);
            } else {
                // Use new expression-enabled drawing method
                this.drawBallWithExpression(ballX, ballY, balls[j]);
            }
        }
    }
    
    /**
     * Draw the selected ball with eye-catching animation and expressions
     */
    drawSelectedBall(x, y, ball) {
        const ctx = this.ctx;
        const colorIndex = this.expressionSystem.getBallColor(ball);
        
        // Apply animation transformations
        ctx.save();
        
        // Bounce effect
        const animatedY = y + this.selectedBallAnimation.bounce;
        
        // Scale effect
        ctx.translate(x, animatedY);
        ctx.scale(this.selectedBallAnimation.scale, this.selectedBallAnimation.scale);
        ctx.translate(-x, -animatedY);
        
        // Enhanced glow for selected ball
        ctx.shadowColor = this.ballColors[colorIndex];
        ctx.shadowBlur = this.selectedBallAnimation.glow;
        
        // Draw the ball with expressions and animations applied
        this.drawBallWithExpression(x, animatedY, ball);
        
        // Add pulsing ring effect around selected ball
        ctx.globalAlpha = 0.6;
        ctx.strokeStyle = this.ballColors[colorIndex];
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x, animatedY, this.ballSize + 8 + Math.sin(this.selectedBallAnimation.time * 5) * 4, 0, Math.PI * 2);
        ctx.stroke();
        
        // Add sparkle effect
        this.drawSparkleEffect(x, animatedY);
        
        ctx.restore();
    }
    
    /**
     * Draw sparkle effect around selected ball
     */
    drawSparkleEffect(x, y) {
        const ctx = this.ctx;
        const sparkleCount = 6;
        const sparkleRadius = this.ballSize + 15;
        
        ctx.save();
        ctx.fillStyle = '#FFD700'; // Gold sparkles
        
        for (let i = 0; i < sparkleCount; i++) {
            const angle = (i / sparkleCount) * Math.PI * 2 + this.selectedBallAnimation.time * 2;
            const sparkleX = x + Math.cos(angle) * sparkleRadius;
            const sparkleY = y + Math.sin(angle) * sparkleRadius;
            
            // Pulsing sparkle size
            const sparkleSize = 2 + Math.sin(this.selectedBallAnimation.time * 8 + i) * 1;
            
            ctx.globalAlpha = 0.8 + Math.sin(this.selectedBallAnimation.time * 6 + i) * 0.2;
            
            // Draw star shape
            this.drawStar(sparkleX, sparkleY, sparkleSize, sparkleSize * 0.5, 4);
        }
        
        ctx.restore();
    }
    
    /**
     * Draw a star shape for sparkle effect
     */
    drawStar(x, y, outerRadius, innerRadius, points) {
        const ctx = this.ctx;
        ctx.beginPath();
        
        for (let i = 0; i < points * 2; i++) {
            const angle = (i * Math.PI) / points;
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const pointX = x + Math.cos(angle) * radius;
            const pointY = y + Math.sin(angle) * radius;
            
            if (i === 0) {
                ctx.moveTo(pointX, pointY);
            } else {
                ctx.lineTo(pointX, pointY);
            }
        }
        
        ctx.closePath();
        ctx.fill();
    }
    
    /**
     * Draw a single ball with enhanced 3D appearance
     */
    drawBall(x, y, colorIndex) {
        const color = this.ballColors[colorIndex];
        const ctx = this.ctx;
        
        // Ball shadow with blur
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        ctx.shadowBlur = 6;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.arc(x, y, this.ballSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        
        // Main ball gradient (3D effect)
        const mainGradient = ctx.createRadialGradient(
            x - this.ballSize * 0.3, y - this.ballSize * 0.3, 0,
            x, y, this.ballSize
        );
        mainGradient.addColorStop(0, this.lightenColor(color, 60));
        mainGradient.addColorStop(0.3, this.lightenColor(color, 20));
        mainGradient.addColorStop(0.7, color);
        mainGradient.addColorStop(1, this.darkenColor(color, 30));
        
        ctx.fillStyle = mainGradient;
        ctx.beginPath();
        ctx.arc(x, y, this.ballSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Outer glow effect (subtle)
        const glowGradient = ctx.createRadialGradient(x, y, this.ballSize * 0.8, x, y, this.ballSize + 4);
        glowGradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
        glowGradient.addColorStop(1, color + '20'); // Reduced transparency for subtlety
        
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(x, y, this.ballSize + 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Removed primary and secondary highlights to avoid interfering with facial expressions
        
        // Subtle rim light
        const rimGradient = ctx.createRadialGradient(x, y, this.ballSize - 2, x, y, this.ballSize);
        rimGradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
        rimGradient.addColorStop(0.8, 'rgba(255, 255, 255, 0)');
        rimGradient.addColorStop(1, 'rgba(255, 255, 255, 0.3)');
        
        ctx.fillStyle = rimGradient;
        ctx.beginPath();
        ctx.arc(x, y, this.ballSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Ball border with subtle color variation
        ctx.strokeStyle = this.darkenColor(color, 40);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(x, y, this.ballSize, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    /**
     * Draw a ball with expression
     * Enhanced version that includes facial expressions
     */
    drawBallWithExpression(x, y, ball) {
        // Handle both old format (number) and new format (object)
        const colorIndex = typeof ball === 'object' ? ball.color : ball;
        let expression;
        
        if (typeof ball === 'object' && ball.expression) {
            expression = ball.expression;
        } else if (this.expressionSystem && this.expressionSystem.getExpressionForColor) {
            expression = this.expressionSystem.getExpressionForColor(this.currentLevel, colorIndex);
        } else {
            // Fallback: assign different expressions based on color
            const fallbackExpressions = ['angry', 'laughing', 'crying', 'surprised', 'sleeping'];
            expression = fallbackExpressions[colorIndex % fallbackExpressions.length];
        }
        
        // Debug logging for first few levels
        // if (this.currentLevel <= 3 && Math.random() < 0.05) {
        //     console.log(`🎭 Drawing ball - Level: ${this.currentLevel}, Color: ${colorIndex}, Expression: ${expression}`);
        // }
        
        // Draw the base ball
        this.drawBall(x, y, colorIndex);
        
        // Draw the facial expression
        this.drawExpression(x, y, expression);
    }
    
    /**
     * Draw facial expression on a ball
     */
    drawExpression(x, y, expression) {
        const ctx = this.ctx;
        const size = this.ballSize;
        
        ctx.save();
        
        // Set common properties for expression drawing
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        switch (expression) {
            case 'angry':
                this.drawAngryExpression(ctx, x, y, size);
                break;
            case 'laughing':
                this.drawLaughingExpression(ctx, x, y, size);
                break;
            case 'crying':
                this.drawCryingExpression(ctx, x, y, size);
                break;
            case 'surprised':
                this.drawSurprisedExpression(ctx, x, y, size);
                break;
            case 'sleeping':
                this.drawSleepingExpression(ctx, x, y, size);
                break;
            default:
                // Fallback to happy expression
                this.drawLaughingExpression(ctx, x, y, size);
        }
        
        ctx.restore();
    }
    
    /**
     * Draw angry expression: angled eyebrows, frowning mouth
     */
    drawAngryExpression(ctx, x, y, size) {
        ctx.strokeStyle = '#2c3e50';
        ctx.fillStyle = '#2c3e50';
        ctx.lineWidth = 2;
        
        // Angry eyebrows (angled inward)
        ctx.beginPath();
        ctx.moveTo(x - size * 0.4, y - size * 0.3);
        ctx.lineTo(x - size * 0.1, y - size * 0.15);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(x + size * 0.4, y - size * 0.3);
        ctx.lineTo(x + size * 0.1, y - size * 0.15);
        ctx.stroke();
        
        // Angry eyes (small dots)
        ctx.beginPath();
        ctx.arc(x - size * 0.25, y - size * 0.1, size * 0.06, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(x + size * 0.25, y - size * 0.1, size * 0.06, 0, Math.PI * 2);
        ctx.fill();
        
        // Frowning mouth
        ctx.beginPath();
        ctx.arc(x, y + size * 0.35, size * 0.2, 0, Math.PI, true);
        ctx.stroke();
    }
    
    /**
     * Draw laughing expression: happy eyes, big smile
     */
    drawLaughingExpression(ctx, x, y, size) {
        ctx.strokeStyle = '#2c3e50';
        ctx.fillStyle = '#2c3e50';
        ctx.lineWidth = 2;
        
        // Happy eyes (curved lines)
        ctx.beginPath();
        ctx.arc(x - size * 0.25, y - size * 0.1, size * 0.12, 0.2, Math.PI - 0.2);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.arc(x + size * 0.25, y - size * 0.1, size * 0.12, 0.2, Math.PI - 0.2);
        ctx.stroke();
        
        // Big smile
        ctx.beginPath();
        ctx.arc(x, y + size * 0.1, size * 0.25, 0, Math.PI);
        ctx.stroke();
        
        // Dimples
        ctx.beginPath();
        ctx.arc(x - size * 0.35, y + size * 0.15, size * 0.03, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(x + size * 0.35, y + size * 0.15, size * 0.03, 0, Math.PI * 2);
        ctx.fill();
    }
    
    /**
     * Draw crying expression: droopy eyes, downturned mouth, tear drops
     */
    drawCryingExpression(ctx, x, y, size) {
        ctx.strokeStyle = '#2c3e50';
        ctx.fillStyle = '#2c3e50';
        ctx.lineWidth = 2;
        
        // Sad eyes (droopy)
        ctx.beginPath();
        ctx.arc(x - size * 0.25, y - size * 0.1, size * 0.08, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(x + size * 0.25, y - size * 0.1, size * 0.08, 0, Math.PI * 2);
        ctx.fill();
        
        // Sad eyebrows
        ctx.beginPath();
        ctx.moveTo(x - size * 0.35, y - size * 0.25);
        ctx.lineTo(x - size * 0.15, y - size * 0.2);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(x + size * 0.35, y - size * 0.25);
        ctx.lineTo(x + size * 0.15, y - size * 0.2);
        ctx.stroke();
        
        // Downturned mouth
        ctx.beginPath();
        ctx.arc(x, y + size * 0.4, size * 0.15, 0, Math.PI, true);
        ctx.stroke();
        
        // Tear drops
        ctx.fillStyle = '#3498db';
        ctx.beginPath();
        ctx.ellipse(x - size * 0.4, y + size * 0.1, size * 0.04, size * 0.08, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.ellipse(x + size * 0.38, y + size * 0.15, size * 0.03, size * 0.06, 0, 0, Math.PI * 2);
        ctx.fill();
    }
    
    /**
     * Draw surprised expression: wide eyes, open mouth
     */
    drawSurprisedExpression(ctx, x, y, size) {
        ctx.strokeStyle = '#2c3e50';
        ctx.fillStyle = '#2c3e50';
        ctx.lineWidth = 2;
        
        // Wide surprised eyes
        ctx.beginPath();
        ctx.arc(x - size * 0.25, y - size * 0.1, size * 0.1, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.arc(x + size * 0.25, y - size * 0.1, size * 0.1, 0, Math.PI * 2);
        ctx.stroke();
        
        // Eye pupils
        ctx.beginPath();
        ctx.arc(x - size * 0.25, y - size * 0.1, size * 0.05, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(x + size * 0.25, y - size * 0.1, size * 0.05, 0, Math.PI * 2);
        ctx.fill();
        
        // Surprised mouth (small oval)
        ctx.beginPath();
        ctx.ellipse(x, y + size * 0.25, size * 0.08, size * 0.12, 0, 0, Math.PI * 2);
        ctx.stroke();
        
        // Raised eyebrows
        ctx.beginPath();
        ctx.arc(x - size * 0.25, y - size * 0.25, size * 0.15, 0.1, Math.PI - 0.1);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.arc(x + size * 0.25, y - size * 0.25, size * 0.15, 0.1, Math.PI - 0.1);
        ctx.stroke();
    }
    
    /**
     * Draw sleeping expression: closed eyes, peaceful mouth, z's
     */
    drawSleepingExpression(ctx, x, y, size) {
        ctx.strokeStyle = '#2c3e50';
        ctx.fillStyle = '#2c3e50';
        ctx.lineWidth = 2;
        
        // Closed eyes (curved lines)
        ctx.beginPath();
        ctx.arc(x - size * 0.25, y - size * 0.1, size * 0.12, Math.PI + 0.3, Math.PI * 2 - 0.3);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.arc(x + size * 0.25, y - size * 0.1, size * 0.12, Math.PI + 0.3, Math.PI * 2 - 0.3);
        ctx.stroke();
        
        // Peaceful mouth (small smile)
        ctx.beginPath();
        ctx.arc(x, y + size * 0.2, size * 0.1, 0, Math.PI);
        ctx.stroke();
        
        // Sleeping Z's
        ctx.font = `${size * 0.3}px Arial`;
        ctx.fillStyle = '#7f8c8d';
        ctx.fillText('Z', x + size * 0.4, y - size * 0.3);
        ctx.font = `${size * 0.2}px Arial`;
        ctx.fillText('z', x + size * 0.5, y - size * 0.5);
        ctx.font = `${size * 0.15}px Arial`;
        ctx.fillText('z', x + size * 0.55, y - size * 0.65);
    }
    
    /**
     * Draw animating ball during movement
     */
    /**
     * Enhanced 3-stage ball animation with multi-ball support
     */
    drawAnimatingBall() {
        const startX = (this.canvas.width - (this.tubes.length * (this.tubeWidth + 20) - 20)) / 2;
        const tubeY = this.canvas.height - this.tubeHeight - 50;
        
        // Calculate exact positions
        const fromTubeX = startX + this.animatingBall.fromTube * (this.tubeWidth + 20) + this.tubeWidth / 2;
        const toTubeX = startX + this.animatingBall.toTube * (this.tubeWidth + 20) + this.tubeWidth / 2;
        
        // Calculate tube rim positions (top of tubes)
        const tubeRimY = tubeY - 15;
        
        // Calculate starting position (inside tube A)
        const fromBallY = tubeY + this.tubeHeight - (this.tubes[this.animatingBall.fromTube].length + 1) * (this.ballSize * 2 + this.ballSpacing) - this.ballSpacing;
        
        // Calculate final position (inside tube B)
        const toBallY = tubeY + this.tubeHeight - (this.tubes[this.animatingBall.toTube].length + 1) * (this.ballSize * 2 + this.ballSpacing) - this.ballSpacing;
        
        const progress = this.animatingBall.progress;
        let currentX, currentY;
        
        // Simplified 3-stage animation with linear interpolation
        if (progress <= 0.3) {
            // Stage 1: Rise straight up from tube A (0% - 30%)
            const stageProgress = progress / 0.3;
            
            currentX = fromTubeX; // Stay exactly on tube A center
            currentY = fromBallY + (tubeRimY - fromBallY) * stageProgress;
            
        } else if (progress <= 0.7) {
            // Stage 2: Move horizontally from tube A to tube B (30% - 70%)
            const stageProgress = (progress - 0.3) / 0.4;
            
            // Simple linear horizontal movement
            currentX = fromTubeX + (toTubeX - fromTubeX) * stageProgress;
            
            // Simple arc - only go up and down, no complex curves
            const arcHeight = 40;
            const arcProgress = Math.sin(stageProgress * Math.PI);
            currentY = tubeRimY - arcHeight * arcProgress;
            
        } else {
            // Stage 3: Drop straight down into tube B (70% - 100%)
            const stageProgress = (progress - 0.7) / 0.3;
            
            currentX = toTubeX; // Stay exactly on tube B center
            currentY = tubeRimY + (toBallY - tubeRimY) * stageProgress;
        }
        
        // Enhanced visual effects for multi-ball transfers
        this.ctx.save();
        
        // Handle single ball animation (existing functionality)
        if (!this.animatingBall.isMultiBall) {
            // Minimal glow effect only
            const ballColor = this.expressionSystem.getBallColor(this.animatingBall.ball);
            this.ctx.shadowColor = this.ballColors[ballColor];
            this.ctx.shadowBlur = 8;
            
            // Draw the ball with expression at exact calculated position
            this.drawBallWithExpression(currentX, currentY, this.animatingBall.ball);
        }
        // Handle multi-ball animation (new functionality)
        else {
            const ballCount = this.animatingBall.ballCount;
            const ballSpacing = this.ballSize * 0.8; // Closer spacing for visual effect
            
            // Enhanced glow for multi-ball
            const ballColor = this.expressionSystem.getBallColor(this.animatingBall.ball);
            this.ctx.shadowColor = this.ballColors[ballColor];
            this.ctx.shadowBlur = 12;
            
            // Draw multiple balls with slight offset to show stack
            for (let i = 0; i < ballCount; i++) {
                const offsetY = i * ballSpacing;
                const offsetX = i * 2; // Slight horizontal offset for 3D effect
                
                // Slight opacity variation for depth
                this.ctx.globalAlpha = 1 - (i * 0.1);
                
                this.drawBallWithExpression(currentX - offsetX, currentY - offsetY, this.animatingBall.ball);
            }
            
            // Reset opacity
            this.ctx.globalAlpha = 1;
        }
        
        this.ctx.restore();
        
        // Add particle effects only once per stage
        if (!this.animatingBall.emergenceParticlesAdded && progress >= 0.29) {
            this.addEmergenceParticles(fromTubeX, tubeRimY);
            this.animatingBall.emergenceParticlesAdded = true;
        }
        
        if (!this.animatingBall.entryParticlesAdded && progress >= 0.69) {
            this.addEntryParticles(toTubeX, tubeRimY);
            this.animatingBall.entryParticlesAdded = true;
        }
    }
    
    /**
     * Draw motion trail for 3-stage animation
     */
    drawRealistic3StageTrail(progress) {
        const trailLength = 4;
        const ballColor = this.ballColors[this.animatingBall.ball];
        
        for (let i = 0; i < trailLength; i++) {
            const trailProgress = Math.max(0.25, progress - (i + 1) * 0.02); // Only during travel stage
            if (trailProgress <= 0.25 || trailProgress >= 0.75) continue;
            
            // Recalculate trail position
            const startX = (this.canvas.width - (this.tubes.length * (this.tubeWidth + 20) - 20)) / 2;
            const tubeY = this.canvas.height - this.tubeHeight - 50;
            
            const fromTubeTopX = startX + this.animatingBall.fromTube * (this.tubeWidth + 20) + this.tubeWidth / 2;
            const fromTubeTopY = tubeY - 15;
            const toTubeTopX = startX + this.animatingBall.toTube * (this.tubeWidth + 20) + this.tubeWidth / 2;
            const toTubeTopY = tubeY - 15;
            
            const stageProgress = (trailProgress - 0.25) / 0.5;
            const easedProgress = this.easeInOutCubic(stageProgress);
            
            const distance = Math.abs(toTubeTopX - fromTubeTopX);
            const arcHeight = Math.max(60, distance * 0.3);
            const peakY = Math.min(fromTubeTopY, toTubeTopY) - arcHeight;
            
            const trailX = fromTubeTopX + (toTubeTopX - fromTubeTopX) * easedProgress;
            const arcProgress = Math.sin(easedProgress * Math.PI);
            const trailY = fromTubeTopY + (peakY - fromTubeTopY) * arcProgress;
            
            // Draw trail point
            const alpha = (1 - i / trailLength) * 0.5;
            const size = this.ballSize * (1 - i * 0.15);
            
            this.ctx.save();
            this.ctx.globalAlpha = alpha;
            this.ctx.fillStyle = ballColor;
            this.ctx.beginPath();
            this.ctx.arc(trailX - fromTubeTopX, trailY - fromTubeTopY, size * 0.3, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        }
    }
    
    /**
     * Draw arc trajectory preview
     */
    drawArcTrajectoryPreview(fromX, fromY, toX, toY, progress) {
        const distance = Math.abs(toX - fromX);
        const arcHeight = Math.max(50, distance * 0.25);
        const peakY = Math.min(fromY, toY) - arcHeight;
        
        this.ctx.save();
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash([2, 4]);
        this.ctx.globalAlpha = 0.4 * (1 - (progress - 0.3) / 0.4);
        
        this.ctx.beginPath();
        this.ctx.moveTo(fromX, fromY);
        
        // Draw parabolic arc
        for (let t = 0; t <= 1; t += 0.1) {
            const x = fromX + (toX - fromX) * t;
            const arcProgress = Math.sin(t * Math.PI);
            const y = fromY + (peakY - fromY) * arcProgress;
            this.ctx.lineTo(x, y);
        }
        
        this.ctx.stroke();
        this.ctx.restore();
    }
    
    /**
     * Add particle effects when ball emerges from tube
     */
    addEmergenceParticles(x, y) {
        for (let i = 0; i < 3; i++) {
            this.particles.push({
                x: x + (Math.random() - 0.5) * 20,
                y: y + Math.random() * 10,
                vx: (Math.random() - 0.5) * 2,
                vy: -Math.random() * 2,
                life: 20,
                color: '#E8F4F8',
                size: Math.random() * 2 + 1
            });
        }
    }
    
    /**
     * Add particle effects when ball enters tube
     */
    addEntryParticles(x, y) {
        for (let i = 0; i < 3; i++) {
            this.particles.push({
                x: x + (Math.random() - 0.5) * 15,
                y: y + Math.random() * 5,
                vx: (Math.random() - 0.5) * 1.5,
                vy: Math.random() * 1.5,
                life: 15,
                color: '#F0F8FF',
                size: Math.random() * 1.5 + 0.5
            });
        }
    }
    
    /**
     * Enhanced easing functions for 3-stage animation
     */
    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }
    
    easeInCubic(t) {
        return t * t * t;
    }
    
    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
    
    /**
     * Draw ball motion trail effect
     */
    drawBallTrail(currentX, currentY, progress) {
        const trailLength = 5;
        const ballColor = this.ballColors[this.animatingBall.ball];
        
        for (let i = 0; i < trailLength; i++) {
            const trailProgress = Math.max(0, progress - (i + 1) * 0.03);
            if (trailProgress <= 0) continue;
            
            // Recalculate position for trail point
            const t = this.easeInOutBack(trailProgress);
            const distance = Math.abs(this.animatingBall.toTube - this.animatingBall.fromTube);
            const arcHeight = Math.max(80, distance * (this.tubeWidth + 20) * 0.4);
            
            const startX = (this.canvas.width - (this.tubes.length * (this.tubeWidth + 20) - 20)) / 2;
            const tubeY = this.canvas.height - this.tubeHeight - 50;
            
            const fromX = startX + this.animatingBall.fromTube * (this.tubeWidth + 20) + this.tubeWidth / 2;
            const fromY = tubeY + this.tubeHeight - (this.tubes[this.animatingBall.fromTube].length + 1) * (this.ballSize * 2 + this.ballSpacing) - this.ballSpacing;
            
            const toX = startX + this.animatingBall.toTube * (this.tubeWidth + 20) + this.tubeWidth / 2;
            const toY = tubeY + this.tubeHeight - (this.tubes[this.animatingBall.toTube].length + 1) * (this.ballSize * 2 + this.ballSpacing) - this.ballSpacing;
            
            const controlPoint1X = fromX + (toX - fromX) * 0.25;
            const controlPoint1Y = fromY - arcHeight * 0.3;
            const controlPoint2X = fromX + (toX - fromX) * 0.75;
            const controlPoint2Y = toY - arcHeight * 0.3;
            
            const trailX = Math.pow(1-t, 3) * fromX + 
                          3 * Math.pow(1-t, 2) * t * controlPoint1X + 
                          3 * (1-t) * Math.pow(t, 2) * controlPoint2X + 
                          Math.pow(t, 3) * toX;
            
            const trailY = Math.pow(1-t, 3) * fromY + 
                          3 * Math.pow(1-t, 2) * t * controlPoint1Y + 
                          3 * (1-t) * Math.pow(t, 2) * controlPoint2Y + 
                          Math.pow(t, 3) * toY;
            
            // Draw trail point
            const alpha = (1 - i / trailLength) * 0.6;
            const size = this.ballSize * (1 - i * 0.1);
            
            this.ctx.save();
            this.ctx.globalAlpha = alpha;
            this.ctx.fillStyle = ballColor;
            this.ctx.beginPath();
            this.ctx.arc(trailX, trailY, size * 0.4, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        }
    }
    
    /**
     * Draw trajectory preview line
     */
    drawTrajectoryPreview(fromX, fromY, toX, toY, cp1X, cp1Y, cp2X, cp2Y, progress) {
        this.ctx.save();
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash([5, 5]);
        this.ctx.globalAlpha = 0.5 * (1 - progress);
        
        this.ctx.beginPath();
        this.ctx.moveTo(fromX, fromY);
        this.ctx.bezierCurveTo(cp1X, cp1Y, cp2X, cp2Y, toX, toY);
        this.ctx.stroke();
        this.ctx.restore();
    }
    
    /**
     * Enhanced easing function with back effect
     */
    easeInOutBack(t) {
        const c1 = 1.70158;
        const c2 = c1 * 1.525;
        
        return t < 0.5
            ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
            : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
    }
    
    /**
     * Draw victory particles
     */
    /**
     * Enhanced particle drawing with dynamic properties
     */
    drawParticles() {
        for (let particle of this.particles) {
            this.ctx.save();
            
            // Dynamic alpha based on particle life
            const maxLife = particle.maxLife || 60;
            this.ctx.globalAlpha = particle.life / maxLife;
            
            // Use particle color
            this.ctx.fillStyle = particle.color;
            
            // Use dynamic particle size
            const size = particle.size || 3;
            
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2);
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
     * Draw rounded rectangle helper
     */
    drawRoundedRect(x, y, width, height, topLeft = 0, topRight = 0, bottomLeft = 0, bottomRight = 0) {
        const ctx = this.ctx;
        
        ctx.beginPath();
        ctx.moveTo(x + topLeft, y);
        
        // Top side
        ctx.lineTo(x + width - topRight, y);
        if (topRight > 0) {
            ctx.quadraticCurveTo(x + width, y, x + width, y + topRight);
        }
        
        // Right side
        ctx.lineTo(x + width, y + height - bottomRight);
        if (bottomRight > 0) {
            ctx.quadraticCurveTo(x + width, y + height, x + width - bottomRight, y + height);
        }
        
        // Bottom side
        ctx.lineTo(x + bottomLeft, y + height);
        if (bottomLeft > 0) {
            ctx.quadraticCurveTo(x, y + height, x, y + height - bottomLeft);
        }
        
        // Left side
        ctx.lineTo(x, y + topLeft);
        if (topLeft > 0) {
            ctx.quadraticCurveTo(x, y, x + topLeft, y);
        }
        
        ctx.closePath();
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
    
    /**
     * Debug method to clear localStorage and reset timer
     * Call this in browser console if timer issues persist: window.ballSortGameInstance.debugClearState()
     */
    debugClearState() {
        console.log('Clearing game state and resetting timer...');
        localStorage.removeItem('ballSortGame');
        this.timeLeft = 60; // New levels start with 60 seconds
        this.levelTimeLimit = 60;
        this.stopTimer();
        this.startTimer();
        this.updateTimerDisplay();
        console.log('Game state cleared. Timer reset to 60 seconds for new level.');
    }

    /**
     * Debug method to test 30-second timer manually
     * Call this in browser console: window.ballSortGameInstance.debugTest30Timer()
     */
    debugTest30Timer() {
        console.log('Testing 30-second timer manually...');
        this.gameState = 'playing';
        this.isPaused = false;
        this.timeLeft = 30;
        this.startAdRewardTimer();
        console.log('30-second timer started manually for testing.');
    }

    /**
     * Debug method to test interstitial ad manually
     * Call this in browser console: window.ballSortGameInstance.debugTestInterstitialAd()
     */
    debugTestInterstitialAd() {
        console.log('Testing interstitial ad manually...');
        this.showInterstitialAd();
        console.log('Interstitial ad started manually for testing.');
    }

    /**
     * Debug method to test premium purchase
     * Call this in browser console: window.ballSortGameInstance.debugTestPremium()
     */
    debugTestPremium() {
        console.log('Testing premium purchase manually...');
        this.onPurchaseSuccess();
        console.log('Premium activated manually for testing.');
    }

    /**
     * Debug method to reset premium status
     * Call this in browser console: window.ballSortGameInstance.debugResetPremium()
     */
    debugResetPremium() {
        console.log('Resetting premium status...');
        this.setPremiumStatus(false);
        location.reload(); // Reload to reinitialize ads
        console.log('Premium status reset. Page will reload.');
    }
}

// Initialize game when page loads (prevent multiple instances)
document.addEventListener('DOMContentLoaded', () => {
    if (!window.ballSortGameInstance) {
        window.ballSortGameInstance = new BallSortGame();
    }
});

// Service worker for offline play (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => console.log('SW registered'))
            .catch(error => console.log('SW registration failed'));
    });
}
