// Debug Expression System
console.log("=== DEBUGGING BALL EXPRESSIONS ===");

// Test the BallExpressionSystem directly
const testSystem = new BallExpressionSystem();

console.log("Available expressions:", testSystem.getAllExpressions());

// Test level 1 with colors 0-4
console.log("\n=== LEVEL 1 EXPRESSIONS ===");
for (let color = 0; color < 5; color++) {
    const expression = testSystem.getExpressionForColor(1, color);
    console.log(`Level 1, Color ${color}: ${expression}`);
}

// Test level 5 with colors 0-4
console.log("\n=== LEVEL 5 EXPRESSIONS ===");
for (let color = 0; color < 5; color++) {
    const expression = testSystem.getExpressionForColor(5, color);
    console.log(`Level 5, Color ${color}: ${expression}`);
}

// Test seeded random function directly
console.log("\n=== TESTING SEEDED RANDOM ===");
for (let i = 0; i < 10; i++) {
    const seed = testSystem.generateSeed(1, i);
    const randomIndex = testSystem.seededRandom(seed, 5);
    const expression = testSystem.expressions[randomIndex];
    console.log(`Seed: ${seed}, Index: ${randomIndex}, Expression: ${expression}`);
}

// Test ball object creation
console.log("\n=== TESTING BALL OBJECTS ===");
for (let color = 0; color < 3; color++) {
    const ballObj = testSystem.convertBallToObject(color, 1);
    console.log(`Ball object for color ${color}:`, ballObj);
}