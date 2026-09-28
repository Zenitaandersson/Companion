import { test, type Page } from '@playwright/test';

/**
 * Not a test of behaviour: captures screenshots of the main screens for visual review.
 * Run with: npx playwright test e2e/screenshots.spec.ts
 */
const OUT = 'test-results/screens';

async function openCarerMode(page: Page) {
  await page.getByTestId('carer-entry').click();
}

async function typePin(page: Page, pin: string) {
  for (const d of pin) await page.getByRole('button', { name: d, exact: true }).click();
}

test('capture screens', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('today-card').waitFor();

  // Seed through the carer flow so screens have content.
  await openCarerMode(page);
  await page.screenshot({ path: `${OUT}/pin.png`, fullPage: true, animations: 'disabled' });
  await typePin(page, '1234');
  await typePin(page, '1234');
  await page.getByLabel('First name').fill('Erik');
  await page.getByLabel('Where they are').fill('at home in Lerum');
  await page.waitForTimeout(600);
  await page.getByRole('button', { name: 'Next →' }).click();
  await page.getByRole('button', { name: '+ Add a person' }).click();
  await page.getByLabel('First name').fill('Anna');
  await page.getByLabel('Relationship').fill('daughter');
  await page.getByLabel('One sentence').fill('Your daughter. She lives in Lerum.');
  await page.getByLabel('Phone number').fill('+46701234567');
  await page.getByLabel('This is who the Help button calls').check();
  await page.getByRole('button', { name: 'Save' }).click();
  await page.getByRole('button', { name: '+ Add a person' }).click();
  await page.getByLabel('First name').fill('Martin');
  await page.getByLabel('Relationship').fill('son');
  await page.getByLabel('One sentence').fill('Your son. He works in Gothenburg.');
  await page.getByRole('button', { name: 'Save' }).click();
  await page.getByRole('button', { name: 'Next →' }).click();
  await page.getByRole('button', { name: 'Gentle day' }).click();
  await page.getByText('Breakfast').first().waitFor();
  await page.screenshot({ path: `${OUT}/carer-routine.png`, fullPage: true, animations: 'disabled' });
  await page.getByRole('button', { name: 'Next →' }).click();
  await page.getByRole('button', { name: '+ Add a question' }).click();
  await page.getByLabel('Their question').fill('Where is Martin?');
  await page.getByLabel('Your answer').fill('Martin is at work. He comes home for dinner.');
  await page.getByRole('button', { name: 'Save' }).click();
  await page.getByRole('button', { name: '+ Add a question' }).click();
  await page.getByLabel('Their question').fill('What day is it?');
  await page.getByLabel('Your answer').fill('Today is {day}, {date}. It is {time}.');
  await page.getByRole('button', { name: 'Save' }).click();
  await page.getByRole('button', { name: 'Skip for now' }).click();
  await page.getByRole('button', { name: 'Skip for now' }).click();
  await page.getByRole('button', { name: 'Finish' }).click();
  await page.screenshot({ path: `${OUT}/carer-home.png`, fullPage: true, animations: 'disabled' });
  await page.getByTestId('carer-close').click();

  await page.getByTestId('today-card').waitFor();
  await page.screenshot({ path: `${OUT}/today.png`, fullPage: true, animations: 'disabled' });

  await page.getByRole('button', { name: 'People' }).click();
  await page.screenshot({ path: `${OUT}/people.png`, fullPage: true, animations: 'disabled' });
  await page.getByRole('button', { name: /Anna/ }).click();
  await page.screenshot({ path: `${OUT}/person-card.png`, fullPage: true, animations: 'disabled' });
  await page.getByTestId('back-to-today').click();

  await page.getByRole('button', { name: 'My day' }).click();
  await page.screenshot({ path: `${OUT}/my-day.png`, fullPage: true, animations: 'disabled' });
  await page.getByTestId('back-to-today').click();

  await page.getByRole('button', { name: 'Questions' }).click();
  await page.screenshot({ path: `${OUT}/questions.png`, fullPage: true, animations: 'disabled' });
  await page.getByRole('button', { name: 'What day is it?' }).click();
  await page.screenshot({ path: `${OUT}/answer.png`, fullPage: true, animations: 'disabled' });
  await page.getByTestId('back-to-today').click();

  await page.getByRole('button', { name: 'Help' }).click();
  await page.screenshot({ path: `${OUT}/help.png`, fullPage: true, animations: 'disabled' });
});
