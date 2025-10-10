# Ball Sort Puzzle Game

A fully functional 2D Ball Sorting Puzzle Game built with HTML5 Canvas, JavaScript, and Tailwind CSS.

## 🎮 Game Features

### Core Gameplay
- **Objective**: Sort colored balls into tubes so each tube contains only one color
- **Rules**: 
  - Only move the top ball from each tube
  - Balls can only be placed on empty tubes or on top of same-colored balls
  - Complete the level when all tubes have single colors

### Progressive Difficulty
- **Beginner Levels (1-5)**: 3-4 tubes, 2-3 colors, 1 empty tube
- **Intermediate Levels (6-15)**: 5-6 tubes, 4-5 colors, more complex arrangements
- **Advanced Levels (16+)**: 7-8 tubes, 6+ colors, challenging puzzles

### Game Features
- **Move Counter**: Track your efficiency
- **Undo System**: Take back mistakes
- **Hint System**: Get help when stuck (3 hints per level)
- **Shuffle Option**: Reorganize balls (2 shuffles per level)
- **Auto-save**: Progress is automatically saved
- **Smooth Animations**: Ball movement with arc trajectories
- **Sound Effects**: Audio feedback for actions
- **Victory Effects**: Particle celebrations on level completion

### Controls
- **Mouse/Touch**: Click tubes to select and move balls
- **Keyboard Shortcuts**:
  - `Esc`: Pause game
  - `R`: Restart level
  - `U`: Undo last move
  - `H`: Show hint

### Visual Features
- **Clean UI**: Modern design with Tailwind CSS
- **Smooth Animations**: Eased ball movements and effects
- **Responsive Design**: Works on desktop and mobile
- **Accessibility**: High contrast support, keyboard navigation
- **Particle Effects**: Victory celebrations and visual feedback

## 🚀 How to Run

1. **Simple Setup**: Open `index.html` in any modern web browser
2. **Local Server** (recommended): 
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   
   # Using VS Code Live Server extension
   Right-click index.html -> "Open with Live Server"
   ```
3. **Access**: Open `http://localhost:8000` in your browser

## 📁 File Structure

```
ball_sort_game/
├── index.html          # Main game page with UI structure
├── game.js            # Complete game logic and rendering
├── styles.css         # Custom CSS animations and styles
├── sw.js             # Service worker for offline play
└── README.md         # This file
```

## 🎯 Game Classes and Structure

### BallSortGame Class
The main game class containing:

- **Game State Management**: Level progression, moves, scoring
- **Tube System**: Ball storage and movement logic
- **Animation Engine**: Smooth ball movements and effects
- **UI Controls**: Button handling and modal management
- **Audio System**: Sound effects for actions
- **Save/Load**: Automatic progress persistence

### Key Methods
- `generateLevel()`: Creates puzzles with progressive difficulty
- `isValidMove()`: Validates ball movement rules
- `moveBall()`: Handles ball movement with animation
- `isLevelComplete()`: Checks win conditions
- `render()`: Canvas drawing and visual effects

## 🎨 Customization Options

### Colors
Modify `ballColors` array in `game.js` to change ball colors:
```javascript
this.ballColors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', // Add more colors
];
```

### Difficulty
Adjust `getLevelConfig()` method to modify:
- Number of tubes per level
- Colors per level
- Balls per tube
- Empty tube ratios

### Animations
Modify easing functions and animation speeds:
```javascript
this.animatingBall.progress += 0.05; // Animation speed
```

### UI Themes
Update CSS variables in `styles.css` for different themes:
- Background gradients
- Button colors
- Tube appearances

## 🔧 Technical Details

### Technologies Used
- **HTML5 Canvas**: Game rendering and graphics
- **JavaScript ES6+**: Game logic and interactions
- **Tailwind CSS**: UI styling and responsive design
- **Web APIs**: LocalStorage, Audio, Service Workers

### Performance Features
- **RequestAnimationFrame**: Smooth 60fps rendering
- **Efficient Rendering**: Only draws what's necessary
- **Memory Management**: Proper cleanup of effects and particles
- **Responsive Canvas**: Adapts to different screen sizes

### Browser Compatibility
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
- Mobile browsers with Canvas support

## 🎵 Audio

The game includes embedded audio effects:
- **Pop Sound**: Ball movement feedback
- **Victory Sound**: Level completion celebration

Audio is embedded as base64 data URIs for offline functionality.

## 🏆 Game Tips

1. **Plan Ahead**: Look for opportunities to create empty spaces
2. **Use Hints Wisely**: Save hints for truly challenging situations
3. **Stack Strategy**: Try to build complete color stacks early
4. **Undo Freely**: Don't hesitate to undo and try different approaches
5. **Pattern Recognition**: Look for repeating color patterns

## 🐛 Known Limitations

- Audio may not work on some mobile browsers without user interaction
- Very large level numbers (50+) may generate extremely difficult puzzles
- Service worker caching may need manual refresh for updates

## 📱 Mobile Support

The game is fully responsive and touch-friendly:
- Touch controls for ball selection and movement
- Responsive UI that adapts to screen size
- Optimized performance for mobile devices

## 🔄 Future Enhancements

Potential additions:
- **Daily Challenges**: Special puzzle mode
- **Themes**: Unlockable visual themes
- **Leaderboards**: Competition and scoring
- **More Animations**: Enhanced visual effects
- **Tutorial Mode**: Interactive learning

## 📄 License

This project is open source and available under the MIT License.

---

**Enjoy playing Ball Sort Puzzle!** 🎉

The game provides hours of engaging puzzle-solving fun with progressively challenging levels and smooth, polished gameplay.
