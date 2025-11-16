/**
 * Interactive Feature Tutorial System
 * Provides guided introduction to all game features with skip option
 */

class FeatureTutorial {
    constructor(gameInstance) {
        this.game = gameInstance;
        this.currentStep = 0;
        this.isActive = false;
        this.tutorialSteps = [];
        this.overlay = null;
        this.highlightElement = null;
        this.tooltipElement = null;
        
        // Tutorial completion tracking
        this.completedTutorials = this.loadTutorialProgress();
        
        this.initializeTutorialSteps();
        this.createTutorialElements();
    }

    /**
     * Initialize all tutorial steps with detailed explanations
     */
    initializeTutorialSteps() {
        this.tutorialSteps = [
            {
                id: 'welcome',
                title: '🎮 Welcome to Ball Sort Puzzle!',
                description: 'Let me show you all the amazing features in this game. You can skip this tutorial anytime!',
                target: null,
                position: 'center',
                showSkip: true,
                action: null
            },
            {
                id: 'level_grid',
                title: '🎯 Level Selection Grid',
                description: 'This is your level progress grid. Green levels are completed, blue is current, and gray are locked. Tap any unlocked level to play!',
                target: '#level-grid',
                position: 'bottom',
                showSkip: true,
                action: () => this.highlightLevelGrid()
            },
            {
                id: 'level_stars',
                title: '⭐ Star Rating System',
                description: 'Complete levels efficiently to earn up to 3 stars! Stars show your mastery of each level.',
                target: '.level-button[data-level="1"]',
                position: 'top',
                showSkip: true,
                action: () => this.highlightStarSystem()
            },
            {
                id: 'progress_bar',
                title: '📊 Progress Bar',
                description: 'Track your overall game completion here. See how many levels you\'ve conquered out of 200!',
                target: '#progress-bar',
                position: 'bottom',
                showSkip: true,
                action: () => this.highlightProgressBar()
            },
            {
                id: 'level_timer',
                title: '⏱️ Level Timer',
                description: 'This timer tracks how long you take to complete each level. Faster completion earns more stars!',
                target: '#game-timer',
                position: 'bottom',
                showSkip: true,
                action: () => this.highlightTimer()
            },
            {
                id: 'hint_system',
                title: '💡 Hint System',
                description: 'Stuck on a level? Use hints to get helpful suggestions! You can earn more hints by watching ads.',
                target: '#hint-button',
                position: 'top',
                showSkip: true,
                action: () => this.highlightHintButton()
            },
            {
                id: 'restart_option',
                title: '🔄 Restart Level',
                description: 'Made a mistake? No problem! Restart the level anytime to try a different approach.',
                target: '#restart-button',
                position: 'top',
                showSkip: true,
                action: () => this.highlightRestartButton()
            },
            {
                id: 'ads_system',
                title: '📺 Smart Ad System',
                description: 'Choose your ad experience! Watch 20 seconds for quick rewards or 30 seconds for bigger bonuses.',
                target: '#watch-ad-button',
                position: 'top',
                showSkip: true,
                action: () => this.highlightAdSystem()
            },
            {
                id: 'go_ad_free',
                title: '🌟 Go Ad-Free Premium',
                description: 'Upgrade to premium for an uninterrupted experience! Remove all ads and unlock exclusive features.',
                target: '#go-ad-free-button',
                position: 'top',
                showSkip: true,
                action: () => this.highlightPremiumFeatures()
            },
            {
                id: 'leaderboard',
                title: '🏆 Global Leaderboards',
                description: 'Compete with players worldwide! See your ranking in total levels completed, fastest times, and more.',
                target: '#leaderboard-button',
                position: 'top',
                showSkip: true,
                action: () => this.highlightLeaderboard()
            },
            {
                id: 'achievements',
                title: '🎖️ Achievement System',
                description: 'Unlock achievements as you play! Complete challenges to earn special badges and bragging rights.',
                target: '#achievements-button',
                position: 'top',
                showSkip: true,
                action: () => this.highlightAchievements()
            },
            {
                id: 'settings',
                title: '⚙️ Game Settings',
                description: 'Customize your experience! Adjust sound, effects, and other preferences to your liking.',
                target: '#settings-button',
                position: 'top',
                showSkip: true,
                action: () => this.highlightSettings()
            },
            {
                id: 'completion',
                title: '🎉 You\'re All Set!',
                description: 'You now know all the features! Start playing and enjoy your Ball Sort Puzzle adventure. Have fun!',
                target: null,
                position: 'center',
                showSkip: false,
                action: () => this.completeTutorial()
            }
        ];
    }

    /**
     * Create tutorial overlay and tooltip elements
     */
    createTutorialElements() {
        // Create overlay
        this.overlay = document.createElement('div');
        this.overlay.id = 'tutorial-overlay';
        this.overlay.className = 'tutorial-overlay';
        this.overlay.innerHTML = `
            <div class="tutorial-background"></div>
            <div class="tutorial-highlight"></div>
        `;

        // Create tooltip
        this.tooltipElement = document.createElement('div');
        this.tooltipElement.id = 'tutorial-tooltip';
        this.tooltipElement.className = 'tutorial-tooltip';

        // Add to body
        document.body.appendChild(this.overlay);
        document.body.appendChild(this.tooltipElement);

        // Hide initially
        this.overlay.style.display = 'none';
        this.tooltipElement.style.display = 'none';
    }

    /**
     * Start the tutorial system
     */
    startTutorial() {
        // Check if user has completed tutorial before
        if (this.completedTutorials.featureGuide && !this.forceRestart) {
            this.showTutorialMenu();
            return;
        }

        this.isActive = true;
        this.currentStep = 0;
        this.showStep(this.currentStep);
        this.trackTutorialEvent('tutorial_started');
    }

    /**
     * Show tutorial menu for returning users
     */
    showTutorialMenu() {
        const menuHtml = `
            <div class="tutorial-menu">
                <div class="tutorial-menu-content">
                    <h3>🎮 Feature Guide</h3>
                    <p>Welcome back! Would you like to:</p>
                    <div class="tutorial-menu-buttons">
                        <button class="btn-tutorial-option" onclick="featureTutorial.startFullTutorial()">
                            📚 See Full Guide
                        </button>
                        <button class="btn-tutorial-option" onclick="featureTutorial.showQuickTips()">
                            ⚡ Quick Tips Only
                        </button>
                        <button class="btn-tutorial-option" onclick="featureTutorial.skipTutorial()">
                            🎯 Skip to Game
                        </button>
                    </div>
                    <div class="tutorial-menu-footer">
                        <small>You can always access this guide from the settings menu</small>
                    </div>
                </div>
            </div>
        `;

        this.showCustomDialog(menuHtml);
    }

    /**
     * Start full tutorial (for returning users)
     */
    startFullTutorial() {
        this.forceRestart = true;
        this.hideCustomDialog();
        this.startTutorial();
    }

    /**
     * Show quick tips version
     */
    showQuickTips() {
        const quickTipsHtml = `
            <div class="quick-tips">
                <div class="quick-tips-content">
                    <h3>⚡ Quick Tips</h3>
                    <div class="tips-grid">
                        <div class="tip-item">
                            <div class="tip-icon">⭐</div>
                            <div class="tip-text">Complete levels faster for more stars</div>
                        </div>
                        <div class="tip-item">
                            <div class="tip-icon">💡</div>
                            <div class="tip-text">Use hints when stuck on difficult levels</div>
                        </div>
                        <div class="tip-item">
                            <div class="tip-icon">🏆</div>
                            <div class="tip-text">Check leaderboards to compete globally</div>
                        </div>
                        <div class="tip-item">
                            <div class="tip-icon">🌟</div>
                            <div class="tip-text">Go premium for an ad-free experience</div>
                        </div>
                        <div class="tip-item">
                            <div class="tip-icon">📺</div>
                            <div class="tip-text">Choose 20s or 30s ad options for rewards</div>
                        </div>
                        <div class="tip-item">
                            <div class="tip-icon">🎖️</div>
                            <div class="tip-text">Unlock achievements for special challenges</div>
                        </div>
                    </div>
                    <button class="btn-continue" onclick="featureTutorial.skipTutorial()">
                        🎮 Start Playing!
                    </button>
                </div>
            </div>
        `;

        this.showCustomDialog(quickTipsHtml);
        this.trackTutorialEvent('quick_tips_shown');
    }

    /**
     * Show individual tutorial step
     */
    showStep(stepIndex) {
        if (stepIndex >= this.tutorialSteps.length) {
            this.endTutorial();
            return;
        }

        const step = this.tutorialSteps[stepIndex];
        
        // Execute step action if provided
        if (step.action) {
            step.action();
        }

        // Show overlay and highlight target
        this.showOverlay();
        this.highlightTarget(step.target);
        this.showTooltip(step);

        // Track step view
        this.trackTutorialEvent('tutorial_step_viewed', { step: step.id });
    }

    /**
     * Show overlay
     */
    showOverlay() {
        this.overlay.style.display = 'block';
        this.overlay.style.opacity = '0';
        
        // Fade in animation
        setTimeout(() => {
            this.overlay.style.transition = 'opacity 0.3s ease';
            this.overlay.style.opacity = '1';
        }, 10);
    }

    /**
     * Highlight target element
     */
    highlightTarget(targetSelector) {
        const highlight = this.overlay.querySelector('.tutorial-highlight');
        
        if (!targetSelector) {
            highlight.style.display = 'none';
            return;
        }

        const targetElement = document.querySelector(targetSelector);
        if (!targetElement) {
            highlight.style.display = 'none';
            return;
        }

        const rect = targetElement.getBoundingClientRect();
        const padding = 8;

        highlight.style.display = 'block';
        highlight.style.left = (rect.left - padding) + 'px';
        highlight.style.top = (rect.top - padding) + 'px';
        highlight.style.width = (rect.width + padding * 2) + 'px';
        highlight.style.height = (rect.height + padding * 2) + 'px';
        highlight.style.borderRadius = '8px';
        highlight.style.boxShadow = '0 0 0 4px rgba(255, 255, 255, 0.8), 0 0 0 9999px rgba(0, 0, 0, 0.6)';
        highlight.style.animation = 'tutorialPulse 2s infinite';
    }

    /**
     * Show tooltip with step information
     */
    showTooltip(step) {
        const tooltip = this.tooltipElement;
        
        tooltip.innerHTML = `
            <div class="tooltip-header">
                <h4>${step.title}</h4>
                <span class="tooltip-progress">${this.currentStep + 1} / ${this.tutorialSteps.length}</span>
            </div>
            <div class="tooltip-content">
                <p>${step.description}</p>
            </div>
            <div class="tooltip-actions">
                ${step.showSkip ? '<button class="btn-skip" onclick="featureTutorial.skipTutorial()">⏭️ Skip Tutorial</button>' : ''}
                ${this.currentStep > 0 ? '<button class="btn-prev" onclick="featureTutorial.previousStep()">⬅️ Previous</button>' : ''}
                <button class="btn-next" onclick="featureTutorial.nextStep()">
                    ${this.currentStep < this.tutorialSteps.length - 1 ? 'Next ➡️' : 'Finish 🎉'}
                </button>
            </div>
        `;

        tooltip.style.display = 'block';
        this.positionTooltip(step.target, step.position);
    }

    /**
     * Position tooltip relative to target
     */
    positionTooltip(targetSelector, position) {
        const tooltip = this.tooltipElement;
        
        if (!targetSelector || position === 'center') {
            // Center the tooltip
            tooltip.style.position = 'fixed';
            tooltip.style.top = '50%';
            tooltip.style.left = '50%';
            tooltip.style.transform = 'translate(-50%, -50%)';
            tooltip.style.maxWidth = '400px';
            return;
        }

        const targetElement = document.querySelector(targetSelector);
        if (!targetElement) {
            // Fallback to center
            tooltip.style.position = 'fixed';
            tooltip.style.top = '50%';
            tooltip.style.left = '50%';
            tooltip.style.transform = 'translate(-50%, -50%)';
            return;
        }

        const rect = targetElement.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        const padding = 16;

        tooltip.style.position = 'fixed';
        tooltip.style.maxWidth = '320px';

        switch (position) {
            case 'top':
                tooltip.style.top = (rect.top - tooltipRect.height - padding) + 'px';
                tooltip.style.left = (rect.left + rect.width / 2) + 'px';
                tooltip.style.transform = 'translateX(-50%)';
                break;
            case 'bottom':
                tooltip.style.top = (rect.bottom + padding) + 'px';
                tooltip.style.left = (rect.left + rect.width / 2) + 'px';
                tooltip.style.transform = 'translateX(-50%)';
                break;
            case 'left':
                tooltip.style.top = (rect.top + rect.height / 2) + 'px';
                tooltip.style.left = (rect.left - tooltipRect.width - padding) + 'px';
                tooltip.style.transform = 'translateY(-50%)';
                break;
            case 'right':
                tooltip.style.top = (rect.top + rect.height / 2) + 'px';
                tooltip.style.left = (rect.right + padding) + 'px';
                tooltip.style.transform = 'translateY(-50%)';
                break;
        }

        // Ensure tooltip stays within viewport
        this.adjustTooltipPosition();
    }

    /**
     * Adjust tooltip position to stay within viewport
     */
    adjustTooltipPosition() {
        const tooltip = this.tooltipElement;
        const rect = tooltip.getBoundingClientRect();
        const padding = 16;

        if (rect.left < padding) {
            tooltip.style.left = padding + 'px';
            tooltip.style.transform = tooltip.style.transform.replace('translateX(-50%)', '');
        }

        if (rect.right > window.innerWidth - padding) {
            tooltip.style.left = (window.innerWidth - rect.width - padding) + 'px';
            tooltip.style.transform = tooltip.style.transform.replace('translateX(-50%)', '');
        }

        if (rect.top < padding) {
            tooltip.style.top = padding + 'px';
            tooltip.style.transform = tooltip.style.transform.replace('translateY(-50%)', '');
        }

        if (rect.bottom > window.innerHeight - padding) {
            tooltip.style.top = (window.innerHeight - rect.height - padding) + 'px';
            tooltip.style.transform = tooltip.style.transform.replace('translateY(-50%)', '');
        }
    }

    /**
     * Move to next step
     */
    nextStep() {
        this.currentStep++;
        this.showStep(this.currentStep);
    }

    /**
     * Move to previous step
     */
    previousStep() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.showStep(this.currentStep);
        }
    }

    /**
     * Skip tutorial completely
     */
    skipTutorial() {
        this.trackTutorialEvent('tutorial_skipped', { step: this.currentStep });
        this.endTutorial();
        this.hideCustomDialog();
    }

    /**
     * Complete tutorial and mark as finished
     */
    completeTutorial() {
        this.completedTutorials.featureGuide = true;
        this.saveTutorialProgress();
        this.trackTutorialEvent('tutorial_completed');
        this.endTutorial();
    }

    /**
     * End tutorial and hide elements
     */
    endTutorial() {
        this.isActive = false;
        this.hideOverlay();
        this.hideTooltip();
        
        // Show completion message if tutorial was actually completed
        if (this.currentStep >= this.tutorialSteps.length - 1) {
            setTimeout(() => {
                this.showCompletionMessage();
            }, 500);
        }
    }

    /**
     * Hide overlay with animation
     */
    hideOverlay() {
        if (this.overlay) {
            this.overlay.style.transition = 'opacity 0.3s ease';
            this.overlay.style.opacity = '0';
            setTimeout(() => {
                this.overlay.style.display = 'none';
            }, 300);
        }
    }

    /**
     * Hide tooltip
     */
    hideTooltip() {
        if (this.tooltipElement) {
            this.tooltipElement.style.display = 'none';
        }
    }

    /**
     * Show completion message
     */
    showCompletionMessage() {
        const completionHtml = `
            <div class="tutorial-completion">
                <div class="completion-content">
                    <div class="completion-icon">🎉</div>
                    <h3>Tutorial Complete!</h3>
                    <p>You're now ready to master Ball Sort Puzzle!</p>
                    <div class="completion-stats">
                        <div class="stat-item">
                            <strong>13</strong>
                            <span>Features Learned</span>
                        </div>
                        <div class="stat-item">
                            <strong>200</strong>
                            <span>Levels to Conquer</span>
                        </div>
                        <div class="stat-item">
                            <strong>∞</strong>
                            <span>Fun Ahead</span>
                        </div>
                    </div>
                    <button class="btn-start-game" onclick="featureTutorial.hideCustomDialog()">
                        🎮 Start Playing!
                    </button>
                </div>
            </div>
        `;

        this.showCustomDialog(completionHtml);
    }

    /**
     * Show custom dialog
     */
    showCustomDialog(htmlContent) {
        const dialog = document.createElement('div');
        dialog.className = 'tutorial-dialog';
        dialog.innerHTML = htmlContent;
        document.body.appendChild(dialog);

        // Fade in animation
        setTimeout(() => {
            dialog.style.opacity = '1';
        }, 10);
    }

    /**
     * Hide custom dialog
     */
    hideCustomDialog() {
        const dialog = document.querySelector('.tutorial-dialog');
        if (dialog) {
            dialog.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(dialog);
            }, 300);
        }
    }

    // Feature highlighting methods
    highlightLevelGrid() {
        // Add special highlighting to level grid
        const levelGrid = document.querySelector('#level-grid');
        if (levelGrid) {
            levelGrid.classList.add('tutorial-pulse');
            setTimeout(() => levelGrid.classList.remove('tutorial-pulse'), 3000);
        }
    }

    highlightStarSystem() {
        // Highlight star rating system
        const levelButtons = document.querySelectorAll('.level-button');
        levelButtons.forEach((button, index) => {
            if (index < 3) { // Highlight first 3 levels
                button.classList.add('tutorial-star-highlight');
                setTimeout(() => button.classList.remove('tutorial-star-highlight'), 3000);
            }
        });
    }

    highlightProgressBar() {
        const progressBar = document.querySelector('#progress-bar');
        if (progressBar) {
            progressBar.classList.add('tutorial-progress-animation');
            setTimeout(() => progressBar.classList.remove('tutorial-progress-animation'), 3000);
        }
    }

    highlightTimer() {
        const timer = document.querySelector('#game-timer');
        if (timer) {
            timer.classList.add('tutorial-timer-tick');
            setTimeout(() => timer.classList.remove('tutorial-timer-tick'), 3000);
        }
    }

    highlightHintButton() {
        const hintButton = document.querySelector('#hint-button');
        if (hintButton) {
            hintButton.classList.add('tutorial-hint-glow');
            setTimeout(() => hintButton.classList.remove('tutorial-hint-glow'), 3000);
        }
    }

    highlightRestartButton() {
        const restartButton = document.querySelector('#restart-button');
        if (restartButton) {
            restartButton.classList.add('tutorial-restart-spin');
            setTimeout(() => restartButton.classList.remove('tutorial-restart-spin'), 3000);
        }
    }

    highlightAdSystem() {
        // Simulate ad choice popup
        const adInfo = document.createElement('div');
        adInfo.className = 'tutorial-ad-demo';
        adInfo.innerHTML = `
            <div class="ad-demo-content">
                <h4>🎯 Smart Ad Choices</h4>
                <div class="ad-options">
                    <div class="ad-option">
                        <div class="ad-duration">20s</div>
                        <div class="ad-reward">Quick Reward</div>
                    </div>
                    <div class="ad-option">
                        <div class="ad-duration">30s</div>
                        <div class="ad-reward">Big Bonus</div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(adInfo);
        setTimeout(() => {
            if (document.body.contains(adInfo)) {
                document.body.removeChild(adInfo);
            }
        }, 3000);
    }

    highlightPremiumFeatures() {
        // Show premium benefits
        const premiumDemo = document.createElement('div');
        premiumDemo.className = 'tutorial-premium-demo';
        premiumDemo.innerHTML = `
            <div class="premium-demo-content">
                <h4>🌟 Premium Benefits</h4>
                <ul>
                    <li>✅ No ads interruption</li>
                    <li>✅ Unlimited hints</li>
                    <li>✅ Exclusive themes</li>
                    <li>✅ Priority support</li>
                </ul>
            </div>
        `;
        document.body.appendChild(premiumDemo);
        setTimeout(() => {
            if (document.body.contains(premiumDemo)) {
                document.body.removeChild(premiumDemo);
            }
        }, 3000);
    }

    highlightLeaderboard() {
        // Show leaderboard preview
        const leaderboardPreview = document.createElement('div');
        leaderboardPreview.className = 'tutorial-leaderboard-demo';
        leaderboardPreview.innerHTML = `
            <div class="leaderboard-demo-content">
                <h4>🏆 Global Rankings</h4>
                <div class="demo-rankings">
                    <div class="ranking-item">1. SpeedMaster - 198 levels</div>
                    <div class="ranking-item">2. PuzzleQueen - 195 levels</div>
                    <div class="ranking-item">3. BallSorter - 192 levels</div>
                    <div class="ranking-item current">4. You - 15 levels</div>
                </div>
            </div>
        `;
        document.body.appendChild(leaderboardPreview);
        setTimeout(() => {
            if (document.body.contains(leaderboardPreview)) {
                document.body.removeChild(leaderboardPreview);
            }
        }, 3000);
    }

    highlightAchievements() {
        // Show achievement samples
        const achievementDemo = document.createElement('div');
        achievementDemo.className = 'tutorial-achievement-demo';
        achievementDemo.innerHTML = `
            <div class="achievement-demo-content">
                <h4>🎖️ Unlock Achievements</h4>
                <div class="demo-achievements">
                    <div class="achievement unlocked">
                        <span class="achievement-icon">🎯</span>
                        <span class="achievement-name">First Steps</span>
                    </div>
                    <div class="achievement locked">
                        <span class="achievement-icon">⚡</span>
                        <span class="achievement-name">Speed Demon</span>
                    </div>
                    <div class="achievement locked">
                        <span class="achievement-icon">💎</span>
                        <span class="achievement-name">Perfect Score</span>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(achievementDemo);
        setTimeout(() => {
            if (document.body.contains(achievementDemo)) {
                document.body.removeChild(achievementDemo);
            }
        }, 3000);
    }

    highlightSettings() {
        const settingsButton = document.querySelector('#settings-button');
        if (settingsButton) {
            settingsButton.classList.add('tutorial-settings-bounce');
            setTimeout(() => settingsButton.classList.remove('tutorial-settings-bounce'), 3000);
        }
    }

    /**
     * Load tutorial progress from localStorage
     */
    loadTutorialProgress() {
        try {
            const saved = localStorage.getItem('ballsort_tutorial_progress');
            return saved ? JSON.parse(saved) : {};
        } catch (error) {
            console.error('Error loading tutorial progress:', error);
            return {};
        }
    }

    /**
     * Save tutorial progress to localStorage
     */
    saveTutorialProgress() {
        try {
            localStorage.setItem('ballsort_tutorial_progress', JSON.stringify(this.completedTutorials));
        } catch (error) {
            console.error('Error saving tutorial progress:', error);
        }
    }

    /**
     * Track tutorial events for analytics
     */
    trackTutorialEvent(eventName, properties = {}) {
        // Integration with your existing analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, {
                event_category: 'tutorial',
                ...properties
            });
        }
        
        console.log('Tutorial Event:', eventName, properties);
    }

    /**
     * Show tutorial from settings menu
     */
    showFromSettings() {
        this.forceRestart = true;
        this.startTutorial();
    }

    /**
     * Show quick help for specific feature
     */
    showQuickHelp(featureId) {
        const step = this.tutorialSteps.find(s => s.id === featureId);
        if (step) {
            this.showOverlay();
            this.highlightTarget(step.target);
            
            // Create quick help tooltip
            const quickHelpHtml = `
                <div class="tooltip-header">
                    <h4>${step.title}</h4>
                    <button class="btn-close" onclick="featureTutorial.hideQuickHelp()">✕</button>
                </div>
                <div class="tooltip-content">
                    <p>${step.description}</p>
                </div>
                <div class="tooltip-actions">
                    <button class="btn-got-it" onclick="featureTutorial.hideQuickHelp()">
                        👍 Got it!
                    </button>
                </div>
            `;
            
            this.tooltipElement.innerHTML = quickHelpHtml;
            this.tooltipElement.style.display = 'block';
            this.positionTooltip(step.target, step.position);
        }
    }

    /**
     * Hide quick help
     */
    hideQuickHelp() {
        this.hideOverlay();
        this.hideTooltip();
    }
}

// Global instance
let featureTutorial = null;

// Initialize when game is ready
function initializeFeatureTutorial(gameInstance) {
    featureTutorial = new FeatureTutorial(gameInstance);
    return featureTutorial;
}
