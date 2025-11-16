/**
 * Google Play Games Services Integration
 * Handles authentication, leaderboards, cloud save, and in-app purchases
 */

class GooglePlayGamesManager {
    constructor() {
        this.isInitialized = false;
        this.isAuthenticated = false;
        this.playerInfo = null;
        
        // Achievement IDs (replace with your actual achievement IDs from Google Play Console)
        this.achievementIds = {
            FIRST_LEVEL: 'achievement_first_level',
            TEN_LEVELS: 'achievement_ten_levels', 
            FIFTY_LEVELS: 'achievement_fifty_levels',
            HUNDRED_LEVELS: 'achievement_hundred_levels',
            ALL_LEVELS: 'achievement_all_levels',
            NO_HINTS: 'achievement_no_hints',
            SPEED_DEMON: 'achievement_speed_demon',
            PERFECTIONIST: 'achievement_perfectionist',
            COMEBACK_KING: 'achievement_comeback_king',
            PREMIUM_USER: 'achievement_premium_user'
        };
        
        // Leaderboard IDs (replace with your actual leaderboard IDs from Google Play Console)
        this.leaderboardIds = {
            TOTAL_LEVELS: 'leaderboard_total_levels',
            FASTEST_COMPLETION: 'leaderboard_fastest_completion',
            MINIMUM_MOVES: 'leaderboard_minimum_moves',
            DAILY_CHALLENGE: 'leaderboard_daily_challenge',
            WEEKLY_SCORE: 'leaderboard_weekly_score'
        };
        
        // Product IDs for in-app purchases
        this.productIds = {
            AD_FREE: 'ball_sort_ad_free',
            PREMIUM_FEATURES: 'ball_sort_premium',
            HINT_PACK_SMALL: 'ball_sort_hints_10',
            HINT_PACK_LARGE: 'ball_sort_hints_50'
        };
        
        // Events
        this.onAuthSuccess = null;
        this.onAuthFailure = null;
        this.onLeaderboardLoaded = null;
        
        this.initialize();
    }

    /**
     * Initialize Google Play Games Services
     */
    async initialize() {
        console.log('🎮 Initializing Google Play Games Services...');
        
        try {
            // Check if we're running in a Cordova/PhoneGap environment
            if (typeof window.plugins !== 'undefined' && window.plugins.playGamesServices) {
                this.playGamesPlugin = window.plugins.playGamesServices;
                console.log('✅ Play Games Services plugin found');
                
                // Auto-authenticate if possible
                await this.authenticateUser();
            } else {
                console.log('⚠️ Play Games Services not available - running in web mode');
                // For web testing, simulate authentication
                this.simulateWebAuth();
            }
            
            console.log('✅ Google Play Games Services initialization complete');
        } catch (error) {
            console.error('❌ Failed to initialize Play Games Services:', error);
            // Still set up web mode as fallback
            console.log('🔄 Falling back to web simulation mode...');
            this.simulateWebAuth();
        }
    }

    /**
     * Authenticate user with Google Play Games
     */
    async authenticateUser() {
        console.log('🔐 Authenticating user...');
        
        return new Promise((resolve, reject) => {
            if (!this.playGamesPlugin) {
                this.simulateWebAuth();
                resolve(true);
                return;
            }

            this.playGamesPlugin.auth(
                () => {
                    console.log('✅ Authentication successful');
                    this.isAuthenticated = true;
                    this.getPlayerInfo().then(() => {
                        if (this.onAuthSuccess) this.onAuthSuccess();
                        resolve(true);
                    });
                },
                (error) => {
                    console.error('❌ Authentication failed:', error);
                    this.isAuthenticated = false;
                    if (this.onAuthFailure) this.onAuthFailure(error);
                    reject(error);
                }
            );
        });
    }

    /**
     * Get player information
     */
    async getPlayerInfo() {
        return new Promise((resolve, reject) => {
            if (!this.playGamesPlugin) {
                // Web simulation
                this.playerInfo = {
                    playerId: 'web_user_' + Date.now(),
                    displayName: 'Web Player',
                    avatarImageUrl: null
                };
                resolve(this.playerInfo);
                return;
            }

            this.playGamesPlugin.getPlayerInfo(
                (player) => {
                    this.playerInfo = player;
                    console.log('👤 Player info:', player);
                    resolve(player);
                },
                (error) => {
                    console.error('❌ Failed to get player info:', error);
                    reject(error);
                }
            );
        });
    }

    /**
     * Sign in to Google Play Games Services
     */
    async signIn() {
        console.log('🔐 Attempting to sign in...');
        
        if (!this.playGamesPlugin) {
            // Web simulation
            console.log('🌐 Web mode - simulating sign in...');
            this.simulateWebAuth();
            return true;
        }

        try {
            await this.authenticateUser();
            return true;
        } catch (error) {
            console.error('❌ Sign in failed:', error);
            return false;
        }
    }

    /**
     * Sign out from Google Play Games Services
     */
    async signOut() {
        console.log('🚪 Signing out...');
        
        return new Promise((resolve) => {
            if (!this.playGamesPlugin) {
                // Web simulation
                this.isAuthenticated = false;
                this.playerInfo = null;
                localStorage.removeItem('webUserName');
                console.log('🌐 Web mode - signed out');
                resolve();
                return;
            }

            this.playGamesPlugin.signOut(
                () => {
                    console.log('✅ Sign out successful');
                    this.isAuthenticated = false;
                    this.playerInfo = null;
                    resolve();
                },
                (error) => {
                    console.error('❌ Sign out failed:', error);
                    // Still mark as signed out locally
                    this.isAuthenticated = false;
                    this.playerInfo = null;
                    resolve();
                }
            );
        });
    }

    /**
     * Check if user is signed in
     */
    isSignedIn() {
        return this.isAuthenticated && this.playerInfo !== null;
    }

    /**
     * Submit score to leaderboard
     */
    async submitScore(level) {
        console.log(`🏆 Submitting score: Level ${level}`);
        
        // For web testing, allow score submission even if not fully authenticated
        // as long as we have player info (from web simulation)
        if (!this.isAuthenticated && !this.playerInfo) {
            console.log('⚠️ Not authenticated and no player info - cannot submit score');
            return false;
        }

        return new Promise((resolve) => {
            if (!this.playGamesPlugin) {
                // Web simulation - store locally for testing
                const webLeaderboard = JSON.parse(localStorage.getItem('webLeaderboard') || '[]');
                const existingEntry = webLeaderboard.find(entry => entry.playerId === this.playerInfo.playerId);
                
                if (existingEntry) {
                    if (level > existingEntry.score) {
                        existingEntry.score = level;
                        existingEntry.lastUpdate = Date.now();
                    }
                } else {
                    webLeaderboard.push({
                        playerId: this.playerInfo.playerId,
                        displayName: this.playerInfo.displayName,
                        score: level,
                        lastUpdate: Date.now()
                    });
                }
                
                // Keep only top 20
                webLeaderboard.sort((a, b) => b.score - a.score);
                webLeaderboard.splice(20);
                
                localStorage.setItem('webLeaderboard', JSON.stringify(webLeaderboard));
                console.log('📊 Score submitted to web leaderboard');
                resolve(true);
                return;
            }

            this.playGamesPlugin.submitScore(
                this.leaderboardId,
                level,
                () => {
                    console.log('✅ Score submitted successfully');
                    resolve(true);
                },
                (error) => {
                    console.error('❌ Failed to submit score:', error);
                    resolve(false);
                }
            );
        });
    }

    /**
     * Show leaderboard
     */
    async showLeaderboard() {
        console.log('📊 Showing leaderboard...');

        if (!this.playGamesPlugin) {
            // Web simulation - show custom leaderboard
            this.showWebLeaderboard();
            return;
        }

        this.playGamesPlugin.showLeaderboard(
            this.leaderboardId,
            () => console.log('✅ Leaderboard shown'),
            (error) => console.error('❌ Failed to show leaderboard:', error)
        );
    }

    /**
     * Get top 20 leaderboard data
     */
    async getLeaderboardData() {
        return new Promise((resolve) => {
            if (!this.playGamesPlugin) {
                // Web simulation
                const webLeaderboard = JSON.parse(localStorage.getItem('webLeaderboard') || '[]');
                resolve(webLeaderboard.slice(0, 20));
                return;
            }

            this.playGamesPlugin.getLeaderboardScores(
                this.leaderboardId,
                'PUBLIC',
                'ALL_TIME',
                20,
                (leaderboard) => {
                    console.log('📊 Leaderboard data received:', leaderboard);
                    resolve(leaderboard.scores || []);
                },
                (error) => {
                    console.error('❌ Failed to get leaderboard data:', error);
                    resolve([]);
                }
            );
        });
    }

    /**
     * Save game data to cloud
     */
    async saveToCloud(gameData) {
        if (!this.isAuthenticated) {
            console.log('⚠️ Not authenticated - cannot save to cloud');
            return false;
        }

        console.log('☁️ Saving game data to cloud...');

        return new Promise((resolve) => {
            if (!this.playGamesPlugin) {
                // Web simulation - use localStorage
                localStorage.setItem('cloudGameData', JSON.stringify(gameData));
                console.log('✅ Game data saved to web storage');
                resolve(true);
                return;
            }

            this.playGamesPlugin.saveGameData(
                JSON.stringify(gameData),
                'Ball Sort Progress',
                () => {
                    console.log('✅ Game data saved to cloud');
                    resolve(true);
                },
                (error) => {
                    console.error('❌ Failed to save to cloud:', error);
                    resolve(false);
                }
            );
        });
    }

    /**
     * Load game data from cloud
     */
    async loadFromCloud() {
        if (!this.isAuthenticated) {
            console.log('⚠️ Not authenticated - cannot load from cloud');
            return null;
        }

        console.log('☁️ Loading game data from cloud...');

        return new Promise((resolve) => {
            if (!this.playGamesPlugin) {
                // Web simulation
                const cloudData = localStorage.getItem('cloudGameData');
                if (cloudData) {
                    console.log('✅ Game data loaded from web storage');
                    resolve(JSON.parse(cloudData));
                } else {
                    resolve(null);
                }
                return;
            }

            this.playGamesPlugin.loadGameData(
                (data) => {
                    if (data && data.data) {
                        console.log('✅ Game data loaded from cloud');
                        resolve(JSON.parse(data.data));
                    } else {
                        console.log('ℹ️ No cloud save data found');
                        resolve(null);
                    }
                },
                (error) => {
                    console.error('❌ Failed to load from cloud:', error);
                    resolve(null);
                }
            );
        });
    }

    /**
     * Purchase ad-free version
     */
    async purchaseAdFree() {
        console.log('💰 Initiating ad-free purchase...');

        return new Promise((resolve) => {
            if (!this.playGamesPlugin) {
                // Web simulation - show mock purchase dialog
                this.showMockPurchaseDialog(resolve);
                return;
            }

            // Use Google Play Billing (requires separate plugin)
            if (window.store) {
                window.store.order(this.adFreeProductId)
                    .then(() => {
                        console.log('✅ Purchase successful');
                        this.setPremiumStatus(true);
                        resolve(true);
                    })
                    .catch((error) => {
                        console.error('❌ Purchase failed:', error);
                        resolve(false);
                    });
            } else {
                console.log('⚠️ Billing not available - showing mock purchase');
                this.showMockPurchaseDialog(resolve);
            }
        });
    }

    /**
     * Set premium status with enhanced persistence
     */
    setPremiumStatus(isPremium) {
        const premiumData = {
            isPremium: isPremium,
            purchaseDate: new Date().toISOString(),
            lastVerified: new Date().toISOString(),
            version: '1.0'
        };
        
        localStorage.setItem('ballSortPremium', JSON.stringify(premiumData));
        localStorage.setItem('ballSortPremiumSimple', isPremium.toString()); // Backward compatibility
        
        console.log(`🎖️ Premium status set to: ${isPremium}`);
        
        if (isPremium) {
            console.log(`💎 Premium activated on: ${premiumData.purchaseDate}`);
        }
    }

    /**
     * Check if user has premium with enhanced verification
     */
    isPremiumUser() {
        // First check the enhanced storage format
        const premiumData = localStorage.getItem('ballSortPremium');
        if (premiumData) {
            try {
                const data = JSON.parse(premiumData);
                if (data && data.isPremium === true) {
                    // Update last verified timestamp
                    data.lastVerified = new Date().toISOString();
                    localStorage.setItem('ballSortPremium', JSON.stringify(data));
                    return true;
                }
            } catch (error) {
                console.warn('Error parsing premium data, checking fallback:', error);
            }
        }
        
        // Fallback to simple format for backward compatibility
        return localStorage.getItem('ballSortPremiumSimple') === 'true';
    }

    /**
     * Get premium purchase details
     */
    getPremiumDetails() {
        const premiumData = localStorage.getItem('ballSortPremium');
        if (premiumData) {
            try {
                return JSON.parse(premiumData);
            } catch (error) {
                console.warn('Error parsing premium details:', error);
            }
        }
        
        // Return basic info if only simple format exists
        if (localStorage.getItem('ballSortPremiumSimple') === 'true') {
            return {
                isPremium: true,
                purchaseDate: 'Unknown',
                lastVerified: new Date().toISOString(),
                version: 'legacy'
            };
        }
        
        return null;
    }

    /**
     * Simulate web authentication for testing
     */
    simulateWebAuth() {
        console.log('🌐 Simulating web authentication...');
        
        // Get or create user ID
        let userId = localStorage.getItem('webUserId');
        if (!userId) {
            userId = 'web_user_' + Date.now();
            localStorage.setItem('webUserId', userId);
        }
        
        // Get or prompt for user name
        let userName = localStorage.getItem('webUserName');
        if (!userName) {
            userName = prompt('Enter your player name for testing:', 'Web Player') || 'Web Player';
            localStorage.setItem('webUserName', userName);
        }
        
        this.isAuthenticated = true;
        this.playerInfo = {
            playerId: userId,
            displayName: userName,
            avatarImageUrl: null
        };
        
        console.log('✅ Web authentication successful:', this.playerInfo);
        
        if (this.onAuthSuccess) {
            this.onAuthSuccess();
        }
    }

    /**
     * Show web leaderboard modal
     */
    async showWebLeaderboard() {
        const leaderboardData = await this.getLeaderboardData();
        this.displayLeaderboardModal(leaderboardData);
    }

    /**
     * Display leaderboard modal
     */
    displayLeaderboardModal(leaderboardData) {
        // Create modal HTML
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-xl p-6 max-w-md w-full mx-4 max-h-96 overflow-hidden">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-2xl font-bold text-gray-800">🏆 Leaderboard</h2>
                    <button id="closeLeaderboard" class="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
                </div>
                <div class="overflow-y-auto max-h-72">
                    ${this.generateLeaderboardHTML(leaderboardData)}
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Close button event
        document.getElementById('closeLeaderboard').addEventListener('click', () => {
            modal.remove();
        });

        // Click outside to close
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    /**
     * Generate leaderboard HTML
     */
    generateLeaderboardHTML(leaderboardData) {
        if (!leaderboardData.length) {
            return '<p class="text-center text-gray-500">No scores yet. Be the first!</p>';
        }

        const currentUserId = this.playerInfo?.playerId;
        
        return leaderboardData.map((entry, index) => {
            const isCurrentUser = entry.playerId === currentUserId;
            const rankClass = index < 3 ? 'font-bold text-yellow-600' : 'text-gray-600';
            const bgClass = isCurrentUser ? 'bg-blue-100' : 'hover:bg-gray-50';
            
            return `
                <div class="flex items-center justify-between p-3 ${bgClass} rounded-lg mb-2">
                    <div class="flex items-center">
                        <span class="${rankClass} text-lg w-8">#${index + 1}</span>
                        <span class="font-medium ${isCurrentUser ? 'text-blue-600' : 'text-gray-800'}">
                            ${entry.displayName || 'Player'} ${isCurrentUser ? '(You)' : ''}
                        </span>
                    </div>
                    <span class="font-semibold text-gray-700">Level ${entry.score}</span>
                </div>
            `;
        }).join('');
    }

    /**
     * Show mock purchase dialog for web testing
     */
    showMockPurchaseDialog(callback) {
        console.log('📱 Showing mock purchase dialog...');
        
        const modal = document.createElement('div');
        modal.id = 'mockPurchaseDialog';
        modal.className = 'fixed inset-0 flex items-center justify-center';
        
        // Use inline styles to ensure visibility regardless of CSS framework issues
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            opacity: 1;
        `;
        
        modal.innerHTML = `
            <div style="
                background-color: white;
                border-radius: 12px;
                padding: 24px;
                max-width: 400px;
                width: 90%;
                margin: 16px;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
                text-align: center;
                font-family: Arial, sans-serif;
            ">
                <h2 style="
                    font-size: 24px;
                    font-weight: bold;
                    margin: 0 0 16px 0;
                    color: #333;
                ">💎 Go Ad-Free</h2>
                <p style="
                    color: #666;
                    margin: 0 0 16px 0;
                    font-size: 16px;
                    line-height: 1.5;
                ">Remove all ads and enjoy uninterrupted gameplay!</p>
                <p style="
                    font-size: 28px;
                    font-weight: bold;
                    color: #22c55e;
                    margin: 0 0 24px 0;
                ">$9.99</p>
                <div style="
                    display: flex;
                    gap: 12px;
                ">
                    <button id="mockPurchaseConfirm" style="
                        flex: 1;
                        background-color: #22c55e;
                        color: white;
                        padding: 12px 16px;
                        border-radius: 8px;
                        border: none;
                        font-size: 16px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: background-color 0.2s;
                    ">Purchase</button>
                    <button id="mockPurchaseCancel" style="
                        flex: 1;
                        background-color: #d1d5db;
                        color: #374151;
                        padding: 12px 16px;
                        border-radius: 8px;
                        border: none;
                        font-size: 16px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: background-color 0.2s;
                    ">Cancel</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        console.log('✅ Mock purchase dialog added to DOM');
        
        // Add hover effects
        const confirmBtn = document.getElementById('mockPurchaseConfirm');
        const cancelBtn = document.getElementById('mockPurchaseCancel');
        
        confirmBtn.addEventListener('mouseenter', () => {
            confirmBtn.style.backgroundColor = '#16a34a';
        });
        confirmBtn.addEventListener('mouseleave', () => {
            confirmBtn.style.backgroundColor = '#22c55e';
        });
        
        cancelBtn.addEventListener('mouseenter', () => {
            cancelBtn.style.backgroundColor = '#9ca3af';
        });
        cancelBtn.addEventListener('mouseleave', () => {
            cancelBtn.style.backgroundColor = '#d1d5db';
        });

        
        confirmBtn.addEventListener('click', () => {
            console.log('🎉 Mock purchase confirmed!');
            this.setPremiumStatus(true);
            modal.remove();
            
            // Trigger the game's purchase success handler with fallback
            console.log('🔄 Calling game onPurchaseSuccess...');
            
            // Try multiple ways to call the success handler
            let successHandlerCalled = false;
            
            // Method 1: Direct call to window.game.onPurchaseSuccess
            if (window.game && typeof window.game.onPurchaseSuccess === 'function') {
                try {
                    window.game.onPurchaseSuccess();
                    successHandlerCalled = true;
                    console.log('✅ Called window.game.onPurchaseSuccess()');
                } catch (error) {
                    console.error('❌ Error calling window.game.onPurchaseSuccess:', error);
                }
            }
            
            // Method 2: Try to find game instance globally
            if (!successHandlerCalled && window.ballSortGameInstance && typeof window.ballSortGameInstance.onPurchaseSuccess === 'function') {
                try {
                    window.ballSortGameInstance.onPurchaseSuccess();
                    successHandlerCalled = true;
                    console.log('✅ Called window.ballSortGameInstance.onPurchaseSuccess()');
                } catch (error) {
                    console.error('❌ Error calling window.ballSortGameInstance.onPurchaseSuccess:', error);
                }
            }
            
            // Method 3: Manual fallback - show success notification directly
            if (!successHandlerCalled) {
                console.log('⚠️ Game onPurchaseSuccess method not found - showing manual success notification');
                this.showManualSuccessNotification();
                
                // Try to hide ads manually
                this.hideAdsManually();
            }
            
            callback(true);
        });

        cancelBtn.addEventListener('click', () => {
            console.log('❌ Mock purchase cancelled');
            modal.remove();
            callback(false);
        });
        
        // Add backdrop click to close
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                console.log('🔙 Mock purchase dialog closed by backdrop click');
                modal.remove();
                callback(false);
            }
        });
    }

    /**
     * Show manual success notification when game handler is not available
     */
    showManualSuccessNotification() {
        console.log('🎉 Showing manual purchase success notification...');
        
        const notification = document.createElement('div');
        notification.id = 'manualSuccessNotification';
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #22c55e, #3b82f6);
            color: white;
            padding: 24px 32px;
            border-radius: 12px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            z-index: 10001;
            text-align: center;
            font-family: Arial, sans-serif;
            animation: successPulse 0.6s ease-out;
        `;
        
        notification.innerHTML = `
            <div style="font-size: 48px; margin-bottom: 8px;">💎✨</div>
            <div style="font-size: 24px; font-weight: bold; margin-bottom: 8px;">Purchase Successful!</div>
            <div style="font-size: 16px; opacity: 0.9; margin-bottom: 12px;">Premium features activated</div>
            <div style="font-size: 14px; background: rgba(255,255,255,0.2); padding: 8px 16px; border-radius: 20px;">
                All ads removed • Unlimited gameplay
            </div>
        `;
        
        // Add CSS animation
        if (!document.querySelector('#successAnimationStyle')) {
            const style = document.createElement('style');
            style.id = 'successAnimationStyle';
            style.textContent = `
                @keyframes successPulse {
                    0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0; }
                    50% { transform: translate(-50%, -50%) scale(1.05); }
                    100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                }
                @keyframes confettiFall {
                    0% { transform: translate(-50%, -50%) rotate(0deg) scale(1); opacity: 1; }
                    100% { transform: translate(-50%, -50%) translateY(200px) rotate(360deg) scale(0); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        // Show confetti effect
        this.showConfettiEffect();
        
        // Remove notification after 4 seconds
        setTimeout(() => {
            notification.style.transition = 'all 0.5s ease-out';
            notification.style.opacity = '0';
            notification.style.transform = 'translate(-50%, -50%) scale(0.8)';
            setTimeout(() => notification.remove(), 500);
        }, 3500);
    }

    /**
     * Show confetti effect
     */
    showConfettiEffect() {
        console.log('🎊 Showing confetti effect...');
        
        for (let i = 0; i < 20; i++) {
            const confetti = document.createElement('div');
            confetti.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                width: 10px;
                height: 10px;
                background: ${['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'][Math.floor(Math.random() * 5)]};
                border-radius: 50%;
                pointer-events: none;
                z-index: 10000;
                animation: confettiFall 3s ease-out forwards;
                animation-delay: ${Math.random() * 1000}ms;
                transform: translate(-50%, -50%) rotate(${Math.random() * 360}deg);
            `;
            
            document.body.appendChild(confetti);
            
            // Remove confetti after animation
            setTimeout(() => confetti.remove(), 3500);
        }
    }

    /**
     * Hide ads manually when game instance is not available
     */
    hideAdsManually() {
        console.log('🚫 Hiding ads manually...');
        
        // Hide banner ads
        const bannerContainer = document.getElementById('bannerAdContainer');
        if (bannerContainer) {
            bannerContainer.style.display = 'none';
            console.log('✅ Banner ads hidden manually');
        }
        
        // Hide interstitial ad modal
        const interstitialModal = document.getElementById('interstitialAdModal');
        if (interstitialModal) {
            interstitialModal.style.display = 'none';
            console.log('✅ Interstitial ads hidden manually');
        }
        
        // Hide other ad containers
        const adSelectors = [
            '.ad-container',
            '.interstitial-ad',
            '.banner-ad',
            '.rewarded-ad',
            '#googleAdContainer',
            '#mobileAdContainer',
            '.admob-ad'
        ];
        
        adSelectors.forEach(selector => {
            const ads = document.querySelectorAll(selector);
            ads.forEach(ad => {
                ad.style.display = 'none';
            });
        });
        
        console.log('✅ All ads hidden manually');
    }

    /**
     * Alias methods for test compatibility
     */
    
    // Alias for getLeaderboardData()
    async getLeaderboard() {
        return await this.getLeaderboardData();
    }
    
    // Alias for saveToCloud()
    async saveProgress(data) {
        return await this.saveToCloud(data);
    }
    
    // Alias for loadFromCloud()
    async loadProgress() {
        return await this.loadFromCloud();
    }
    
    // Alias for isPremiumUser()
    isPremium() {
        return this.isPremiumUser();
    }
}

// Export for global use
window.GooglePlayGamesManager = GooglePlayGamesManager;
