# Goat Simulator - Setup & Running Guide

## Quick Start

### 1. Install Dependencies
```bash
cd code/ui/my-react-app
npm install
# if @playwright/test is not already installed:
npm install -D @playwright/test
```

### 2. Run Development Server
```bash
npm run dev
```
The app will be available at `http://localhost:5173`

### 3. Access the Game
- Navigate to `http://localhost:5173`
- Click on "Goat Simulator" in the menu or go to `/goat-simulator`

## Building for Production

```bash
npm run build
npm run preview  # preview the production build locally
```

## Testing

### Setup Playwright
```bash
npm install -D @playwright/test
npx playwright install
```

### Run Tests
```bash
# Run all tests
npm run test

# Run in UI mode (interactive)
npm run test:ui

# Run with visible browser
npm run test:headed

# Run specific test file
npx playwright test tests/goat-simulator.spec.ts

# Run tests in debug mode
npx playwright test --debug
```

### Test Coverage
The test suite includes:
- ✅ Page load and rendering
- ✅ UI element visibility
- ✅ Pause/Resume functionality
- ✅ Game reset
- ✅ Keyboard input handling
- ✅ Mouse click handling
- ✅ Responsive design
- ✅ Stats display and updates
- ✅ Control instructions
- ✅ Accessibility features
- ✅ Console error checking
- ✅ Window resize handling

## Code Quality

### Lint Check
```bash
npm run lint  # Must pass with zero warnings
```

### Type Checking
```bash
npm run typecheck  # Must pass with no TypeScript errors
```

### Run All Checks
```bash
npm run lint && npm run typecheck && npm run build
```

## Gameplay Instructions

### Movement
- **WASD** or **Arrow Keys** - Move the goat around
- **SPACE** - Jump
- **Left Mouse Click** - Headbutt (collect items or break obstacles)

### Game Mechanics
- Collect **golden spheres** for points (+50 per item)
- Your **energy** decreases when moving and jumping
- **Energy** regenerates when idle
- Try to collect all items for the highest score
- **Health** is displayed but can be extended with game events

### UI Controls
- **P** or **Pause Button** - Pause/Resume the game
- **Menu (☰)** - Open navigation menu
- **New Game** - Reset all stats and restart

## Architecture Overview

### Technology Stack
- **React 19**: Component framework
- **Three.js**: 3D graphics
- **React Three Fiber**: React renderer for Three.js
- **Vite**: Build tool
- **TypeScript**: Type safety
- **Playwright**: E2E testing

### File Structure
```
src/pages/GoatSimulator/
├── GoatSimulatorPage.tsx           # Main page entry
├── README.md                       # Feature documentation
├── interfaces.ts                   # Type definitions
├── components/
│   ├── GameEngine.tsx              # Game loop & logic
│   ├── Goat.tsx                    # 3D goat model
│   ├── Scene.tsx                   # Environment
│   └── GameUI.tsx                  # HUD & buttons
├── constants/
│   └── gameSettings.ts             # Config & constants
└── utils/
    └── physics.ts                  # Physics utilities

tests/
└── goat-simulator.spec.ts          # End-to-end tests
```

## Troubleshooting

### Issue: Tests fail to connect
**Solution**: Make sure dev server is running
```bash
npm run dev  # in one terminal
npm run test  # in another terminal
```

### Issue: White screen when opening game
**Solution**: Check browser console for errors, ensure:
- Dev server is running
- WebGL is enabled in browser
- JavaScript is not blocked
- GPU drivers are up to date

### Issue: Game controls not responding
**Solution**:
- Click the canvas area to focus it
- Check if game is paused
- Verify keyboard input by checking console

### Issue: Lint errors after changes
**Solution**:
```bash
npm run lint  # See what's wrong
# Fix issues manually or with:
npx eslint . --fix
```

### Issue: TypeScript errors
**Solution**:
```bash
npm run typecheck  # See detailed errors
# Ensure all variable types are explicit
# Use interfaces for complex objects
```

## Performance Tips

### For Better Performance
- Close other browser tabs
- Ensure GPU acceleration is enabled
- Run in Chrome or Edge (typically fastest)
- Use `npm run preview` for production build testing

### Performance Metrics
- Target: 60 FPS
- Shadow map resolution: 2048x2048
- Draw calls: ~50-100
- Typical GPU usage: 15-30%

## Development Workflow

### Making Changes
1. Make code changes
2. Test locally: `npm run dev`
3. Verify lint: `npm run lint`
4. Verify types: `npm run typecheck`
5. Run tests: `npm run test`
6. Build: `npm run build`

### Adding New Features
1. Add TypeScript interfaces in `interfaces.ts`
2. Add constants in `constants/gameSettings.ts`
3. Implement in appropriate component
4. Add corresponding tests in `tests/goat-simulator.spec.ts`
5. Update README with feature description

## Deployment Notes

The game is compatible with Azure Static Web Apps and can be deployed via the GitHub Actions workflow in `.github/workflows/app-deploy.yml`

### Pre-deployment Checklist
- [ ] lint passes: `npm run lint`
- [ ] types check: `npm run typecheck`
- [ ] builds successfully: `npm run build`
- [ ] tests pass: `npm run test`
- [ ] game loads on `/goat-simulator` route
- [ ] controls respond to input
- [ ] UI is responsive

## Browser Support

| Browser | Support |
|---------|---------|
| Chrome 90+ | ✅ Full |
| Edge 90+ | ✅ Full |
| Firefox 88+ | ✅ Full |
| Safari 15+ | ✅ Full |
| Mobile Chrome | ✅ Good |
| Mobile Safari | ✅ Good |

## Additional Resources

- Three.js Docs: https://threejs.org/docs/
- React Three Fiber: https://docs.pmnd.rs/react-three-fiber/
- Playwright Testing: https://playwright.dev/
- TypeScript: https://www.typescriptlang.org/

## Getting Help

If you encounter issues:
1. Check the browser console (F12) for errors
2. Review the React Three Fiber documentation
3. Check existing game files for similar patterns
4. Ensure all TypeScript types are explicit
5. Verify all dependencies are installed: `npm install`
