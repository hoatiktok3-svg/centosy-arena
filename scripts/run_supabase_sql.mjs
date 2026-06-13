import { chromium } from 'playwright';
import { readFileSync, cpSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SQL = readFileSync(join(__dirname, '../supabase/ALL_PENDING_MIGRATIONS.sql'), 'utf8');

const SRC_PROFILE = 'C:\\Users\\ADMIN\\AppData\\Local\\Google\\Chrome\\User Data\\Default';
const TEMP_DIR    = 'C:\\Temp\\pw_chrome_temp';
const TEMP_DEFAULT = TEMP_DIR + '\\Default';

// Copy key session files to temp profile
console.log('📋 Đang copy Chrome session sang temp profile...');
if (!existsSync(TEMP_DEFAULT)) mkdirSync(TEMP_DEFAULT, { recursive: true });

const filesToCopy = ['Local Storage', 'Session Storage', 'Sessions', 'Storage', 'Extension Cookies'];
for (const f of filesToCopy) {
  try {
    cpSync(join(SRC_PROFILE, f), join(TEMP_DEFAULT, f), { recursive: true });
    console.log(`  ✓ ${f}`);
  } catch (e) {
    console.log(`  - skip ${f}: ${e.message}`);
  }
}

console.log('🚀 Đang mở Chrome với temp profile...');
const context = await chromium.launchPersistentContext(TEMP_DIR, {
  headless: false,
  channel: 'chrome',
  args: [
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-session-crashed-bubble',
    '--no-sandbox',
  ],
});

const page = await context.newPage();

console.log('🌐 Mở Supabase SQL Editor...');
await page.goto('https://supabase.com/dashboard/project/avprramyljytezenekwx/sql/new', {
  waitUntil: 'domcontentloaded',
  timeout: 30000,
});

// Check if logged in
await page.waitForTimeout(3000);
const url = page.url();
console.log('📍 URL hiện tại:', url);

if (url.includes('sign-in') || url.includes('login') || url.includes('auth')) {
  console.log('⚠️  Chưa đăng nhập — cần login thủ công');
  await page.waitForURL('**/sql/**', { timeout: 120000 });
  console.log('✅ Đã đăng nhập!');
}

console.log('⏳ Đợi SQL Editor...');
await page.waitForSelector('.monaco-editor, .view-lines, [data-testid="sql-editor"]', { timeout: 30000 }).catch(() => {});
await page.waitForTimeout(3000);

// Try to insert SQL via JS directly into Monaco editor
console.log('✏️  Đang nhập SQL...');
const injected = await page.evaluate((sql) => {
  // Try Monaco editor API
  if (window.monaco) {
    const editors = window.monaco.editor.getEditors();
    if (editors.length > 0) {
      editors[0].setValue(sql);
      return 'monaco-api';
    }
  }
  return 'not-found';
}, SQL);

console.log('Monaco inject result:', injected);

if (injected !== 'monaco-api') {
  // Fallback: click and paste
  await page.click('body');
  await page.keyboard.press('Control+a');
  await page.waitForTimeout(200);
  await page.evaluate((sql) => navigator.clipboard.writeText(sql), SQL);
  await page.waitForTimeout(300);
  const editor = await page.$('.view-lines');
  if (editor) {
    await editor.click();
    await page.keyboard.press('Control+a');
    await page.waitForTimeout(200);
    await page.keyboard.press('Control+v');
  }
}

await page.waitForTimeout(1500);

console.log('▶️  Chạy SQL (Ctrl+Enter)...');
await page.keyboard.press('Control+Enter');
await page.waitForTimeout(6000);

// Screenshot result
const shot = join(__dirname, 'supabase_result.png');
await page.screenshot({ path: shot, fullPage: false });
console.log('📸 Screenshot:', shot);

// Check result text
const resultText = await page.evaluate(() => {
  const el = document.querySelector('[data-testid="result-panel"], .results-panel, .output');
  return el ? el.innerText.slice(0, 300) : '';
});
console.log('📊 Kết quả:', resultText || '(không đọc được — xem screenshot)');

await page.waitForTimeout(3000);
await context.close();
console.log('✅ DONE!');
