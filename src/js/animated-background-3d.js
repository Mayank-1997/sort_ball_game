/**
 * 3D Animated Background System for Ball Sort Game
 * Creates dynamic animated background elements behind the game canvas
 */

class AnimatedBackground3D {
    constructor() {
        this.container = null;
        this.particles = [];
        this.animatedElements = [];
        this.isInitialized = false;
    }
    
    /**
     * Initialize the 3D animated background system
     */
    initialize() {
        this.container = document.querySelector('.game-canvas-3d-background');
        if (!this.container) {
            console.warn('3D Background container not found');
            return;
        }
        
        this.createDynamicParticles();
        this.createFloatingElements();
        this.startAnimationLoop();
        this.isInitialized = true;
        
        console.log('✅ 3D Animated Background initialized');
    }
    
    /**
     * Create additional dynamic particles
     */
    createDynamicParticles() {
        const colors = [
            '255, 107, 107',   // Red
            '78, 205, 196',    // Turquoise
            '69, 183, 209',    // Sky Blue
            '150, 206, 180',   // Mint Green
            '254, 202, 87',    // Golden Yellow
            '255, 159, 243',   // Hot Pink
            '84, 160, 255',    // Electric Blue
            '245, 87, 108'     // Red Orange
        ];
        
        const particleSystem = this.container.querySelector('.particle-system');
        if (!particleSystem) return;
        
        // Create 20 additional dynamic particles
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            const color = colors[Math.floor(Math.random() * colors.length)];
            const size = Math.random() * 4 + 2; // 2-6px
            const left = Math.random() * 100; // 0-100%
            const duration = Math.random() * 10 + 8; // 8-18s
            const delay = Math.random() * 8; // 0-8s
            const drift = (Math.random() - 0.5) * 80; // -40 to 40px
            
            particle.style.setProperty('--particle-color', color);
            particle.style.setProperty('--size', size + 'px');
            particle.style.left = left + '%';
            particle.style.setProperty('--duration', duration + 's');
            particle.style.setProperty('--delay', delay + 's');
            particle.style.setProperty('--drift', drift + 'px');
            
            particleSystem.appendChild(particle);
            this.particles.push(particle);
        }
    }
    
    /**
     * Create additional floating elements
     */
    createFloatingElements() {
        const ballColors = [
            { color: '#ff6b6b', shadow: '#ee5a52', glow: '255, 107, 107' },
            { color: '#4ecdc4', shadow: '#45b7aa', glow: '78, 205, 196' },
            { color: '#45b7d1', shadow: '#3a9bc1', glow: '69, 183, 209' },
            { color: '#96ceb4', shadow: '#85b8a3', glow: '150, 206, 180' },
            { color: '#feca57', shadow: '#fd9644', glow: '254, 202, 87' },
            { color: '#ff9ff3', shadow: '#f368e0', glow: '255, 159, 243' },
            { color: '#54a0ff', shadow: '#2e86de', glow: '84, 160, 255' },
            { color: '#f5576c', shadow: '#e74c3c', glow: '245, 87, 108' }
        ];
        
        // Create 5 additional floating balls
        for (let i = 0; i < 5; i++) {
            const ball = document.createElement('div');
            ball.className = 'floating-3d-ball';
            
            const colorData = ballColors[Math.floor(Math.random() * ballColors.length)];
            const size = Math.random() * 15 + 15; // 15-30px
            const top = Math.random() * 80 + 10; // 10-90%
            const left = Math.random() * 80 + 10; // 10-90%
            const duration = Math.random() * 8 + 8; // 8-16s
            const delay = Math.random() * 6; // 0-6s
            
            ball.style.setProperty('--ball-color', colorData.color);
            ball.style.setProperty('--ball-shadow', colorData.shadow);
            ball.style.setProperty('--ball-glow', colorData.glow);
            ball.style.width = size + 'px';
            ball.style.height = size + 'px';
            ball.style.top = top + '%';
            ball.style.left = left + '%';
            ball.style.setProperty('--duration', duration + 's');
            ball.style.setProperty('--delay', delay + 's');
            
            this.container.appendChild(ball);
            this.animatedElements.push(ball);
        }
        
        // Create 3 additional floating tubes
        const tubeColors = [
            '102, 126, 234',   // Purple
            '245, 87, 108',    // Red Orange
            '79, 172, 254',    // Blue
            '150, 206, 180',   // Mint
            '254, 202, 87'     // Yellow
        ];
        
        for (let i = 0; i < 3; i++) {
            const tube = document.createElement('div');
            tube.className = 'floating-3d-tube';
            
            const color = tubeColors[Math.floor(Math.random() * tubeColors.length)];
            const width = Math.random() * 8 + 8; // 8-16px
            const height = Math.random() * 25 + 30; // 30-55px
            const top = Math.random() * 70 + 15; // 15-85%
            const left = Math.random() * 70 + 15; // 15-85%
            const duration = Math.random() * 10 + 15; // 15-25s
            const delay = Math.random() * 8; // 0-8s
            
            tube.style.setProperty('--tube-color', color);
            tube.style.setProperty('--tube-glow', color);
            tube.style.width = width + 'px';
            tube.style.height = height + 'px';
            tube.style.top = top + '%';
            tube.style.left = left + '%';
            tube.style.setProperty('--duration', duration + 's');
            tube.style.setProperty('--delay', delay + 's');
            
            this.container.appendChild(tube);
            this.animatedElements.push(tube);
        }
    }
    
    /**
     * Start the animation loop for dynamic effects
     */
    startAnimationLoop() {
        // Periodically add new particles
        setInterval(() => {
            this.addRandomParticle();
        }, 3000); // Every 3 seconds
        
        // Periodically pulse background elements
        setInterval(() => {
            this.pulseRandomElement();
        }, 5000); // Every 5 seconds
    }
    
    /**
     * Add a random particle to the system
     */
    addRandomParticle() {
        const particleSystem = this.container?.querySelector('.particle-system');
        if (!particleSystem || this.particles.length > 50) return; // Limit particles
        
        const colors = ['255, 107, 107', '78, 205, 196', '69, 183, 209', '150, 206, 180', '254, 202, 87'];
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        const color = colors[Math.floor(Math.random() * colors.length)];
        const size = Math.random() * 3 + 2;
        const left = Math.random() * 100;
        const duration = Math.random() * 8 + 10;
        const drift = (Math.random() - 0.5) * 60;
        
        particle.style.setProperty('--particle-color', color);
        particle.style.setProperty('--size', size + 'px');
        particle.style.left = left + '%';
        particle.style.setProperty('--duration', duration + 's');
        particle.style.setProperty('--delay', '0s');
        particle.style.setProperty('--drift', drift + 'px');
        
        particleSystem.appendChild(particle);
        this.particles.push(particle);
        
        // Remove particle after animation
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
                const index = this.particles.indexOf(particle);
                if (index > -1) this.particles.splice(index, 1);
            }
        }, duration * 1000 + 1000);
    }
    
    /**
     * Add pulse effect to random background element
     */
    pulseRandomElement() {
        const allElements = [
            ...this.container.querySelectorAll('.floating-3d-ball'),
            ...this.container.querySelectorAll('.floating-3d-tube')
        ];
        
        if (allElements.length === 0) return;
        
        const randomElement = allElements[Math.floor(Math.random() * allElements.length)];
        randomElement.style.transform = 'scale(1.3)';
        randomElement.style.transition = 'transform 0.3s ease';
        
        setTimeout(() => {
            randomElement.style.transform = '';
            randomElement.style.transition = '';
        }, 300);
    }
    
    /**
     * Clean up the background system
     */
    destroy() {
        // Remove all dynamic elements
        this.particles.forEach(particle => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        });
        
        this.animatedElements.forEach(element => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
        });
        
        this.particles = [];
        this.animatedElements = [];
        this.isInitialized = false;
        
        console.log('🗑️ 3D Animated Background destroyed');
    }
}

// Export for use in game
if (typeof window !== 'undefined') {
    window.AnimatedBackground3D = AnimatedBackground3D;
}