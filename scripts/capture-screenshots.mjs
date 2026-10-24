import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

const CHROME_PATH = fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
  ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  : 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const BASE_URL = 'http://localhost:3005';
const OUTPUT_DIR = path.resolve(process.cwd(), 'docs', 'screenshots');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const PAGES = [
  { url: '/', filename: '01-dashboard.png', name: 'Executive Dashboard' },
  { url: '/voice', filename: '02-voice-assistant.png', name: 'Simulated Alexa+ Voice Assistant' },
  { url: '/planner', filename: '03-smart-planner.png', name: 'Smart Daily Planner' },
  { url: '/tasks', filename: '04-task-manager.png', name: 'Task Manager' },
  { url: '/insights', filename: '05-productivity-insights.png', name: 'Productivity Insights' },
  { url: '/settings', filename: '06-bedrock-settings.png', name: 'Amazon Bedrock & Settings' },
];

async function capture() {
  console.log(`Launching browser using: ${CHROME_PATH}`);
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1400,900'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900, deviceScaleFactor: 2 });

  for (const p of PAGES) {
    const fullUrl = `${BASE_URL}${p.url}`;
    console.log(`Capturing ${p.name} from ${fullUrl}...`);
    await page.goto(fullUrl, { waitUntil: 'networkidle0', timeout: 15000 });
    // Brief wait for animations / charts to settle
    await new Promise((r) => setTimeout(r, 1000));
    const dest = path.join(OUTPUT_DIR, p.filename);
    await page.screenshot({ path: dest, fullPage: false });
    console.log(`Saved screenshot: ${dest}`);
  }

  await browser.close();
  console.log('All screenshots captured successfully!');
}

capture().catch((err) => {
  console.error('Screenshot capture failed:', err);
  process.exit(1);
});
