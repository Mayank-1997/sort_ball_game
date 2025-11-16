/**
 * Debug script for Tube Design System integration
 * Tests the tube design system within the game environment
 */

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Tube Design Debug Script loaded');
    
    // Test tube design system availability
    setTimeout(() => {
        testTubeDesignSystemIntegration();
    }, 1000);
});

function testTubeDesignSystemIntegration() {
    console.log('🧪 Testing Tube Design System Integration...');
    
    // Test 1: Check if TubeDesignSystem is available
    if (typeof TubeDesignSystem !== 'undefined') {
        console.log('✅ TubeDesignSystem class is available');
        
        try {
            const testSystem = new TubeDesignSystem();
            console.log('✅ TubeDesignSystem can be instantiated');
            
            // Test design assignment
            const designs = testSystem.generateLevelTubeDesigns(1, 5);
            console.log('✅ Level 1 tube designs:', designs);
            
            // Test individual tube design
            const tubeDesign = testSystem.getTubeDesignForIndex(1, 0);
            console.log('✅ Tube 0 in Level 1:', tubeDesign);
            
        } catch (error) {
            console.error('❌ TubeDesignSystem instantiation failed:', error);
        }
    } else {
        console.error('❌ TubeDesignSystem class not found');
    }
    
    // Test 2: Check if drawing functions are available
    if (typeof drawTubeWithDesign !== 'undefined') {
        console.log('✅ drawTubeWithDesign function is available');
    } else {
        console.error('❌ drawTubeWithDesign function not found');
    }
    
    // Test 3: Check if game instance has tube design system
    setTimeout(() => {
        if (typeof window.game !== 'undefined' && window.game.tubeDesignSystem) {
            console.log('✅ Game instance has tube design system');
            
            // Test design assignment for current level
            const currentLevel = window.game.currentLevel || 1;
            const totalTubes = window.game.tubes ? window.game.tubes.length : 5;
            
            if (totalTubes > 0) {
                const levelDesigns = window.game.tubeDesignSystem.generateLevelTubeDesigns(currentLevel, totalTubes);
                console.log(`✅ Current level ${currentLevel} tube designs:`, levelDesigns);
                
                // Test each tube design
                for (let i = 0; i < totalTubes; i++) {
                    const design = window.game.tubeDesignSystem.getTubeDesignForIndex(currentLevel, i);
                    console.log(`   Tube ${i}: ${design}`);
                }
            }
        } else {
            console.error('❌ Game instance does not have tube design system');
        }
    }, 2000);
    
    // Test 4: Visual test - try to draw different designs on a test canvas
    setTimeout(() => {
        createVisualTest();
    }, 1500);
}

function createVisualTest() {
    console.log('🎨 Creating visual test...');
    
    // Create a test canvas
    const testCanvas = document.createElement('canvas');
    testCanvas.width = 400;
    testCanvas.height = 200;
    testCanvas.style.position = 'fixed';
    testCanvas.style.top = '10px';
    testCanvas.style.right = '10px';
    testCanvas.style.border = '2px solid #333';
    testCanvas.style.background = 'white';
    testCanvas.style.zIndex = '10000';
    testCanvas.title = 'Tube Design Visual Test';
    
    document.body.appendChild(testCanvas);
    
    const ctx = testCanvas.getContext('2d');
    
    // Draw different tube designs
    if (typeof drawTubeWithDesign !== 'undefined') {
        const designs = ['simple', 'round', 'zigzag', 'hexagonal', 'wavy'];
        
        designs.forEach((design, index) => {
            const x = index * 70 + 10;
            const y = 20;
            
            try {
                drawTubeWithDesign(ctx, x, y, 50, 120, design);
                
                // Add label
                ctx.fillStyle = '#333';
                ctx.font = '10px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(design, x + 25, y + 140);
                
                console.log(`✅ Drew ${design} tube successfully`);
            } catch (error) {
                console.error(`❌ Failed to draw ${design} tube:`, error);
                
                // Draw error indicator
                ctx.fillStyle = 'red';
                ctx.fillRect(x, y, 50, 120);
                ctx.fillStyle = 'white';
                ctx.font = '8px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('ERROR', x + 25, y + 60);
            }
        });
    } else {
        ctx.fillStyle = 'red';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('drawTubeWithDesign not available', 200, 100);
    }
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
        if (testCanvas.parentNode) {
            testCanvas.parentNode.removeChild(testCanvas);
            console.log('🗑️ Visual test canvas removed');
        }
    }, 10000);
}