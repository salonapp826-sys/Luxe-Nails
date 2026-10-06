#!/usr/bin/env node

/**
 * Pre-build Configuration & Environment Dry-Run Check
 * Validates critical environment variables, vercel.json routes, and application entrypoints
 * to prevent runtime crashes and silent deployment failures on Vercel.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('\n🔍 =======================================================');
console.log('   Running LuxeNails Pre-Build Deployment Health Check   ');
console.log('=======================================================\n');

let issuesFound = 0;
let warningsFound = 0;

function checkPassed(msg) {
  console.log(`  \x1b[32m✔ [PASS]\x1b[0m ${msg}`);
}

function checkWarn(msg, advice) {
  warningsFound++;
  console.log(`  \x1b[33m⚠ [WARN]\x1b[0m ${msg}`);
  if (advice) console.log(`           \x1b[90m↳ ${advice}\x1b[0m`);
}

function checkFail(msg, advice) {
  issuesFound++;
  console.log(`  \x1b[31m✖ [FAIL]\x1b[0m ${msg}`);
  if (advice) console.log(`           \x1b[90m↳ ${advice}\x1b[0m`);
}

// 1. Check entry point HTML
const indexPath = path.join(rootDir, 'index.html');
if (fs.existsSync(indexPath)) {
  const content = fs.readFileSync(indexPath, 'utf-8');
  if (content.includes('id="root"')) {
    checkPassed('index.html entrypoint verified with root element');
  } else {
    checkFail('index.html missing <div id="root">', 'Add <div id="root"></div> in index.html');
  }
} else {
  checkFail('index.html not found in project root', 'Create index.html');
}

// 2. Check Vercel routing configuration
const vercelConfigPath = path.join(rootDir, 'vercel.json');
if (fs.existsSync(vercelConfigPath)) {
  try {
    const raw = fs.readFileSync(vercelConfigPath, 'utf-8');
    const parsed = JSON.parse(raw);
    const hasRewrites = Array.isArray(parsed.rewrites) && parsed.rewrites.length > 0;
    if (hasRewrites) {
      checkPassed('vercel.json routing & SPA rewrites verified');
    } else {
      checkWarn('vercel.json exists but missing rewrites array', 'Ensure rewrites array maps /(.*) to /index.html');
    }
  } catch (err) {
    checkFail('vercel.json is not valid JSON', err.message);
  }
} else {
  checkWarn('vercel.json not detected in root', 'Add vercel.json with SPA rewrites for proper Vercel routing');
}

// 3. Check Vercel API handlers
const apiPath = path.join(rootDir, 'api', 'index.js');
if (fs.existsSync(apiPath)) {
  checkPassed('Vercel serverless /api endpoint handler present');
} else {
  checkWarn('api/index.js not found', 'Create api/index.js to serve lightweight telemetry and health probes');
}

// 4. Environment Variables Inspection
console.log('\n⚙  Inspecting Environment Variables & Supabase API config:');
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (supabaseUrl) {
  if (supabaseUrl.startsWith('http://') || supabaseUrl.startsWith('https://')) {
    checkPassed(`VITE_SUPABASE_URL configured (${supabaseUrl.split('@').pop()})`);
  } else {
    checkWarn('VITE_SUPABASE_URL does not start with https://', 'Verify valid Supabase project URL');
  }
} else {
  checkWarn(
    'VITE_SUPABASE_URL is not set in build environment',
    'Set VITE_SUPABASE_URL in Vercel Project Settings -> Environment Variables. The app will use resilient offline mock fallback.'
  );
}

if (supabaseAnonKey) {
  if (supabaseAnonKey.length > 20) {
    checkPassed('VITE_SUPABASE_ANON_KEY configured');
  } else {
    checkWarn('VITE_SUPABASE_ANON_KEY seems unusually short', 'Ensure the full anon public JWT key is pasted');
  }
} else {
  checkWarn(
    'VITE_SUPABASE_ANON_KEY is not set in build environment',
    'Set VITE_SUPABASE_ANON_KEY in Vercel Project Settings -> Environment Variables.'
  );
}

// 5. Final Summary
console.log('\n-------------------------------------------------------');
if (issuesFound === 0) {
  console.log(`\x1b[32m✔ Pre-build check complete: 0 critical errors, ${warningsFound} non-blocking warnings.\x1b[0m`);
  console.log('  Proceeding with Vite production bundle compilation...\n');
  process.exit(0);
} else {
  console.error(`\x1b[31m✖ Pre-build check failed with ${issuesFound} critical issues.\x1b[0m\n`);
  process.exit(1);
}
