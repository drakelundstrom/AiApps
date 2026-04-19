# Goat Simulator - 3D Game

A fully-featured 3D goat simulator game built with React, Three.js, and React Three Fiber.

## Features

### Gameplay
- **3D Goat Character**: Fully modeled goat with body, horns, beard, eyes, and legs
- **Physics System**: Realistic gravity, velocity, and collision detection
- **Movement**: WASD/Arrow keys for movement with smooth acceleration
- **Jumping**: Space bar to jump with variable jump physics
- **Headbutting**: Left-click to perform headbutts with cooldown mechanics
- **Collectibles**: Multiple golden spheres scattered around the map to collect for points
- **Score System**: Earn points by collecting items and interacting with the environment
- **Health & Energy**: Track goat vitals - energy decreases with movement and jumps
- **Dynamic Camera**: Third-person camera that follows the goat smoothly

### Environment
- **Terrain**: 100x100 unit play area with grass and boundary walls
- **Obstacles**: Interactive wooden boxes scattered around for environmental challenge
- **Decorative Trees**: Multiple trees placed throughout the level for ambiance
- **Sky and Lighting**: Dynamic lighting with directional shadows and ambient light
- **Fog**: Distance fog for atmospheric depth

### UI/UX
- **In-Game HUD**: Real-time display of score, health, energy, and time
- **Control Instructions**: On-screen keyboard shortcuts reference
- **Pause System**: Toggle pause with P key or button
- **Reset**: New Game button to restart game state
- **Responsive Design**: Mobile-friendly UI that adapts to screen size
- **Pause Overlay**: Clear pause menu with game state preserved

## Controls

| Input | Action |
|-------|--------|
| **W/A/S/D** | Move forward/left/back/right |
| **Arrow Keys** | Alternative movement |
| **SPACE** | Jump |
| **Left Click** | Headbutt |
| **P** | Pause/Resume |
| **Mouse Drag** | Implicit camera control |

## Game Stats

- **Score**: Increases by collecting items (50pts each)
- **Health**: Starts at 100, can be modified by game events
- **Energy**: Depletes with movement/jumping, regenerates when idle
- **Time**: Shows elapsed gameplay time
- **Objects Interacted**: Count of collectibles gathered

## Technical Architecture

### Component Structure

```
GoatSimulator/
├── GoatSimulatorPage.tsx      # Main page component with Canvas setup
├── interfaces.ts               # TypeScript type definitions
├── components/
│   ├── GameEngine.tsx         # Core game logic and state management
│   ├── Goat.tsx               # 3D goat model and rendering
│   ├── Scene.tsx              # Environment, terrain, and collectibles
│   └── GameUI.tsx             # HUD and controls UI
├── constants/
│   └── gameSettings.ts        # Game configuration and constants
└── utils/
    └── physics.ts             # Physics and collision utilities
```

### Key Technologies

- **React**: Component-based architecture
- **Three.js**: 3D rendering engine
- **React Three Fiber**: React renderer for Three.js
- **TypeScript**: Full type safety

### Physics Implementation

- Gravity: 0.015 units/frame
- Jump Force: 0.5 units/frame
- Max Speed: 0.5 units/frame
- Friction: 0.95 multiplier
- Headbutt Cooldown: 500ms

## Game Constants

All game configuration is centralized in `constants/gameSettings.ts`:

- **Terrain Size**: 100x100 units
- **Max Energy**: 100 points
- **Max Health**: 100 points
- **Energy Decay**: 0.05 per frame of movement
- **Obstacles**: 6 placed around the map
- **Collectibles**: 8 items with respawning on reset

## Testing

Comprehensive Playwright tests are available in `tests/goat-simulator.spec.ts`:

- Page load and rendering tests
- UI element visibility checks
- Pause/Resume functionality
- Game reset functionality
- Control input validation
- Event handling tests
- Responsive design tests
- Accessibility checks

### Running Tests

```bash
# Install dependencies
npm install

# Run Playwright tests
npx playwright test tests/goat-simulator.spec.ts

# Run tests in UI mode
npx playwright test --ui

# Run with headed browser
npx playwright test --headed
```

## Performance Considerations

- Optimized shadow rendering with 2048x2048 resolution
- Efficient geometry instancing for obstacles
- FOG for far-distance culling
- Hardware acceleration through WebGL
- requestAnimationFrame for smooth 60fps rendering

## Accessibility

- Keyboard controls for all game actions
- ARIA labels on interactive buttons
- High contrast UI elements
- Support for arrow keys alongside WASD
- Clear visual feedback for game states

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 15+
- Mobile browsers with WebGL support

## Future Enhancement Ideas

- Power-ups and special items
- Multiple levels/arenas
- Multiplayer support
- Sound effects and music
- Ragdoll physics
- Weather effects
- NPCs and interactions
- Procedurally generated terrain
- Mobile touch controls optimization

## Code Quality

- Full TypeScript strict mode
- ESLint with React plugins
- Type-safe component props
- Explicit interfaces for all data structures
- Functional components with hooks
- Memoization for performance

## Troubleshooting

### White screen on load
- Check browser console for WebGL errors
- Ensure GPU supports WebGL 2.0
- Clear browser cache and reload

### Game feels sluggish
- Check GPU/CPU usage
- Reduce shadow map resolution if needed
- Close other intensive applications

### Controls not responding
- Click on canvas to ensure focus
- Check input device connection
- Verify JavaScript is enabled

## Notes

- The game maintains accurate physics simulation for realistic movement
- Score increases naturally through gameplay by collecting items
- Energy acts as a resource balancing system
- The collision detection system prevents the goat from leaving the arena
- All assets are procedurally generated (no external textures needed)

