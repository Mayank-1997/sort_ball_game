/**
 * Enhanced Tube Drawing Functions for Different Tube Designs
 * Contains specialized drawing functions for each tube design type
 */

/**
 * Draw a tube with the specified design and vibrant outline
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} x - X position
 * @param {number} y - Y position  
 * @param {number} width - Tube width
 * @param {number} height - Tube height
 * @param {string} design - Tube design type
 * @param {Array} balls - Balls in the tube
 * @param {number} level - Current level (for color calculation)
 * @param {number} tubeIndex - Tube index (for color calculation)
 */
function drawTubeWithDesign(ctx, x, y, width, height, design, balls = [], level = 1, tubeIndex = 0) {
    ctx.save();
    
    // Get design parameters with vibrant colors
    const tubeDesignSystem = window.tubeDesignSystem || new TubeDesignSystem();
    const params = tubeDesignSystem.getTubeDesignParams(design, width, height, level, tubeIndex);
    
    // Add glow effect around the tube
    ctx.shadowColor = params.glowColor;
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // Draw based on design type
    switch (design) {
        case 'simple':
            drawSimpleTube(ctx, x, y, width, height, params);
            break;
        case 'round':
            drawRoundTube(ctx, x, y, width, height, params);
            break;
        case 'zigzag':
            drawZigzagTube(ctx, x, y, width, height, params);
            break;
        case 'hexagonal':
            drawHexagonalTube(ctx, x, y, width, height, params);
            break;
        case 'wavy':
            drawWavyTube(ctx, x, y, width, height, params);
            break;
        case 'diamond':
            drawDiamondTube(ctx, x, y, width, height, params);
            break;
        case 'star':
            drawStarTube(ctx, x, y, width, height, params);
            break;
        default:
            drawSimpleTube(ctx, x, y, width, height, params);
    }
    
    ctx.restore();
}

/**
 * Draw simple rectangular tube with vibrant outline
 */
function drawSimpleTube(ctx, x, y, width, height, params) {
    // Background fill with slight tint of the outline color
    const tintedFill = ctx.createLinearGradient(x, y, x + width, y);
    tintedFill.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
    tintedFill.addColorStop(0.5, params.outlineColor + '10'); // Very light tint
    tintedFill.addColorStop(1, 'rgba(255, 255, 255, 0.15)');
    
    ctx.fillStyle = tintedFill;
    ctx.fillRect(x, y, width, height);
    
    // Vibrant border with glow
    ctx.save();
    ctx.shadowColor = params.glowColor;
    ctx.shadowBlur = 4;
    ctx.strokeStyle = params.borderColor;
    ctx.lineWidth = params.borderWidth;
    ctx.strokeRect(x, y, width, height);
    ctx.restore();
}

/**
 * Draw rounded tube with gradient effect
 */
function drawRoundTube(ctx, x, y, width, height, params) {
    const radius = params.borderRadius;
    
    // Create gradient background
    const gradient = ctx.createLinearGradient(x, y, x + width, y);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.05)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0.15)');
    
    // Draw rounded rectangle
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    
    // Fill with gradient
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Border
    ctx.strokeStyle = params.borderColor;
    ctx.lineWidth = params.borderWidth;
    ctx.stroke();
}

/**
 * Draw tube with zigzag outline
 */
function drawZigzagTube(ctx, x, y, width, height, params) {
    const zigzagSize = 8;
    const steps = Math.floor(height / zigzagSize);
    
    ctx.beginPath();
    
    // Left zigzag edge
    ctx.moveTo(x, y);
    for (let i = 0; i < steps; i++) {
        const stepY = y + (i * zigzagSize);
        if (i % 2 === 0) {
            ctx.lineTo(x - 3, stepY + zigzagSize / 2);
            ctx.lineTo(x, stepY + zigzagSize);
        } else {
            ctx.lineTo(x + 3, stepY + zigzagSize / 2);
            ctx.lineTo(x, stepY + zigzagSize);
        }
    }
    
    // Bottom edge
    ctx.lineTo(x + width, y + height);
    
    // Right zigzag edge
    for (let i = steps - 1; i >= 0; i--) {
        const stepY = y + (i * zigzagSize);
        if (i % 2 === 0) {
            ctx.lineTo(x + width + 3, stepY + zigzagSize / 2);
            ctx.lineTo(x + width, stepY);
        } else {
            ctx.lineTo(x + width - 3, stepY + zigzagSize / 2);
            ctx.lineTo(x + width, stepY);
        }
    }
    
    // Top edge
    ctx.lineTo(x, y);
    ctx.closePath();
    
    // Fill and stroke
    ctx.fillStyle = params.fillColor;
    ctx.fill();
    ctx.strokeStyle = params.borderColor;
    ctx.lineWidth = params.borderWidth;
    ctx.stroke();
}

/**
 * Draw hexagonal tube
 */
function drawHexagonalTube(ctx, x, y, width, height, params) {
    const cutSize = width * 0.15;
    
    ctx.beginPath();
    ctx.moveTo(x + cutSize, y);
    ctx.lineTo(x + width - cutSize, y);
    ctx.lineTo(x + width, y + cutSize);
    ctx.lineTo(x + width, y + height - cutSize);
    ctx.lineTo(x + width - cutSize, y + height);
    ctx.lineTo(x + cutSize, y + height);
    ctx.lineTo(x, y + height - cutSize);
    ctx.lineTo(x, y + cutSize);
    ctx.closePath();
    
    // Fill and stroke
    ctx.fillStyle = params.fillColor;
    ctx.fill();
    ctx.strokeStyle = params.borderColor;
    ctx.lineWidth = params.borderWidth;
    ctx.stroke();
}

/**
 * Draw wavy tube
 */
function drawWavyTube(ctx, x, y, width, height, params) {
    const waveAmplitude = 5;
    const waveFrequency = 0.02;
    
    ctx.beginPath();
    
    // Left wavy edge
    ctx.moveTo(x, y);
    for (let i = 0; i <= height; i += 2) {
        const waveX = x + Math.sin(i * waveFrequency) * waveAmplitude;
        ctx.lineTo(waveX, y + i);
    }
    
    // Bottom edge
    ctx.lineTo(x + width, y + height);
    
    // Right wavy edge
    for (let i = height; i >= 0; i -= 2) {
        const waveX = x + width + Math.sin(i * waveFrequency + Math.PI) * waveAmplitude;
        ctx.lineTo(waveX, y + i);
    }
    
    // Top edge
    ctx.lineTo(x, y);
    ctx.closePath();
    
    // Fill and stroke
    ctx.fillStyle = params.fillColor;
    ctx.fill();
    ctx.strokeStyle = params.borderColor;
    ctx.lineWidth = params.borderWidth;
    ctx.stroke();
}

/**
 * Draw diamond-shaped tube
 */
function drawDiamondTube(ctx, x, y, width, height, params) {
    const diamondSize = Math.min(width, height) * 0.1;
    
    ctx.beginPath();
    
    // Create diamond pattern on edges
    const segments = 6;
    const segmentHeight = height / segments;
    
    // Left edge with diamonds
    ctx.moveTo(x, y);
    for (let i = 0; i < segments; i++) {
        const segY = y + (i * segmentHeight);
        ctx.lineTo(x - diamondSize, segY + segmentHeight * 0.25);
        ctx.lineTo(x, segY + segmentHeight * 0.5);
        ctx.lineTo(x - diamondSize, segY + segmentHeight * 0.75);
        ctx.lineTo(x, segY + segmentHeight);
    }
    
    // Bottom and right edges (straight)
    ctx.lineTo(x + width, y + height);
    ctx.lineTo(x + width, y);
    ctx.lineTo(x, y);
    ctx.closePath();
    
    // Fill and stroke
    ctx.fillStyle = params.fillColor;
    ctx.fill();
    ctx.strokeStyle = params.borderColor;
    ctx.lineWidth = params.borderWidth;
    ctx.stroke();
}

/**
 * Draw star-pattern tube
 */
function drawStarTube(ctx, x, y, width, height, params) {
    // Base rectangle
    ctx.fillStyle = params.fillColor;
    ctx.fillRect(x, y, width, height);
    
    // Add star decorations on corners
    const starSize = 8;
    
    // Draw small stars at intervals
    ctx.fillStyle = params.borderColor;
    for (let i = 0; i < 3; i++) {
        const starY = y + (height / 4) * (i + 1);
        drawSmallStar(ctx, x - starSize/2, starY, starSize/2);
        drawSmallStar(ctx, x + width + starSize/2, starY, starSize/2);
    }
    
    // Main border
    ctx.strokeStyle = params.borderColor;
    ctx.lineWidth = params.borderWidth;
    ctx.strokeRect(x, y, width, height);
}

/**
 * Helper function to draw a small star
 */
function drawSmallStar(ctx, centerX, centerY, radius) {
    ctx.save();
    ctx.translate(centerX, centerY);
    
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
        const angle = (i * 144 - 90) * Math.PI / 180;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
}

// Export functions for use in game
if (typeof window !== 'undefined') {
    window.drawTubeWithDesign = drawTubeWithDesign;
    window.drawSimpleTube = drawSimpleTube;
    window.drawRoundTube = drawRoundTube;
    window.drawZigzagTube = drawZigzagTube;
    window.drawHexagonalTube = drawHexagonalTube;
    window.drawWavyTube = drawWavyTube;
    window.drawDiamondTube = drawDiamondTube;
    window.drawStarTube = drawStarTube;
}