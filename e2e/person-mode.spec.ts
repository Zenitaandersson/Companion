import { expect, test, type Page } from '@playwright/test';

/** Taps the quiet "For carers" link under the Today bar. */
async function openCarerMode(page: Page) {
  await page.getByTestId('carer-entry').click();
}

async function typePin(page: Page, pin: string) {
  for (const d of pin) await page.getByRole('button', { name: d, exact: true }).click();
}

test('first launch shows Today, carer sets a PIN, name and routine, person sees them', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));

  await page.goto('/');
  const card = page.getByTestId('today-card');
  await expect(card).toContainText('Hello');
  await expect(page.getByTestId('back-to-today')).toBeVisible();

  // Enter carer mode and set a PIN (asked twice).
  await openCarerMode(page);
  await expect(page.getByText('Choose a PIN')).toBeVisible();
  await typePin(page, '1234');
  await expect(page.getByText('Repeat the PIN')).toBeVisible();
  await typePin(page, '1234');

  // Onboarding step 1: the person.
  await expect(page.getByText('Step 1 of 6')).toBeVisible();
  await page.getByLabel('First name').fill('Erik');
  await page.getByLabel('Where they are').fill('at home in Lerum');
  await page.waitForTimeout(600); // drafts save shortly after typing stops
  await page.getByRole('button', { name: 'Next →' }).click();

  // Step 2: add a person.
  await expect(page.getByText('Step 2 of 6')).toBeVisible();
  await page.getByRole('button', { name: '+ Add a person' }).click();
  await page.getByLabel('First name').fill('Anna');
  await page.getByLabel('Relationship').fill('daughter');
  await page.getByLabel('One sentence').fill('Your daughter. She lives in Lerum.');
  await page.getByLabel('Phone number').fill('+46701234567');
  await page.getByLabel('This is who the Help button calls').check();
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByText('Anna 🤍')).toBeVisible();
  await page.getByRole('button', { name: 'Next →' }).click();

  // Step 3: routine from template.
  await expect(page.getByText('Step 3 of 6')).toBeVisible();
  await page.getByRole('button', { name: 'Gentle day' }).click();
  await expect(page.getByText(/Breakfast/)).toBeVisible();
  await page.getByRole('button', { name: 'Next →' }).click();

  // Step 4: a question with a dynamic answer.
  await expect(page.getByText('Step 4 of 6')).toBeVisible();
  await page.getByRole('button', { name: '+ Add a question' }).click();
  await page.getByLabel('Their question').fill('What day is it?');
  await page.getByLabel('Your answer').fill('Today is {day}.');
  await page.getByRole('button', { name: 'Save' }).click();
  await page.getByRole('button', { name: 'Skip for now' }).click();
  await page.getByRole('button', { name: 'Skip for now' }).click();

  // Step 6: finish.
  await expect(page.getByText('Step 6 of 6')).toBeVisible();
  await page.getByRole('button', { name: 'Finish' }).click();
  await expect(page.getByText('Carer settings', { exact: true })).toBeVisible();
  await page.getByTestId('carer-close').click();

  // Person mode reflects the setup.
  await expect(card).toContainText('Hello Erik');
  await expect(card).toContainText('You are at home in Lerum');

  await page.getByRole('button', { name: 'People' }).click();
  await page.getByRole('button', { name: /Anna/ }).click();
  await expect(page.getByText('Your daughter. She lives in Lerum.')).toBeVisible();
  await expect(page.getByTestId('call-link')).toHaveAttribute('href', 'tel:+46701234567');
  await page.getByTestId('back-to-today').click();
  await expect(card).toBeVisible();

  await page.getByRole('button', { name: 'My day' }).click();
  await expect(page.getByText('Breakfast').first()).toBeVisible();
  await expect(page.locator('[aria-current="step"]')).toHaveCount(1);
  await page.getByTestId('back-to-today').click();

  await page.getByRole('button', { name: 'Questions' }).click();
  await page.getByRole('button', { name: 'What day is it?' }).click();
  const weekday = new Intl.DateTimeFormat('en-GB', { weekday: 'long' }).format(new Date());
  await expect(page.getByTestId('answer-text')).toHaveText(`Today is ${weekday}.`);
  await page.getByTestId('back-to-today').click();

  await page.getByRole('button', { name: 'Help' }).click();
  await expect(page.getByTestId('help-call')).toHaveAttribute('href', 'tel:+46701234567');
  await page.getByTestId('back-to-today').click();

  // Data survives a reload; carer mode now asks for the PIN.
  await page.reload();
  await expect(card).toContainText('Hello Erik');

  // An accidental tap: the PIN screen has the familiar way home, and a wrong PIN clears quietly.
  await openCarerMode(page);
  await expect(page.getByText('Enter your PIN')).toBeVisible();
  await page.getByTestId('back-to-today').click();
  await expect(card).toBeVisible();
  await openCarerMode(page);
  await typePin(page, '0000');
  await expect(page.getByText('Enter your PIN')).toBeVisible();
  await expect(page.locator('.notice')).toHaveCount(0);
  await typePin(page, '1234');
  await expect(page.getByText('Carer settings', { exact: true })).toBeVisible();

  expect(errors).toEqual([]);
});

test('person mode never scrolls sideways and keeps big tap targets', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('today-card')).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(overflow).toBe(false);
  const heights = await page.$$eval('.big-button', (els) => els.map((e) => e.getBoundingClientRect().height));
  expect(heights.length).toBeGreaterThan(0);
  for (const h of heights) expect(h).toBeGreaterThanOrEqual(88);
});

test('the carer entry is visible on Today only and quieter than the person buttons', async ({ page }) => {
  await page.goto('/');
  const entry = page.getByTestId('carer-entry');
  await expect(entry).toBeVisible();
  await expect(entry).toHaveText(/For carers/);
  const entrySize = await entry.evaluate((e) => parseFloat(getComputedStyle(e).fontSize));
  const buttonSize = await page.getByTestId('back-to-today').evaluate((e) => parseFloat(getComputedStyle(e).fontSize));
  expect(entrySize).toBeLessThan(buttonSize);
  await page.getByRole('button', { name: 'People' }).click();
  await expect(entry).toHaveCount(0);
});
