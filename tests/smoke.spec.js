import { test, expect } from '@playwright/test';

test('Persona OS boots without runtime errors and core navigation is interactive', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/', { waitUntil: 'networkidle' });

  await expect(page.locator('#planet canvas')).toBeVisible();
  await expect(page.locator('#commandToggle')).toBeVisible();

  await page.locator('#commandToggle').click();
  await expect(page.locator('#commandCenter')).toHaveClass(/open/);
  await expect(page.locator('#commandResults .command-item').first()).toBeVisible();

  await page.locator('#commandResults .command-item').filter({ hasText: 'Explore System Worlds' }).click();
  await expect(page.locator('#commandCenter')).not.toHaveClass(/open/);

  await page.locator('[data-command="systems"]').first().click();
  await expect(page.locator('#systems')).toBeInViewport();

  expect(errors, `Browser runtime errors: ${errors.join('; ')}`).toEqual([]);
});

test('Persona OS command center opens with keyboard shortcut', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.keyboard.press(process.platform === 'darwin' ? 'Meta+K' : 'Control+K');
  await expect(page.locator('#commandCenter')).toHaveClass(/open/);
  await page.keyboard.press('Escape');
  await expect(page.locator('#commandCenter')).not.toHaveClass(/open/);
});
