/**
 * Pre-build Environment Variable Validation Script
 * Verifies the presence and format of required Supabase credentials
 * (VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY) before Vite bundle compilation.
 */

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

console.log('\n🔒 [ENV VALIDATOR] Checking required build environment variables...');

// Attempt to load .env or .env.local if running outside containerized Vite env
const envPaths = ['.env', '.env.local', '.env.production'];
for (const relPath of envPaths) {
  const fullPath = resolve(process.cwd(), relPath);
  if (existsSync(fullPath)) {
    try {
      const content = readFileSync(fullPath, 'utf-8');
      content.split('\n').forEach((line) => {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
          const key = match[1];
          let value = match[2] || '';
          if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
          if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
          if (!process.env[key]) {
            process.env[key] = value.trim();
          }
        }
      });
    } catch {
      // Ignore read errors
    }
  }
}

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const isStrict = process.argv.includes('--strict') || process.env.STRICT_ENV === 'true';

let hasErrors = false;

// 1. Validate VITE_SUPABASE_URL
if (!supabaseUrl || supabaseUrl.trim() === '' || supabaseUrl === 'your-project-url-here') {
  console.warn('  ⚠️  Missing or default VITE_SUPABASE_URL');
  console.warn('      ↳ Please define VITE_SUPABASE_URL in your Vercel Project Settings or .env');
  if (isStrict) hasErrors = true;
} else if (!supabaseUrl.startsWith('https://') && !supabaseUrl.startsWith('http://')) {
  console.warn(`  ⚠️  Invalid VITE_SUPABASE_URL format: "${supabaseUrl}". Expected URL starting with https://`);
  if (isStrict) hasErrors = true;
} else {
  console.log(`  ✔  VITE_SUPABASE_URL is configured (${supabaseUrl.replace(/^https?:\/\//, '').split('/')[0]})`);
}

// 2. Validate VITE_SUPABASE_ANON_KEY
if (!supabaseAnonKey || supabaseAnonKey.trim() === '' || supabaseAnonKey === 'your-project-anon-key-here') {
  console.warn('  ⚠️  Missing or default VITE_SUPABASE_ANON_KEY');
  console.warn('      ↳ Please define VITE_SUPABASE_ANON_KEY in your Vercel Project Settings or .env');
  if (isStrict) hasErrors = true;
} else if (supabaseAnonKey.length < 20) {
  console.warn('  ⚠️  VITE_SUPABASE_ANON_KEY appears too short to be a valid public anon key');
  if (isStrict) hasErrors = true;
} else {
  console.log('  ✔  VITE_SUPABASE_ANON_KEY is configured');
}

if (hasErrors) {
  console.error('\n❌ [ENV VALIDATOR] Pre-build validation failed due to missing required environment variables.\n');
  process.exit(1);
}

console.log('✨ [ENV VALIDATOR] Environment validation completed successfully.\n');
process.exit(0);
