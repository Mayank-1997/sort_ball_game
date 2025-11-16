# Audio Files for Ball Sort Puzzle Game

This folder contains the sound effects for the Ball Sort Puzzle game. The game expects these specific audio files:

## Required Sound Files

1. **select.mp3** - Sound when selecting a ball (clicking on a tube with balls)
2. **pop.mp3** - Sound for deselecting or clicking empty tube  
3. **transfer.mp3** - Sound when successfully moving ball(s) from one tube to another
4. **error.mp3** - Sound when attempting an invalid move
5. **warning.mp3** - Sound for warnings (currently unused but reserved)
6. **victory.mp3** - Sound when completing a level
7. **congratulations.mp3** - Sound for special achievements

## Audio Requirements

- **Format**: MP3 (most compatible across browsers)
- **Duration**: 0.2-1.0 seconds for UI sounds, up to 2-3 seconds for victory sounds
- **Volume**: Medium level (game sets volume to 50% automatically)
- **Quality**: 44.1kHz sample rate recommended

## Free Sound Sources

### 1. Freesound.org (Requires free account)
- High quality, diverse sounds
- Creative Commons licensed
- URL: https://freesound.org

### 2. Zapsplat (Free with account)
- Professional sound library
- High quality MP3s
- URL: https://zapsplat.com

### 3. OpenGameArt.org
- Game-specific sounds
- Open source friendly
- URL: https://opengameart.org

### 4. BBC Sound Effects (Free)
- Professional BBC sound library
- Public domain sounds
- URL: https://sound-effects.bbcrewind.co.uk

### 5. Adobe Audition (Free sounds)
- Included with Creative Cloud
- Professional quality
- Built-in sound library

## Recommended Sound Types

### select.mp3
- Soft chime, bell, or click
- Pleasant, not jarring
- Duration: 0.2-0.5 seconds

### pop.mp3  
- Short pop, click, or tap
- Lighter than select sound
- Duration: 0.1-0.3 seconds

### transfer.mp3
- Whoosh, slide, or satisfying pop
- Indicates successful action
- Duration: 0.3-0.8 seconds

### error.mp3
- Buzz, beep, or negative sound
- Should sound different from success sounds
- Duration: 0.3-0.6 seconds

### victory.mp3
- Triumphant chime, bell sequence, or fanfare
- Celebratory but not too long
- Duration: 1-2 seconds

### congratulations.mp3
- Longer celebratory sound
- Musical sequence or fanfare
- Duration: 2-3 seconds

## Installation Instructions

1. Download audio files in MP3 format
2. Rename them to match the exact filenames listed above
3. Place them in this `/src/audio/` folder
4. Test the game - sounds should play automatically

## Testing Sounds

- Use the "Test Sound 🔊" button in the game to test audio functionality
- Check browser console for any audio loading errors
- Ensure browser allows audio playback (some browsers block autoplay)

## Troubleshooting

If sounds don't play:
1. Check browser console for errors
2. Ensure files are named exactly as specified
3. Try different browsers (Chrome usually works best)
4. Check if browser has audio/autoplay blocked
5. Verify file formats are standard MP3

## License Note

When downloading sounds, ensure they are:
- Royalty-free for commercial use, OR
- Creative Commons licensed, OR  
- Public domain

Always check licensing requirements for any downloaded audio files.
