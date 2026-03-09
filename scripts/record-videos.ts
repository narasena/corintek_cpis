import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.resolve(__dirname, '../');
const TEST_RESULTS_DIR = path.join(PROJECT_ROOT, 'test-results');
const VIDEOS_OUT_DIR = path.join(PROJECT_ROOT, 'videos');

console.log('🎬 Starting CPIS Video Generation Suite...');

// 1. Ensure output directory exists
if (!fs.existsSync(VIDEOS_OUT_DIR)) {
  fs.mkdirSync(VIDEOS_OUT_DIR, { recursive: true });
}

// 2. Clear old test results to prevent stale video copies
if (fs.existsSync(TEST_RESULTS_DIR)) {
  console.log('🧹 Clearing old test results...');
  fs.rmSync(TEST_RESULTS_DIR, { recursive: true, force: true });
}

// 3. Run Playwright
console.log('🚀 Running Playwright Video Scenarios...');
try {
  execSync(
    'dotenv -e .env.e2e.local -- npx playwright test -c playwright.video.config.ts',
    {
      cwd: PROJECT_ROOT,
      stdio: 'inherit',
    }
  );
} catch (error) {
  console.warn(
    '⚠️ Playwright run finished with errors, but extracting recorded videos anyway.'
  );
}

// 4. Extract and Rename Videos
console.log('📦 Extracting recorded videos...');
const testResultFolders = fs
  .readdirSync(TEST_RESULTS_DIR, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name);

let copiedCount = 0;

for (const folder of testResultFolders) {
  const folderPath = path.join(TEST_RESULTS_DIR, folder);
  const webmFile = path.join(folderPath, 'video.webm');

  if (fs.existsSync(webmFile)) {
    // Parse the folder name to generate a clean output name.
    // Playwright folder format: `filename.spec.ts-hash-Test-Name-project-name`
    // Desired output: `filename-Test-Name-project-name.webm`

    // Simplistic parsing:
    // Extract everything after the first hypens and remove the hash if possible,
    // or just use a regex to clean it up.

    const match = folder.match(
      /^(.+?)\.spec\.ts-[^-]+-(.+?)-(video-(desktop|mobile))$/
    );

    let cleanName = folder + '.webm';
    if (match) {
      const suiteName = match[1]; // e.g., 01-users-and-profiles
      const testName = match[2]; // e.g., System-Demo-Admin-Login
      const device = match[3]; // e.g., video-desktop

      cleanName = `${suiteName}-${testName}-${device}.webm`;
    }

    const outPath = path.join(VIDEOS_OUT_DIR, cleanName);
    fs.copyFileSync(webmFile, outPath);
    console.log(`✅ Saved: ${cleanName}`);
    copiedCount++;
  }
}

console.log(
  `🎉 Finished! Extracted ${copiedCount} videos to /videos directory.`
);
