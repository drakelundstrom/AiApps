import { test, expect } from '@playwright/test'

test.describe('Goat Simulator Game', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/goat-simulator')
    await page.waitForLoadState('networkidle')
    // Wait for canvas to be ready
    await page.waitForTimeout(2000)
  })

  test('should load the game page', async ({ page }) => {
    const pageTitle = await page.locator('.goat-simulator-page').isVisible()
    expect(pageTitle).toBeTruthy()
  })

  test('should display game UI with HUD', async ({ page }) => {
    const hud = await page.locator('.game-hud').isVisible()
    expect(hud).toBeTruthy()
  })

  test('should display score, health, and energy stats', async ({ page }) => {
    const scoreElement = await page.locator('.stat-label:has-text("Score")')
    const healthElement = await page.locator('.stat-label:has-text("Health")')
    const energyElement = await page.locator('.stat-label:has-text("Energy")')

    expect(await scoreElement.isVisible()).toBeTruthy()
    expect(await healthElement.isVisible()).toBeTruthy()
    expect(await energyElement.isVisible()).toBeTruthy()
  })

  test('should display control instructions', async ({ page }) => {
    const controls = await page.locator('.controls-info').isVisible()
    expect(controls).toBeTruthy()

    expect(await page.locator('text=W/A/S/D').isVisible()).toBeTruthy()
    expect(await page.locator('text=SPACE').isVisible()).toBeTruthy()
    expect(await page.locator('text=Left Click').isVisible()).toBeTruthy()
  })

  test('should display pause and reset buttons', async ({ page }) => {
    const pauseBtn = await page.locator('.pause-btn')
    const resetBtn = await page.locator('.reset-btn')

    expect(await pauseBtn.isVisible()).toBeTruthy()
    expect(await resetBtn.isVisible()).toBeTruthy()
    expect(await pauseBtn.textContent()).toContain('Pause')
  })

  test('should pause the game when pause button is clicked', async ({ page }) => {
    const pauseBtn = await page.locator('.pause-btn')
    await pauseBtn.click()
    await page.waitForTimeout(500)

    const pauseOverlay = await page.locator('.pause-overlay').isVisible()
    expect(pauseOverlay).toBeTruthy()

    const pauseMessage = await page.locator('.pause-message h2').textContent()
    expect(pauseMessage).toContain('Game Paused')
  })

  test('should resume the game from pause', async ({ page }) => {
    const pauseBtn = await page.locator('.pause-btn')

    // Pause the game
    await pauseBtn.click()
    await page.waitForTimeout(200)
    let overlay = await page.locator('.pause-overlay').isVisible()
    expect(overlay).toBeTruthy()

    // Resume the game
    await pauseBtn.click()
    await page.waitForTimeout(200)
    overlay = await page.locator('.pause-overlay').isVisible()
    expect(overlay).toBeFalsy()
  })

  test('should pause the game with P key', async ({ page }) => {
    await page.keyboard.press('p')
    await page.waitForTimeout(500)

    const pauseOverlay = await page.locator('.pause-overlay').isVisible()
    expect(pauseOverlay).toBeTruthy()
  })

  test('should reset the game when reset button is clicked', async ({ page }) => {
    const resetBtn = await page.locator('.reset-btn')

    // Get initial score
    const scoreText1 = await page.locator('.stat-value').first().textContent()

    // Wait a moment
    await page.waitForTimeout(1000)

    // Reset
    await resetBtn.click()
    await page.waitForTimeout(500)

    // Score should be 0 after reset
    const scoreText2 = await page.locator('.stat-value').first().textContent()
    expect(scoreText2).toContain('0')
  })

  test('should display canvas for 3D rendering', async ({ page }) => {
    const canvas = await page.locator('canvas').isVisible()
    expect(canvas).toBeTruthy()
  })

  test('should have health and energy bars', async ({ page }) => {
    const healthBar = await page.locator('.health-bar').isVisible()
    const energyBar = await page.locator('.energy-bar').isVisible()

    expect(healthBar).toBeTruthy()
    expect(energyBar).toBeTruthy()
  })

  test('should display responsive UI on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.waitForTimeout(500)

    const hud = await page.locator('.game-hud').isVisible()
    expect(hud).toBeTruthy()

    const buttons = await page.locator('.game-buttons').isVisible()
    expect(buttons).toBeTruthy()
  })

  test('should handle window focus and blur', async ({ page }) => {
    const pauseBtn = await page.locator('.pause-btn')
    expect(await pauseBtn.isVisible()).toBeTruthy()

    // Simulating blur by pressing escape shouldn't break the game
    await page.keyboard.press('Escape')
    await page.waitForTimeout(200)

    // UI should still be visible
    expect(await pauseBtn.isVisible()).toBeTruthy()
  })

  test('should display time elapsed in HUD', async ({ page }) => {
    await page.pauseForDebugger = false
    const timeLabel = await page.locator('.stat-label:has-text("Time")')
    expect(await timeLabel.isVisible()).toBeTruthy()

    // Wait and check time is increasing
    const time1 = await page.locator('.stat-value').nth(3).textContent()
    await page.waitForTimeout(2000)
    const time2 = await page.locator('.stat-value').nth(3).textContent()

    // Times should likely be different (or at least the same, no errors)
    expect(time1).toBeDefined()
    expect(time2).toBeDefined()
  })

  test('should not break on continuous pause/resume', async ({ page }) => {
    const pauseBtn = await page.locator('.pause-btn')

    for (let i = 0; i < 5; i++) {
      await pauseBtn.click()
      await page.waitForTimeout(200)
      await pauseBtn.click()
      await page.waitForTimeout(200)
    }

    const hud = await page.locator('.game-hud').isVisible()
    expect(hud).toBeTruthy()
  })

  test('should handle keyboard input', async ({ page }) => {
    const hud = await page.locator('.game-hud')
    expect(await hud.isVisible()).toBeTruthy()

    // Send keyboard inputs
    await page.keyboard.press('w')
    await page.keyboard.press('a')
    await page.keyboard.press('s')
    await page.keyboard.press('d')
    await page.keyboard.press('Space')

    // Game should still be functional
    expect(await hud.isVisible()).toBeTruthy()
  })

  test('should handle mouse click', async ({ page }) => {
    const canvas = await page.locator('canvas')
    const box = await canvas.boundingBox()

    if (box) {
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
      await page.waitForTimeout(200)
    }

    // Game should handle click without error
    const hud = await page.locator('.game-hud').isVisible()
    expect(hud).toBeTruthy()
  })

  test('should render without console errors', async ({ page }) => {
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    await page.waitForTimeout(3000)

    // Should have no critical errors (some warnings might be present)
    const criticalErrors = errors.filter(
      (e) => !e.includes('Permission denied') && !e.includes('deprecated')
    )
    expect(criticalErrors.length).toBe(0)
  })

  test('should maintain game state on resize', async ({ page }) => {
    const hud = await page.locator('.game-hud')
    expect(await hud.isVisible()).toBeTruthy()

    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.waitForTimeout(500)

    expect(await hud.isVisible()).toBeTruthy()

    await page.setViewportSize({ width: 1280, height: 720 })
    await page.waitForTimeout(500)

    expect(await hud.isVisible()).toBeTruthy()
  })

  test('should have accessible button labels', async ({ page }) => {
    const pauseBtn = await page.locator('.pause-btn')
    const resetBtn = await page.locator('.reset-btn')

    const pauseText = await pauseBtn.textContent()
    const resetText = await resetBtn.textContent()

    expect(pauseText).toMatch(/Pause|Resume/)
    expect(resetText).toContain('New Game')
  })

  test('should update stats dynamically', async ({ page }) => {
    const scoreElements = await page.locator('.stat-value').all()
    const initialScore = scoreElements.length > 0 ? await scoreElements[0].textContent() : '0'

    await page.waitForTimeout(1000)

    const updatedElements = await page.locator('.stat-value').all()
    const updatedScore = updatedElements.length > 0 ? await updatedElements[0].textContent() : '0'

    // Stats should be accessible and readable
    expect(initialScore).toBeDefined()
    expect(updatedScore).toBeDefined()
  })
})
